import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js"; 
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
    cancelarReclamo,
    crearReclamo,
    getAllReclamos,
    getMisReclamos,
    getReclamo,
    getReclamosConIdentidad,
    getReclamosPendientes,
    updateEstadoReclamo
} from "../controllers/reclamos.controller.js";

const router = Router();

router.post("/", 
    authenticateJwt,
    authorizeRoles("usuario"),
    crearReclamo);

router.get("/", 
    authenticateJwt, 
    authorizeRoles("administrador", 
                    "presidente",),
    getAllReclamos
);

router.get("/mis-reclamos", 
    authenticateJwt, 
    authorizeRoles("usuario"), 
    getMisReclamos
);

router.patch("/:id", 
    authenticateJwt, 
    authorizeRoles("administrador", 
                    "presidente"), 
    updateEstadoReclamo
);

router.patch("/:id/cancelar", 
    authenticateJwt, 
    authorizeRoles("usuario"), 
    cancelarReclamo
);

router.get("/pendientes", 
    authenticateJwt, 
    authorizeRoles("secretario",
                    "tesorero"),
    getReclamosPendientes
);

router.get("/identidades",
    authenticateJwt,
    authorizeRoles("administrador"),
    getReclamosConIdentidad
);

export default router;