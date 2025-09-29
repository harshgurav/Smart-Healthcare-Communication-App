import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
  Plus,
  Calendar,
  Users,
  FileText,
  Activity,
  Phone,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { patientService, visitService } from '../services/api'

const Dashboard = () => {
  const { data: stats } = useQuery('patient-stats', patientService.getStats)
  const { data: patients = [] } = useQuery('recent-patients', () => patientService.getAll({ limit: 4 }))

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.total_patients || 248,
      change: '+12 this month',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: "Today's Appointments",
      value: 8,
      change: '2 completed',
      changeType: 'neutral',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Reports',
      value: 15,
      change: '-3 from yesterday',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Cases',
      value: 32,
      change: '+4 this week',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-blue-500'
    }
  ]

  const quickActions = [
    { title: 'New Patient Registration', icon: Plus },
    { title: 'Schedule Appointment', icon: Calendar },
    { title: 'Generate Report', icon: FileText },
    { title: 'View Analytics', icon: TrendingUp }
  ]

  const getStatusBadge = (status) => {
    const badges = {
      'Stable': 'bg-green-100 text-green-800',
      'Needs Attention': 'bg-yellow-100 text-yellow-800',
      'Critical': 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const mockPatients = [
    {
      patient_id: 1,
      first_name: 'Ramesh',
      last_name: 'Chandra',
      age: 45,
      sex: 'Male',
      phone: '+91-9876543210',
      last_visit: '2025-09-15',
      next_visit: '2025-09-25',
      status: 'Stable',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 2,
      first_name: 'Priya',
      last_name: 'Sharma',
      age: 32,
      sex: 'Female',
      phone: '+91-9876543212',
      last_visit: '2025-09-12',
      next_visit: '2025-09-20',
      status: 'Needs Attention',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 3,
      first_name: 'Rajesh',
      last_name: 'Kumar',
      age: 67,
      sex: 'Male',
      phone: '+91-9876543214',
      last_visit: '2025-09-10',
      next_visit: '2025-09-30',
      status: 'Critical',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      patient_id: 4,
      first_name: 'Anita',
      last_name: 'Patel',
      age: 28,
      sex: 'Female',
      phone: '+91-9876543216',
      last_visit: '2025-09-08',
      next_visit: '2025-10-01',
      status: 'Stable',
      doctor: 'Dr. Sarah Wilson'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <Link
            to="/patients/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Patient</span>
          </Link>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>View Schedule</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <Link to="/patients" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                View All Patients
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockPatients.map((patient) => (
                  <div key={patient.patient_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {patient.age} years • {patient.sex}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            📞 Last visit: {patient.last_visit}
                          </span>
                          <span className="text-xs text-gray-500">
                            📞 {patient.phone}
                          </span>
                          <span className="text-xs text-gray-500">
                            📅 Next: {patient.next_visit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(patient.status)}`}>
                        {patient.status}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          to={`/patients/${patient.patient_id}`}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Records</span>
                        </Link>
                        <Link
                          to={`/patients/${patient.patient_id}/visit`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          New Visit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & AI Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{action.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Patient Risk Alert</h4>
                    <p className="text-sm text-red-700 mt-1">
                      3 patients require follow-up for chronic condition monitoring
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Medication Compliance</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Overall patient medication adherence: 87%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard