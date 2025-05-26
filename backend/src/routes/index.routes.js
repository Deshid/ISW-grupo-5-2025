"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";

import reclamoRoutes from "./reclamos.routes.js";
import pagoRoutes from "./pago.routes.js";
const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/reclamos", reclamoRoutes)
    .use("/pagos",pagoRoutes);


export default router;