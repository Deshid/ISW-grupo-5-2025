"use strict";
import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import { ReservaSchema } from "../entity/reserva.entity.js";

// sanciones (ADMIN)
export async function sancionarUsuarioServicio(id, sancionado = true) {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const usuario = await userRepository.findOne({ where: { id } });
    if (!usuario) return [null, "Usuario no encontrado"];
    usuario.sancionado = sancionado;
    await userRepository.save(usuario);
    return [usuario, null];
}

// servicio para reservar espacio comun, crear reserva
export async function reservarEspacioServicio({ id, id_espacio, fecha, horaInicio, horaFin }) {
    try {
        // validando si es que está sancionado
        const userRepository = AppDataSource.getRepository("User");
        const usuario = await userRepository.findOne({ where: { id } });
        if (usuario.sancionado) {
            return [null, "No puedes reservar porque estás sancionado. Comuniquese con el presidente del condominio."];
        }
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        // Validar que la hora de inicio sea menor que la de fin
        if (horaInicio >= horaFin) {
            return [null, "La hora de inicio debe ser menor que la hora de fin."];
        }
        // Verificar si ya existe una reserva que colisione en ese espacio comun y fecha
        const reservasColisionadas = await reservaRepository.find({
            where: { espacioComun: { id_espacio }, fecha, 
                    estado: In(["pendiente", "aprobada", "cancelacion_pendiente"]) 
                },
            relations: ["espacioComun", "usuario"],
        });
        const hayColision = reservasColisionadas.some(r => (horaInicio < r.horaFin && horaFin > r.horaInicio));
        if (hayColision) {
            return [null, "El espacio ya está reservado en ese horario."];
        }
        // solo puede reservar con al menos 1 dia de anticipacion y hasta 15 dias antes de la fecha reservada
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaReserva = new Date(fecha);
        fechaReserva.setHours(0, 0, 0, 0);
        const diferenciaDias = (fechaReserva - hoy) / (1000 * 60 * 60 * 24);
        if (diferenciaDias < 1 || diferenciaDias > 15) {
            return [null, "Solo puedes reservar con al menos 1 día y hasta 15 días de anticipación."];
        }

        // Obtener todas las reservas activas del usuario
        const reservasUsuario = await reservaRepository.find({
            where: { usuario: { id } }
        });
        // revisar este: // Filtrar solo las reservas futuras activas (pendiente o aprobada y fecha >= hoy)
        const hoy2 = new Date();
        hoy2.setHours(0, 0, 0, 0);
        const reservasActivas = reservasUsuario.filter(r =>
            (r.estado === "pendiente" || r.estado === "aprobada") && new Date(r.fecha) >= hoy2
        );

        if (reservasActivas.length >= 3) {
        return [null, "Solo puedes tener 3 reservas activas. Cancela o espera a usar alguna para reservar otra vez."];
            }
        // solo se puede reservar hasta 4 horas continuas el mismo día,
        // esta sección fue con ayuda de internet ya que me parecio dificil para mi :(
        function horaStringAMinutos(horaStr) {
            const [h, m] = horaStr.split(":").map(Number);
            return h * 60 + m;
            }
            const minutosInicio = horaStringAMinutos(horaInicio);
            const minutosFin = horaStringAMinutos(horaFin);
            const duracion = minutosFin - minutosInicio;
                if (duracion > 240) { // 4 horas * 60 minutos
                    return [null, "Solo puedes reservar hasta 4 horas continuas en un mismo día."];
                }
        // creando reserva
        const nuevaReserva = reservaRepository.create({
            usuario: { id },
            espacioComun: { id_espacio },
            fecha,
            horaInicio,
            horaFin,
            estado: "pendiente"
        });
        // guardando reserva
        await reservaRepository.save(nuevaReserva);
        const reservaCompleta = await reservaRepository.findOne({
            where: { id: nuevaReserva.id },
            relations: ["usuario", "espacioComun"],
        });
        const dataReserva = {
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
        };
        return [dataReserva, null];
    } catch (error) {
        console.error("Error al reservar espacio común:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getReservasServicio({ id_espacio, fecha }) {
    try {
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        const reservas = await reservaRepository.find({
            where: { espacioComun: { id_espacio: id_espacio }, fecha, },
            relations: ["espacioComun", "usuario"],
        });
        // devuelve las reservas encontradas
        const reservaEncontrada = reservas.map(reserva => ({
            estado: reserva.estado,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin,
            espacioComun: reserva.espacioComun.nombre,
            usuario: reserva.usuario.nombreCompleto,
        }));
        return [reservaEncontrada, null];
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        return [null, "Error interno del servidor"];
    }
}
// Obtener reservas de un usuario
export async function getMisReservasServicio(req, res) {
    try {
        const userId = req.user.id;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        const reservas = await reservaRepository.find({
            where: { usuario: { id: userId } },
            relations: ["espacioComun", "usuario"],
        });
        const resultado = reservas.map(reserva => ({
            id_reserva: reserva.id,
            estado: reserva.estado,
            fecha: reserva.fecha,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin,
            espacioComun: reserva.espacioComun.id_espacio,
            espacioComun: reserva.espacioComun.nombre,
        }));
        return [resultado, null];
    } catch (error) {
        console.error("Error al obtener mis reservas:", error);
        return [null, "Error interno del servidor"];
    }
}
// Actualizar reserva de usuario
export async function actualizarReservaServicio(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { fecha, horaInicio, horaFin, id_espacio } = req.body;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        const reserva = await reservaRepository.findOne({
            where: { id, usuario: { id: userId } },
            relations: ["usuario", "espacioComun"],
        });
        if (!reserva) return [null, "Reserva no encontrada"];
        if (reserva.estado !== "pendiente") return [null, "Solo puedes modificar reservas en estado pendiente"];
        if (diferenciaDias < 1) {
            return [null, "Solo puedes modificar reservas con al menos 1 día de anticipación"];
        }
        if (fecha) reserva.fecha = fecha;
        if (horaInicio) reserva.horaInicio = horaInicio;
        if (horaFin) reserva.horaFin = horaFin;
        if (id_espacio) reserva.espacioComun = { id_espacio };
        await reservaRepository.save(reserva);
        const respuesta = {
            fecha: reserva.fecha,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin,
            estado: reserva.estado,
            usuario: {
                nombreCompleto: reserva.usuario.nombreCompleto,
                email: reserva.usuario.email,
            },
            espacioComun: {
                id_espacio: reserva.espacioComun.id_espacio,
                nombre: reserva.espacioComun.nombre,
                descripcion: reserva.espacioComun.descripcion
            }
        };
        return [respuesta, null];
    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Solicita cancelar reserva aprobada (USUARIO) */
export async function solicitarCancelacionReservaServicio(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        // ver que sea del usuario autenticado
        const reserva = await reservaRepository.findOne({
            where: { id, usuario: { id: userId } }
        });
        if (!reserva) {
            return [null, "Reserva no encontrada"];
        }
        // Validar la cancelación con al menos 1 día de anticipación
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaReserva = new Date(reserva.fecha);
        fechaReserva.setHours(0, 0, 0, 0);
        const diferenciaDias = (fechaReserva - hoy) / (1000 * 60 * 60 * 24);
        if (diferenciaDias < 1) {
            return [null, "Solo puedes cancelar hasta 1 día antes de la fecha de la reserva"];
        }
        // verificar el estado de la reserva
        if (reserva.estado === "rechazada" || reserva.estado === "cancelada") {
            return [null, "No puedes cancelar una reserva que ya está rechazada o cancelada."];
        }
        // elimina la reserva automáticamente si está pendiente
        if (reserva.estado === "pendiente") {
            // await reservaRepository.remove(reserva);
            reserva.estado = "cancelada";
            await reservaRepository.save(reserva);
            return [reserva, null];
        }
        reserva.estado = "cancelacion_pendiente";
        await reservaRepository.save(reserva);
        return [reserva, null];
    } catch (error) {
        console.error("Error al solicitar la cancelación:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Obtener reservas pendientes (ADMIN) */
export async function getReservasAdminServicio(res) {
    try {
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        const reservas = await reservaRepository.find({
            where: [{ estado: "pendiente" }, { estado: "cancelacion_pendiente" }],
            relations: ["usuario", "espacioComun"],
            order: { fecha: "ASC", horaInicio: "ASC" }
        });
        const resultadoPendientes = reservas.map(reserva => ({
            id: reserva.id,
            estado: reserva.estado,
            fecha: reserva.fecha,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin,
            usuario: {
                id: reserva.usuario.id,
                nombreCompleto: reserva.usuario.nombreCompleto,
                email: reserva.usuario.email,
                rut: reserva.usuario.rut,
                rol: reserva.usuario.rol
            },
            espacioComun: {
                id_espacio: reserva.espacioComun.id_espacio,
                nombre: reserva.espacioComun.nombre,
                descripcion: reserva.espacioComun.descripcion
            }
        }));
        return [resultadoPendientes, null];
    } catch (error) {
        console.error("Error al obtener reservas para admin:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Eliminar reserva cancelada (admin) */
export async function cancelarReservaServicio(req, res) {
    try {
        const { id } = req.params;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        const reserva = await reservaRepository.findOne({ where: { id } });
        if (!reserva)
            return [null, "Reserva no encontrada"];
        if (reserva.estado !== "cancelacion_pendiente") {
            return [null, "La reserva no está en estado de cancelación pendiente"];
        }
        reserva.estado = "cancelada";
        await reservaRepository.save(reserva);
        return [reserva, null];
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
        return [null, "Error interno del servidor"];
    }
}

// Actualizar estado de reserva (ADMIN)
export async function actualizarEstadoReservaServicio(id, estado) {
    try {
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        const reserva = await reservaRepository.findOne({ where: { id } });
        if (!reserva) return [null, "Reserva no encontrada"];
        if (!["aprobada", "rechazada"].includes(estado)) {
            return [null, "Estado inválido. Usa 'aprobada' o 'rechazada'."];
        }
        reserva.estado = estado;
        await reservaRepository.save(reserva);
        return [reserva, null];
    } catch (error) {
        console.error("Error al actualizar estado de reserva:", error);
        return [null, "Error interno del servidor"];
    }
}