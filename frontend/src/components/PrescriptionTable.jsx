import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Copy, Check, Pill, Search } from 'lucide-react'
import { medicineService } from '../services/api'

const FALLBACK_MEDICINES = [
  { id: 1, name: 'Paracetamol', strength: '650mg', form: 'Tablet' },
  { id: 2, name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
  { id: 3, name: 'Amoxicillin + Clavulanic Acid (Augmentin 625)', strength: '500mg/125mg', form: 'Tablet' },
  { id: 4, name: 'Azithromycin', strength: '500mg', form: 'Tablet' },
  { id: 5, name: 'Pantoprazole (Pan 40)', strength: '40mg', form: 'Tablet' },
  { id: 6, name: 'Pantoprazole + Domperidone (Pan-D)', strength: '40mg/30mg', form: 'Capsule' },
  { id: 7, name: 'Cetirizine', strength: '10mg', form: 'Tablet' },
  { id: 8, name: 'Montelukast + Levocetirizine (Montair-LC)', strength: '10mg/5mg', form: 'Tablet' },
  { id: 9, name: 'ORS (Oral Rehydration Salts - Electral)', strength: '21.8g', form: 'Sachet' },
  { id: 10, name: 'Aceclofenac + Paracetamol (Zerodol-P)', strength: '100mg/325mg', form: 'Tablet' },
  { id: 11, name: 'Metformin SR (Glycomet SR)', strength: '500mg', form: 'Tablet' },
  { id: 12, name: 'Amlodipine (Stamlo)', strength: '5mg', form: 'Tablet' },
  { id: 13, name: 'Telmisartan (Telma)', strength: '40mg', form: 'Tablet' },
  { id: 14, name: 'Atorvastatin', strength: '10mg', form: 'Tablet' },
  { id: 15, name: 'Ondansetron (Emeset)', strength: '4mg', form: 'Tablet' },
  { id: 16, name: 'Vitamin B-Complex + Vitamin C (Becosules)', strength: 'Standard', form: 'Capsule' },
]

const FOOD_TIMING_OPTIONS = [
  { value: 'before', label: 'Before Food' },
  { value: 'after', label: 'After Food' },
  { value: 'with', label: 'With Food' },
]

export const createEmptyPrescriptionRow = () => ({
  medicine_name: '',
  dosage: '',
  morning: true,
  noon: false,
  night: true,
  food_timing: 'after',
  duration_days: 5,
  instructions: '',
})

export const formatDosagePattern = (row) => {
  const m = row.morning ? 1 : 0
  const n = row.noon ? 1 : 0
  const nt = row.night ? 1 : 0
  return `${m}-${n}-${nt}`
}

const MedicineAutocomplete = ({ value, onChangeText, onSelectMedicine, inputRef }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(async () => {
      const q = (value || '').trim()
      setIsLoading(true)
      try {
        const data = await medicineService.search(q)
        if (Array.isArray(data) && data.length > 0) {
          setResults(data.slice(0, 8))
          setHighlightIndex(0)
        } else if (Array.isArray(data)) {
          setResults([])
          setHighlightIndex(-1)
        }
      } catch {
        const lower = q.toLowerCase()
        const filtered = FALLBACK_MEDICINES.filter((m) =>
          m.name.toLowerCase().includes(lower)
        ).slice(0, 8)
        setResults(filtered)
        setHighlightIndex(filtered.length > 0 ? 0 : -1)
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [value, isOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      if (results.length > 0) {
        setHighlightIndex((prev) => (prev + 1) % results.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (isOpen && results.length > 0) {
        setHighlightIndex((prev) => (prev - 1 + results.length) % results.length)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && highlightIndex >= 0 && highlightIndex < results.length) {
        onSelectMedicine(results[highlightIndex])
        setIsOpen(false)
      } else {
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder="Search or type medicine..."
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChangeText(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">Searching medicines...</div>
          ) : (
            results.map((med, idx) => (
              <button
                key={med.id || `${med.name}-${idx}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelectMedicine(med)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                  idx === highlightIndex
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">{med.name}</span>
                  {med.form && (
                    <span className="ml-2 text-xs text-gray-500">({med.form})</span>
                  )}
                </div>
                {med.strength && (
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {med.strength}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const PrescriptionTable = ({
  prescriptions,
  onChange,
  onCopyLastPrescription,
  hasLastPrescription = false,
  isCopyingLast = false,
}) => {
  const medicineInputRefs = useRef([])
  const [focusRowIdx, setFocusRowIdx] = useState(null)

  useEffect(() => {
    if (focusRowIdx !== null && medicineInputRefs.current[focusRowIdx]) {
      medicineInputRefs.current[focusRowIdx].focus()
      setFocusRowIdx(null)
    }
  }, [focusRowIdx, prescriptions.length])

  const updateRow = (index, updates) => {
    const next = prescriptions.map((row, i) =>
      i === index ? { ...row, ...updates } : row
    )
    onChange(next)
  }

  const addRow = (autoFocus = true) => {
    const newIndex = prescriptions.length
    onChange([...prescriptions, createEmptyPrescriptionRow()])
    if (autoFocus) {
      setFocusRowIdx(newIndex)
    }
  }

  const removeRow = (index) => {
    if (prescriptions.length <= 1) {
      onChange([createEmptyPrescriptionRow()])
      return
    }
    onChange(prescriptions.filter((_, i) => i !== index))
  }

  const handleSelectMedicine = (index, med) => {
    const current = prescriptions[index]
    updateRow(index, {
      medicine_name: med.name,
      dosage: med.strength || current.dosage || '',
    })
  }

  const handleLastFieldKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (index === prescriptions.length - 1) {
        addRow(true)
      } else {
        setFocusRowIdx(index + 1)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Pill className="w-5 h-5 mr-2 text-blue-600" />
            Rx — Prescription Builder
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Search medicine, tick Morning-Noon-Night dosage, choose food timing, and press Enter on Note to add next row.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onCopyLastPrescription && (
            <button
              type="button"
              onClick={onCopyLastPrescription}
              disabled={isCopyingLast || !hasLastPrescription}
              title={
                hasLastPrescription
                  ? 'Copy medicines from patient’s previous visit'
                  : 'No previous visit found for this patient'
              }
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-1.5 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{isCopyingLast ? 'Copying...' : 'Copy Last Prescription'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => addRow(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Rx Table */}
      <div className="p-4 overflow-x-visible">
        <div className="min-w-full">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-2.5 px-2 w-8">#</th>
                <th className="py-2.5 px-2 min-w-[220px]">Medicine</th>
                <th className="py-2.5 px-2 w-28"></th>
                <th className="py-2.5 px-2 w-56">Dosage</th>
                <th className="py-2.5 px-2 w-56">Timing</th>
                <th className="py-2.5 px-2 w-28">Duration</th>
                <th className="py-2.5 px-2 min-w-[160px]">Note / Instructions</th>
                <th className="py-2.5 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prescriptions.map((row, index) => {
                const pattern = formatDosagePattern(row)
                return (
                  <tr key={index} className="hover:bg-gray-50/60 align-middle">
                    <td className="py-3 px-2 text-gray-500 font-medium">
                      {index + 1}.
                    </td>

                    {/* Medicine Autocomplete */}
                    <td className="py-3 px-2">
                      <MedicineAutocomplete
                        inputRef={(el) => (medicineInputRefs.current[index] = el)}
                        value={row.medicine_name}
                        onChangeText={(val) => updateRow(index, { medicine_name: val })}
                        onSelectMedicine={(med) => handleSelectMedicine(index, med)}
                      />
                    </td>

                    {/* Strength / Dosage */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        placeholder="e.g. 500mg"
                        value={row.dosage || ''}
                        onChange={(e) => updateRow(index, { dosage: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.preventDefault()
                        }}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Morning / Noon / Night Toggles + Pattern */}
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden">
                          {[
                            { key: 'morning', label: 'Morning', short: 'M' },
                            { key: 'noon', label: 'Noon', short: 'N' },
                            { key: 'night', label: 'Night', short: 'Nt' },
                          ].map((slot, sIdx) => {
                            const active = Boolean(row[slot.key])
                            return (
                              <button
                                key={slot.key}
                                type="button"
                                title={slot.label}
                                onClick={() =>
                                  updateRow(index, { [slot.key]: !active })
                                }
                                className={`px-2.5 py-1.5 text-xs font-medium flex items-center space-x-1 transition-colors ${
                                  sIdx > 0 ? 'border-l border-gray-300' : ''
                                } ${
                                  active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {active && <Check className="w-3 h-3 stroke-[2.5]" />}
                                <span>{slot.short}</span>
                              </button>
                            )
                          })}
                        </div>
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                          {pattern}
                        </span>
                      </div>
                    </td>

                    {/* Food Timing Segmented Control */}
                    <td className="py-3 px-2">
                      <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden">
                        {FOOD_TIMING_OPTIONS.map((opt, oIdx) => {
                          const selected = (row.food_timing || 'after') === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                updateRow(index, { food_timing: opt.value })
                              }
                              className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                oIdx > 0 ? 'border-l border-gray-300' : ''
                              } ${
                                selected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {opt.label.replace(' Food', '')}
                            </button>
                          )
                        })}
                      </div>
                    </td>

                    {/* Duration in Days */}
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          placeholder="5"
                          value={row.duration_days ?? ''}
                          onChange={(e) =>
                            updateRow(index, {
                              duration_days:
                                e.target.value === ''
                                  ? ''
                                  : parseInt(e.target.value, 10) || '',
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault()
                          }}
                          className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                        <span className="text-xs text-gray-500">days</span>
                      </div>
                    </td>

                    {/* Optional Note / Instructions (Enter adds new row) */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        placeholder="e.g. SOS for fever (Enter ↵)"
                        value={row.instructions || ''}
                        onChange={(e) =>
                          updateRow(index, { instructions: e.target.value })
                        }
                        onKeyDown={(e) => handleLastFieldKeyDown(e, index)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Remove Row */}
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        title="Remove row"
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionTable
