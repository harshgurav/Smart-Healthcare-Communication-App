import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Printer,
  Download,
  Share2,
  ArrowLeft,
  Settings,
  Check,
  X,
  Phone,
  Clock,
  MapPin,
} from 'lucide-react'
import html2pdf from 'html2pdf.js'
import {
  visitService,
  patientService,
  prescriptionService,
  clinicService,
} from '../services/api'

const FALLBACK_CLINIC = {
  doctor_name: 'Dr. Sarah Wilson',
  qualifications: 'MBBS, MD (General Medicine)',
  registration_no: 'MCI-45892 / DMC-28410',
  clinic_name: 'Arogya Care Clinic & Diagnostic Centre',
  address: '102, Ground Floor, Shanti Nagar Market, New Delhi - 110049',
  phone: '+91-9811223344, 011-26543210',
  timings: 'Mon - Sat: 9:30 AM - 1:30 PM & 5:30 PM - 9:00 PM (Sun Closed)',
  services:
    'General Consultation • Diabetes & Hypertension Management • ECG • Nebulization • Vaccination • Routine Lab Investigations',
}

const FALLBACK_VISITS = {
  1: {
    visit_id: 1,
    patient_id: 1,
    visit_date: '2025-09-17',
    chief_complaint: 'Excessive Urine, Weight Gain, Swollen Feet',
    symptoms: '[Vitals: Temp: 98.6 °F | BP: 140/80 mmHg | Pulse: 78 /min | SpO2: 98% | Wt: 72 kg]\nMild pedal edema',
    diagnosis: 'Hypertension, Type 2 Diabetes, CKD',
    treatment_plan: 'Low salt diet, daily blood sugar & BP charting',
    follow_up_date: '2025-10-15',
    notes: 'Restrict salt intake (<4g/day). Walk 30 mins daily. Bring fasting & PP blood sugar report on next visit.',
  },
}

const FALLBACK_RX = [
  {
    prescription_id: 1,
    medicine_name: 'Insulin Degludec + Aspart (Ryzodeg)',
    dosage: '100IU/ml',
    morning: true,
    noon: false,
    night: true,
    food_timing: 'before',
    duration_days: 30,
    frequency: '1-0-1',
    duration: '30 days',
    instructions: '12 units morning & night subcutaneously',
  },
  {
    prescription_id: 2,
    medicine_name: 'Empagliflozin (Jardiance)',
    dosage: '25mg',
    morning: true,
    noon: false,
    night: false,
    food_timing: 'after',
    duration_days: 30,
    frequency: '1-0-0',
    duration: '30 days',
    instructions: 'Take after breakfast with plenty of water',
  },
  {
    prescription_id: 3,
    medicine_name: 'Sitagliptin + Metformin (Istamet)',
    dosage: '50mg/1000mg',
    morning: true,
    noon: false,
    night: true,
    food_timing: 'after',
    duration_days: 30,
    frequency: '1-0-1',
    duration: '30 days',
    instructions: 'After meals',
  },
  {
    prescription_id: 4,
    medicine_name: 'Amlodipine (Stamlo)',
    dosage: '5mg',
    morning: true,
    noon: false,
    night: false,
    food_timing: 'after',
    duration_days: 30,
    frequency: '1-0-0',
    duration: '30 days',
    instructions: 'Morning after breakfast',
  },
]

const parseVitalsAndCleanSymptoms = (visit, patient) => {
  const rawSymptoms = visit?.symptoms || ''
  const vitalsMatch = rawSymptoms.match(/^\[Vitals:\s*([^\]]+)\]\n?/i)
  let cleanSymptoms = rawSymptoms
  const vitalsList = []

  if (vitalsMatch) {
    cleanSymptoms = rawSymptoms.replace(vitalsMatch[0], '').trim()
    const segments = vitalsMatch[1].split('|').map((s) => s.trim()).filter(Boolean)
    vitalsList.push(...segments)
  } else {
    // Check if BP is mentioned in notes
    const bpMatch = (visit?.notes || '').match(/BP:\s*([0-9]+\/[0-9]+(?:\s*mmHg)?)/i)
    if (bpMatch) vitalsList.push(`BP: ${bpMatch[1]}`)
    vitalsList.push('Temp: 98.6 °F')
    if (patient?.weight) vitalsList.push(`Wt: ${patient.weight} kg`)
    if (patient?.height) vitalsList.push(`Ht: ${patient.height} cm`)
  }

  return { vitalsList, cleanSymptoms }
}

const formatFoodTimingLabel = (timing) => {
  const map = {
    before: 'Before Food',
    after: 'After Food',
    with: 'With Food',
    any: 'Any Time',
  }
  return map[(timing || 'after').toLowerCase()] || timing || 'After Food'
}

