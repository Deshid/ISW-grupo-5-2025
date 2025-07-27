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

    monto: Joi.number()
        .precision(2)
        .positive()
        .required()
        .messages({
            "number.base": "El monto debe ser un número.",
            "number.precision": "El monto no debe tener más de 2 decimales.",
            "number.positive": "El monto debe ser un número positivo.",
            "any.required": "El monto es obligatorio.",
        }),
    mes: Joi.string()
        .valid("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")
        .required()
        .messages({
            "string.empty": "El mes no puede estar vacío.",
            "any.required": "El mes es obligatorio.",
            "any.only": "El mes proporcionado no es válido. Debe ser uno de los meses del año.",
        }),
    fechaPago: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "La fecha de pago debe ser una fecha válida.",
            "date.iso": "La fecha de pago debe estar en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ).",
        }),
    metodo: Joi.string()
        .valid("Efectivo", "Transferencia", "Tarjeta de Crédito",
            "Débito Automático", "Cheque")
        .required()
        .messages({
            "string.empty": "El método de pago no puede estar vacío.",
            "any.required": "El método de pago es obligatorio.",
            "any.only": "El método de pago debe ser 'Efectivo', 'Transferencia', etc.",
        }),
})

    .xor("rut", "departamento")
    .messages({
        "object.xor": "Debe proporcionar exclusivamente el RUT o el Departamento",
        "object.missing": "Debe proporcionar el RUT o el Departamento del residente.",
    })

    .keys({
        rut: rutValidator,
        departamento: Joi.string()
            .min(2)
            .max(10)
            .messages({
                "string.empty": "El número de departamento no puede estar vacío.",
                "string.base": "El número de departamento debe ser de tipo string.",
                "string.min": "El número de departamento debe tener al menos 2 caracteres.",
                "string.max": "El número de departamento debe tener como máximo 10 caracteres.",
            }),
    })
    .unknown(false)
    .messages({
        "object.unknown": "No se permiten propiedades adicionales.",

    });


export const pagoParamsValidation = Joi.object({
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
});

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
});