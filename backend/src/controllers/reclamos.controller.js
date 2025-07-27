"use strict";

import Reclamo from "../entity/reclamos.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { 
    handleErrorClient, 
    handleErrorServer, 
    handleSuccess 
    } from "../handlers/responseHandlers.js";

import { formatoFecha } from "../helpers/dateFormat.helper.js"
import { sendMail } from "../helpers/email.helper.js";

export async function crearReclamo(req, res) {
    try {
        const { descripcion, categoria, anonimo } = req.body;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);

        const nuevoReclamo = reclamoRepository.create({
            descripcion,
            categoria,
            anonimo: !!anonimo,
            estado: "pendiente",
            user: { id: req.user.id }
        });

        await reclamoRepository.save(nuevoReclamo);

        // Enviar correo de confirmación al usuario
        if (req.user && req.user.email) {
            const asunto = "Reclamo recibido";
            const texto = `Hola ${req.user.nombreCompleto},
            Tu reclamo ha sido recibido y está pendiente de revisión.
            \nDescripción: ${descripcion}
            \nCategoría: ${categoria}
            \nGracias por comunicarte.`;
            await sendMail(req.user.email, asunto, texto);
        }


        handleSuccess(res, 201, "Reclamo creado exitosamente", nuevoReclamo);
    } 
    catch (error) {
        handleErrorServer(res, 500, error.message);
    }   
}

export async function getAllReclamos(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const order = req.query.order === "asc" ? "ASC" : "DESC";
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const esAdmin = req.user.rol === "administrador";
        const [reclamos, total] = await reclamoRepository.findAndCount({
            relations: ["user"],
            skip,
            take: limit,
            order: { fecha: order }
        });
        const reclamosFiltrados = reclamos.map(r => {
            const reclamoFormateado = {
                ...r,
                fecha: formatoFecha(r.fecha),
                user: r.user ? {
                    nombreCompleto: r.user.nombreCompleto,
                    email: r.user.email,
                    rut: r.user.rut
                } : null
            };
            if (r.anonimo && !esAdmin) {
                return { ...reclamoFormateado, user: null };
            }
            return reclamoFormateado;
        });
        return handleSuccess(res, 200, "Reclamos encontrados", {
            reclamos: reclamosFiltrados,
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
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) }, relations: ["user"] });

        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }

        // Formatear la fecha igual que en getAllReclamos
        const fechaObj = new Date(reclamo.fecha);
        const fechaFormateada = fechaObj.toLocaleDateString("es-CL") + ", " + fechaObj.toLocaleTimeString("es-CL");

        // Formatear el usuario igual que en la lista
        const user = reclamo.user
            ? {
                nombreCompleto: reclamo.user.nombreCompleto,
                email: reclamo.user.email,
                rut: reclamo.user.rut
            }
            : null;

            fecha: fechaFormateada,
            descripcion: reclamo.descripcion,
            categoria: reclamo.categoria,
            anonimo: reclamo.anonimo,
            estado: reclamo.estado,
            comentarioInterno: reclamo.comentarioInterno,
            resolucion: reclamo.resolucion,
            usuarioId: reclamo.usuarioId,
            user
        };

        return handleSuccess(res, 200, "Reclamo encontrado", reclamoFormateado);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateEstadoReclamo(req, res) {
    try {
        const { id } = req.params;
        const { estado, comentarioInterno } = req.body;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        // Buscar con la relación usuario para obtener el email
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) }, relations: ["user"] });
        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }
        
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

        // Enviar notificación por correo
        if (reclamo.user && reclamo.user.email) {
            const asunto = `Actualización de estado de tu reclamo sobre ${reclamo.categoria} (ID: ${reclamo.id})`;
            const texto = `Hola ${reclamo.user.nombreCompleto},
            \n\nEl estado de tu reclamo ha sido actualizado a: ${estado}.\n` 
            +(comentarioInterno ? `Comentario: ${comentarioInterno}\n` : "") 
            + (estado === "resuelto" ? `Resolución: ${comentarioInterno}\n` : "") 
            + "\nSi tienes dudas, contacta a la administración.";
            await sendMail(reclamo.user.email, asunto, texto);
        }
        return handleSuccess(res, 200, "Estado del reclamo actualizado", reclamo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getMisReclamos(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const [reclamos, total] = await reclamoRepository.findAndCount({
            where: { user: { id: req.user.id } },
            relations: ["user"],
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
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const reclamo = await reclamoRepository.findOne({ where: { id: Number(id) }, relations: ["user"] });
        if (!reclamo) {
            return handleErrorClient(res, 404, "Reclamo no encontrado");
        }
        if (reclamo.estado !== "pendiente") {
            return handleErrorClient(res, 400, "Solo se pueden cancelar reclamos pendientes");
        }
        if (reclamo.user?.id !== req.user.id) {
            return handleErrorClient(res, 403, "No puedes cancelar un reclamo que no es tuyo");
        }
        reclamo.estado = "cancelado";
        reclamo.comentarioInterno = req.body.motivo;
        await reclamoRepository.save(reclamo);

        // Enviar notificación por correo
        if (reclamo.user && reclamo.user.email) {
            const asunto = "Tu reclamo ha sido cancelado";
            const texto = `Hola ${reclamo.user.nombreCompleto},
            \n\nTu reclamo acerca de ${reclamo.categoria} ha sido cancelado.
            \nTu motivo: ${req.body.motivo}\n\n
            Si tienes dudas, contacta a la administración.`;
            // Cambia a la función correcta según tu helper
            await sendMail(reclamo.user.email, asunto, texto);
        }
        return handleSuccess(res, 200, "Reclamo cancelado exitosamente", reclamo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReclamosPendientes(req, res) {
    try {
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
            relations: ["user"],
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reclamoRepository = AppDataSource.getRepository(Reclamo);
        const [reclamos, total] = await reclamoRepository.findAndCount({
            relations: ["user"],
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