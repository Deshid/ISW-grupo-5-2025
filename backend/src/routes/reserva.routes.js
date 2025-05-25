"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { crearReserva, getReservas } from "../controllers/reserva.controller.js";
import { actualizarEstadoReserva } from "../controllers/reserva.controller.js";
import { cancelarReserva } from "../controllers/reserva.controller.js";
import { solicitarCancelacionReserva } from "../controllers/reserva.controller.js";
import { getMisReservas } from "../controllers/reserva.controller.js";
import { actualizarReservaUsuario } from "../controllers/reserva.controller.js";
import { eliminarReservaUsuario } from "../controllers/reserva.controller.js";

const router = Router();

router.post("/", crearReserva);
router.get("/", getReservas);
router.patch("/:id/estado", authenticateJwt, isAdmin, actualizarEstadoReserva);
router.get("/mis-reservas", authenticateJwt, getMisReservas);
router.patch("/:id", authenticateJwt, actualizarReservaUsuario);
router.delete("/:id", authenticateJwt, eliminarReservaUsuario);
router.patch("/:id/solicitar-cancelacion", authenticateJwt, solicitarCancelacionReserva);
router.patch("/:id/cancelar", authenticateJwt, isAdmin, cancelarReserva);
export default router;