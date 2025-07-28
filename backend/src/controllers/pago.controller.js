"use strict";

import {
    createPagoService,
    deletePagoService,
    getPagoService,
    getPagosService,
} from "../services/pago.service.js";

import {
    pagoBodyValidation,
    pagoParamsValidation,
    pagoQueryValidation, 
} from "../validations/pago.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

import { generarComprobantePago } from "../services/pdf.services.js";
import { sendEmail } from "../services/email.service.js"; 

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
                "Solo el tesorero puede registrar un pago",
            );
        }

        const [resultado, pagoError] = await createPagoService(body);
        if (pagoError) {
            return handleErrorClient(
                res,
                400,
                "No se pudo registrar el pago",
                pagoError,
            );
        }

        const pago = resultado.pago;

        const pagoLimpio = {
            idPago: pago.idPago,
            monto: pago.monto,
            mes: pago.mes,
            fechaPago: pago.fechaPago,
            metodo: pago.metodo,
            user: {
                id: pago.user.id,
                nombreCompleto: pago.user.nombreCompleto,
                rut: pago.user.rut,
                departamento: pago.user.departamento,
                rol: pago.user.rol,
                email: pago.user.email || "N/A", 
            },
        };

        let emailInfo = null;
        try {
   
            if (!pago.user || !pago.user.email) {
                console.warn(`Advertencia: No se pudo enviar el 
                    comprobante por correo. 
                    El usuario ${pago.user?.nombreCompleto || "sin nombre"} (ID: ${pago.user?.id || "N/A"}) 
                    no tiene una dirección de correo electrónico asociada.`);
            } else {
                const pdfBuffer = await generarComprobantePago(pago); // Genera el PDF como Buffer

                const attachments = [
                    {
                        filename: `comprobante_pago_${pago.idPago}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf",
                    },
                ];

                const emailSubject = `Comprobante de Pago de Gastos Comunes - ${pago.mes}`;
                const emailText = `Estimado(a) ${pago.user.nombreCompleto},\n\nAdjunto encontrará el 
                comprobante de su pago de gastos comunes 
                correspondiente al mes de ${pago.mes}.\n\nSaludos cordiales,\nTesorería Condominios`;
                const emailHtml = `
                    <p>Estimado(a) ${pago.user.nombreCompleto},</p>
                    <p>Adjunto encontrará el comprobante de su 
                    pago de gastos comunes correspondiente al mes de <strong>${pago.mes}</strong>.</p>
                    <p>Monto: <strong>$${pago.monto}</strong></p>
                    <p>Gracias por su pago.</p>
                    <p>Saludos cordiales,<br>Tesorería Condominios</p>
                `;

                emailInfo = await sendEmail(
                    pago.user.email,
                    emailSubject,
                    emailText,
                    emailHtml,
                    attachments
                );
                console.log(`Comprobante enviado por correo a ${pago.user.email}. Info:`, emailInfo);
            }
        } catch (emailError) {
            console.error("Error al enviar el comprobante por correo:", emailError);
 
        }



        return handleSuccess(
            res,
            201,
            "Pago registrado con éxito y comprobante enviado por correo (si el email estaba disponible).",
            {
                pago: pagoLimpio,
                comprobanteUrl: `/api/pago/comprobante?idPago=${pago.idPago}`,
                emailInfo: emailInfo ? "Comprobante enviado" : "No se pudo enviar ",
            },
        );

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
        const { idPago } = req.params;
        const { error } = pagoParamsValidation.validate({ idPago });


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