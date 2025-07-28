import { useEffect, useState } from "react";
import useTodosReclamos from "@hooks/reclamos/useTodosReclamos";
import useUserRole from "../hooks/auth/useUserRole";
import BuscarReclamoPorId from "./SearchReclamoPorId";
import { updateEstadoReclamo } from "@services/reclamos.service";
import EditarReclamo from "./EditarReclamo";
import { API_URL } from "@services/reclamos.service";
import "@styles/todosReclamos.css";


export default function TodosReclamos() {
    const { reclamos, loading, mensaje, page, setPage, totalPages, verAnonimos, setVerAnonimos, ordenDesc, setOrdenDesc, fetchReclamos } = useTodosReclamos();
    const { isAdmin } = useUserRole();
    const [busquedaActiva, setBusquedaActiva] = useState(false);
    const [reclamoEditado, setReclamoEditado] = useState(null);

    const handleEditarReclamo = async (reclamoEditado) => {
        console.log("ID reclamo:", reclamoEditado.id);
        const { id, estado, comentarioInterno } = reclamoEditado;
        console.log("Datos enviados:", { estado, comentarioInterno });
        const url = `${API_URL}/${id}`;
        console.log("URL PATCH:", url);
        await updateEstadoReclamo(id, { estado, comentarioInterno });
        setReclamoEditado(null);
        if (typeof fetchReclamos === 'function') {
            fetchReclamos();
            
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
            <h3>Todos los Reclamos
                <button
                    className="orden-fecha-btn"
                    onClick={() => setOrdenDesc(!ordenDesc)}
                    title={ordenDesc ? "Ordenar de más antiguo a más reciente" : "Ordenar de más reciente a más antiguo"}
                >
                    {ordenDesc ? "↓" : "↑"}
                </button>
            </h3>

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
                <div className="Flechas-reclamos">
                    <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                        <span className="icon">←</span> Volver
                    </button>
                    <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                        <span className="icon">→</span> Siguiente
                    </button>
                </div>
            </div>
            )}
            {!busquedaActiva && (
                <ul className="reclamos-lista">
                    {reclamosOrdenados.map((r) => (
                        <li key={r.id} className="reclamo-card" onDoubleClick={() => setReclamoEditado(r)}>
                            <strong>{r.categoria}</strong>
                            <p>{r.descripcion}</p>
                            <span>Estado: {r.estado}</span>
                            <p className="fecha">Fecha: {r.soloFecha}</p>
                            <p className="hora">Hora: {r.soloHora}</p>
                            {(!r.anonimo || verAnonimos) ? (
                                <>
                                    <p className="hora">Autor: {r.user ? r.user.nombreCompleto : "Anónimo"}</p>
                                    <p className="hora">Email: {r.user ? r.user.email : "No disponible"}</p>
                                    <p className="hora">RUT: {r.user ? r.user.rut : "No disponible"}</p>
                                    <p className="hora">ID reclamo: {r.id}</p>
                                </>
                            ) : (
                                <>
                                    <p className="hora">Autor: Anónimo</p>
                                    <p className="hora">Email: Anónimo</p>
                                    <p className="hora">RUT: Anónimo</p>
                                    <p className="hora">ID reclamo: {r.id}</p>
                                </>
                            )}
                            <p className="hora">Comentarios: {r.comentarioInterno}</p>
                            <p className="hora">Anonimo: {r.anonimo ? "Sí" : "No"}</p>
                        </li>
                    ))}

                    {reclamoEditado && (
                        <EditarReclamo
                            reclamo={reclamoEditado}
                            onClose={() => setReclamoEditado(null)}
                            onSave={handleEditarReclamo}
                        />
                    )}
                </ul>
            )}
        </div>
    );
}