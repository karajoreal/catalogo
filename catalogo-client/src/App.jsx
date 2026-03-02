import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CatalogoViewer from './pages/CatalogoViewer'
import ImageViewer from './pages/ImageViewer'
import Login from './pages/Login'
import Admin from './pages/Admin'
import API_URL from './config'

function PrivateRoute({ children }) {
    const { admin, loading } = useAuth()
    if (loading) return <div className="loading"><div className="spinner" /></div>
    return admin ? children : <Navigate to="/admin/login" replace />
}

// Router que detecta el tipo de catálogo y muestra el visor correcto
function CatalogoRouter() {
    const { id } = useParams()
    const [tipo, setTipo] = useState(null)

    useEffect(() => {
        fetch(`${API_URL}/api/catalogos/${id}`)
            .then(r => r.json())
            .then(d => setTipo(d.tipo || 'pdf'))
            .catch(() => setTipo('pdf'))
    }, [id])

    if (!tipo) return <div className="loading"><div className="spinner" /></div>
    return tipo === 'imagenes' ? <ImageViewer /> : <CatalogoViewer />
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<><Navbar /><Home /></>} />
                    <Route path="/catalogo/:id" element={<CatalogoRouter />} />
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
