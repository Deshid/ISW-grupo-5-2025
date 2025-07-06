"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SancionSchema } from "../entity/sancion.entity.js";
import UserSchema from "../entity/user.entity.js";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export async function sancionarUsuarioServicio(id, fecha_inicio, fecha_fin, motivo) {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const sancionRepository = AppDataSource.getRepository(SancionSchema);

    const usuario = await userRepository.findOne({ where: { id } });
    if (!usuario) return [null, "Usuario no encontrado"];
    if (!fecha_inicio || !fecha_fin || !motivo) {
        return [null, "Fecha de inicio, fecha de fin y motivo son obligatorios"];
    }

    // Validar si ya tiene una sanción activa
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const sancionActiva = await sancionRepository.findOne({
        where: {
            usuario: { id: usuario.id },
            fecha_inicio: LessThanOrEqual(hoy),
            fecha_fin: MoreThanOrEqual(hoy)
        }
    });
    if (sancionActiva) {
        return [null, "Este usuario ya tiene una sanción activa"];
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (inicio >= fin) return [null, "La fecha de inicio debe ser anterior a la fecha de fin"];
    if (inicio > fin) return [null, "La fecha de inicio debe ser anterior o igual a la fecha de fin"];

    const nuevaSancion = sancionRepository.create({
        usuario,
        fecha_inicio,
        fecha_fin,
        motivo
    });

    await sancionRepository.save(nuevaSancion);
    return [nuevaSancion, null];
}

export async function suspenderSancionServicio(id) {
    const sancionRepository = AppDataSource.getRepository(SancionSchema);

    // Buscar sanción activa del usuario
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const sancionActiva = await sancionRepository.findOne({
        where: {
            usuario: { id: Number(id) },
            fecha_inicio: LessThanOrEqual(hoy),
            fecha_fin: MoreThanOrEqual(hoy)
        }
    });

    if (!sancionActiva) return [null, "No hay sanción activa para este usuario"];

    // Finalizar la sanción hoy (ayer, para que no esté activa hasta el final del día)
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    ayer.setHours(0, 0, 0, 0);
    sancionActiva.fecha_fin = ayer;
    await sancionRepository.save(sancionActiva);

    return [sancionActiva, null];
}

export async function obtenerSancionesServicio() {
    const sancionRepository = AppDataSource.getRepository(SancionSchema);
    const sanciones = await sancionRepository.find({
        relations: ["usuario"]
    });
    if (!sanciones || sanciones.length === 0) return [null, "No hay sanciones registradas"];
    return [sanciones, null];
}
