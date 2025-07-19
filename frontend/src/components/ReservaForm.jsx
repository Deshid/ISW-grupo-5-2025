import { useState, useEffect } from "react";
import { createReserva, getMisReservas, solicitarCancelacionReservaUsuario } from "@services/reserva.service.js";
import '../styles/reserva.css';

export default function VistaReserva() {
    const [form, setForm] = useState({
        id_espacio: "",
        fecha: "",
        horaInicio: "",
        horaFin: ""
    });

    const [mensaje, setMensaje] = useState("");
    const [reservas, setReservas] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        const res = await createReserva(form);
        if (res && res.reserva) {
            setMensaje("Reserva creada exitosamente");
            setForm({ id_espacio: "", fecha: "", horaInicio: "", horaFin: "" });
            cargarReservas();
        } else {
            setMensaje(res.error || "Error al crear reserva");
        }
    };

    const cargarReservas = async () => {
        const data = await getMisReservas();
        setReservas(data || []);
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    const nombreEspacio = (espacioComun) => {
        const mapa = { 1: "Quincho", 2: "Sala Multiuso", 3: "Patio" };
        return mapa[espacioComun] || espacioComun;
    };

    return (
        <div className="main-container-reserva">
            {/* Formulario de reserva */}
            <form onSubmit={handleSubmit} className="form-reserva">
                <h2>📆 Crear Reserva</h2>
                <label>
                    Espacio:
                    <select name="id_espacio" value={form.id_espacio} onChange={handleChange} required>
                        <option value="">Seleccione un espacio</option>
                        <option value="1">Quincho</option>
                        <option value="2">Patio</option>
                        <option value="3">Sala Multiuso</option>
                    </select>
                </label>
                <label>
                    Fecha:
                    <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
                </label>
                <label>
                    Hora inicio:
                    <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} required />
                </label>
                <label>
                    Hora fin:
                    <input type="time" name="horaFin" value={form.horaFin} onChange={handleChange} required />
                </label>
                <button type="submit">Reservar</button>
                {mensaje && <div className="mensaje">{mensaje}</div>}
            </form>

            {/* Lista de reservas */}
            <div className="mis-reservas-container">
                <h3>📋 Mis Reservas</h3>
                {reservas.length === 0 && <p className="no-reservas">Aún no tienes reservas.</p>}
                {reservas
                    .slice()
                    .sort((a, b) => {
                        const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
                        const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
                        return fechaB - fechaA; // orden descendente
                    })
                    .map((r, idx) => (
                        <div key={idx} className="notice-item">
                            <h4>{nombreEspacio(r.espacioComun)}</h4>
                            <p>
                                {r.fecha}   
                                <br />
                                {r.horaInicio} - {r.horaFin} hrs
                            </p>
                            {/* Display estado */}
                            {r.estado && (
                                <span className={`estado-${r.estado}`}>
                                    {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                </span>
                            )}
                            {/* Cancel button */}
                            {["pendiente", "aprobada"].includes(r.estado) && (
                                <button
                                    className="btn-warning"
                                    onClick={async () => {
                                        if (window.confirm("¿Seguro que quieres cancelar esta reserva?")) {
                                            const res = await solicitarCancelacionReservaUsuario(r.id || r.id_reserva);
                                            if (res && res.reserva) {
                                                setMensaje("Solicitud de cancelación enviada.");
                                                cargarReservas();
                                            } else {
                                                setMensaje(res.error || "Error al solicitar cancelación.");
                                            }
                                        }
                                    }}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}