const resolvePatternAndTicks = (rx) => {
  const hasExplicitTicks =
    Boolean(rx.morning) || Boolean(rx.noon) || Boolean(rx.night)
  if (hasExplicitTicks) {
    const m = rx.morning ? 1 : 0
    const n = rx.noon ? 1 : 0
    const nt = rx.night ? 1 : 0
    return {
      morning: Boolean(rx.morning),
      noon: Boolean(rx.noon),
      night: Boolean(rx.night),
      pattern: `${m} - ${n} - ${nt}`,
    }
  }
  // Parse legacy frequency like "1-0-1" or "Twice daily"
  const freq = (rx.frequency || '').trim()
  const dashMatch = freq.match(/^(\d+)\s*-\s*(\d+)\s*-\s*(\d+)$/)
  if (dashMatch) {
    return {
      morning: Number(dashMatch[1]) > 0,
      noon: Number(dashMatch[2]) > 0,
      night: Number(dashMatch[3]) > 0,
      pattern: `${dashMatch[1]} - ${dashMatch[2]} - ${dashMatch[3]}`,
    }
  }
  if (/twice/i.test(freq)) {
    return { morning: true, noon: false, night: true, pattern: '1 - 0 - 1' }
  }
  if (/three|thrice/i.test(freq)) {
    return { morning: true, noon: true, night: true, pattern: '1 - 1 - 1' }
  }
  if (/once/i.test(freq)) {
    return { morning: true, noon: false, night: false, pattern: '1 - 0 - 0' }
  }
  return {
    morning: false,
    noon: false,
    night: false,
    pattern: freq || '1 - 0 - 1',
  }
}

