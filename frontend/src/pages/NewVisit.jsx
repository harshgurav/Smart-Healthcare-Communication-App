import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from 'react-query'
import { Calendar, FileText, Plus, Trash2, Save, X } from 'lucide-react'
import { visitService, prescriptionService } from '../services/api'

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
    notes: ''
  })

  const [prescriptions, setPrescriptions] = useState([
    { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const createVisitMutation = useMutation(
    async (data) => {
      console.log('Creating visit with data:', data)
      const visit = await visitService.create(patientId, data)
      console.log('Visit created:', visit)

      // Create prescriptions
      for (const prescription of prescriptions) {
        if (prescription.medicine_name) {
          console.log('Creating prescription:', prescription)
          await prescriptionService.create(visit.visit_id, prescription)
        }
      }

      return visit
    },
    {
      onSuccess: (visit) => {
        console.log('Visit creation successful:', visit)
        queryClient.invalidateQueries(['patient-visits', patientId])
        navigate(`/patients/${patientId}`)
      },
      onError: (error) => {
        console.error('Visit creation failed:', error)
        setError(error.response?.data?.detail || 'Failed to create visit')
        setIsSubmitting(false)
      }
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Clean the data before sending
      const cleanedData = {
        ...visitData,
        follow_up_date: visitData.follow_up_date || null
      }

      console.log('Submitting visit data:', cleanedData)
      await createVisitMutation.mutateAsync(cleanedData)
    } catch (error) {
      console.error('Submit error:', error)
      setError(error.message || 'Failed to create visit')
      setIsSubmitting(false)
    }
  }

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      medicine_name: '', dosage: '', frequency: '', duration: '', instructions: ''
    }])
  }

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index, field, value) => {
    const updated = [...prescriptions]
    updated[index][field] = value
    setPrescriptions(updated)
  }

  // Mock patient data
  const mockPatient = {
    first_name: 'Ramesh',
    last_name: 'Chandra',
    age: 45,
    sex: 'Male',
    doctor: 'Dr. Sarah Wilson'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Visit</h1>
            <p className="text-gray-600">
              Patient: {mockPatient.first_name} {mockPatient.last_name} • {mockPatient.age} years • {mockPatient.sex}
            </p>
          </div>
          <button
            onClick={() => navigate(`/patients/${patientId}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visit Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Visit Details
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Complaint *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Patient's main concern or reason for visit..."
                value={visitData.chief_complaint}
                onChange={(e) => setVisitData({ ...visitData, chief_complaint: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Detailed symptoms observed or reported..."
                value={visitData.symptoms}
                onChange={(e) => setVisitData({ ...visitData, symptoms: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Medical diagnosis..."
                value={visitData.diagnosis}
                onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Plan
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Recommended treatment and care plan..."
                value={visitData.treatment_plan}
                onChange={(e) => setVisitData({ ...visitData, treatment_plan: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Any additional observations or notes..."
                value={visitData.notes}
                onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Prescriptions
            </h3>
            <button
              type="button"
              onClick={addPrescription}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Medicine {index + 1}</h4>
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescription(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Paracetamol"
                        value={prescription.medicine_name}
                        onChange={(e) => updatePrescription(index, 'medicine_name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 500mg"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={prescription.frequency}
                        onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 7 days"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Take after meals"
                      value={prescription.instructions}
                      onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/patients/${patientId}`)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createVisitMutation.isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting || createVisitMutation.isLoading ? 'Saving...' : 'Save Visit'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewVisit