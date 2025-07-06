"use strict";

import Reclamo from "../entity/reclamos.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { 
    handleErrorClient, 
    handleErrorServer, 
    handleSuccess 
    } from "../handlers/responseHandlers.js";
import { 
    cancelacionReclamoValidation,
    crearReclamoValidation,
    getAllReclamosValidation, // Usaremos esta validación para paginación en identidades
    getMisReclamosValidation,
    getReclamosConIdentidadValidation,
    getReclamosPendientesValidation,
    updateEstadoReclamoValidation 
    } from "../validations/reclamos.validation.js";
import { formatoFecha } from "../helpers/dateFormat.js"

export async function crearReclamo(req, res) {
    try {
        const { error } = crearReclamoValidation.validate(req.body);
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
        const { error } = getAllReclamosValidation.validate(req.query);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const esAdmin = req.user.rol === "administrador";
        const [reclamos, total] = await reclamoRepository.findAndCount({
            relations: ["usuario"],
            skip,
            take: limit
        });
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
        return handleSuccess(res, 200, "Reclamos encontrados", {
            reclamos: reclamosFiltrados, // como ya tienes
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
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
        const { error } = updateEstadoReclamoValidation.validate(req.body);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
        const { estado } = req.body;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) } });
        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }
        // Lógica de transición de estados
        if (reclamo.estado === "cancelado") {
            return handleErrorClient(res, 400, "No se puede modificar un reclamo cancelado.");
        }
        if (reclamo.estado === "resuelto") {
            return handleErrorClient(res, 400, "No se puede modificar un reclamo resuelto.");
        }
        if (reclamo.estado === "en_proceso" && (estado === "pendiente" || estado === "cancelado")) {
            return handleErrorClient(res, 400, "Un reclamo en proceso no puede volver a pendiente ni ser cancelado.");
        }
        if (req.body.comentarioInterno && estado !== "resuelto") {
            reclamo.comentarioInterno = req.body.comentarioInterno;
        }
        if (req.body.comentarioInterno && estado === "resuelto") {
            reclamo.resolucion = req.body.comentarioInterno;
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
        const { error } = getMisReclamosValidation.validate(req.query);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const [reclamos, total] = await reclamoRepository.findAndCount({
            where: { usuario: { id: req.user.id } },
            relations: ["usuario"],
            skip,
            take: limit
        });
        if (!reclamos || reclamos.length === 0) {
            return handleErrorClient(res, 200, "No existen reclamos enviados en su historial", []);
        }
        const reclamosFormateados = reclamos.map(r => ({
            ...r,
            fecha: formatoFecha(r.fecha)
        }));
        return handleSuccess(res, 200, "Reclamos obtenidos exitosamente", {
            reclamos: reclamosFormateados,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function cancelarReclamo(req, res) {
    try {
        const { id } = req.params;
        const { error } = cancelacionReclamoValidation.validate(req.body);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
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
        reclamo.comentarioInterno = req.body.motivo;
        await reclamoRepository.save(reclamo);
        return handleSuccess(res, 200, "Reclamo cancelado exitosamente", reclamo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReclamosPendientes(req, res) {
    try {
        const { error } = getReclamosPendientesValidation.validate(req.query);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { id } = req.params;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const [reclamos, total] = await reclamoRepository.findAndCount({
            where: [
            { estado: "pendiente" },
            { estado: "en_proceso" }
            ],
            relations: ["usuario"],
            skip,
            take: limit
        });
        if (!reclamos || reclamos.length === 0) {
            return handleErrorClient(res, 200, "No hay reclamos pendientes o en proceso", []);
        }
        return handleSuccess(res, 200, "Reclamos pendientes encontrados", {
            reclamos,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReclamosConIdentidad(req, res) {
    try {
        // Usar validación de paginación
        const { error } = getReclamosConIdentidadValidation.validate(req.query);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const [reclamos, total] = await reclamoRepository.findAndCount({
            relations: ["usuario"],
            skip,
            take: limit
        });
        // El admin puede ver la identidad incluso en anónimos, así que no ocultes nada
        const reclamosFormateados = reclamos.map(r => ({
            ...r,
            fecha: formatoFecha(r.fecha)
        }));
        return handleSuccess(res, 200, "Reclamos con identidad", {
            reclamos: reclamosFormateados,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}