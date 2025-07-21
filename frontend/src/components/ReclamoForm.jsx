
import { useState,  } from "react";
import { 
    crearReclamo,
    //getMisReclamos,
    //getReclamosPendientes,
    //getReclamosConIdentidad,
    //updateEstadoReclamo,
    //cancelarReclamo,
    //getAllReclamos
 } from "@services/reclamos.service"

import "../styles/reclamos.css";

export default function ReclamoForm({ ReclamoCreado }) {
    const [form, setForm] = useState({
        descripcion: "",
        categoria: "",
        anonimo: false
    });
    const [mensaje, setMensaje] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        const res = await crearReclamo(form);
        if (res && res.reclamo) {
            setMensaje("Reclamo creado exitosamente");
            setForm({ descripcion: "", categoria: "", anonimo: false });
            if (ReclamoCreado) ReclamoCreado();
        } else {
            setMensaje(res.error || "Error al crear reclamo");
        }
    };
//REVISAR HOOKS PARA CONECTAR CON EL BACKEND
    return (
        <form onSubmit={handleSubmit} className="form-reclamo">
            <label className="descripcion">
                <p>Descripción:</p>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required />
            </label>
            <label className="categoria">
                <p>Categoría:</p>
                <input name="categoria" value={form.categoria} onChange={handleChange} required />
            </label>
            <label className="anonimo">
                <p>¿Desea enviar el reclamo de forma anónima?</p>
                <input type="checkbox" name="anonimo" checked={form.anonimo} onChange={handleChange} />
            </label>
            <button type="submit">Crear Reclamo</button>
            {mensaje && <div>{mensaje}</div>}
        </form>
    );
}