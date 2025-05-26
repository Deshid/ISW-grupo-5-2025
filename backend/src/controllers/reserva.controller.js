"use strict";
import {
    actualizarEstadoReservaServicio,
    actualizarReservaServicio,
    cancelarReservaServicio,
    eliminarReservaUsuarioServicio,
    getMisReservasServicio,
    getReservasAdminServicio,
    getReservasServicio,
    reservarEspacioServicio,
    solicitarCancelacionReservaServicio
} from "../services/reserva.service.js";
import { reservaValidation } from "../validations/reserva.validation.js";


// Crear reserva
    export async function crearReserva(req, res) {
    try {
        const { error, value } = reservaValidation.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        value.id = req.user.id;
        const [reserva, err] = await reservarEspacioServicio(value);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({
        message: "Reserva creada exitosamente",
        status: "Success",
        reserva
        });
    } catch (error) {
        console.error("Error al reservar espacio común:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    }

    export async function getReservas(req, res) {
    try {
        const { id_espacio, fecha } = req.query;
        const [reservasEncontradas, err] = await getReservasServicio({ id_espacio, fecha });
        if (err) return res.status(400).json({ error: err });
        res.status(200).json(reservasEncontradas);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    }
    // Obtener reservas del usuario autenticado
    export async function getMisReservas(req, res) {
    try {
        const [resultado, err] = await getMisReservasServicio(req, res);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al obtener las reservas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    }

    // Actualizar reserva del usuario (pendiente)
export async function actualizarReserva(req, res) {
    try {
        const [reserva, err] = await actualizarReservaServicio(req, res);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({ message: "Reserva actualizada correctamente", reserva });
    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

// Eliminar reserva del usuario
    export async function eliminarReservaUsuario(req, res) {
    try {
        const [ok, err] = await eliminarReservaUsuario(req, res);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({ message: "Reserva eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    }

/* Solicita cancelar reserva aprobada (USUARIO) */
export async function solicitarCancelacionReserva(req, res) {
    try {
        const [reserva, err] = await solicitarCancelacionReservaServicio(req, res);
        if (err) return res.status(400).json({ error: err });
        return res.status(200).json({ message: "Solicitud para cancelar enviada.", reserva });
    } catch (error) {
        console.error("Error al solicitar la cancelación:", error);
        return res.status(500).json({ error: "Error al solicitar la cancelación" });
    }
}
/* Obtener reservas pendientes (ADMIN) */
    export async function getReservasAdmin(req, res) {
    try {
        const [resultado, err] = await getReservasAdminServicio(res);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al obtener reservas para admin:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    }

/* Cancelar reserva (ADMIN) */
export async function cancelarReserva(req, res) {
    try {
        const [reserva, err] = await cancelarReservaServicio(req, res);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({ message: "Reserva cancelada por el administrador", reserva });
    } catch (error) {
        res.status(500).json({ error: "Error al cancelar reserva" });
    }
}

    export async function actualizarEstadoReserva(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const [reserva, err] = await actualizarEstadoReservaServicio(id, estado);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({ message: `Reserva ${estado}`, reserva });
    } catch (error) {
        console.error("Error al actualizar estado de reserva:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}