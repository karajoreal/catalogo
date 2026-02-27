import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

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

    useEffect(() => {
        const fetchCatalogo = async () => {
            try {
                const res = await fetch(`/api/catalogos/${id}`)
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
                <div className="book-container">
                    <div className="book" style={pageFlipStyle}>
                        {catalogo.pdf_url ? (
                            <Document
                                file={catalogo.pdf_url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="loading" style={{ width: '920px', height: '640px' }}><div className="spinner" /></div>}
                                error={<div style={{ color: 'var(--danger)', padding: '2rem' }}>Error al cargar el PDF</div>}
                            >
                                {/* Left page */}
                                <div className="book-page book-page-left">
                                    {leftPageNum <= (numPages || 0) ? (
                                        <Page pageNumber={leftPageNum} height={640} renderTextLayer={false} renderAnnotationLayer={false} />
                                    ) : (
                                        <div style={{ width: 460, height: 640, background: '#f8f5ef' }} />
                                    )}
                                </div>
                                {/* Right page */}
                                <div className="book-page book-page-right">
                                    {rightPageNum <= (numPages || 0) ? (
                                        <Page pageNumber={rightPageNum} height={640} renderTextLayer={false} renderAnnotationLayer={false} />
                                    ) : (
                                        <div style={{ width: 460, height: 640, background: '#f8f5ef' }} />
                                    )}
                                </div>
                            </Document>
                        ) : (
                            <div style={{ width: 920, height: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#1a1a2e', borderRadius: 4 }}>
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
