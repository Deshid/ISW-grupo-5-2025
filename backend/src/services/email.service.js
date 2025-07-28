import nodemailer from "nodemailer";
import { emailConfig } from ".././config/configEnv.js";

//objetos de adjuntos
export const sendEmail = async (to, subject, text, html, attachments = []) => {
    try {
        const transporter = nodemailer.createTransport({
            service: emailConfig.service,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass,
            },
        });

        const mailOptions = {
            from: `Tesorería Condominios" <${emailConfig.user}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
            attachments: attachments,
        };

        const info = await transporter.sendMail(mailOptions);

        return info;

    } catch (error) {
        console.error("Error enviando el correo: %s", error.message);
        throw new Error("Error enviando el correo: " + error.message);
    }
};