import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js"; 
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { crearReclamo, getAllReclamos, getReclamo, updateEstadoReclamo } from "../controllers/reclamos.controller.js";

const router = Router();

router.post("/", authenticateJwt, authorizeRoles("usuario"), crearReclamo);

router.get("/", authenticateJwt, authorizeRoles("administrador", "presidente", "secretario", "tesorero"), getAllReclamos
);

router.get("/:id", authenticateJwt, authorizeRoles("administrador", "presidente", "secretario", "tesorero"), getReclamo
);

router.patch("/:id", authenticateJwt, authorizeRoles("administrador", "presidente"), updateEstadoReclamo);

export default router;