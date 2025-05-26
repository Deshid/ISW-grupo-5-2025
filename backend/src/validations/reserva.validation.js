"use strict";
    import Joi from "joi";

    export const reservaValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
        "number.base": "El id debe ser un número.",
        "number.integer": "El id debe ser un número entero.",
        "number.positive": "El id debe ser un número positivo.",
        "any.required": "El id es obligatorio."
    }),
    id_espacio: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El id debe ser un número.",
            "number.integer": "El id debe ser un número entero.",
            "number.positive": "El id debe ser un número positivo.",
            "any.required": "El id_espacio es obligatorio."
        }),
    fecha: Joi.string()
        .isoDate()
        .required()
        .messages({
        "string.pattern.base": "La fecha debe ser válida (YYYY-MM-DD).",
        "any.required": "La fecha es obligatoria.",
    }),
    horaInicio: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
        "string.pattern.base": "La hora de inicio debe tener formato HH:mm.",
        "any.required": "La hora de inicio es obligatoria.",
    }),
    horaFin: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
        "string.pattern.base": "La hora de término debe tener formato HH:mm.",
        "any.required": "La hora de término es obligatoria.",
    }),
    })