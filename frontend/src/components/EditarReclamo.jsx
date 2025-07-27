import { useState } from "react";
import '@styles/editarReclamo.css';

export default function EditarReclamo({ reclamo, onClose, onSave }) {
    const [estado, setEstado] = useState(reclamo.estado);
    const [comentarioInterno, setComentarioInterno] = useState(reclamo.comentarioInterno || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: reclamo.id, estado, comentarioInterno });
        console.log("Estado:", estado);
    };

    return (
        <div className="reclamo-overlay">
            <div className="reclamo-contenido">
                <h3>Editar Estado del Reclamo</h3>
                <form onSubmit={handleSubmit}>
                    <label>
                        <p>Estado:</p>
                        <select value={estado} onChange={e => setEstado(e.target.value)} required>
                            { estado === "pendiente" && (
                                <option value="pendiente" disabled>Pendiente</option>
                            )}
                            <option value="en_proceso">En proceso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </label>
                    <label>
                        <p>Comentario interno:</p>
                        <textarea
                            name="comentarioInterno"
                            value={comentarioInterno}
                            onChange={e => setComentarioInterno(e.target.value)}
                            rows={3}
                        />
                    </label>
                    <div className="reclamo-overlay-btns">
                        <button type="submit">Guardar</button>
                        <button type="button" className="cancelar-btn" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}