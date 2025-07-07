"use strict";
import passport from "passport";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export function authenticateJwt(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return handleErrorServer(
        res,
        500,
        "Error de autenticación en el servidor"
      );
    }

    if (!user) {
      return handleErrorClient(
        res,
        401,
        "No tienes permiso para acceder a este recurso",
        { info: info ? info.message : "No se encontró el usuario" }
      )
    }

    req.user = user;
    next();
  })(req, res, next);
}

export function isTesorero(req, res, next) {
  if (req.user && req.user.rol === "tesorero") {
    return next();
  }

  return res.status(403).json({
    message: "Acceso denegado, solo el tesorero puede registrar pagos",

  });

}

