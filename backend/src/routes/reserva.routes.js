"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { crearReserva, getReservas } from "../controllers/reserva.controller.js"; // O el controlador correcto
import { actualizarEstadoReserva } from "../controllers/reserva.controller.js";
import { cancelarReserva } from "../controllers/reserva.controller.js";
import { solicitarCancelacionReserva } from "../controllers/reserva.controller.js";

const router = Router();

router.post("/", crearReserva);
router.get("/", getReservas);
router.patch("/:id/estado", authenticateJwt, isAdmin, actualizarEstadoReserva);
router.patch("/:id/solicitar-cancelacion", authenticateJwt, solicitarCancelacionReserva);
router.patch("/:id/cancelar", authenticateJwt, isAdmin, cancelarReserva);
export default router;