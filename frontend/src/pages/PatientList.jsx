import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Search, Plus, Filter, Eye, Phone, Calendar, User } from 'lucide-react'
import { patientService } from '../services/api'

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: patients = [], isLoading } = useQuery(
    ['patients', searchTerm],
    () => patientService.getAll({ search: searchTerm }),
    { enabled: true }
  )

  // Mock data for demonstration
  const mockPatients = [
    {
      patient_id: 1,
      first_name: 'Ramesh',
      last_name: 'Chandra',
      age: 45,
      sex: 'Male',
      phone: '+91-9876543210',
      email: 'ramesh.chandra@email.com',
      last_visit: '2025-09-15',
      next_visit: '2025-09-25',
      status: 'Stable',
      created_at: '2025-01-15',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 2,
      first_name: 'Priya',
      last_name: 'Sharma',
      age: 32,
      sex: 'Female',
      phone: '+91-9876543212',
      email: 'priya.sharma@email.com',
      last_visit: '2025-09-12',
      next_visit: '2025-09-20',
      status: 'Needs Attention',
      created_at: '2025-02-20',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 3,
      first_name: 'Rajesh',
      last_name: 'Kumar',
      age: 67,
      sex: 'Male',
      phone: '+91-9876543214',
      email: 'rajesh.kumar@email.com',
      last_visit: '2025-09-10',
      next_visit: '2025-09-30',
      status: 'Critical',
      created_at: '2025-01-10',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 4,
      first_name: 'Anita',
      last_name: 'Patel',
      age: 28,
      sex: 'Female',
      phone: '+91-9876543216',
      email: 'anita.patel@email.com',
      last_visit: '2025-09-08',
      next_visit: '2025-10-01',
      status: 'Stable',
      created_at: '2025-03-05',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 5,
      first_name: 'Suresh',
      last_name: 'Gupta',
      age: 55,
      sex: 'Male',
      phone: '+91-9876543218',
      email: 'suresh.gupta@email.com',
      last_visit: '2025-09-05',
      next_visit: '2025-09-28',
      status: 'Stable',
      created_at: '2025-01-25',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 6,
      first_name: 'Kavita',
      last_name: 'Singh',
      age: 41,
      sex: 'Female',
      phone: '+91-9876543220',
      email: 'kavita.singh@email.com',
      last_visit: '2025-09-03',
      next_visit: '2025-09-22',
      status: 'Needs Attention',
      created_at: '2025-02-14',
      doctor: 'Dr. Sarah Wilson'
    }
  ]

  const getStatusBadge = (status) => {
    const badges = {
      'Stable': 'bg-green-100 text-green-800',
      'Needs Attention': 'bg-yellow-100 text-yellow-800',
      'Critical': 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = searchTerm === '' ||
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)

    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage your patient records and appointments</p>
        </div>
        <Link
          to="/patients/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients by name or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Stable">Stable</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="Critical">Critical</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Patients ({filteredPatients.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
            </p>
            <Link
              to="/patients/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <div key={patient.patient_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {patient.age} years • {patient.sex}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Last visit: {patient.last_visit}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Next: {patient.next_visit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(patient.status)}`}>
                      {patient.status}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/patients/${patient.patient_id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Records</span>
                      </Link>
                      <Link
                        to={`/patients/${patient.patient_id}/visit`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        New Visit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientList