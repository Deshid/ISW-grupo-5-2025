"use strict";

import Reclamo from "../entity/reclamos.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { 
    handleErrorClient, 
    handleErrorServer, 
    handleSuccess 
    } from "../handlers/responseHandlers.js";

export async function crearReclamo(req, res) {
    try {
        const { descripcion, categoria, anonimo } = req.body;
        if (!descripcion || !categoria) {
        return handleErrorClient(res, 400, "Tanto la descripción como la categoría son obligatorias");
        }

        const reclamoRepository = AppDataSource.getRepository(Reclamo);

        const nuevoReclamo = reclamoRepository.create({
            descripcion,
            categoria,
            anonimo: !!anonimo,
            estado: "pendiente",
            usuario: anonimo ? null : { id: req.user.id },
        });

        await reclamoRepository.save(nuevoReclamo);
        handleSuccess(res, 201, "Reclamo creado exitosamente", nuevoReclamo);
    } 
    catch (error) {
        handleErrorServer(res, 500, error.message);
        return;
    }   
}

export async function getAllReclamos(req, res) {
    try {
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamos = await reclamoRepository.find({ relations: ["usuario"] });
        return handleSuccess(res, 200, "Reclamos encontrados", reclamos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReclamo(req, res) {
    try {
        const { id } = req.params;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) }, relations: ["usuario"] });
        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }
        return handleSuccess(res, 200, "Reclamo encontrado", reclamo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateEstadoReclamo(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        if (!estado) {
            return handleErrorClient(res, 400, "El nuevo estado es obligatorio");
        }
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) } });
        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }
        reclamo.estado = estado;
        await reclamoRepository.save(reclamo);
        return handleSuccess(res, 200, "Estado del reclamo actualizado", reclamo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}