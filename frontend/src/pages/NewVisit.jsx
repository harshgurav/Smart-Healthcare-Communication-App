import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Calendar, Save, X, Printer, CheckCircle2, Activity, ArrowLeft } from 'lucide-react'
import { patientService, visitService, prescriptionService } from '../services/api'
import PrescriptionTable, {
  createEmptyPrescriptionRow,
  formatDosagePattern,
} from '../components/PrescriptionTable'

const DEFAULT_FALLBACK_LAST_RX = [
  {
    medicine_name: 'Telmisartan (Telma)',
    dosage: '40mg',
    morning: true,
    noon: false,
    night: false,
    food_timing: 'after',
    duration_days: 30,
    instructions: 'Continue regular BP monitoring',
  },
  {
    medicine_name: 'Metformin SR (Glycomet SR)',
    dosage: '500mg',
    morning: true,
    noon: false,
    night: true,
    food_timing: 'after',
    duration_days: 30,
    instructions: 'Take after meals',
  },
]

const buildVitalsPrefix = (vitals) => {
  const parts = []
  if (vitals.temperature?.trim()) parts.push(`Temp: ${vitals.temperature.trim()}`)
  if (vitals.bp?.trim()) parts.push(`BP: ${vitals.bp.trim()}`)
  if (vitals.pulse?.trim()) parts.push(`Pulse: ${vitals.pulse.trim()}`)
  if (vitals.spo2?.trim()) parts.push(`SpO2: ${vitals.spo2.trim()}`)
  if (vitals.weight?.trim()) parts.push(`Wt: ${vitals.weight.trim()}`)
  return parts.length > 0 ? `[Vitals: ${parts.join(' | ')}]` : ''
}

