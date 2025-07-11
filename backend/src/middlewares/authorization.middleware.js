import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

export function authorizeRoles(...rolesPermitidos) {
    return async (req, res, next) => {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const userFound = await userRepository.findOneBy({ email: req.user.email });

            if (!userFound) {
                return handleErrorClient(
                    res,
                    404,
                    "Usuario no encontrado en la base de datos",
                );
            }

            const rolUser = userFound.rol;

            if (!rolesPermitidos.includes(rolUser)) {
                return handleErrorClient(
                    res,
                    403,
                    "Error al acceder al recurso",
                    `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`
                );
            }
            next();
        } catch (error) {
            handleErrorServer(
                res,
                500,
                error.message,
            );
        }
    }
}

export async function isAdmin(req, res, next) {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOneBy({ email: req.user.email });

        if (!userFound) {
            return handleErrorClient(
                res,
                404,
                "Usuario no encontrado en la base de datos",
            );
        }

        const rolUser = userFound.rol;

        if (rolUser !== "administrador") {
            return handleErrorClient(
                res,
                403,
                "Error al acceder al recurso",
                "Se requiere un rol de administrador para realizar esta acción."
            );
        }
        next();
    } catch (error) {
        handleErrorServer(
            res,
            500,
            error.message,
        );
    }

}

export function isTesorero(req, res, next) {
    if (req.user && req.user.rol === "tesorero") {
        return next();
    }

    return res.status(403).json({
        message: "Acceso denegado, solo el tesorero puede registrar pagos",

    });

}