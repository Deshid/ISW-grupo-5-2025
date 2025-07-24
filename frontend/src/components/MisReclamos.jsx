import useMisReclamos from "@hooks/reclamos/useMisReclamos";
import eliminarIcon from "../assets/TrashCanIcon.svg";
import "../styles/misReclamos.css";

export default function MisReclamos() {
    const { reclamos, loading, mensaje, handleCancelarReclamo, page, setPage, totalPages } = useMisReclamos();

    if (loading) return <div>Cargando...</div>;
    if (mensaje) return <div>{mensaje}</div>;
    if (reclamos.length === 0) return <div>No tienes reclamos enviados.</div>;

    return (
        <div>
            <h3>Todos los Reclamos</h3>
            <div className="Flechas-reclamos">
                <button onClick={() => setPage(page - 1)} 
                        disabled={page <= 1}
                >
                    <span className="icon">←</span> Volver
                </button>
                <button onClick={() => setPage(page + 1)} 
                        disabled={page >= totalPages}
                >
                    <span className="icon">→</span> Siguiente
                </button>
            </div>
        
        <div>
            <ul className="reclamos-lista">
                {reclamos.map((r) => (
                    <li key={r.id} className="reclamo-card">
                        <strong>{r.categoria}</strong>
                        <p>{r.descripcion}</p>
                        <span>Estado: {r.estado}</span>
                        <strong>Última actualización:</strong>
                        <p className="fecha">Fecha: {r.soloFecha}</p>
                        <p className="hora">Hora: {r.soloHora}</p>
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
        </div>
    </div>
    );
}