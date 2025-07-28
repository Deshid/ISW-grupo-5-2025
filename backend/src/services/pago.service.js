"use strict";

import UserSchema from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import PagoSchema from "../entity/pago.entity.js";

// Si más adelante quieres volver a generar el PDF, descomenta esta línea
// import { generarComprobantePago } from "./pdf.services.js";

export async function createPagoService(data) {
    try {
        const pagoRepository = AppDataSource.getRepository(PagoSchema);
        const userRepository = AppDataSource.getRepository(UserSchema);

        let user;
        if (data.rut) {
            user = await userRepository.findOne({ where: { rut: data.rut } });
        } else if (data.departamento) {
            user = await userRepository.findOne({ where: { departamento: data.departamento } });
        }

        if (!user) {
            return [null, "Residente no encontrado con el RUT o Departamento proporcionado."];
        }

        const pagoExistente = await pagoRepository.findOne({
            where: {
                mes: data.mes,
                user: { id: user.id },
            },
            relations: ["user"],
        });

        if (pagoExistente) {
            return [null, `Ya existe un pago registrado para ${user.nombreCompleto} en el mes de ${data.mes}.`];
        }

        const nuevoPago = pagoRepository.create({
            monto: data.monto,
            mes: data.mes,
            fechaPago: data.fechaPago,
            metodo: data.metodo,
            user: user,
        });

        const pagoGuardado = await pagoRepository.save(nuevoPago);

        return [{ pago: pagoGuardado }, null];
    } catch (error) {
        console.error("Error al crear el pago:", error);
        return [null, "Error interno del servidor"];
    }
}


export async function getPagosService() {
    try {
        const pagoRepository = AppDataSource.getRepository(PagoSchema);

        const pagos = await pagoRepository.find({
            relations: ["user"],
            order: { fechaPago: "DESC" },
        });

        if (!pagos || pagos.length === 0) return [null, "No hay pagos registrados"];

        return [pagos, null];
    } catch (error) {
        console.error("Error al obtener los pagos:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getPagoService({ idPago }) {
    try {
        const pagoRepository = AppDataSource.getRepository(PagoSchema);

        const pago = await pagoRepository.findOne({
            where: { idPago },
            relations: ["user"],
        });

        if (!pago) return [null, "Pago no encontrado"];

        return [pago, null];
    } catch (error) {
        console.error("Error al obtener el pago:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deletePagoService({ idPago }) {
    try {
        const pagoRepository = AppDataSource.getRepository(PagoSchema);

        const pago = await pagoRepository.findOne({
            where: { idPago },
            relations: ["user"],
        });

        if (!pago) return [null, "Pago no encontrado"];

        const pagoEliminado = await pagoRepository.remove(pago);

        return [pagoEliminado, null];
    } catch (error) {
        console.error("Error al eliminar el pago:", error);
        return [null, "Error interno del servidor"];
    }
}