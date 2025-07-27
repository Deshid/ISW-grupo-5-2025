import Joi from "joi";

const categoriasValidas = ["servicio", "edificio", "residente"];

export const cancelarReclamoValidation = Joi.object({
    motivo: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .required()
        .custom((value, helpers) => {
            if (!value || value.trim().length === 0) {
                return helpers.error("any.empty");
            }
            return value;
        })
        .messages({
            "string.base": "El motivo debe ser un texto.",
            "string.empty": "El motivo no puede estar vacío.",
            "string.min": "El motivo debe tener al menos 10 caracteres.",
            "string.max": "El motivo no puede superar los 500 caracteres.",
            "any.required": "El motivo es obligatorio."
        })
});

export const crearReclamoValidation = Joi.object({
    descripcion: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .required()
        .custom((value, helpers) => {
            if (!value || value.trim().length === 0) {
                return helpers.error("any.empty");
            }
            return value;
        })
        .messages({
            "string.base": "La descripción debe ser un texto.",
            "string.empty": "La descripción no puede estar vacía.",
            "string.min": "La descripción debe tener al menos 10 caracteres.",
            "string.max": "La descripción no puede superar los 500 caracteres.",
            "any.required": "La descripción es obligatoria."
        }),
    categoria: Joi.string()
        .trim()
        .lowercase()
        .valid(...categoriasValidas)
        .required()
        .messages({
            "any.only": `La categoría debe ser una de: ${categoriasValidas.join(", ")}`,
            "string.base": "La categoría debe ser un texto.",
            "string.empty": "La categoría es obligatoria.",
            "any.required": "La categoría es obligatoria."
        }),
    anonimo: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "El campo 'anonimo' debe ser verdadero o falso."
        })
});


export const getAllReclamosValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            "number.base": "El número de página debe ser un número.",
            "number.integer": "El número de página debe ser un entero.",
            "number.min": "El número de página debe ser al menos 1."
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "number.base": "El límite debe ser un número.",
            "number.integer": "El límite debe ser un entero.",
            "number.min": "El límite debe ser al menos 1.",
            "number.max": "El límite no puede ser mayor a 100."
        }),
    order: Joi.string()
        .valid("asc", "desc")
        .optional()
        .default("desc")
        .messages({
            "any.only": "El orden debe ser 'asc' o 'desc'.",
            "string.base": "El orden debe ser un texto.",
            "string.empty": "El orden no puede estar vacío.",
            "any.required": "El orden es obligatorio."
        })
});

export const getMisReclamosValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional() 
        .messages({
            "number.base": "El número de página debe ser un número.",
            "number.integer": "El número de página debe ser un entero.",
            "number.min": "El número de página debe ser al menos 1."
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "number.base": "El límite debe ser un número.",
            "number.integer": "El límite debe ser un entero.",
            "number.min": "El límite debe ser al menos 1.",
            "number.max": "El límite no puede ser mayor a 100."
        })
});


export const getReclamosConIdentidadValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            "number.base": "El número de página debe ser un número.",
            "number.integer": "El número de página debe ser un entero.",
            "number.min": "El número de página debe ser al menos 1."
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "number.base": "El límite debe ser un número.",
            "number.integer": "El límite debe ser un entero.",
            "number.min": "El límite debe ser al menos 1.",
            "number.max": "El límite no puede ser mayor a 100."
        })
});

export const getReclamosPendientesValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            "number.base": "El número de página debe ser un número.",
            "number.integer": "El número de página debe ser un entero.",
            "number.min": "El número de página debe ser al menos 1."
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "number.base": "El límite debe ser un número.",
            "number.integer": "El límite debe ser un entero.",
            "number.min": "El límite debe ser al menos 1.",
            "number.max": "El límite no puede ser mayor a 100."
        }),
    order: Joi.string()
        .valid("asc", "desc")
        .optional()
        .default("desc")
        .messages({
            "any.only": "El orden debe ser 'asc' o 'desc'.",
            "string.base": "El orden debe ser un texto.",
            "string.empty": "El orden no puede estar vacío.",
            "any.required": "El orden es obligatorio."
        })
});

export const updateEstadoReclamoValidation = Joi.object({
    estado: Joi.string()
        .trim()
        .lowercase()
        .valid("cancelado", "pendiente", "en_proceso", "resuelto")
        .required()
        .messages({
            "any.only": "El estado debe ser uno de: pendiente, en_proceso, resuelto, cancelado.",
            "string.base": "El estado debe ser un texto.",
            "string.empty": "El estado es obligatorio.",
            "any.required": "El estado es obligatorio."
        }),
        comentarioInterno: Joi.string()
        .trim()
        .min(3)
        .max(500)
        .optional()
        .messages({
            "string.base": "El comentario debe ser un texto.",
            "string.min": "El comentario debe tener al menos 3 caracteres.",
            "string.max": "El comentario no puede superar los 500 caracteres."
        })
});