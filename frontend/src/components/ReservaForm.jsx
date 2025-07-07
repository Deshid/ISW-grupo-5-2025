import { useState, useEffect } from "react";
import { createReserva } from "@services/reserva.service.js";
import {getMisReservas} from "@services/reserva.service.js";
import '../styles/reserva.css';

export default function ReservaForm({ ReservaCreada }) {
    const [form, setForm] = useState({
        id_espacio: "",
        fecha: "",
        horaInicio: "",
        horaFin: ""
    });
    const [mensaje, setMensaje] = useState("");

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
            if (ReservaCreada) ReservaCreada();
        } else {
            setMensaje(res.error || "Error al crear reserva");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-reserva">
            <label>
                Espacio:
                <input name="id_espacio" value={form.id_espacio} onChange={handleChange} required />
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
            {mensaje && <div>{mensaje}</div>}
        </form>
    );
}

export function ListaReservasUsuario() {
    const [reservas, setReservas] = useState([]);

    useEffect(() => {
        getMisReservas().then((data) => {
            setReservas(data || []);
        });
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Mis Reservas</h2>
            <table className="min-w-full border">
                <thead>
                    <tr>
                        <th>Espacio</th>
                        <th>Fecha</th>
                        <th>Hora Inicio</th>
                        <th>Hora Fin</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {reservas.map((r, idx) => (
                        <tr key={idx}>
                            <td>{r.espacioComun}</td>
                            <td>{r.fecha}</td>
                            <td>{r.horaInicio}</td>
                            <td>{r.horaFin}</td>
                            <td>{r.estado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}