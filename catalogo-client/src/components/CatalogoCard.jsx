// Color gradients for catalog cover placeholders when no portada image
const COVER_GRADIENTS = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #0d0221 0%, #190e3b 50%, #2d1b69 100%)',
    'linear-gradient(135deg, #1a0a00 0%, #3d1c02 50%, #6b2f03 100%)',
    'linear-gradient(135deg, #001a1a 0%, #003333 50%, #005555 100%)',
    'linear-gradient(135deg, #1a001a 0%, #330033 50%, #550055 100%)',
]

const COVER_EMOJIS = ['📚', '📖', '📗', '📕', '📘', '🗂️', '📋']

export default function CatalogoCard({ catalogo, onClick }) {
    const gradIdx = catalogo.id % COVER_GRADIENTS.length
    const emojiIdx = catalogo.id % COVER_EMOJIS.length

    return (
        <article className="catalog-card" onClick={onClick} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick()}>
            <div className="card-cover">
                {catalogo.portada_url ? (
                    <img src={catalogo.portada_url} alt={catalogo.titulo} loading="lazy" />
                ) : (
                    <div className="card-cover-placeholder" style={{ background: COVER_GRADIENTS[gradIdx] }}>
                        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                            {COVER_EMOJIS[emojiIdx]}
                        </span>
                    </div>
                )}
                {catalogo.es_nuevo ? <span className="badge-nuevo">NUEVO</span> : null}
            </div>
            <div className="card-body">
                <div className="card-brand">{catalogo.marca_nombre || 'Sin marca'}</div>
                <div className="card-title">{catalogo.titulo}</div>
                <div className="card-meta">
                    <span className="card-year">{catalogo.anio || catalogo.temporada_nombre}</span>
                    <button className="btn-ver" tabIndex={-1}>Ver →</button>
                </div>
            </div>
        </article>
    )
}
