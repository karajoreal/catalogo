import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Logo SVG corporativo Tendence (cuadrícula 2x2)
function TendenceLogo({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="13" height="13" fill="#ED1C24" rx="1.5" />
            <rect x="15" y="0" width="13" height="13" fill="#A3C939" rx="1.5" />
            <rect x="0" y="15" width="13" height="13" fill="#F7941D" rx="1.5" />
            <rect x="15" y="15" width="13" height="13" fill="#99D9EA" rx="1.5" />
            <text x="15" y="25.5" fontSize="7" fontWeight="700" fill="white" fontFamily="Arial, sans-serif" textAnchor="middle" dominantBaseline="auto">TD</text>
        </svg>
    )
}

export default function Navbar() {
    const { admin } = useAuth()
    const navigate = useNavigate()

    return (
        <nav className="navbar">
            <div className="navbar__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <TendenceLogo size={30} />
                <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px', fontSize: '1.3rem', fontWeight: 700 }}>
                    TENDENCE <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>Catálogos</span>
                </span>
            </div>
            <div className="navbar__nav">
                <NavLink to="/" end>Inicio</NavLink>
                {admin && <NavLink to="/admin">Admin</NavLink>}
            </div>
            <div className="navbar__actions">
                {admin ? (
                    <button className="btn btn-outline" style={{ fontSize: '.8rem', padding: '.4rem 1rem' }} onClick={() => navigate('/admin')}>
                        Panel Admin
                    </button>
                ) : (
                    <button className="btn btn-outline" style={{ fontSize: '.8rem', padding: '.4rem 1rem' }} onClick={() => navigate('/admin/login')}>
                        Acceso Admin
                    </button>
                )}
            </div>
        </nav>
    )
}
