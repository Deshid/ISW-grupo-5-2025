import useMisReclamos from "@hooks/reclamos/useMisReclamos";
import eliminarIcon from "../assets/TrashCanIcon.svg";
import "../styles/misReclamos.css";

export default function MisReclamos() {
    const { reclamos, loading, mensaje, handleCancelarReclamo } = useMisReclamos();

    if (loading) return <div>Cargando...</div>;
    if (mensaje) return <div>{mensaje}</div>;
    if (reclamos.length === 0) return <div>No tienes reclamos enviados.</div>;

    return (
        <div>
            <ul className="reclamos-lista">
                {reclamos.map((r) => (
                    <li key={r.id} className="reclamo-card">
                        <strong>{r.categoria}</strong>
                        <p>{r.descripcion}</p>
                        <span>Estado: {r.estado}</span>
                        <strong>Ultima actualizacion:</strong>
                        <li><p className="fecha">Fecha: {r.soloFecha}</p></li>
                        <li><p className="hora">Hora: {r.soloHora}</p></li>
                        {
                            r.estado === "pendiente" && (
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
    );
}