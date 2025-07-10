"use strict";

import {
    createPagoService,
    deletePagoService,
    getPagoService,
    getPagosService,
} from "../services/pago.service.js";

import {
    pagoBodyValidation,
    pagoQueryValidation,
} from "../validations/pago.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export async function createPago(req, res) {
    try {
        const { body } = req;
        const { error } = pagoBodyValidation.validate(body);
        if (error) {
            return handleErrorClient(
                res,
                400,
                "error validación pago",
                error.message,
            );
        }

        if (req.user.rol !== "tesorero") {
            return handleErrorClient(
                res,
                403,
                "solo el tesorero puede registrar un pago",
            );
        }

        const [resultado, pagoError] = await createPagoService(body);
        if (pagoError) {
            return handleErrorClient(
                res,
                400,
                "no se pudo registrar el pago",
                pagoError,
            );
        }

        // Devuelve el PDF directamente
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "inline; filename=comprobante_pago.pdf",
        );
        return res.status(201).send(resultado.pdfBuffer);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}
export async function getPagos(req, res) {
    try {
        const [pagos, errorPagos] = await getPagosService();

        if (errorPagos) return handleErrorClient(res, 404, errorPagos);

        pagos.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "pagos encontrados", pagos);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function getPago(req, res) {
    try {
        const { idPago } = req.query;
        const { error } = pagoQueryValidation.validate({ idPago });
        if (error) {
            return handleErrorClient(res, 400, "Error la consulta", error.message);
        }

        const [pago, errorPago] = await getPagoService({ idPago });
        if (errorPago) return handleErrorClient(res, 404, errorPago);

        return handleSuccess(res, 200, "Pago encontrado", pago);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function deletePago(req, res) {
    try {
        const { idPago } = req.query;

        const { error } = pagoQueryValidation.validate({ idPago });
        if (error) {
            return handleErrorClient(res, 400, "datos invalidos", error.message);
        }

        const [deletedPago, errorDeleted] = await deletePagoService({ idPago });
        if (errorDeleted) return handleErrorClient(res, 404, errorDeleted);

        return handleSuccess(res, 200, "Pago eliminado", deletedPago);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}


//TEMPORAL SOLO PARA PRUEBA

export async function testComprobantePDF(req, res) {
    const pagoFicticio = {
        idPago: 999,
        monto: 45000,
        mes: "Julio",
        fechaPago: new Date(),
        metodo: "Transferencia",
        user: {
            nombreCompleto: "Juan Pérez",
            rut: "12.345.678-9",
            departamento: "Departamento 302",
        },
    };

    try {
        const pdfBuffer = await generarComprobantePago(pagoFicticio);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=comprobante_test.pdf");
        return res.send(pdfBuffer);
    } catch (err) {
        return res.status(500).json({ error: "Error generando comprobante" });
    }
}


export async function descargarComprobante(req, res) {
    try {
        const { idPago } = req.query;

        const [pago, errorPago] = await getPagoService({ idPago });
        if (errorPago) {
            return res.status(404).json({ mensaje: "Pago no encontrado" });
        }

        const pdfBuffer = await generarComprobantePago(pago);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=comprobante_pago_${idPago}.pdf`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error al generar comprobante:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
}