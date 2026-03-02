import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API_URL from '../config'

export default function ImageViewer() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [catalogo, setCatalogo] = useState(null)
    const [currentSpread, setCurrentSpread] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [zoom, setZoom] = useState(1)
    const [animating, setAnimating] = useState(false)
    const [animDir, setAnimDir] = useState(null)

    useEffect(() => {
        fetch(`${API_URL}/api/catalogos/${id}`)
            .then(r => { if (!r.ok) throw new Error('Catálogo no encontrado'); return r.json() })
            .then(data => { setCatalogo(data); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) })
    }, [id])

    const imagenes = catalogo?.imagenes || []
    // Distribuir en spreads de 2 imágenes
    const totalSpreads = Math.ceil(imagenes.length / 2)
    const leftIdx = currentSpread * 2
    const rightIdx = currentSpread * 2 + 1

    const doFlip = useCallback((dir) => {
        if (animating) return
        if (dir === 'next' && currentSpread >= totalSpreads - 1) return
        if (dir === 'prev' && currentSpread <= 0) return
        setAnimDir(dir)
        setAnimating(true)
        setTimeout(() => {
            setCurrentSpread(s => dir === 'next' ? s + 1 : s - 1)
            setAnimating(false)
            setAnimDir(null)
        }, 300)
    }, [animating, currentSpread, totalSpreads])

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight') doFlip('next')
            if (e.key === 'ArrowLeft') doFlip('prev')
            if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 2.5))
            if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5))
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [doFlip])

    if (loading) return <div className="loading"><div className="spinner" /></div>
    if (error) return (
        <div className="loading" style={{ flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>😕</div>
            <p>{error}</p>
            <button className="btn btn-outline" onClick={() => navigate('/')}>← Volver</button>
        </div>
    )

    const bookStyle = {
        transform: animating
            ? `scale(${zoom}) rotateY(${animDir === 'next' ? '-12deg' : '12deg'})`
            : `scale(${zoom})`,
        transition: 'transform 0.3s ease',
        transformOrigin: 'center top'
    }

    return (
        <div className="viewer-page">
            {/* Top Bar */}
            <div className="viewer-topbar">
                <button className="btn-back" onClick={() => navigate('/')}>← Volver</button>
                <div className="viewer-title">
                    {catalogo.titulo}
                    {catalogo.marca_nombre && <span style={{ color: 'var(--primary)', marginLeft: '.5rem' }}> — {catalogo.marca_nombre}</span>}
                </div>
                <div className="viewer-controls">
                    {/* Zoom controls */}
                    <button className="btn btn-ghost zoom-btn" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} title="Alejar (-)">−</button>
                    <span className="zoom-level" onClick={() => setZoom(1)} title="Click para resetear">{Math.round(zoom * 100)}%</span>
                    <button className="btn btn-ghost zoom-btn" onClick={() => setZoom(z => Math.min(z + 0.25, 2.5))} title="Acercar (+)">+</button>
                    <span style={{ width: 1, background: 'var(--gold-border)', height: 20, margin: '0 .5rem' }} />
                    <span>Img {leftIdx + 1}{rightIdx < imagenes.length ? `–${rightIdx + 1}` : ''} de {imagenes.length}</span>
                    <button className="btn btn-ghost" style={{ padding: '.3rem .6rem', fontSize: '1.1rem' }} onClick={() => doFlip('prev')} disabled={currentSpread === 0}>‹</button>
                    <button className="btn btn-ghost" style={{ padding: '.3rem .6rem', fontSize: '1.1rem' }} onClick={() => doFlip('next')} disabled={currentSpread >= totalSpreads - 1}>›</button>
                </div>
            </div>

            {/* Stage */}
            <div className="viewer-stage">
                <button className="nav-arrow nav-arrow-left" onClick={() => doFlip('prev')} disabled={currentSpread === 0}>‹</button>

                <div className="book-container">
                    <div className="book" style={bookStyle}>
                        <div style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', borderRadius: '2px 8px 8px 2px', boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }}>
                            {/* Imagen izquierda */}
                            <div className="book-page book-page-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                                {imagenes[leftIdx] ? (
                                    <img
                                        src={`${API_URL}${imagenes[leftIdx]}`}
                                        alt={`Página ${leftIdx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                        onError={e => { e.target.style.display = 'none' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
                                )}
                            </div>
                            {/* Separador lomo */}
                            <div style={{ width: 4, background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.05))', flexShrink: 0 }} />
                            {/* Imagen derecha */}
                            <div className="book-page book-page-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                                {imagenes[rightIdx] ? (
                                    <img
                                        src={`${API_URL}${imagenes[rightIdx]}`}
                                        alt={`Página ${rightIdx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                        onError={e => { e.target.style.display = 'none' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#0d0d0d' }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button className="nav-arrow nav-arrow-right" onClick={() => doFlip('next')} disabled={currentSpread >= totalSpreads - 1}>›</button>
            </div>

            {/* Bottom bar — thumbnails */}
            <div className="viewer-bottom">
                <div className="thumbnail-strip">
                    {imagenes.filter((_, i) => i % 2 === 0).map((src, i) => (
                        <div key={i} className={`thumbnail ${currentSpread === i ? 'active' : ''}`} onClick={() => setCurrentSpread(i)} title={`Ir a imagen ${i * 2 + 1}`}>
                            <img src={`${API_URL}${src}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
                <div className="viewer-badge">🔒 Solo visualización — sin descarga</div>
            </div>
        </div>
    )
}
