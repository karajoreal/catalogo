import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import CatalogoCard from '../components/CatalogoCard'
import API_URL from '../config'

const API = `${API_URL}/api`

export default function Home() {
    const navigate = useNavigate()
    const [catalogos, setCatalogos] = useState([])
    const [marcas, setMarcas] = useState([])
    const [temporadas, setTemporadas] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtros, setFiltros] = useState({ marca_ids: [], anios: [] })

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [cRes, mRes, tRes] = await Promise.all([
                    fetch(`${API}/catalogos`),
                    fetch(`${API}/marcas`),
                    fetch(`${API}/temporadas`)
                ])
                const cData = await cRes.json()
                const mData = await mRes.json()
                const tData = await tRes.json()
                setCatalogos(cData.catalogos || [])
                setMarcas(mData || [])
                setTemporadas(tData || [])
            } catch (e) {
                console.error('Error cargando:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    // Filtrar catalogos
    const filtered = catalogos.filter(c => {
        const byMarca = filtros.marca_ids.length === 0 || filtros.marca_ids.includes(c.marca_id)
        const byAnio = filtros.anios.length === 0 || filtros.anios.includes(c.anio)
        return byMarca && byAnio
    })

    // Agrupar por año
    const byAnio = {}
    filtered.forEach(c => {
        const y = c.anio || 'Sin año'
        if (!byAnio[y]) byAnio[y] = []
        byAnio[y].push(c)
    })
    const sortedAnios = Object.keys(byAnio).sort((a, b) => b - a)

    if (loading) return (
        <div className="layout">
            <div className="loading"><div className="spinner" /></div>
        </div>
    )

    return (
        <div className="layout">
            <FilterBar
                marcas={marcas}
                temporadas={temporadas}
                filtros={filtros}
                onChange={setFiltros}
            />
            <main className="main-content">
                {sortedAnios.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No hay catálogos disponibles</h3>
                        <p style={{ color: 'var(--text-dim)', marginTop: '.5rem' }}>
                            Prueba cambiando los filtros o espera a que el administrador suba nuevos catálogos.
                        </p>
                    </div>
                ) : (
                    sortedAnios.map(anio => (
                        <section key={anio} style={{ marginBottom: '3rem' }}>
                            <div className="section-header">
                                <h2>Temporada {anio}</h2>
                                <span className="count-badge">{byAnio[anio].length} catálogo{byAnio[anio].length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="catalog-grid">
                                {byAnio[anio].map(cat => (
                                    <CatalogoCard
                                        key={cat.id}
                                        catalogo={cat}
                                        onClick={() => navigate(`/catalogo/${cat.id}`)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </main>
        </div>
    )
}
