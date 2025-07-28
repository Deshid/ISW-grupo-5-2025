
import useReclamosPendientes from "../hooks/reclamos/useReclamosPendientes";
import "../styles/misReclamos.css";
import { useState } from "react";

export default function ReclamosPendientes() {
    const [page, setPage] = useState(1);
    const [ordenDesc, setOrdenDesc] = useState(true);
    const { reclamos, loading, mensaje, totalPages } = useReclamosPendientes(page, ordenDesc);

    return (
        <div className="containerReclamosPendientes">
            <h2>Reclamos Pendientes</h2>
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

            
            {loading && <p>Cargando...</p>}
            {mensaje && <p>{mensaje}</p>}
            {mensaje && !loading && (
                <div className="alerta-error">
                    {mensaje}
                </div>
            )}
            </div>
                <ul className="reclamos-lista">
                    {reclamos.map((r) => (
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
                        </li>
                    ))}
                </ul>
            <div className="flechas-reclamos">
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
        </div>
    );
}