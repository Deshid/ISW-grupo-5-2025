import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js"; 
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { crearReclamo } from "../controllers/reclamos.controller.js";

const router = Router();

router.post(
    "/",
    authenticateJwt,
    authorizeRoles("usuario"),
    crearReclamo
);

export default router;