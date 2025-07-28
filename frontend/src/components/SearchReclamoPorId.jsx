
import Search from "./Search";
import useBuscarReclamoPorId from "@hooks/reclamos/useBuscarReclamoPorId";
import { useState, useEffect } from "react";
import EditarReclamo from "./EditarReclamo";
import { updateEstadoReclamo } from "@services/reclamos.service";

export default function BuscarReclamoPorId({ verAnonimos, onBusquedaActiva }) {
    const { reclamo, loading, mensaje, buscarPorId, limpiarBusqueda } = useBuscarReclamoPorId();
    const [idBusqueda, setIdBusqueda] = useState("");
    const [reclamoEditado, setReclamoEditado] = useState(null);
    const [errorEdicion, setErrorEdicion] = useState("");

    useEffect(() => {
        if (onBusquedaActiva) onBusquedaActiva(!!reclamo);
    }, [reclamo, onBusquedaActiva]);

    const handleBuscar = () => {
        if (idBusqueda.trim()) buscarPorId(idBusqueda.trim());
    };

    const handleLimpiar = () => {
        setIdBusqueda("");
        limpiarBusqueda();
    };

    const handleEditarReclamo = async (reclamoEditado) => {
        setErrorEdicion("");
        try {
            await updateEstadoReclamo(reclamoEditado.id, {
                estado: reclamoEditado.estado,
                comentarioInterno: reclamoEditado.comentarioInterno
            });
            setReclamoEditado(null);
            // Si tienes una función para refrescar la búsqueda, puedes llamarla aquí
            // limpiarBusqueda();
        } catch (error) {
            setErrorEdicion(error.response?.data?.mensaje || error.response?.data?.error || "Error al actualizar el reclamo");
        }
    };

    return (
        <div className="buscar-reclamo">
            <Search
                value={idBusqueda}
                onChange={e => setIdBusqueda(e.target.value)}
                placeholder="Buscar reclamo por ID"
            />
            <button onClick={handleBuscar} disabled={loading}>Buscar</button>
            <button onClick={handleLimpiar}>Limpiar</button>
            {mensaje && <div>{mensaje}</div>}
            {reclamo && (
                <ul className="reclamos-lista">
                    <li key={reclamo.id} className="reclamo-card" onDoubleClick={() => setReclamoEditado(reclamo)}>
                        <strong>{reclamo.categoria}</strong>
                        <span>Estado: {reclamo.estado}</span>
                        <p className="fecha">Fecha: {reclamo.soloFecha}</p>
                        <p className="hora">Hora: {reclamo.soloHora}</p>
                        {(!reclamo.anonimo || verAnonimos) ? (
                            <>
                                <p className="hora">Autor: {reclamo.user ? reclamo.user.nombreCompleto : "Anónimo"}</p>
                                <p className="hora">Email: {reclamo.user ? reclamo.user.email : "No disponible"}</p>
                                <p className="hora">RUT: {reclamo.user ? reclamo.user.rut : "No disponible"}</p>
                                <p className="hora">ID reclamo: {reclamo.id}</p>
                            </>
                        ) : (
                            <>
                                <p className="hora">Autor: Anónimo</p>
                                <p className="hora">Email: Anónimo</p>
                                <p className="hora">RUT: Anónimo</p>
                                <p className="hora">ID reclamo: {reclamo.id}</p>
                            </>
                        )}
                        {reclamoEditado && (
                            <EditarReclamo
                                reclamo={reclamoEditado}
                                onClose={() => { setReclamoEditado(null); setErrorEdicion(""); }}
                                onSave={handleEditarReclamo}
                                error={errorEdicion}
                            />
                        )}
                    </li>
                </ul>
            )}
        </div>
    );
}