"use strict";
import { sancionarUsuarioServicio } from "../services/sancion.service.js";
import { suspenderSancionServicio } from "../services/sancion.service.js";
import { obtenerSancionesServicio } from "../services/sancion.service.js";

export async function sancionarUsuario(req, res) {
    try {
        const { id } = req.params;
        const { fecha_inicio, fecha_fin, motivo } = req.body;
        const [sancion, err] = await sancionarUsuarioServicio(id, fecha_inicio, fecha_fin, motivo, true);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({ message: "Usuario sancionado correctamente", sancion });
    } catch (error) {
        console.error("Error al sancionar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

export async function suspenderSancion(req, res) {
    try {
        const { id } = req.params;
        const [sancion, err] = await suspenderSancionServicio(id);
        if (err) return res.status(400).json({ error: err });
        res.status(200).json({ message: "Sanción suspendida correctamente", sancion });
    } catch (error) {
        console.error("Error al suspender sanción:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

export async function obtenerSanciones(req, res) {
    try {
        const [sanciones, err] = await obtenerSancionesServicio();
        if (err) return res.status(404).json({ error: err });
        res.status(200).json({ sanciones });
    } catch (error) {
        console.error("Error al obtener sanciones:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}