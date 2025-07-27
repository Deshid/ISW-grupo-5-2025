import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js"; 
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { 
    validateAllreclamos,
    validateBody
} from "../middlewares/reclamos.middleware.js";
import { 
    cancelarReclamoValidation,
    crearReclamoValidation,
    getAllReclamosValidation,
    getMisReclamosValidation,
    getReclamosConIdentidadValidation,
    getReclamosPendientesValidation,
    updateEstadoReclamoValidation
} from "../validations/reclamos.validation.js";
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
    validateBody(crearReclamoValidation),
    crearReclamo);

router.get("/", 
    authenticateJwt, 
    authorizeRoles("administrador", "presidente"),
    validateAllreclamos(getAllReclamosValidation),
    getAllReclamos
);

router.get("/mis-reclamos", 
    authenticateJwt, 
    authorizeRoles("usuario"), 
    validateAllreclamos(getMisReclamosValidation),
    getMisReclamos
);

router.patch("/:id", 
    authenticateJwt, 
    authorizeRoles("administrador", 
                    "presidente"),
    validateBody(updateEstadoReclamoValidation), 
    updateEstadoReclamo
);

router.patch("/:id/cancelar", 
    authenticateJwt, 
    authorizeRoles("usuario"), 
    validateBody(cancelarReclamoValidation),
    cancelarReclamo
);

router.get("/pendientes", 
    authenticateJwt, 
    authorizeRoles("secretario", "tesorero"),
    validateAllreclamos(getReclamosPendientesValidation),
    getReclamosPendientes
);

router.get("/identidades",
    authenticateJwt,
    authorizeRoles("administrador"),
    validateAllreclamos(getReclamosConIdentidadValidation),
    getReclamosConIdentidad
);

router.get("/:id",
    authenticateJwt,
    authorizeRoles("administrador", "presidente"),
    validateBody(getAllReclamosValidation),
    getReclamo
);

export default router;