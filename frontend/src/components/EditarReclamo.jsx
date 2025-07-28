import { useEditarReclamoForm } from "../hooks/useEditarReclamoForm";
import '@styles/editarReclamo.css';

export default function EditarReclamo({ reclamo, onClose, onSave, error }) {
    const { estado, setEstado, comentarioInterno, setComentarioInterno } = useEditarReclamoForm(reclamo);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: reclamo.id, estado, comentarioInterno });
        console.log("Estado:", estado);
    };
if (typeof error !== "undefined") {
    console.log("Mensaje de error recibido en EditarReclamo:", error);
}
    return (
        <div className="reclamo-overlay">
            <div className="reclamo-contenido">
                <h3>Actualizar Reclamo</h3>
                <form onSubmit={handleSubmit}>
                    <label>
                        <p>Estado:</p>
                        <select className="estado-select" value={estado} onChange={e => setEstado(e.target.value)} required>
                            <option value="pendiente" style={{display:'none'}}>Pendiente</option>
                            <option value="en_proceso">En proceso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </label>
                    <label>
                        <p>Comentario de la Directiva:</p>
                        <textarea
                            name="comentarioInterno"
                            value={comentarioInterno}
                            onChange={e => setComentarioInterno(e.target.value)}
                            rows={3}
                        />
                    </label>
                    <div className="reclamo-overlay-btns">
                        <button type="submit" className="guardar-btn">Guardar</button>
                        <button type="button" className="cancelar-btn" onClick={onClose}>Cancelar</button>
                        {error  && (
                        <div className="error-msg">
                            <p>{error}</p>
                        </div>
                    )}
                    </div>
                </form>
            </div>
        </div>
    );
}