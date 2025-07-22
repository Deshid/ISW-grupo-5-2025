
import "../styles/reclamos.css";
import useReclamoForm from "@hooks/reclamos/useReclamoForm";

export default function ReclamoForm({ ReclamoCreado }) {
    const {
        form,
        mensaje,
        handleChange,
        handleSubmit
    } = useReclamoForm(ReclamoCreado);

    return (
        <form onSubmit={handleSubmit} className="form-reclamo">
            {/* ...igual que antes... */}
            <label className="descripcion">
                <p>Descripción:</p>
                <textarea 
                    name="descripcion" 
                    value={form.descripcion} 
                    onChange={handleChange} 
                    required />
            </label>
            <label className="categoria">
                <p>Categoría:</p>
                <select 
                    name="categoria" 
                    value={form.categoria} 
                    onChange={handleChange} 
                    required>
                    <option value="">Seleccione una categoría</option>
                    <option value="edificio">Edificio</option>
                    <option value="residente">Residente</option>
                    <option value="servicio">Servicio</option>
                </select>
            </label>
            <label className="anonimo">
                <p>¿Desea enviar el reclamo de forma anónima?</p>
                <input 
                    type="checkbox" 
                    name="anonimo" 
                    checked={form.anonimo} 
                    onChange={handleChange} />
            </label>
            <button type="submit">Crear Reclamo</button>
            {mensaje && <div>{mensaje}</div>}
        </form>
    );
}