import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  User, 
  FileText, 
  Plus, 
  Mail, 
  Pill,
  Heart,
  Weight,
  Ruler,
  MessageSquare,
  Printer
} from 'lucide-react'
import { patientService, visitService, prescriptionService } from '../services/api'

const PatientProfile = () => {
  const { id } = useParams()
  
  // Fallback mock patient data
  const mockPatient = {
    patient_id: id,
    first_name: 'Ramesh',
    last_name: 'Chandra',
    age: 65,
    sex: 'Male',
    height: 166,
    weight: 72,
    phone: '+91-7276866115',
    email: 'ramesh.chandra@email.com',
    address: '123 Main Street, New Delhi, India',
    emergency_contact: 'Sunita Chandra',
    emergency_phone: '+91-9876543210',
    status: 'Stable',
    last_visit: '2025-09-17',
    next_appointment: '2025-10-15',
    patient_id_display: `HPID-QEM63411${String(id).padStart(2, '0')}`
  }

  const mockVisits = [
    {
      visit_id: 1,
      visit_date: '2025-09-17',
      doctor: 'Dr. Sarah Wilson',
      vitals: {
        height: '166 cm',
        weight: '72 kg',
        bp: '140 / 80 mmHg'
      },
      diagnosis: 'Hypertension, Type 2 Diabetes, CKD',
      chief_complaints: 'Excessive Urine, Weight Gain, Swollen Feet',
      prescriptions: [
        { medicine: 'Ryzodeg', dose: '12 - 0 - 12', timing: '--', frequency: '--', duration: '--', note: '' },
        { medicine: 'Jardiance 25MG', dose: '1 - 0 - 1', timing: '--', frequency: '--', duration: '--', note: '' },
        { medicine: 'ISTAMET 50/1000', dose: '1 - 0 - 1', timing: 'After Food', frequency: '--', duration: '--', note: '' },
        { medicine: 'Stamlo 5mg', dose: '1 - 0 - 0', timing: '--', frequency: '--', duration: '--', note: '' }
      ]
    },
    {
      visit_id: 2,
      visit_date: '2025-09-03',
      doctor: 'Dr. Sarah Wilson',
      vitals: {
        height: '166 cm',
        weight: '72 kg',
        bp: '140 / 80 mmHg'
      },
      diagnosis: 'Hypertension, Type 2 Diabetes, CKD',
      chief_complaints: 'Excessive Urine, Weight Gain, Swollen Feet',
      prescriptions: [
        { medicine: 'Ryzodeg', dose: '12 - 0 - 12', timing: '--', frequency: '--', duration: '--', note: '' },
        { medicine: 'Jardiance 25MG', dose: '1 - 0 - 1', timing: '--', frequency: '--', duration: '--', note: '' },
        { medicine: 'ISTAMET 50/1000', dose: '1 - 0 - 1', timing: 'After Food', frequency: '--', duration: '--', note: '' },
        { medicine: 'Stamlo 5mg', dose: '1 - 0 - 0', timing: '--', frequency: '--', duration: '--', note: '' }
      ]
    },
    {
      visit_id: 3,
      visit_date: '2025-08-11',
      doctor: 'Dr. Sarah Wilson',
      vitals: {
        height: '165 cm',
        weight: '69 kg',
        bp: '140 / 80 mmHg'
      },
      diagnosis: 'Hypertension, Type 2 Diabetes',
      chief_complaints: 'Excessive Urine',
      prescriptions: [
        { medicine: 'Ryzodeg', dose: '10 - 0 - 10', timing: '--', frequency: '--', duration: '--', note: '' },
        { medicine: 'ISTAMET 50/500', dose: '1 - 0 - 1', timing: 'After Food', frequency: '--', duration: '--', note: '' },
        { medicine: 'Stamlo 5mg', dose: '1 - 0 - 0', timing: 'After Breakfast', frequency: 'Daily', duration: '--', note: '' }
      ]
    },
    {
      visit_id: 4,
      visit_date: '2025-08-06',
      doctor: 'Dr. Sarah Wilson',
      vitals: {
        height: '166 cm',
        weight: '68 kg',
        bp: '138 / 80 mmHg'
      },
      diagnosis: 'Hypertension, Type 2 Diabetes',
      chief_complaints: 'Routine Follow-up',
      prescriptions: [
        { medicine: 'Ryzodeg', dose: '10 - 0 - 10', timing: '--', frequency: '--', duration: '--', note: '' },
        { medicine: 'ISTAMET 50/500', dose: '1 - 0 - 1', timing: 'After Food', frequency: '--', duration: '--', note: '' },
        { medicine: 'Stamlo 5mg', dose: '1 - 0 - 0', timing: 'After Breakfast', frequency: 'Daily', duration: '--', note: '' }
      ]
    }
  ]

  const { data: apiPatient } = useQuery(
    ['patient', id],
    () => patientService.getById(id),
    { retry: 1 }
  )

  const { data: apiVisits } = useQuery(
    ['patient-visits-with-rx', id],
    async () => {
      const visitsList = await visitService.getByPatientId(id)
      if (!Array.isArray(visitsList) || visitsList.length === 0) return null
      const enriched = await Promise.all(
        visitsList.map(async (v) => {
          let rxList = []
          try {
            rxList = await prescriptionService.getByVisitId(v.visit_id)
          } catch {
            rxList = []
          }
          return {
            visit_id: v.visit_id,
            visit_date: v.visit_date,
            doctor: 'Dr. Sarah Wilson',
            vitals: {
              height: apiPatient?.height ? `${apiPatient.height} cm` : '166 cm',
              weight: apiPatient?.weight ? `${apiPatient.weight} kg` : '72 kg',
              bp: '120 / 80 mmHg',
            },
            diagnosis: v.diagnosis || 'General Consultation',
            chief_complaints: v.chief_complaint || '',
            prescriptions: rxList.map((rx) => {
              const hasTicks = rx.morning || rx.noon || rx.night
              const dosePattern = hasTicks
                ? `${rx.morning ? 1 : 0} - ${rx.noon ? 1 : 0} - ${rx.night ? 1 : 0}`
                : rx.frequency || '1 - 0 - 1'
              const timingMap = {
                before: 'Before Food',
                after: 'After Food',
                with: 'With Food',
                any: 'Any Time',
              }
              return {
                medicine: `${rx.medicine_name || ''} ${rx.dosage || ''}`.trim(),
                dose: dosePattern,
                timing: timingMap[rx.food_timing] || rx.food_timing || 'After Food',
                frequency: rx.frequency || dosePattern,
                duration: rx.duration_days ? `${rx.duration_days} days` : rx.duration || '--',
                note: rx.instructions || '',
              }
            }),
          }
        })
      )
      return enriched
    },
    { retry: 1 }
  )

  const patient = apiPatient
    ? {
        ...mockPatient,
        ...apiPatient,
        patient_id_display: `HPID-QEM63411${String(apiPatient.patient_id).padStart(2, '0')}`,
      }
    : mockPatient

  const visits = apiVisits && apiVisits.length > 0 ? apiVisits : mockVisits

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return { day, month, year }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{patient.patient_id_display}</span>
                <span>•</span>
                <span>{patient.age}y</span>
                <span>•</span>
                <span>{patient.sex}</span>
                <span>•</span>
                <span>{patient.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/patients/${id}/visit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Visit / Rx</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Timeline Sidebar */}
        <div className="w-20 bg-white border-r border-gray-200 py-6">
          <div className="space-y-6">
            {visits.map((visit, index) => {
              const { day, month } = formatDate(visit.visit_date)
              return (
                <div key={visit.visit_id} className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-medium ${
                    index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className="text-lg font-bold">{day}</div>
                    <div className="text-xs">{month}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-6 border-b border-gray-200">
              <button className="pb-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
                Advice
              </button>
              <button className="pb-2 px-1 text-gray-500 hover:text-gray-700">
                Tests Requested
              </button>
              <button className="pb-2 px-1 text-gray-500 hover:text-gray-700">
                Load Previous
              </button>
            </div>
          </div>

          {/* Past Visits Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Past Visits</h3>
              <span className="text-sm text-gray-600">{visits.length} visit(s)</span>
            </div>

            <div className="space-y-4">
              {visits.map((visit) => {
                const { day, month, year } = formatDate(visit.visit_date)
                return (
                  <div key={visit.visit_id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Visit Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{day}</div>
                            <div className="text-sm text-gray-500">{month}</div>
                            <div className="text-sm text-gray-500">{year}</div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {day}-{month}-{year}
                            </h4>
                            <p className="text-sm text-gray-600">By {visit.doctor}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </button>
                          <button className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>SMS</span>
                          </button>
                          <Link
                            to={`/visits/${visit.visit_id}/prescription`}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                            <span>View / Print Prescription</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Visit Content */}
                    <div className="p-6">
                      {/* Vitals */}
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-900 mb-3">Vitals:</h5>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Ruler className="w-4 h-4" />
                            <span>Height {visit.vitals.height}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Weight className="w-4 h-4" />
                            <span>Weight {visit.vitals.weight}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4" />
                            <span>BP {visit.vitals.bp}</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-900 mb-2">Diagnosis:</h5>
                        <p className="text-gray-700">{visit.diagnosis}</p>
                      </div>

                      {/* Chief Complaints */}
                      {visit.chief_complaints && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-gray-900 mb-2">Chief Complaints:</h5>
                          <p className="text-gray-700">{visit.chief_complaints}</p>
                        </div>
                      )}

                      {/* Prescriptions */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Pill className="w-4 h-4 mr-2" />
                          Rx
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Medicine</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Dose</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Timing</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Frequency</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Duration</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visit.prescriptions.map((prescription, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-2 px-3 text-gray-900">{prescription.medicine}</td>
                                  <td className="py-2 px-3 text-gray-600 font-mono">{prescription.dose}</td>
                                  <td className="py-2 px-3 text-gray-600">{prescription.timing}</td>
                                  <td className="py-2 px-3 text-gray-600">{prescription.frequency}</td>
                                  <td className="py-2 px-3 text-gray-600">{prescription.duration}</td>
                                  <td className="py-2 px-3 text-gray-600">{prescription.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center">
            <Link
              to={`/patients/${id}/visit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Visit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientProfile
