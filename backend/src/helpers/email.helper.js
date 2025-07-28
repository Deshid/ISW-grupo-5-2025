import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



export async function sendMail(to, subject, text, html) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        ...(html && { html })
    };
    try {
        await transporter.sendMail(mailOptions);
        return { ok: true, message: "Correo enviado correctamente" };
    } catch (error) {
        return { ok: false, message: "Error al enviar correo", error };
    }
}