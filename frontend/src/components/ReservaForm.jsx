import { useState, useEffect } from "react";
import { createReserva, getMisReservas, solicitarCancelacionReservaUsuario, actualizarReserva } from "@services/reserva.service.js";
import { showSuccessAlert } from "../helpers/sweetAlert";
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
    const [editReservaId, setEditReservaId] = useState(null);
    const [editForm, setEditForm] = useState({ id_espacio: "", fecha: "", horaInicio: "", horaFin: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        const res = await createReserva(form);
        if (res && res.reserva) {
            setMensaje("Reserva creada exitosamente");
            showSuccessAlert("✅ Reserva creada exitosamente", "Tu reserva fue registrada correctamente.");
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
            {/* Popup edición de reserva */}
            {editReservaId && (
                <div className="popup-editar-reserva">
                  <div className="popup-editar-content">
                    <form
                      className="form-reserva"
                      onSubmit={async e => {
                        e.preventDefault();
                        setMensaje("");
                        const res = await actualizarReserva(editReservaId, editForm);
                        if (res && res.reserva) {
                          setMensaje("Reserva actualizada correctamente");
                          setEditReservaId(null);
                          cargarReservas();
                        } else {
                          setMensaje(res.error || "Error al actualizar reserva");
                        }
                      }}
                    >
                      <h2>✏️ Editar Reserva</h2>
                      <label>
                        Espacio:
                        <select name="id_espacio" value={editForm.id_espacio} onChange={e => setEditForm(f => ({ ...f, id_espacio: e.target.value }))} required>
                          <option value="">Seleccione un espacio</option>
                          <option value="1">Quincho</option>
                          <option value="2">Sala Multiuso</option>
                          <option value="3">Patio</option>
                        </select>
                      </label>
                      <label>
                        Fecha:
                        <input type="date" name="fecha" value={editForm.fecha} onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))} required />
                      </label>
                      <label>
                        Hora inicio:
                        <input type="time" name="horaInicio" value={editForm.horaInicio} onChange={e => setEditForm(f => ({ ...f, horaInicio: e.target.value }))} required />
                      </label>
                      <label>
                        Hora fin:
                        <input type="time" name="horaFin" value={editForm.horaFin} onChange={e => setEditForm(f => ({ ...f, horaFin: e.target.value }))} required />
                      </label>
                      <button type="submit" className="btn-update">Guardar cambios</button>
                      <button type="button" className="btn-cancelar-gris" onClick={() => setEditReservaId(null)}>Cancelar</button>
                    </form>
                  </div>
                </div>
            )}
            {/* Formulario de reserva */}
            <form onSubmit={handleSubmit} className="form-reserva">
                <h2>📆 Crear Reserva</h2>
                <label>
                    Espacio:
                    <select name="id_espacio" value={form.id_espacio} onChange={handleChange} required>
                        <option value="">Seleccione un espacio</option>
                        <option value="1">Quincho</option>
                        <option value="2">Sala Multiuso</option>
                        <option value="3">Patio</option>
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

            {/* Lista de reservas siempre visible */}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4>{nombreEspacio(r.espacioComun)}</h4>
                                {(() => {
                                    const ahora = new Date();
                                    const fechaFin = new Date(`${r.fecha}T${r.horaFin}`);
                                    if ((r.estado === "pendiente") && fechaFin >= ahora) {
                                        return (
                                            <button
                                                className="btn-update"
                                                style={{ padding: '0.3rem 0.8rem', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setEditReservaId(r.id || r.id_reserva);
                                                    setEditForm({
                                                        id_espacio: r.id_espacio || '',
                                                        fecha: r.fecha || '',
                                                        horaInicio: r.horaInicio || '',
                                                        horaFin: r.horaFin || ''
                                                    });
                                                }}
                                            >Editar</button>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <p>
                                {r.fecha}   
                                <br />
                                {r.horaInicio} - {r.horaFin} hrs
                            </p>
                            {/* Display estado o finalizada */}
                            {(() => {
                                const ahora = new Date();
                                const fechaFin = new Date(`${r.fecha}T${r.horaFin}`);
                                if ((r.estado === 'aprobada' || r.estado === 'pendiente') && fechaFin < ahora) {
                                    return <span className="estado-finalizada">Finalizada</span>;
                                }
                                if (r.estado === 'cancelacion_pendiente') {
                                    return (
                                        <span className="badge-cancelacion-pendiente" title="Solicitud de cancelación enviada, esperando aprobación del administrador">
                                    
                                            Cancelación pendiente
                                        </span>
                                    );
                                }
                                if (r.estado) {
                                    return (
                                        <span className={`estado-${r.estado}`}>
                                            {r.estado.charAt(0).toUpperCase() + r.estado.slice(1).replace('_', ' ')}
                                        </span>
                                    );
                                }
                                return null;
                            })()}
                            {/* Cancel button */}
                            {(() => {
                                const ahora = new Date();
                                const fechaFin = new Date(`${r.fecha}T${r.horaFin}`);
                                if (["pendiente", "aprobada"].includes(r.estado) && fechaFin >= ahora) {
                                    return (
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
                                        >Cancelar</button>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    ))}
            </div>
        </div>
    );
}