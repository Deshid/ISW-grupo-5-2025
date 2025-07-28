import useMisReclamos from "@hooks/reclamos/useMisReclamos";
import eliminarIcon from "../assets/TrashCanIcon.svg";
import { useState } from "react";
import "../styles/misReclamos.css";

export default function MisReclamos() {
    const { reclamos, loading, mensaje, handleCancelarReclamo, page, setPage, totalPages } = useMisReclamos();
    const [ordenDesc, setOrdenDesc] = useState(true);

    if (loading) return <div>Cargando...</div>;
    if (mensaje) return <div>{mensaje}</div>;
    if (reclamos.length === 0) return <div>No tienes reclamos enviados.</div>;

    // Ordenar los reclamos por fecha
    const reclamosOrdenados = [...reclamos].sort((a, b) => {
        const [fechaA, horaA] = a.fecha.split(",").map(s => s.trim());
        const [fechaB, horaB] = b.fecha.split(",").map(s => s.trim());
        const [diaA, mesA, anioA] = fechaA.split("-");
        const [diaB, mesB, anioB] = fechaB.split("-");
        const dateA = new Date(`${anioA}-${mesA}-${diaA}T${horaA || "00:00"}`);
        const dateB = new Date(`${anioB}-${mesB}-${diaB}T${horaB || "00:00"}`);
        return ordenDesc ? dateB - dateA : dateA - dateB;
    });

    return (
        <div>
            <div className="flechas-reclamos">
                <button
                    className="orden-fecha-btn"
                    onClick={() => setOrdenDesc(!ordenDesc)}
                    title={ordenDesc ? "Ordenar de más antiguo a más reciente" : "Ordenar de más reciente a más antiguo"}
                >
                    {ordenDesc ? "↓" : "↑"}
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
                        <strong>{r.categoria}</strong>
                        <p>{r.descripcion}</p>
                        <span>Estado: {r.estado}</span>
                        <strong>Última actualización:</strong>
                        <p className="fecha">Fecha: {r.soloFecha}</p>
                        <p className="hora">Hora: {r.soloHora}</p>
                        <p className="hora">Autor: {r.user ? r.user.nombreCompleto : "Anónimo"}</p>
                        <p className="hora">Email: {r.user ? r.user.email : "No disponible"}</p>
                        <p className="hora">RUT: {r.user ? r.user.rut : "No disponible"}</p>
                        <p className="hora">ID reclamo: {r.id}</p>
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