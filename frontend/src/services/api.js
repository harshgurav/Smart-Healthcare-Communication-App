import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Patient services
export const patientService = {
    getAll: (params = {}) => api.get('/patients', { params }).then(res => res.data),
    getById: (id) => api.get(`/patients/${id}`).then(res => res.data),
    create: (data) => api.post('/patients', data).then(res => res.data),
    update: (id, data) => api.put(`/patients/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/patients/${id}`).then(res => res.data),
    getStats: () => api.get('/patients/stats').then(res => res.data),
}

// Visit services
export const visitService = {
    getByPatientId: (patientId) => api.get(`/patients/${patientId}/visits`).then(res => res.data),
    create: (patientId, data) => api.post(`/patients/${patientId}/visits`, data).then(res => res.data),
    getById: (id) => api.get(`/visits/${id}`).then(res => res.data),
    update: (id, data) => api.put(`/visits/${id}`, data).then(res => res.data),
}

// Prescription services
export const prescriptionService = {
    getByVisitId: (visitId) => api.get(`/visits/${visitId}/prescriptions`).then(res => res.data),
    create: (visitId, data) => api.post(`/visits/${visitId}/prescriptions`, data).then(res => res.data),
    bulkReplace: (visitId, prescriptions) => api.post(`/visits/${visitId}/prescriptions/bulk`, prescriptions).then(res => res.data),
    update: (id, data) => api.put(`/prescriptions/${id}`, data).then(res => res.data),
}

// Medicine catalog services
export const medicineService = {
    search: (q = '') => api.get('/medicines/search', { params: { q } }).then(res => res.data),
}

// Clinic settings services
export const clinicService = {
    get: () => api.get('/clinic').then(res => res.data),
    update: (data) => api.put('/clinic', data).then(res => res.data),
}

// AI services
export const aiService = {
    generateSummary: (patientId) => api.post(`/patients/${patientId}/summary`).then(res => res.data),
    searchMedicines: (query) => api.post('/ai/medicine-search', null, { params: { query } }).then(res => res.data),
    diagnosisAssist: (symptoms) => api.post('/ai/diagnosis-assist', { symptoms }).then(res => res.data),
}

// Document services
export const documentService = {
    upload: (patientId, file, documentType, visitId) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('document_type', documentType)
        if (visitId) formData.append('visit_id', visitId)

        return api.post(`/patients/${patientId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data)
    },
    getByPatientId: (patientId) => api.get(`/patients/${patientId}/documents`).then(res => res.data),
}

export default api
