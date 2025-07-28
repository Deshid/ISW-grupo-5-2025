
import useReclamosPendientes from "../hooks/reclamos/useReclamosPendientes";
import "../styles/misReclamos.css";
import { useState } from "react";

export default function ReclamosPendientes() {
    const [page, setPage] = useState(1);
    const [ordenDesc, setOrdenDesc] = useState(true);
    const { reclamos, loading, mensaje, totalPages } = useReclamosPendientes(page, ordenDesc);

    return (
        <div className="containerReclamosPendientes">
            <h2>Reclamos Pendientes
                <button
                    className="orden-fecha-btn"
                    onClick={() => setOrdenDesc(!ordenDesc)}
                    title={ordenDesc ? "Ordenar de más antiguo a más reciente" : "Ordenar de más reciente a más antiguo"}
                >
                    {ordenDesc ? "↓" : "↑"}
                </button>
            </h2>
            {loading && <p>Cargando...</p>}
            {mensaje && <p>{mensaje}</p>}
            {mensaje && !loading && (
                <div className="alerta-error">
                    {mensaje}
                </div>
            )}
            <div className="Flechas-reclamos">
                <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                    <span className="icon">←</span> Volver
                </button>
                <button onClick={() => setPage(page + 1)} disabled={page >= (totalPages || 1)}>
                    <span className="icon">→</span> Siguiente
                </button>
            </div>
            <ul className="reclamos-lista">
                {reclamos.map(reclamo => {
                    const autor = !reclamo.anonimo && reclamo.user ? reclamo.user.nombreCompleto : "Anónimo";
                    const email = !reclamo.anonimo && reclamo.user ? reclamo.user.email : "Anónimo";
                    const rut = !reclamo.anonimo && reclamo.user ? reclamo.user.rut : "Anónimo";
                    return (
                        <li key={reclamo.id} className="reclamo-card">
                            <strong>{reclamo.categoria}</strong>
                            <span>Estado: {reclamo.estado}</span>
                            <p className="fecha">Fecha: {reclamo.soloFecha}</p>
                            <p className="hora">Hora: {reclamo.soloHora}</p>
                            <p className="hora">Autor: {autor}</p>
                            <p className="hora">Email: {email}</p>
                            <p className="hora">RUT: {rut}</p>
                            <p className="hora">ID reclamo: {reclamo.id}</p>
                            <p className="hora">Anonimo: {reclamo.anonimo ? "Sí" : "No"}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}