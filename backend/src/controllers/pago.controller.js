"use strict";

import{
    createPagoService,
    deletePagoService,
    getPagoService,
    getPagosService,
} from "../services/pago.service.js";

import{
    pagoBodyValidation,
    pagoQueryValidation,
}from "../validations/pago.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
}from "../handlers/responseHandlers.js";

export async function createPago(req,res){
    try {
        const{ body } = req;
        const { error } = pagoBodyValidation.validate(body);
        if (error){
            return handleErrorClient(res, 400, "error validación pago",error.message);

        }

        if(req.user.rol !=="tesorero"){
            return handleErrorClient(res, 403, "solo el tesorero puede registrar un pago");

        }

        const [pago, pagoError] = await createPagoService(body);
        if(pagoError){
            return handleErrorClient(res, 400, "no se pudo registrar el pago", pagoError);
        }

        return handleSuccess(res, 201, "pago registrado", pago);


    } catch (error) {
        return handleErrorServer(res, 500, error.message);
        
    }
}

export async function getPagos(req, res){
    try {
        const [pagos, errorPagos] = await getPagosService();

        if(errorPagos) return handleErrorClient(res,404, errorPagos);

        pagos.length === 0
        ? handleSuccess(res, 204)
        : handleSuccess(res, 200, "pagos encontrados", pagos);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
        
    }
}

export async function getPago(req, res){
    try {
        const { idPago } = req.query;
        const { error } = pagoQueryValidation.validate({ idPago });
        if(error){
            return handleErrorClient(res, 400, "Error la consulta", error.message);

        }

        const [pago, errorPago] = await getPagoService ({ idPago });
        if (errorPago) return handleErrorClient(res,404, errorPago);

        return handleSuccess(res, 200, "Pago encontrado", pago);

    } catch (error) {
        return handleErrorServer(res, 500, error.message);
        
    }

}

export async function deletePago(req, res){
    try {
        const { idPago } = req.query;

        const { error } = pagoQueryValidation.validate({ idPago });
        if(error){
            return handleErrorClient(res, 400, "datos invalidos",error.message);

        }

        const [deletedPago, errorDeleted] = await deletePagoService({ idPago });
        if (errorDeleted) return handleErrorClient(res, 404, errorDeleted);

        return handleSuccess(res, 200, "Pago eliminado", deletedPago);
    

    } catch (error) {
        return handleErrorServer(res,500, error.message);
    }
}