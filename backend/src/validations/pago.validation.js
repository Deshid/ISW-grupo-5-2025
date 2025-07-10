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
    // --- Identificación del Residente (Requiere RUT O Departamento) ---
    // Usamos Joi.alternatives() para asegurar que al menos uno de los dos campos esté presente.
    // Los campos 'nombreCompleto', 'rut', 'departamento' ya NO son 'required()' aquí.
    // Se convierten en 'opcionales' en el objeto principal, pero la alternativa los hace obligatorios de forma condicional.

    // Campos del pago
    monto: Joi.number()
        .precision(2) // Permite hasta 2 decimales para el monto (ej. 120.50)
        .positive()
        .required()
        .messages({
            "number.base": "El monto debe ser un número.",
            "number.precision": "El monto no debe tener más de 2 decimales.", // Mensaje para precisión
            "number.positive": "El monto debe ser un número positivo.",
            "any.required": "El monto es obligatorio.",
        }),
    mes: Joi.string()
        .valid("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre") // Unificamos los .valid
        .required()
        .messages({
            "string.empty": "El mes no puede estar vacío.",
            "any.required": "El mes es obligatorio.",
            "any.only": "El mes proporcionado no es válido. Debe ser uno de los meses del año.",
        }),
    fechaPago: Joi.date()
        .iso() // Espera formato ISO 8601 (ej. "2025-05-25" o "2025-05-25T10:30:00Z")
        .default(() => new Date()) // Si no se proporciona, usa la fecha y hora actual
        .messages({
            "date.base": "La fecha de pago debe ser una fecha válida.",
            "date.iso": "La fecha de pago debe estar en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ).",
        }),
    metodo: Joi.string()
        .valid("Efectivo", "Transferencia", "Tarjeta de Crédito", 
            "Débito Automático", "Cheque") // Añade más métodos si es necesario
        .required()
        .messages({
            "string.empty": "El método de pago no puede estar vacío.",
            "any.required": "El método de pago es obligatorio.",
            "any.only": "El método de pago debe ser 'Efectivo', 'Transferencia', etc.",
        }),
})
    // Aquí definimos la lógica condicional para RUT o Departamento
    .xor("rut", "departamento") // Requiere EXCLUSIVAMENTE uno de 'rut' o 'departamento'
    .messages({
        "object.xor": "Debe proporcionar exclusivamente el RUT o el Departamento",
        "object.missing": "Debe proporcionar el RUT o el Departamento del residente.", // Mensaje más específico
    })
    // Definimos los esquemas para 'rut' y 'departamento' aquí, como opcionales en el objeto principal
    // para que 'xor' pueda operar sobre ellos.
    .keys({
        rut: rutValidator, // Usa el validador de RUT predefinido
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
    .unknown(false) // No se permiten propiedades adicionales en el cuerpo de la solicitud de creación de pago.
    .messages({
        "object.unknown": "No se permiten propiedades adicionales.",
        // El mensaje 'object.missing' para el pago entero ya no es necesario aquí
        // porque 'object.xor' maneja la ausencia de RUT/Departamento.
    });

// ... (pagoQueryValidation se mantiene igual)
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