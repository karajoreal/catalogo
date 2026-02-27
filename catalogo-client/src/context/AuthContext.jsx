import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('catalogo_token')
        const stored = localStorage.getItem('catalogo_admin')
        if (token && stored) {
            setAdmin(JSON.parse(stored))
        }
        setLoading(false)
    }, [])

    const login = (token, adminData) => {
        localStorage.setItem('catalogo_token', token)
        localStorage.setItem('catalogo_admin', JSON.stringify(adminData))
        setAdmin(adminData)
    }

    const logout = () => {
        localStorage.removeItem('catalogo_token')
        localStorage.removeItem('catalogo_admin')
        setAdmin(null)
    }

    const getToken = () => localStorage.getItem('catalogo_token')

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
