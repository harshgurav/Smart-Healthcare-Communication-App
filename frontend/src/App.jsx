import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PatientList from './pages/PatientList'
import PatientProfile from './pages/PatientProfile'
import NewVisit from './pages/NewVisit'
import NewPatient from './pages/NewPatient'
import PrescriptionPrint from './pages/PrescriptionPrint'

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/new" element={<NewPatient />} />
                <Route path="/patients/:id" element={<PatientProfile />} />
                <Route path="/patients/:id/visit" element={<NewVisit />} />
                <Route path="/visits/:visitId/prescription" element={<PrescriptionPrint />} />
            </Routes>
        </Layout>
    )
}

export default App