const PrescriptionPrint = () => {
  const { visitId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const printRef = useRef(null)

  const [isExporting, setIsExporting] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [isEditingClinic, setIsEditingClinic] = useState(false)
  const [clinicForm, setClinicForm] = useState(null)

  const { data: clinicData } = useQuery(['clinic-settings'], clinicService.get, {
    retry: 1,
  })

  const { data: visitData, isLoading: isLoadingVisit } = useQuery(
    ['visit', visitId],
    () => visitService.getById(visitId),
    { retry: 1 }
  )

  const visit = visitData || FALLBACK_VISITS[visitId] || FALLBACK_VISITS[1]

  const { data: patientData } = useQuery(
    ['patient', visit?.patient_id],
    () => patientService.getById(visit?.patient_id || 1),
    { enabled: Boolean(visit?.patient_id), retry: 1 }
  )

  const { data: prescriptionsData } = useQuery(
    ['visit-prescriptions', visitId],
    () => prescriptionService.getByVisitId(visitId),
    { retry: 1 }
  )

  const clinic = clinicData || FALLBACK_CLINIC
  const patient = patientData || {
    patient_id: visit?.patient_id || 1,
    first_name: 'Ramesh',
    last_name: 'Chandra',
    age: 65,
    sex: 'Male',
    phone: '+91-7276866115',
    address: '123 Main Street, New Delhi',
    height: 166,
    weight: 72,
  }

  const prescriptions =
    Array.isArray(prescriptionsData) && prescriptionsData.length > 0
      ? prescriptionsData
      : visitData
      ? []
      : FALLBACK_RX

  const { vitalsList, cleanSymptoms } = parseVitalsAndCleanSymptoms(visit, patient)

  const updateClinicMutation = useMutation((data) => clinicService.update(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['clinic-settings'])
      setIsEditingClinic(false)
    },
  })

  const getPdfFileName = () => {
    const safeName = `${patient.first_name || 'Patient'}_${patient.last_name || ''}`
      .trim()
      .replace(/\s+/g, '_')
    const dateStr = visit?.visit_date || new Date().toISOString().split('T')[0]
    return `Prescription_${safeName}_${dateStr}.pdf`
  }

  const getPdfOptions = (filename) => ({
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!printRef.current) return
    setIsExporting(true)
    setShareMessage('')
    try {
      const filename = getPdfFileName()
      await html2pdf().set(getPdfOptions(filename)).from(printRef.current).save()
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSharePdf = async () => {
    if (!printRef.current) return
    setIsExporting(true)
    setShareMessage('')
    try {
      const filename = getPdfFileName()
      const worker = html2pdf().set(getPdfOptions(filename)).from(printRef.current)
      const pdfBlob = await worker.outputPdf('blob')
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' })

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [pdfFile] }))
      ) {
        await navigator.share({
          title: `Prescription - ${patient.first_name} ${patient.last_name}`,
          text: `Medical Prescription from ${clinic.clinic_name}`,
          files: [pdfFile],
        })
        setShareMessage('Shared successfully!')
      } else {
        await html2pdf().set(getPdfOptions(filename)).from(printRef.current).save()
        setShareMessage('Direct file sharing not supported on this browser — PDF downloaded instead.')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        const filename = getPdfFileName()
        await html2pdf().set(getPdfOptions(filename)).from(printRef.current).save()
        setShareMessage('PDF downloaded to your device.')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const openClinicEditor = () => {
    setClinicForm({ ...clinic })
    setIsEditingClinic(true)
  }

  if (isLoadingVisit && !visit) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading printable prescription...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/patients/${patient.patient_id}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Patient Profile</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Prescription Preview (A4)
            </h1>
            <p className="text-xs text-gray-500">
              Visit #{visitId} • {patient.first_name} {patient.last_name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openClinicEditor}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Clinic Header</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print (A4)</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleSharePdf}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share PDF</span>
          </button>
        </div>
      </div>

      {shareMessage && (
        <div className="no-print bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between">
          <span>{shareMessage}</span>
          <button
            type="button"
            onClick={() => setShareMessage('')}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clinic Settings Modal (No-Print) */}
      {isEditingClinic && clinicForm && (
        <div className="no-print fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Customize Clinic Prescription Header
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingClinic(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={clinicForm.doctor_name || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, doctor_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={clinicForm.qualifications || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Registration No.</label>
                <input
                  type="text"
                  value={clinicForm.registration_no || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, registration_no: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={clinicForm.clinic_name || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, clinic_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={clinicForm.phone || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Timings</label>
                <input
                  type="text"
                  value={clinicForm.timings || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, timings: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-gray-700 mb-1">Clinic Address</label>
                <input
                  type="text"
                  value={clinicForm.address || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-gray-700 mb-1">Services Offered</label>
                <input
                  type="text"
                  value={clinicForm.services || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, services: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditingClinic(false)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateClinicMutation.mutate(clinicForm)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Save Header
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A4 Printable Sheet */}
      <div
        ref={printRef}
        className="prescription-a4-sheet bg-white mx-auto shadow-md border border-gray-300 rounded-sm text-gray-900"
        style={{
          width: '210mm',
          minHeight: '285mm',
          padding: '14mm 16mm',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* 1. CLINIC HEADER */}
          <div className="border-b-2 border-blue-900 pb-4">
            <div className="flex justify-between items-start gap-6">
              {/* Doctor Details */}
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-blue-900 tracking-tight">
                  {clinic.doctor_name}
                </h2>
                <p className="text-sm font-semibold text-gray-800">
                  {clinic.qualifications}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Reg. No.: {clinic.registration_no}
                </p>
              </div>

              {/* Clinic Details */}
              <div className="text-right space-y-0.5 max-w-sm">
                <h1 className="text-xl font-extrabold text-blue-900 uppercase tracking-wide">
                  {clinic.clinic_name}
                </h1>
                <p className="text-xs text-gray-700 flex items-center justify-end gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-800 flex-shrink-0" />
                  <span>{clinic.address}</span>
                </p>
                <p className="text-xs text-gray-700 flex items-center justify-end gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-800 flex-shrink-0" />
                  <span>{clinic.phone}</span>
                </p>
                <p className="text-xs text-gray-600 flex items-center justify-end gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-800 flex-shrink-0" />
                  <span>{clinic.timings}</span>
                </p>
              </div>
            </div>

            {/* Services Ribbon */}
            {clinic.services && (
              <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                <p className="text-[11px] font-medium text-blue-950 bg-blue-50/80 py-1 px-3 rounded">
                  {clinic.services}
                </p>
              </div>
            )}
          </div>

          {/* 2. PATIENT DEMOGRAPHICS & DATE */}
          <div className="py-3 border-b border-gray-300 grid grid-cols-12 gap-2 text-sm">
            <div className="col-span-5">
              <span className="text-gray-500 font-medium">Patient Name: </span>
              <span className="font-bold text-gray-900">
                {patient.first_name} {patient.last_name}
              </span>
            </div>
            <div className="col-span-3">
              <span className="text-gray-500 font-medium">Age / Sex: </span>
              <span className="font-semibold text-gray-900">
                {patient.age ? `${patient.age} Yrs` : '--'} / {patient.sex || '--'}
              </span>
            </div>
            <div className="col-span-4 text-right">
              <span className="text-gray-500 font-medium">Date: </span>
              <span className="font-bold text-gray-900">
                {visit?.visit_date || new Date().toISOString().split('T')[0]}
              </span>
            </div>

            <div className="col-span-5 text-xs text-gray-600">
              <span>Patient ID: </span>
              <span className="font-mono font-semibold text-gray-800">
                PID-{String(patient.patient_id || 1).padStart(4, '0')}
              </span>
            </div>
            <div className="col-span-4 text-xs text-gray-600">
              {patient.phone && (
                <>
                  <span>Phone: </span>
                  <span className="font-medium text-gray-800">{patient.phone}</span>
                </>
              )}
            </div>
            <div className="col-span-3 text-right text-xs text-gray-600">
              <span>Visit ID: #{visit?.visit_id || visitId}</span>
            </div>
          </div>

          {/* 3. VITALS BAR */}
          {vitalsList.length > 0 && (
            <div className="py-2.5 px-3 my-3 bg-gray-50 border border-gray-200 rounded flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
              <span className="font-bold text-gray-700 uppercase tracking-wider">
                Vitals:
              </span>
              {vitalsList.map((vital, idx) => (
                <span key={idx} className="font-medium text-gray-800">
                  {vital}
                </span>
              ))}
            </div>
          )}

          {/* 4. CHIEF COMPLAINTS & DIAGNOSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-sm">
            <div className="border-l-2 border-blue-800 pl-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Chief Complaints & Findings
              </p>
              <p className="text-gray-900 font-medium mt-0.5">
                {visit?.chief_complaint || 'Routine Consultation'}
              </p>
              {cleanSymptoms && (
                <p className="text-xs text-gray-600 mt-0.5">{cleanSymptoms}</p>
              )}
            </div>

            {visit?.diagnosis && (
              <div className="border-l-2 border-emerald-700 pl-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Diagnosis
                </p>
                <p className="text-gray-900 font-semibold mt-0.5">
                  {visit.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* 5. Rx TABLE */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-serif font-bold text-blue-900">
                ℞
              </span>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-blue-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-2 px-2.5 text-left w-8 border border-blue-900">#</th>
                  <th className="py-2 px-3 text-left border border-blue-900">
                    Medicine
                  </th>
                  <th className="py-2 px-3 text-center w-36 border border-blue-900">
                    Dosage
                  </th>
                  <th className="py-2 px-3 text-center w-32 border border-blue-900">
                    Timing
                  </th>
                  <th className="py-2 px-3 text-center w-28 border border-blue-900">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-gray-500 italic"
                    >
                      No medicines prescribed in this visit.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((rx, idx) => {
                    const { pattern } = resolvePatternAndTicks(rx)
                    const durationText = rx.duration_days
                      ? `${rx.duration_days} ${rx.duration_days === 1 ? 'Day' : 'Days'}`
                      : rx.duration || '--'

                    return (
                      <tr
                        key={rx.prescription_id || idx}
                        className="border-b border-gray-300 align-top"
                      >
                        <td className="py-2.5 px-2.5 font-medium text-gray-700 border-r border-gray-300">
                          {idx + 1}.
                        </td>
                        <td className="py-2.5 px-3 border-r border-gray-300">
                          <div className="font-bold text-gray-900">
                            {rx.medicine_name || rx.medicine}
                            {rx.dosage && (
                              <span className="ml-1.5 font-semibold text-gray-700">
                                {rx.dosage}
                              </span>
                            )}
                          </div>
                          {rx.instructions && (
                            <div className="text-xs text-gray-600 mt-0.5 italic">
                              Note: {rx.instructions}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-gray-300 align-middle">
                          <div className="font-mono font-bold text-gray-900 text-sm">
                            {pattern}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium text-gray-800 border-r border-gray-300 align-middle">
                          {formatFoodTimingLabel(rx.food_timing || rx.timing)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-gray-900 align-middle">
                          {durationText}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 6. ADVICE / NOTES & FOLLOW-UP */}
          <div className="mt-6 space-y-3 text-sm">
            {(visit?.notes || visit?.treatment_plan) && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Advice / General Instructions:
                </p>
                {visit?.treatment_plan && (
                  <p className="text-gray-800">{visit.treatment_plan}</p>
                )}
                {visit?.notes && (
                  <p className="text-gray-800 whitespace-pre-line">{visit.notes}</p>
                )}
              </div>
            )}

            {visit?.follow_up_date && (
              <div className="text-sm font-semibold text-blue-950">
                Follow-up Date:{' '}
                <span className="underline">{visit.follow_up_date}</span>
              </div>
            )}
          </div>
        </div>

        {/* 7. FOOTER & DOCTOR SIGNATURE AREA */}
        <div className="pt-10 mt-8 border-t border-gray-300 flex items-end justify-between">
          <div className="text-[11px] text-gray-500 space-y-0.5">
            <p>Generated digitally via Smart Healthcare Communication App</p>
            <p>In case of emergency, please contact clinic or nearest hospital immediately.</p>
          </div>

          <div className="text-right min-w-[200px]">
            <div className="h-10 border-b border-gray-400 mb-1.5"></div>
            <p className="text-sm font-bold text-gray-900">{clinic.doctor_name}</p>
            <p className="text-xs text-gray-600">{clinic.qualifications}</p>
            <p className="text-[11px] text-gray-500">
              Reg. No.: {clinic.registration_no}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionPrint
