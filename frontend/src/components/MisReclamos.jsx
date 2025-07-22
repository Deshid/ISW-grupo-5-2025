import useMisReclamos from "@hooks/reclamos/useMisReclamos";
import "../styles/misReclamos.css";

export default function MisReclamos() {
    const { reclamos, loading, mensaje } = useMisReclamos();

    if (loading) return <div>Cargando...</div>;
    if (mensaje) return <div>{mensaje}</div>;
    if (reclamos.length === 0) return <div>No tienes reclamos enviados.</div>;

    return (
        <div>
            <h3>Mis Reclamos</h3>
            <ul className="reclamos-lista">
                {reclamos.map((r) => (
                    <li key={r.id} className="reclamo-card">
                        <strong>{r.categoria}</strong>
                        <p>{r.descripcion}</p>
                        <span>Estado: {r.estado}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}