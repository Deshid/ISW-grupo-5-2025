"use strict";
import Joi from "joi";

export const sancionValidation = Joi.object({
    usuarioId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El id debe ser un número.",
            "number.integer": "El id debe ser un número entero.",
            "number.positive": "El id debe ser un número positivo.",
            "any.required": "El id es obligatorio."
        }),
    fecha_inicio: Joi.string()
        .isoDate()
        .required()
        .messages({
            "string.pattern.base": "La fecha debe ser válida (YYYY-MM-DD).",
            "any.required": "La fecha es obligatoria.",
        }),
    fecha_fin: Joi.string()
        .isoDate()
        .required()
        .messages({
            "string.pattern.base": "La fecha debe ser válida (YYYY-MM-DD).",
            "any.required": "La fecha es obligatoria.",
        }),
    motivo: Joi.string()
        .max(255)
        .required()
        .messages({
            "string.max": "El motivo no puede exceder los 255 caracteres.",
            "any.required": "El motivo es obligatorio."
        }),
})