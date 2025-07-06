"use strict";

import { Router } from "express";
import {
    createPago,
    deletePago,
    getPago,
    getPagos,
} from "../controllers/pago.controller.js";

import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isTesorero } from "../middlewares/authorization.middleware.js";


const router = Router();

router.post("/", authenticateJwt, isTesorero, createPago);
router.get("/", authenticateJwt, isTesorero, getPagos);
router.get("/:idPago", authenticateJwt, isTesorero, getPago);
router.delete("/:idPago", authenticateJwt, isTesorero, deletePago);

export default router;