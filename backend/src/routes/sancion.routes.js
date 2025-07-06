import { Router } from "express";
import { sancionarUsuario } from "../controllers/sancion.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { suspenderSancion } from "../controllers/sancion.controller.js";
import { obtenerSanciones } from "../controllers/sancion.controller.js";

const router = Router();

router.patch("/:id/sancionar", authenticateJwt, isAdmin, sancionarUsuario);
router.patch("/:id/suspender", authenticateJwt, isAdmin, suspenderSancion);
router.get("/", authenticateJwt, isAdmin, obtenerSanciones);
export default router;