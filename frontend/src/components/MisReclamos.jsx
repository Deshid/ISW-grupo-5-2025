import useMisReclamos from "@hooks/reclamos/useMisReclamos";
import eliminarIcon from "../assets/TrashCanIcon.svg";
import "../styles/misReclamos.css";

export default function MisReclamos() {
    const { reclamos, loading, mensaje, handleCancelarReclamo, page, setPage, totalPages, ordenDesc, setOrdenDesc } = useMisReclamos();

    if (loading) return <div>Cargando...</div>;
    if (mensaje) return <div>{mensaje}</div>;
    if (reclamos.length === 0) return <div>No tienes reclamos enviados.</div>;

    // Ordenar los reclamos por fecha
    // Ya vienen ordenados del backend, no es necesario ordenar localmente
    const reclamosOrdenados = reclamos;

    return (
        <div>
            <div className="flechas-reclamos">
                <button
                    className="orden-fecha-btn"
                    onClick={() => setOrdenDesc(!ordenDesc)}
                >
                {ordenDesc ? "Más reciente ↑" : "Más antiguo ↓"}
                </button>
                <button
                    onClick={() => page > 1 && setPage(page - 1)}
                    disabled={page <= 1}
                >
                    <span className="icon">←</span> Volver
                </button>
                <button
                    onClick={() => page < totalPages && setPage(page + 1)}
                    disabled={page >= totalPages}
                >
                    Siguiente <span className="icon">→</span> 
                </button>
            </div>
        
            <div>
                <ul className="reclamos-lista">
                    {reclamosOrdenados.map((r) => (
                        <li key={r.id} className="reclamo-card">
                            {r.anonimo === true && (
                                <strong>Fue Anónimo</strong>
                            )} 
                            <strong> ID reclamo: {r.id}</strong>
                            <strong>Categoría: {r.categoria}</strong>
                            <span>Descripción: {r.descripcion}</span>
                            <span>Estado: {r.estado}</span>
                            <strong>Creación del reclamo:</strong>
                            <span className="fecha">Fecha: {r.soloFecha}</span>
                            <span className="hora">Hora: {r.soloHora}</span>
                            {r.comentarioInterno && (
                                <>
                                    <strong className="hora">Comentarios Directiva:</strong>
                                    <span>{r.comentarioInterno}</span>
                                </>
                            )}
                            {r.estado === "pendiente" && (
                                <button
                                    className="eliminar-btn"
                                    onClick={() => handleCancelarReclamo(r.id)}>
                                    <img className="eliminar-icon" src={eliminarIcon} alt="Eliminar" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                <div className="flechas-reclamos">
                    <button
                        onClick={() => page > 1 && setPage(page - 1)}
                        disabled={page <= 1}
                    >
                        <span className="icon">←</span> Anterior
                    </button>
                    <button
                        onClick={() => page < totalPages && setPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Siguiente <span className="icon">→</span>
                    </button>
                </div>
            </div>
    </div>
    );
}