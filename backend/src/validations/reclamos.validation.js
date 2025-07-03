import Joi from "joi";

export const reclamoBodyValidation = Joi.object({
    descripcion: Joi.string().min(10).max(500).required(),
    categoria: Joi.string().valid("servicio", "edificio", "residente").required(),
    anonimo: Joi.boolean().optional(),
});