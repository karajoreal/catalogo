import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

const API = `${API_URL}/api`

export default function Admin() {
    const { admin, logout, getToken } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('catalogos')
    const [catalogos, setCatalogos] = useState([])
    const [marcas, setMarcas] = useState([])
    const [temporadas, setTemporadas] = useState([])
    const [stats, setStats] = useState({ catalogos: 0, marcas: 0, temporadas: 0, visualizaciones: 0 })
    const [toast, setToast] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [form, setForm] = useState({ titulo: '', descripcion: '', marca_id: '', temporada_id: '', es_nuevo: false })
    const pdfRef = useRef()
    const portadaRef = useRef()
    const [dragOver, setDragOver] = useState(false)
    const [pdfFile, setPdfFile] = useState(null)
    const [portadaFile, setPortadaFile] = useState(null)

    const headers = () => ({ Authorization: `Bearer ${getToken()}` })

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchAll = async () => {
        try {
            const [cRes, mRes, tRes] = await Promise.all([
                fetch(`${API}/catalogos?limit=100`, { headers: headers() }),
                fetch(`${API}/marcas`),
                fetch(`${API}/temporadas`)
            ])
            const cData = await cRes.json()
            const mData = await mRes.json()
            const tData = await tRes.json()
            setCatalogos(cData.catalogos || [])
            setMarcas(mData || [])
            setTemporadas(tData || [])
            setStats({
                catalogos: cData.catalogos?.length || 0,
                marcas: mData.length || 0,
                temporadas: tData.length || 0,
                visualizaciones: (cData.catalogos || []).reduce((s, c) => s + (c.visualizaciones || 0), 0)
            })
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!pdfFile) return showToast('Selecciona un archivo PDF', 'error')
        if (!form.titulo || !form.marca_id || !form.temporada_id) return showToast('Completa todos los campos requeridos', 'error')
        setUploading(true)
        try {
            const fd = new FormData()
            fd.append('pdf', pdfFile)
            if (portadaFile) fd.append('portada', portadaFile)
            Object.entries(form).forEach(([k, v]) => fd.append(k, v))
            const res = await fetch(`${API}/catalogos`, { method: 'POST', headers: headers(), body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            showToast('✅ Catálogo subido exitosamente')
            setForm({ titulo: '', descripcion: '', marca_id: '', temporada_id: '', es_nuevo: false })
            setPdfFile(null)
            setPortadaFile(null)
            fetchAll()
        } catch (e) {
            showToast('❌ ' + e.message, 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este catálogo?')) return
        await fetch(`${API}/catalogos/${id}`, { method: 'DELETE', headers: headers() })
        showToast('Catálogo eliminado')
        fetchAll()
    }

    const handleLogout = () => { logout(); navigate('/admin/login') }

    const navItems = [
        { id: 'catalogos', icon: '📚', label: 'Catálogos' },
        { id: 'marcas', icon: '🏷️', label: 'Marcas' },
        { id: 'temporadas', icon: '📅', label: 'Temporadas' },
    ]

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>📚 CatalogoHub</h2>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-dim)', marginTop: '.25rem' }}>v1.0 — {admin?.nombre}</p>
                </div>
                <nav className="admin-nav">
                    <button className="admin-nav-item" onClick={() => navigate('/')}>🏠 Ver Catálogos</button>
                    {navItems.map(n => (
                        <button key={n.id} className={`admin-nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
                            {n.icon} {n.label}
                        </button>
                    ))}
                    <button className="admin-nav-item admin-nav-logout" style={{ marginTop: 'auto' }} onClick={handleLogout}>🚪 Cerrar Sesión</button>
                </nav>
            </aside>

            {/* Main */}
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Panel de Administración</h1>
                    <p>CatalogoHub — Gestión de catálogos de productos</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    {[
                        { icon: '📚', value: stats.catalogos, label: 'Catálogos' },
                        { icon: '🏷️', value: stats.marcas, label: 'Marcas' },
                        { icon: '📅', value: stats.temporadas, label: 'Temporadas' },
                        { icon: '👁️', value: stats.visualizaciones.toLocaleString(), label: 'Visualizaciones' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-icon">{s.icon}</div>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                {activeTab === 'catalogos' && (
                    <>
                        {/* Upload Form */}
                        <div className="glass-card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>📤 Subir Nuevo Catálogo</h2>
                            <form onSubmit={handleUpload}>
                                {/* Drop zone */}
                                <div
                                    className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                                    style={{ marginBottom: '1.5rem' }}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => {
                                        e.preventDefault(); setDragOver(false)
                                        const f = e.dataTransfer.files[0]
                                        if (f?.type === 'application/pdf') setPdfFile(f)
                                    }}
                                    onClick={() => pdfRef.current?.click()}
                                >
                                    <div className="upload-icon">📄</div>
                                    {pdfFile ? (
                                        <><h3 style={{ color: 'var(--gold)' }}>✅ {pdfFile.name}</h3><p>{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p></>
                                    ) : (
                                        <><h3>Arrastra tu PDF aquí</h3><p>o haz clic para seleccionar un archivo (máx. 200 MB)</p></>
                                    )}
                                    <input ref={pdfRef} type="file" accept=".pdf" hidden onChange={e => setPdfFile(e.target.files[0])} />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nombre del Catálogo *</label>
                                        <input className="form-control" placeholder="Ej: Colección Primavera 2026" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Marca *</label>
                                        <select className="form-control" value={form.marca_id} onChange={e => setForm(f => ({ ...f, marca_id: e.target.value }))} required>
                                            <option value="">Seleccionar marca...</option>
                                            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Temporada / Año *</label>
                                        <select className="form-control" value={form.temporada_id} onChange={e => setForm(f => ({ ...f, temporada_id: e.target.value }))} required>
                                            <option value="">Seleccionar temporada...</option>
                                            {temporadas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Imagen de Portada (opcional)</label>
                                        <input className="form-control" type="file" accept="image/*" style={{ padding: '.5rem .75rem' }} onChange={e => setPortadaFile(e.target.files[0])} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Descripción (opcional)</label>
                                        <textarea className="form-control" placeholder="Descripción del catálogo..." rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                        <input type="checkbox" id="esNuevo" checked={form.es_nuevo} onChange={e => setForm(f => ({ ...f, es_nuevo: e.target.checked }))} style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                                        <label htmlFor="esNuevo" style={{ margin: 0, cursor: 'pointer' }}>Marcar como NUEVO</label>
                                    </div>
                                </div>

                                <button className="btn btn-primary" style={{ marginTop: '.5rem', padding: '.75rem 2rem' }} disabled={uploading}>
                                    {uploading ? '⏳ Subiendo...' : '📤 Subir Catálogo'}
                                </button>
                            </form>
                        </div>

                        {/* Catalog list */}
                        <div className="glass-card">
                            <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>📋 Catálogos ({catalogos.length})</h2>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Portada</th>
                                            <th>Nombre</th>
                                            <th>Marca</th>
                                            <th>Temporada</th>
                                            <th>Vistas</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {catalogos.map(c => (
                                            <tr key={c.id}>
                                                <td>
                                                    {c.portada_url
                                                        ? <img src={c.portada_url} className="table-thumb" alt="" />
                                                        : <div className="table-thumb-placeholder">📄</div>
                                                    }
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                    {c.titulo}
                                                    {c.es_nuevo ? <span className="badge-nuevo" style={{ position: 'static', marginLeft: '.5rem', fontSize: '.6rem' }}>NUEVO</span> : null}
                                                </td>
                                                <td>{c.marca_nombre}</td>
                                                <td>{c.temporada_nombre}</td>
                                                <td>{c.visualizaciones || 0}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '.5rem' }}>
                                                        <button className="btn btn-ghost" style={{ padding: '.3rem .6rem', fontSize: '.8rem' }} onClick={() => window.open(`/catalogo/${c.id}`, '_blank')}>👁️</button>
                                                        <button className="btn btn-danger" style={{ padding: '.3rem .6rem', fontSize: '.8rem' }} onClick={() => handleDelete(c.id)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {catalogos.length === 0 && (
                                    <div className="empty-state" style={{ padding: '3rem' }}>
                                        <div className="empty-icon">📂</div>
                                        <h3>No hay catálogos todavía</h3>
                                        <p>Sube tu primer catálogo PDF arriba.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'marcas' && <MarcasTab marcas={marcas} headers={headers} fetchAll={fetchAll} showToast={showToast} />}
                {activeTab === 'temporadas' && <TemporadasTab temporadas={temporadas} headers={headers} fetchAll={fetchAll} showToast={showToast} />}
            </main>

            {/* Toast */}
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        </div>
    )
}

function MarcasTab({ marcas, headers, fetchAll, showToast }) {
    const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '' })
    const slugify = (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const API = `${API_URL}/api`

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API}/marcas`, { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            if (!res.ok) throw new Error((await res.json()).error)
            showToast('✅ Marca agregada')
            setForm({ nombre: '', slug: '', descripcion: '' })
            fetchAll()
        } catch (e) { showToast('❌ ' + e.message, 'error') }
    }

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar la marca "${nombre}"? Si tiene catálogos asociados también se eliminarán.`)) return
        try {
            await fetch(`${API}/marcas/${id}`, { method: 'DELETE', headers: headers() })
            showToast('🗑️ Marca eliminada')
            fetchAll()
        } catch (e) { showToast('❌ ' + e.message, 'error') }
    }

    return (
        <div>
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>🏷️ Agregar Marca</h2>
                <form onSubmit={handleAdd} className="form-grid">
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input className="form-control" placeholder="Ej: Marca Elite" value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value, slug: slugify(e.target.value) }))} required />
                    </div>
                    <div className="form-group">
                        <label>Slug *</label>
                        <input className="form-control" placeholder="marca-elite" value={form.slug}
                            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Descripción</label>
                        <input className="form-control" placeholder="Descripción de la marca" value={form.descripcion}
                            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button className="btn btn-primary">+ Agregar Marca</button>
                    </div>
                </form>
            </div>
            <div className="glass-card">
                <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Marcas ({marcas.length})</h2>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Nombre</th><th>Slug</th><th>Catálogos</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {marcas.map(m => (
                                <tr key={m.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{m.nombre}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{m.slug}</td>
                                    <td>{m.total_catalogos || 0}</td>
                                    <td>
                                        <button className="btn btn-danger" style={{ padding: '.3rem .7rem', fontSize: '.8rem' }}
                                            onClick={() => handleDelete(m.id, m.nombre)}>🗑️ Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {marcas.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><div className="empty-icon">🏷️</div><h3>Sin marcas todavía</h3></div>}
                </div>
            </div>
        </div>
    )
}

function TemporadasTab({ temporadas, headers, fetchAll, showToast }) {
    const [form, setForm] = useState({ nombre: '', slug: '', anio: new Date().getFullYear().toString(), descripcion: '' })
    const slugify = (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const API = `${API_URL}/api`

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API}/temporadas`, { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            if (!res.ok) throw new Error((await res.json()).error)
            showToast('✅ Temporada agregada')
            setForm({ nombre: '', slug: '', anio: new Date().getFullYear().toString(), descripcion: '' })
            fetchAll()
        } catch (e) { showToast('❌ ' + e.message, 'error') }
    }

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar la temporada "${nombre}"?`)) return
        try {
            await fetch(`${API}/temporadas/${id}`, { method: 'DELETE', headers: headers() })
            showToast('🗑️ Temporada eliminada')
            fetchAll()
        } catch (e) { showToast('❌ ' + e.message, 'error') }
    }

    return (
        <div>
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>📅 Agregar Temporada</h2>
                <form onSubmit={handleAdd} className="form-grid">
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input className="form-control" placeholder="Ej: Primavera-Verano 2026" value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value, slug: slugify(e.target.value) }))} required />
                    </div>
                    <div className="form-group">
                        <label>Año *</label>
                        <input className="form-control" type="number" min="2000" max="2050" value={form.anio}
                            onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label>Slug *</label>
                        <input className="form-control" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <input className="form-control" placeholder="Descripción..." value={form.descripcion}
                            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button className="btn btn-primary">+ Agregar Temporada</button>
                    </div>
                </form>
            </div>
            <div className="glass-card">
                <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Temporadas ({temporadas.length})</h2>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Nombre</th><th>Año</th><th>Catálogos</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {temporadas.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{t.nombre}</td>
                                    <td>{t.anio}</td>
                                    <td>{t.total_catalogos || 0}</td>
                                    <td>
                                        <button className="btn btn-danger" style={{ padding: '.3rem .7rem', fontSize: '.8rem' }}
                                            onClick={() => handleDelete(t.id, t.nombre)}>🗑️ Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {temporadas.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><div className="empty-icon">📅</div><h3>Sin temporadas todavía</h3></div>}
                </div>
            </div>
        </div>
    )
}
