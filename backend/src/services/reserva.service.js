    "use strict";
    import { AppDataSource } from "../config/configDb.js";
    import { ReservaSchema } from "../entity/reserva.entity.js";

    // servicio para reservar espacio comun, crear reserva
export async function reservarEspacioServicio({ id, id_espacio, fecha, horaInicio, horaFin }) {
    try {
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        // Validar que la hora de inicio sea menor que la de fin
        if (horaInicio >= horaFin) {
        return [null, "La hora de inicio debe ser menor que la hora de fin."];
        }
        // Verificar si ya existe una reserva que colisione en ese espacio comun y fecha
        const reservasColisionadas = await reservaRepository.find({
        where: { espacioComun: { id_espacio }, fecha, },
        relations: ["espacioComun", "usuario"],
        });
        const hayColision = reservasColisionadas.some(r => (horaInicio < r.horaFin && horaFin > r.horaInicio));
        if (hayColision) {
        return [null, "El espacio ya está reservado en ese horario."];
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
        const reservaCompleta  = await reservaRepository.findOne({
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
        } };
        return [dataReserva, null];
    } catch (error) {
        console.error("Error al reservar espacio común:", error);
        return [null, "Error interno del servidor"];
    }
    }

export async function getReservasServicio({ id_espacio, fecha }) {
    try{
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
    }catch (error) {
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

// Eliminar reserva de usuario
export async function eliminarReservaUsuarioServicio(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);
        // Buscar la reserva y verificar que sea del usuario
        const reserva = await reservaRepository.findOne({
            where: { id, usuario: { id: userId } },
        });
        if (!reserva) {
            return [null, "Reserva no encontrada o no autorizada"];
        }
        if (reserva.estado !== "pendiente") {
            return [null, "Solo puedes eliminar reservas en estado pendiente"];
        }
        await reservaRepository.remove(reserva);
        return [true, null];
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
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
        // Solo si está aprobada puede solicitar cancelación
        if (reserva.estado !== "aprobada") {
            return [null, "Solo puedes solicitar cancelación de reservas aprobadas"];
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
            where: [{ estado: "pendiente" },{ estado: "cancelacion_pendiente" }],
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