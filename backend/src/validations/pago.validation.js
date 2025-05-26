"use strict";
import Joi from "joi";

const rutValidator = Joi.string()
    .min(9)
    .max(12)
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .messages({
        "string.empty": "El RUT no puede estar vacío.",
        "string.base": "El RUT debe ser de tipo string.",
        "string.min": "El RUT debe tener como mínimo 9 caracteres.",
        "string.max": "El RUT debe tener como máximo 12 caracteres.",
        "string.pattern.base": "Formato de RUT inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    });

export const pagoBodyValidation = Joi.object({
    // Campos que el tesorero ingresa para identificar al residente.
    // Las validaciones de longitud y patrón se toman de user.validation.js
    nombreCompleto: Joi.string()
        .min(15) // Misma longitud mínima que en userBodyValidation
        .max(50) // Misma longitud máxima que en userBodyValidation
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
            "string.empty": "El nombre completo del residente no puede estar vacío.",
            "string.base": "El nombre completo del residente debe ser de tipo string.",
            "string.min": "El nombre completo del residente debe tener al menos 15 caracteres.",
            "string.max": "El nombre completo del residente debe tener como máximo 50 caracteres.",
            "string.pattern.base": "El nombre completo del residente solo puede contener letras y espacios.",
            "any.required": "El nombre completo del residente es obligatorio.",
        }),
    rut: rutValidator.required().messages({
        "any.required": "El RUT del residente es obligatorio.",
    }),
    departamento: Joi.string()
        .min(2) // Ajusta esta longitud según el formato de tus departamentos (ej. "A1", "101", "Torre A-Piso 5")
        .max(10)
        .required()
        .messages({
            "string.empty": "El número de departamento no puede estar vacío.",
            "string.base": "El número de departamento debe ser de tipo string.",
            "string.min": "El número de departamento debe tener al menos 2 caracteres.",
            "string.max": "El número de departamento debe tener como máximo 10 caracteres.",
            "any.required": "El número de departamento es obligatorio.",
        }),

    // Campos propios del pago
    monto: Joi.number()
        .integer() // Si el monto siempre es un entero
        .positive()
        .required()
        .messages({
            "number.base": "El monto debe ser un número.",
            "number.integer": "El monto debe ser un número entero.",
            "number.positive": "El monto debe ser un número positivo.",
            "any.required": "El monto es obligatorio.",
        }),
    mes: Joi.string()
        .valid("Enero", "Febrero", "Marzo", "Abril", "Mayo")
        .valid("Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")
        .required()
        .messages({
            "string.empty": "El mes no puede estar vacío.",
            "any.required": "El mes es obligatorio.",
            "any.only": "El mes proporcionado no es válido. Debe ser uno de los meses del año.",
        }),
    fechaPago: Joi.date()
        .iso() // Espera formato ISO 8601 (ej. "2025-05-25")
        .default(() => new Date()) // Si no se proporciona, usa la fecha y hora actual
        .messages({
            "date.base": "La fecha de pago debe ser una fecha válida.",
            "date.iso": "La fecha de pago debe estar en formato ISO (YYYY-MM-DD).",
        }),
    metodo: Joi.string()
        .valid("Efectivo", "Transferencia")
        .required()
        .messages({
            "string.empty": "El método de pago no puede estar vacío.",
            "any.required": "El método de pago es obligatorio.",
            "any.only": "El método de pago debe ser 'Efectivo' o 'Transferencia'.",
        }),
})
    .unknown(false) // No se permiten propiedades adicionales en el cuerpo de la solicitud de creación de pago.
    .messages({
        "object.unknown": "No se permiten propiedades adicionales.",
        "object.missing": "Faltan campos obligatorios para registrar el pago.",
    });

// Validación para parámetros de consulta (GET /pagos/:idPago o DELETE /pagos/:idPago)
export const pagoQueryValidation = Joi.object({
    idPago: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del pago debe ser un número.",
            "number.integer": "El ID del pago debe ser un número entero.",
            "number.positive": "El ID del pago debe ser un número positivo.",
            "any.required": "El ID del pago es obligatorio.",
        }),
})
    .unknown(false) // No se permiten propiedades adicionales en la consulta.
    .messages({
        "object.unknown": "No se permiten propiedades adicionales.",
        "object.missing": "Debes proporcionar el ID del pago.",
    });