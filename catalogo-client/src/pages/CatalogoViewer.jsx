import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import API_URL from '../config'

// PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PAGES_PER_SPREAD = 2 // left + right

export default function CatalogoViewer() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [catalogo, setCatalogo] = useState(null)
    const [numPages, setNumPages] = useState(null)
    const [currentSpread, setCurrentSpread] = useState(0) // 0-indexed spread
    const [animating, setAnimating] = useState(false)
    const [animDir, setAnimDir] = useState(null) // 'next' | 'prev'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        const fetchCatalogo = async () => {
            try {
                const res = await fetch(`${API_URL}/api/catalogos/${id}`)
                if (!res.ok) throw new Error('Catálogo no encontrado')
                const data = await res.json()
                setCatalogo(data)
            } catch (e) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        fetchCatalogo()
    }, [id])

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
    }

    // Total spreads: first page alone, then 2 pages per spread
    const totalSpreads = numPages ? Math.ceil(numPages / 2) : 0
    const leftPageNum = currentSpread === 0 ? 1 : currentSpread * 2
    const rightPageNum = currentSpread === 0 ? 2 : currentSpread * 2 + 1

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
        }, 350)
    }, [animating, currentSpread, totalSpreads])

    // Keyboard navigation
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

    const pageFlipStyle = animating ? {
        transform: animDir === 'next' ? 'rotateY(-15deg)' : 'rotateY(15deg)',
        transition: 'transform 0.35s ease',
    } : { transition: 'transform 0.35s ease' }

    return (
        <div className="viewer-page">
            {/* Top Bar */}
            <div className="viewer-topbar">
                <button className="btn-back" onClick={() => navigate('/')}>← Volver</button>
                <div className="viewer-title">
                    {catalogo.titulo}
                    {catalogo.marca_nombre && <span style={{ color: 'var(--gold)', marginLeft: '.5rem' }}> — {catalogo.marca_nombre}</span>}
                </div>
                <div className="viewer-controls">
                    {/* Zoom */}
                    <button className="btn btn-ghost zoom-btn" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} title="Alejar (-)">−</button>
                    <span className="zoom-level" onClick={() => setZoom(1)} title="Click para resetear">{Math.round(zoom * 100)}%</span>
                    <button className="btn btn-ghost zoom-btn" onClick={() => setZoom(z => Math.min(z + 0.25, 2.5))} title="Acercar (+)">+</button>
                    <span style={{ width: 1, background: 'var(--gold-border)', height: 20, margin: '0 .5rem' }} />
                    <span>
                        Página {leftPageNum}{rightPageNum <= numPages ? `–${rightPageNum}` : ''} de {numPages || '...'}
                    </span>
                    <button className="btn btn-ghost" style={{ padding: '.3rem .6rem', fontSize: '1rem' }} onClick={() => doFlip('prev')} disabled={currentSpread === 0}>‹</button>
                    <button className="btn btn-ghost" style={{ padding: '.3rem .6rem', fontSize: '1rem' }} onClick={() => doFlip('next')} disabled={currentSpread >= totalSpreads - 1}>›</button>
                </div>
            </div>

            {/* Stage */}
            <div className="viewer-stage">
                {/* Left navigation arrow */}
                <button className="nav-arrow nav-arrow-left" onClick={() => doFlip('prev')} disabled={currentSpread === 0} aria-label="Página anterior">
                    ‹
                </button>

                {/* Book */}
                <div className="book-container" style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s ease' }}>
                    <div className="book" style={pageFlipStyle}>
                        {catalogo.pdf_url ? (
                            <Document
                                file={catalogo.pdf_url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="pdf-loading"><div className="spinner" /></div>}
                                error={<div style={{ color: 'var(--danger)', padding: '2rem' }}>Error al cargar el PDF</div>}
                            >
                                {/* Wrapper flex para side-by-side */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    gap: 0,
                                    boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                                    borderRadius: '2px 8px 8px 2px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Página izquierda */}
                                    <div className="book-page book-page-left">
                                        {leftPageNum <= (numPages || 0) ? (
                                            <Page
                                                pageNumber={leftPageNum}
                                                height={620}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                        ) : (
                                            <div style={{ width: 440, height: 620, background: '#f8f5ef' }} />
                                        )}
                                    </div>
                                    {/* Separador (lomo del libro) */}
                                    <div style={{ width: 4, background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.05))', alignSelf: 'stretch', flexShrink: 0 }} />
                                    {/* Página derecha */}
                                    <div className="book-page book-page-right">
                                        {rightPageNum <= (numPages || 0) ? (
                                            <Page
                                                pageNumber={rightPageNum}
                                                height={620}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                        ) : (
                                            <div style={{ width: 440, height: 620, background: '#f8f5ef' }} />
                                        )}
                                    </div>
                                </div>
                            </Document>
                        ) : (
                            <div style={{ width: 884, height: 620, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#1a1a2e', borderRadius: 4 }}>
                                PDF no disponible
                            </div>
                        )}
                    </div>
                </div>

                {/* Right navigation arrow */}
                <button className="nav-arrow nav-arrow-right" onClick={() => doFlip('next')} disabled={currentSpread >= totalSpreads - 1} aria-label="Siguiente página">
                    ›
                </button>
            </div>

            {/* Bottom bar */}
            <div className="viewer-bottom">
                <ThumbnailStrip
                    pdfUrl={catalogo.pdf_url}
                    numPages={numPages}
                    currentSpread={currentSpread}
                    onSelect={(spread) => setCurrentSpread(spread)}
                />
                <div className="viewer-badge">
                    🔒 Solo visualización — sin descarga
                </div>
            </div>
        </div>
    )
}

// Thumbnail filmstrip component
function ThumbnailStrip({ pdfUrl, numPages, currentSpread, onSelect }) {
    const THUMBS_SHOWN = 8
    const spreads = numPages ? Math.ceil(numPages / 2) : 0

    if (!spreads || !pdfUrl) return <div />

    return (
        <div className="thumbnail-strip">
            {Array.from({ length: Math.min(spreads, THUMBS_SHOWN) }).map((_, i) => {
                const pageNum = i * 2 + 1
                return (
                    <div
                        key={i}
                        className={`thumbnail ${currentSpread === i ? 'active' : ''}`}
                        onClick={() => onSelect(i)}
                        title={`Ir a página ${pageNum}`}
                    >
                        <Document file={pdfUrl} loading="">
                            <Page pageNumber={pageNum} height={62} renderTextLayer={false} renderAnnotationLayer={false} />
                        </Document>
                    </div>
                )
            })}
        </div>
    )
}
