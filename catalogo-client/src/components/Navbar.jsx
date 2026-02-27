import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { admin } = useAuth()
    const navigate = useNavigate()

    return (
        <nav className="navbar">
            <div className="navbar__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                📚 Catalogo<span>Hub</span>
            </div>
            <div className="navbar__nav">
                <NavLink to="/" end>Inicio</NavLink>
                <NavLink to="/?seccion=marcas">Marcas</NavLink>
                <NavLink to="/?seccion=temporadas">Temporadas</NavLink>
            </div>
            <div className="navbar__actions">
                {admin ? (
                    <NavLink to="/admin" className="btn btn-outline" style={{ fontSize: '.85rem', padding: '.4rem 1rem' }}>
                        ⚙️ Admin
                    </NavLink>
                ) : (
                    <NavLink to="/admin/login" className="btn btn-outline" style={{ fontSize: '.85rem', padding: '.4rem 1rem' }}>
                        🔐 Admin
                    </NavLink>
                )}
            </div>
        </nav>
    )
}
