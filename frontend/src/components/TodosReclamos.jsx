import { useEffect, useState } from "react";
import useTodosReclamos from "@hooks/reclamos/useTodosReclamos";
import useUserRole from "../hooks/auth/useUserRole";
import BuscarReclamoPorId from "./SearchReclamoPorId";
import { updateEstadoReclamo } from "@services/reclamos.service";
import EditarReclamo from "./EditarReclamo";
import "@styles/todosReclamos.css";


export default function TodosReclamos() {
    const { reclamos, loading, mensaje, page, setPage, totalPages, verAnonimos, setVerAnonimos, ordenDesc, setOrdenDesc, fetchReclamos } = useTodosReclamos();
    const { isAdmin } = useUserRole();
    const [busquedaActiva, setBusquedaActiva] = useState(false);
    const [reclamoEditado, setReclamoEditado] = useState(null);
    const [errorEdicion, setErrorEdicion] = useState("");

    const handleEditarReclamo = async (reclamoEditado) => {
        setErrorEdicion("");
        try {
            const { id, estado, comentarioInterno } = reclamoEditado;
            await updateEstadoReclamo(id, { estado, comentarioInterno });
            setReclamoEditado(null);
            if (typeof fetchReclamos === 'function') {
                fetchReclamos();
            }
        } catch (error) {
            setErrorEdicion(error.response?.data?.mensaje || error.response?.data?.error || "Error al actualizar el reclamo");
        }
    };
    useEffect(() => {
        console.log("Reclamos actualizados (efectivamente):", reclamos);
    }, [reclamos]);

    const reclamosOrdenados = [...reclamos].sort((a, b) => {
        const fechaA = new Date(a.fecha.split(",")[0].split("-").reverse().join("-") + "T" + (a.fecha.split(",")[1]?.trim() || "00:00"));
        const fechaB = new Date(b.fecha.split(",")[0].split("-").reverse().join("-") + "T" + (b.fecha.split(",")[1]?.trim() || "00:00"));
        return ordenDesc ? fechaB - fechaA : fechaA - fechaB;
    });

    if (loading) return <div>Cargando...</div>;
    if (mensaje) return <div>{mensaje}</div>;
    if (reclamos.length === 0) return <div>No hay reclamos registrados.</div>;

    return (
        <div>
            <h3>Todos los Reclamos</h3>
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
            

            {isAdmin && (
                <div>
                    <label>
                        <span>Ver datos de reclamos anónimos</span>
                        <button
                            className={`switch-btn${verAnonimos ? " on" : ""}`}
                            onClick={() => setVerAnonimos(!verAnonimos)}
                        >
                            <span className="switch-dot" />
                        </button>
                    </label>
                </div>
            )}
            <BuscarReclamoPorId
                verAnonimos={verAnonimos}
                onBusquedaActiva={setBusquedaActiva}
            />
            {!busquedaActiva && (
            <div className="buscar-reclamo-activo">
                
            </div>
            )}
            {!busquedaActiva && (
                <ul className="reclamos-lista">
                    {reclamosOrdenados.map((r) => (
                        <li key={r.id} className="reclamo-card" onDoubleClick={() => setReclamoEditado(r)}>
                            {(r.anonimo === true) ? (
                                <strong>Es Anónimo</strong>
                            ) : (
                                <strong>Autor: {r.user ? r.user.nombreCompleto : "No disponible"}</strong>
                            )}
                            {(!r.anonimo || verAnonimos) ? (
                                <>
                                    <strong> ID reclamo: {r.id}</strong>
                                    <strong>Autor: {r.user ? r.user.nombreCompleto : "No disponible"}</strong>
                                    <strong>Categoría: {r.categoria}</strong>
                                    <span>Descripción: {r.descripcion}</span>
                                    <span>Estado: {r.estado}</span>
                                    <strong>Creación del reclamo:</strong>
                                    <span className="fecha">Fecha: {r.soloFecha}</span>
                                    <span className="hora">Hora: {r.soloHora}</span>
                                </>
                            ) : (
                                <>
                                    <strong> ID reclamo: {r.id}</strong>
                                    <strong>Categoría: {r.categoria}</strong>
                                    <span>Descripción: {r.descripcion}</span>
                                    <span>Estado: {r.estado}</span>
                                    <strong>Creación del reclamo:</strong>
                                    <span className="fecha">Fecha: {r.soloFecha}</span>
                                    <span className="hora">Hora: {r.soloHora}</span>


                                </>
                            )}
                            <p className="comentario-interno">Comentarios: {r.comentarioInterno}</p>
                        </li>
                    ))}

                    {reclamoEditado && (
                        <EditarReclamo
                            reclamo={reclamoEditado}
                            onClose={() => { setReclamoEditado(null); setErrorEdicion(""); }}
                            onSave={handleEditarReclamo}
                            error={errorEdicion}
                        />
                    )}
                </ul>
            )}
        </div>
    );
}