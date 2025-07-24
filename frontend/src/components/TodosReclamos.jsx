import useTodosReclamos from "@hooks/reclamos/useTodosReclamos";
import useUserRole from "../hooks/auth/useUserRole";
import "../styles/todosReclamos.css";

export default function TodosReclamos() {
    const { reclamos, loading, mensaje, page, setPage, totalPages, verAnonimos, setVerAnonimos, ordenDesc, setOrdenDesc } = useTodosReclamos();
    const { isAdmin } = useUserRole();


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
                    <label >
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
            <ul className="reclamos-lista">
                {reclamosOrdenados.map((r) => (
                    <li key={r.id} className="reclamo-card">
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
                            </>
                        ) : (
                            <>
                                <p className="hora">Autor: Anónimo</p>
                                <p className="hora">Email: Anónimo</p>
                                <p className="hora">RUT: Anónimo</p>
                            </>
                        )}
                        <p className="hora">Anonimo: {r.anonimo ? "Sí" : "No"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}