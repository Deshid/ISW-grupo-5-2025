"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", authenticateJwt, authorizeRoles("administrador", "presidente"), getUsers);

router.get("/detail/", authenticateJwt, authorizeRoles("administrador", 
  "usuario", 
  "presidente",
  "tesorero",
  "secretario")
                , getUser);

router.patch("/detail/", authenticateJwt, authorizeRoles("administrador"), updateUser);

router.delete("/detail/", authenticateJwt, authorizeRoles("administrador", "secretario"), deleteUser);

export default router;