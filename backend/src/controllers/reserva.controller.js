import { AppDataSource } from "../config/configDb.js";
import { ReservaSchema } from "../entity/reserva.entity.js";
import { reservarEspacio } from "../services/reserva.service.js";
import { reservaValidation } from "../validations/reserva.validation.js";

    export async function crearReserva(req, res) {
    const { error, value } = reservaValidation.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    value.estado = "pendiente";
    const [reserva, err] = await reservarEspacio(value);
    if (err) {
        return res.status(400).json({ error: err });
    }

    const reservaRepository = AppDataSource.getRepository(ReservaSchema);
    const reservaCompleta = await reservaRepository.findOne({
        where: { id: reserva.id },
        relations: ["usuario", "espacioComun"],
    });

    return res.status(201).json({
        estado: reservaCompleta.estado,
        fecha: reservaCompleta.fecha,
        horaInicio: reservaCompleta.horaInicio,
        horaFin: reservaCompleta.horaFin,
        usuario: {
            id: reservaCompleta.usuario.id,
            nombre: reservaCompleta.usuario.nombreCompleto,
            email: reservaCompleta.usuario.email,
        },
        espacioComun: {
            id: reservaCompleta.espacioComun.id_espacio,
            nombre: reservaCompleta.espacioComun.nombre,
        }
    });
    }

    export async function getReservas(req, res) {
    try {
        const { id_espacio, fecha } = req.query;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);


        const reservas = await reservaRepository.find({
        where: {
            espacioComun: { id_espacio: id_espacio },
            fecha,
        },
        relations: ["espacioComun", "usuario"],
        });

        // devuelve las reservas encontradas
        const reservasEncontradas = reservas.map(reserva => ({
        estado: reserva.estado,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        espacioComun: reserva.espacioComun.nombre,
        usuario: reserva.usuario.nombreCompleto,
        }));

        res.status(200).json(reservasEncontradas);
    }
    catch (error) {
        console.error("Error al obtener reservas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    }

export async function actualizarEstadoReserva(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);

        const reserva = await reservaRepository.findOne({ where: { id } });
        if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });

        if (!["aprobada", "rechazada"].includes(estado)) {
        return res.status(400).json({ error: "Estado inválido" });
        }
            reserva.estado = estado;
            await reservaRepository.save(reserva);
            return res.status(200).json({ message: "Estado de reserva actualizado" });

        } catch (error) {
            res.status(500).json({ error: "Error al actualizar estado" });
        }
        }

export async function solicitarCancelacionReserva(req, res) {
    try {
        const { id } = req.params;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);

        const reserva = await reservaRepository.findOne({ where: { id } });
        if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });

        // Validar que falte al menos 1 día
        const hoy = new Date();
        const fechaReserva = new Date(reserva.fecha);
        const diferencia = (fechaReserva - hoy) / (1000 * 60 * 60 * 24);

        if (diferencia < 1) {
        return res.status(400).json({ error: "Solo puedes cancelar con al menos 1 día de anticipación" });
        }
        // Solo si está aprobada o pendiente puede solicitar cancelación
        if (!["aprobada", "pendiente"].includes(reserva.estado)) {
            return res.status(400).json({ error: "No se puede solicitar cancelación en este estado" });
        }

        reserva.estado = "cancelacion_pendiente";
        await reservaRepository.save(reserva);

        res.status(200).json({ message: "Solicitud para cancelar enviada. Un administrador debe aprobarla.", reserva });
    } catch (error) {
        res.status(500).json({ error: "Error al solicitar la cancelación" });
    }
}
/* Eliminar reserva cancelada */
export async function cancelarReserva(req, res) {
    try {
        const { id } = req.params;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);

        const reserva = await reservaRepository.findOne({ where: { id } });
        if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });

        if (reserva.estado !== "cancelacion_pendiente") {
            return res.status(400).json({ error: "La reserva no está en estado de cancelación pendiente" });
        }
    res.status(200).json({ message: "Reserva cancelada por el administrador", reserva });
    } catch (error) {
        res.status(500).json({ error: "Error al cancelar reserva" });
    }
    }