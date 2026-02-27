import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CatalogoViewer from './pages/CatalogoViewer'
import Login from './pages/Login'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
    const { admin, loading } = useAuth()
    if (loading) return <div className="loading"><div className="spinner" /></div>
    return admin ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<><Navbar /><Home /></>} />
                    <Route path="/catalogo/:id" element={<CatalogoViewer />} />

                    {/* Admin routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={
                        <PrivateRoute><Admin /></PrivateRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
