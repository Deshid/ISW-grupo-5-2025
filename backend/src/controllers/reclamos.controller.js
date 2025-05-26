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