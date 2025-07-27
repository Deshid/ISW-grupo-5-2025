"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { crearReserva, getReservas } from "../controllers/reserva.controller.js";
import { actualizarEstadoReserva } from "../controllers/reserva.controller.js";
import { cancelarReserva } from "../controllers/reserva.controller.js";
import { solicitarCancelacionReserva } from "../controllers/reserva.controller.js";
import { getMisReservas } from "../controllers/reserva.controller.js";
import { getReservasPendientesAdmin } from "../controllers/reserva.controller.js";
import { getReservasAprobadas } from "../controllers/reserva.controller.js";
import { getReservasRechazadas } from "../controllers/reserva.controller.js";
import { actualizarReserva } from "../controllers/reserva.controller.js";
import { getReservasCanceladas } from "../controllers/reserva.controller.js";
const router = Router();

router.post("/", authenticateJwt, crearReserva);
router.get("/", authenticateJwt, getReservas);
router.patch("/:id/estado", authenticateJwt, isAdmin, actualizarEstadoReserva);
router.get("/mis-reservas", authenticateJwt, getMisReservas);
router.patch("/:id", authenticateJwt, actualizarReserva);
router.patch("/:id/solicitar-cancelacion", authenticateJwt, solicitarCancelacionReserva);
router.patch("/:id/cancelar", authenticateJwt, isAdmin, cancelarReserva);
router.get("/admin/pendientes", authenticateJwt, isAdmin, getReservasPendientesAdmin);
router.get("/admin/aprobadas", authenticateJwt, isAdmin, getReservasAprobadas);
router.get("/admin/rechazadas", authenticateJwt, isAdmin, getReservasRechazadas);
router.get("/admin/canceladas", authenticateJwt, isAdmin, getReservasCanceladas);

export default router;