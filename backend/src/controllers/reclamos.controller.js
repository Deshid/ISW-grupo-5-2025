"use strict";

import Reclamo from "../entity/reclamos.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { 
    handleErrorClient, 
    handleErrorServer, 
    handleSuccess 
    } from "../handlers/responseHandlers.js";
import { reclamoBodyValidation } from "../validations/reclamos.validation.js";
import { formatoFecha } from "../helpers/dateFormat.js"

export async function crearReclamo(req, res) {
    try {
        const { error } = reclamoBodyValidation.validate(req.body);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
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
            usuario: { id: req.user.id }
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
        const esAdmin = req.user.rol === "administrador";
        const reclamos = await reclamoRepository.find({ relations: ["usuario"] });
        const reclamosFiltrados = reclamos.map(r => {
            const reclamoFormateado = {
                ...r,
                fecha: formatoFecha(r.fecha)
            };
            if (r.anonimo && !esAdmin) {
                return { ...reclamoFormateado, usuario: null };
            }
            return reclamoFormateado;
        });
        return handleSuccess(res, 200, "Reclamos encontrados", reclamosFiltrados);
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

export async function getMisReclamos(req, res) {
    try {
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamos = await reclamoRepository.find({
            where: { usuario: { id: req.user.id } },
            relations: ["usuario"],
        });
        if (!reclamos || reclamos.length === 0) {
            return handleErrorClient(res, 200, "No existen reclamos enviados en su historial", []);
        }
        const reclamosFormateados = reclamos.map(r => ({
            ...r,
            fecha: formatoFecha(r.fecha)
        }));
        return handleSuccess(res, 200, "Reclamos obtenidos exitosamente", reclamosFormateados);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function cancelarReclamo(req, res) {
    try {
        const { id } = req.params;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) }, relations: ["usuario"] });
        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }
        if (reclamo.estado !== "pendiente") {
            return handleErrorClient(res, 400, "Solo se pueden cancelar reclamos pendientes");
        }
        if (reclamo.usuario?.id !== req.user.id) {
            return handleErrorClient(res, 403, "No puedes cancelar un reclamo que no es tuyo");
        }
        reclamo.estado = "cancelado";
        await reclamoRepository.save(reclamo);
        return handleSuccess(res, 200, "Reclamo cancelado exitosamente", reclamo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReclamosPendientes(req, res) {
    try {
        const { id } = req.params;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamos = await reclamoRepository.find({
            where: [
            { estado: "Pendiente" },
            { estado: "En Proceso" }
            ],
            relations: ["usuario"],
        });
        if (!reclamos || reclamos.length === 0) {
            return handleErrorClient(res, 200, "No hay reclamos pendientes o en proceso", []);
        }
        return handleSuccess(res, 200, "Reclamos pendientes encontrados", reclamos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReclamosConIdentidad(req, res) {
    try {
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamos = await reclamoRepository.find({ relations: ["usuario"] });
        // El admin puede ver la identidad incluso en anónimos, así que no ocultes nada
        const reclamosFormateados = reclamos.map(r => ({
            ...r,
            fecha: formatoFecha(r.fecha)
        }));
        return handleSuccess(res, 200, "Reclamos con identidad", reclamosFormateados);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}