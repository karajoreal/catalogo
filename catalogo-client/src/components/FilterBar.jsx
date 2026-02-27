export default function FilterBar({ marcas, temporadas, filtros, onChange }) {
    const aniosUnicos = [...new Set(temporadas.map(t => t.anio))].sort((a, b) => b - a)

    const toggleMarca = (id) => {
        const ids = filtros.marca_ids.includes(id)
            ? filtros.marca_ids.filter(m => m !== id)
            : [...filtros.marca_ids, id]
        onChange({ ...filtros, marca_ids: ids })
    }

    const toggleAnio = (anio) => {
        const anios = filtros.anios.includes(anio)
            ? filtros.anios.filter(a => a !== anio)
            : [...filtros.anios, anio]
        onChange({ ...filtros, anios })
    }

    const clear = () => onChange({ marca_ids: [], anios: [] })
    const hasFilters = filtros.marca_ids.length > 0 || filtros.anios.length > 0

    return (
        <aside className="sidebar">
            {/* Marcas */}
            <div className="filter-section">
                <h3>Filtrar por Marca</h3>
                {marcas.length === 0 ? (
                    <p style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>Sin marcas configuradas</p>
                ) : (
                    marcas.map(m => (
                        <label key={m.id} className={`filter-chip ${filtros.marca_ids.includes(m.id) ? 'active' : ''}`}>
                            <input
                                type="checkbox"
                                checked={filtros.marca_ids.includes(m.id)}
                                onChange={() => toggleMarca(m.id)}
                            />
                            {m.nombre}
                            {m.total_catalogos > 0 && (
                                <span style={{ marginLeft: 'auto', fontSize: '.7rem', color: 'var(--gold)', background: 'var(--gold-dim)', padding: '.1rem .4rem', borderRadius: '99px' }}>
                                    {m.total_catalogos}
                                </span>
                            )}
                        </label>
                    ))
                )}
            </div>

            {/* Temporadas */}
            <div className="filter-section">
                <h3>Filtrar por Año</h3>
                <div className="season-pills">
                    {aniosUnicos.map(anio => (
                        <button
                            key={anio}
                            className={`season-pill ${filtros.anios.includes(anio) ? 'active' : ''}`}
                            onClick={() => toggleAnio(anio)}
                        >
                            {anio}
                        </button>
                    ))}
                </div>
            </div>

            {hasFilters && (
                <button className="clear-filters" onClick={clear}>
                    ✕ Limpiar filtros
                </button>
            )}
        </aside>
    )
}
