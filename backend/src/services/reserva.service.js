    "use strict";
    import { AppDataSource } from "../config/configDb.js";
    import { ReservaSchema } from "../entity/reserva.entity.js";

    // servicio para reservar espacio comun 
    export async function reservarEspacio({ id, id_espacio, fecha, horaInicio, horaFin }) {
    try {
        const reservaRepository = AppDataSource.getRepository(ReservaSchema);

        // Validar que la hora de inicio sea menor que la de fin
        if (horaInicio >= horaFin) {
        return [null, "La hora de inicio debe ser menor que la hora de fin."];
        }

        // Verificar si ya existe una reserva que colisione en ese espacio comun y fecha
        const reservasColisionadas = await reservaRepository.find({
        where: {
            espacioComun: { id_espacio },
            fecha,
        },
        relations: ["espacioComun", "usuario"],
        });

        const hayColision = reservasColisionadas.some(r => (horaInicio < r.horaFin && horaFin > r.horaInicio)
        );

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
        return [nuevaReserva, null];
    } catch (error) {
        console.error("Error al reservar espacio común:", error);
        return [null, "Error interno del servidor"];
    }
    }