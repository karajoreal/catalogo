import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
            login(data.token, data.admin)
            navigate('/admin')
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>📚 CatalogoHub</h1>
                <p className="login-sub">Panel de Administración</p>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input
                            className="form-control"
                            type="email"
                            placeholder="admin@catalogohub.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            className="form-control"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            required
                        />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '.75rem', padding: '.85rem' }} disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión →'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.8rem', color: 'var(--text-dim)' }}>
                    ← <a href="/" style={{ color: 'var(--gold)' }}>Volver a catálogos</a>
                </p>
            </div>
        </div>
    )
}
