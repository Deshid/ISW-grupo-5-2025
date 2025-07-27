import { sendEmail } from "../services/email.service.js";

import {
    handleErrorServer,
    handleSucces,
} from "../handlers/responseHandlers.js";


export const sendCustomEmail = async (req, res) => { 
    const { email, subject, message } = req.body;

    try {
        const info = await sendEmail( 
            email,
            subject,
            message,
            `<p>${message}</p>` 
        );

        handleSucces(res, 200, "correo enviado", info);
    } catch (error) {
        handleErrorServer(res, 500, "error durante el envio", error.message);
    }
};