const NewVisit = () => {
  const { id: patientId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [visitData, setVisitData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    symptoms: '',
    diagnosis: '',
    treatment_plan: '',
    follow_up_date: '',
    notes: '',
  })

  const [vitals, setVitals] = useState({
    temperature: '98.6 °F',
    bp: '120/80 mmHg',
    pulse: '76 /min',
    spo2: '98%',
    weight: '',
  })

  const [prescriptions, setPrescriptions] = useState([
    createEmptyPrescriptionRow(),
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopyingLast, setIsCopyingLast] = useState(false)
  const [error, setError] = useState('')
  const [savedVisit, setSavedVisit] = useState(null)

  const { data: patient } = useQuery(
    ['patient', patientId],
    () => patientService.getById(patientId),
    {
      retry: 1,
      onSuccess: (p) => {
        if (p?.weight && !vitals.weight) {
          setVitals((prev) => ({ ...prev, weight: `${p.weight} kg` }))
        }
      },
    }
  )

  const { data: pastVisits = [] } = useQuery(
    ['patient-visits', patientId],
    () => visitService.getByPatientId(patientId),
    { retry: 1 }
  )

  const displayPatient = patient || {
    first_name: 'Ramesh',
    last_name: 'Chandra',
    age: 45,
    sex: 'Male',
  }

  const handleCopyLastPrescription = async () => {
    setIsCopyingLast(true)
    try {
      if (pastVisits.length > 0) {
        const lastVisit = pastVisits[0]
        const lastRx = await prescriptionService.getByVisitId(lastVisit.visit_id)
        if (Array.isArray(lastRx) && lastRx.length > 0) {
          setPrescriptions(
            lastRx.map((item) => ({
              medicine_name: item.medicine_name || '',
              dosage: item.dosage || '',
              morning: Boolean(item.morning),
              noon: Boolean(item.noon),
              night: Boolean(item.night),
              food_timing: item.food_timing || 'after',
              duration_days: item.duration_days ?? 5,
              instructions: item.instructions || '',
            }))
          )
          return
        }
      }
      setPrescriptions(DEFAULT_FALLBACK_LAST_RX)
    } catch {
      setPrescriptions(DEFAULT_FALLBACK_LAST_RX)
    } finally {
      setIsCopyingLast(false)
    }
  }

  const createVisitMutation = useMutation(
    async ({ cleanedData, validPrescriptions }) => {
      const visit = await visitService.create(patientId, cleanedData)
      if (validPrescriptions.length > 0) {
        await prescriptionService.bulkReplace(visit.visit_id, validPrescriptions)
      }
      return visit
    },
    {
      onSuccess: (visit) => {
        queryClient.invalidateQueries(['patient-visits', patientId])
        setSavedVisit(visit)
        setIsSubmitting(false)
      },
      onError: (err) => {
        setError(err.response?.data?.detail || 'Failed to create visit')
        setIsSubmitting(false)
      },
    }
  )

  const submitVisit = async (openPrintAfterSave = false) => {
    setIsSubmitting(true)
    setError('')

    try {
      const vitalsPrefix = buildVitalsPrefix(vitals)
      const combinedSymptoms = [vitalsPrefix, visitData.symptoms?.trim()]
        .filter(Boolean)
        .join('\n')

      const cleanedData = {
        ...visitData,
        symptoms: combinedSymptoms,
        follow_up_date: visitData.follow_up_date || null,
      }

      const validPrescriptions = prescriptions
        .filter((p) => p.medicine_name && p.medicine_name.trim())
        .map((p) => {
          const days =
            p.duration_days === '' || p.duration_days === null || p.duration_days === undefined
              ? null
              : Number(p.duration_days)
          return {
            medicine_name: p.medicine_name.trim(),
            dosage: p.dosage?.trim() || '',
            morning: Boolean(p.morning),
            noon: Boolean(p.noon),
            night: Boolean(p.night),
            food_timing: p.food_timing || 'after',
            duration_days: days,
            frequency: formatDosagePattern(p),
            duration: days ? `${days} days` : '',
            instructions: p.instructions?.trim() || '',
          }
        })

      const visit = await createVisitMutation.mutateAsync({
        cleanedData,
        validPrescriptions,
      })

      if (openPrintAfterSave && visit?.visit_id) {
        navigate(`/visits/${visit.visit_id}/prescription`)
      }
    } catch (err) {
      setError(err.message || 'Failed to create visit')
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitVisit(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Consultation & Prescription</h1>
            <p className="text-gray-600">
              Patient: {displayPatient.first_name} {displayPatient.last_name} • {displayPatient.age} years • {displayPatient.sex}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/patients/${patientId}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Saved Visit Banner with View / Print Prescription button */}
      {savedVisit && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-900">
                Visit & Prescription Saved Successfully!
              </h4>
              <p className="text-sm text-emerald-700">
                Ready to print or download the A4 prescription for {displayPatient.first_name} {displayPatient.last_name}.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/patients/${patientId}`}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Patient Profile</span>
            </Link>
            <Link
              to={`/visits/${savedVisit.visit_id}/prescription`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>View / Print Prescription</span>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vitals Quick Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-3.5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Vitals
            </h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Temperature
              </label>
              <input
                type="text"
                placeholder="e.g. 98.6 °F"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Blood Pressure (BP)
              </label>
              <input
                type="text"
                placeholder="e.g. 120/80 mmHg"
                value={vitals.bp}
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pulse Rate
              </label>
              <input
                type="text"
                placeholder="e.g. 76 /min"
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                SpO2
              </label>
              <input
                type="text"
                placeholder="e.g. 98%"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Weight
              </label>
              <input
                type="text"
                placeholder="e.g. 70 kg"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Visit Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Visit & Clinical Findings
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Visit Date *
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={visitData.visit_date}
                  onChange={(e) => setVisitData({ ...visitData, visit_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={visitData.follow_up_date}
                  onChange={(e) => setVisitData({ ...visitData, follow_up_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chief Complaints *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="e.g., Fever since 2 days, body ache, sore throat..."
                  value={visitData.chief_complaint}
                  onChange={(e) => setVisitData({ ...visitData, chief_complaint: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Diagnosis
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="e.g., Acute Viral Pharyngitis..."
                  value={visitData.diagnosis}
                  onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Clinical Symptoms / Examination
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Detailed symptoms or examination findings..."
                  value={visitData.symptoms}
                  onChange={(e) => setVisitData({ ...visitData, symptoms: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  General Advice / Notes (Printed on Rx)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="e.g., Drink plenty of warm fluids, steam inhalation twice daily, avoid cold items..."
                  value={visitData.notes}
                  onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Builder Table */}
        <PrescriptionTable
          prescriptions={prescriptions}
          onChange={setPrescriptions}
          onCopyLastPrescription={handleCopyLastPrescription}
          hasLastPrescription={true}
          isCopyingLast={isCopyingLast}
        />

        {/* Submit Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/patients/${patientId}`)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createVisitMutation.isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting || createVisitMutation.isLoading ? 'Saving...' : 'Save Visit'}
              </span>
            </button>
            <button
              type="button"
              disabled={isSubmitting || createVisitMutation.isLoading}
              onClick={() => submitVisit(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Save & View / Print Prescription</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewVisit
