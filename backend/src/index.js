"use strict";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";
import { cookieKey, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js"; 
import { setupTelegramBotListeners } from "./bot/telegramBot.js"; 
import { passportJwtSetup } from "./auth/passport.auth.js";

import { createEspaciosComunes, createUsers } from "./config/initialSetup.js";
import reservaRoutes from "./routes/reserva.routes.js";
import sancionRoutes from "./routes/sancion.routes.js";
import espacioRoutes from "./routes/reserva.routes.js"; 
import pagoRoutes from "./routes/pago.routes.js";

async function setupServer() {
    try {
        const app = express();

        app.disable("x-powered-by");

        app.use(
            cors({
                credentials: true,
                origin: true,
            }),
        );

        app.use(
            urlencoded({
                extended: true,
                limit: "1mb",
            }),
        );

        app.use(
            json({
                limit: "1mb",
            }),
        );

        app.use(cookieParser());

        app.use(morgan("dev"));

        app.use(
            session({
                secret: cookieKey,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: false, // Cambiar a true en producción con HTTPS
                    httpOnly: true,
                    sameSite: "strict",
                },
            }),
        );

        app.use(passport.initialize());
        app.use(passport.session());
        passportJwtSetup();

        // Rutas de tu API
        app.use("/api", indexRoutes);
        app.use("/api/reservas", reservaRoutes);
        app.use("/api/usuarios", sancionRoutes); // Ojo: /api/usuarios para sanciones? Revisa si es correcto.
        app.use("/api/espacios", espacioRoutes); // Ojo: /api/espacios para reservas? Revisa si es correcto.
        app.use("/api/pagos", pagoRoutes);

        // --- INICIO: RUTA PARA DESCARGAR COMPROBANTES PDF (AÑADIDA) ---
        // Esta ruta es crucial para que la URL del PDF sea accesible desde el exterior,
        // si la usas en las notificaciones de email o WhatsApp.
        app.get("/api/pago/comprobante/download", async (req, res) => {
            const { idPago } = req.query;
            if (!idPago) {
                return res.status(400).json({ message: "ID de pago es requerido." });
            }
            try {
                // Importa y usa tu servicio de pago y pdf aquí.
                // Usamos 'import()' dinámicos para evitar posibles problemas de dependencias circulares
                // si estos servicios también importan algo del controlador de pagos o del bot.
                const { getPagoService } = await import("./services/pago.service.js");
                const { generarComprobantePago } = await import("./services/pdf.services.js");

                const [pago, errorPago] = await getPagoService({ idPago: parseFloat(idPago) });
                if (errorPago || !pago) {
                    return res.status(404).json({ message: "Pago no encontrado." });
                }

                const pdfBuffer = await generarComprobantePago(pago);

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=comprobante_pago_${idPago}.pdf`
                );
                res.send(pdfBuffer);
            } catch (error) {
                console.error("Error al servir comprobante PDF:", error);
                res.status(500).json({ message: "Error interno del servidor al generar PDF." });
            }
        });
        // --- FIN: RUTA PARA DESCARGAR COMPROBANTES PDF ---

        // Iniciar el bot de Telegram ANTES de que el servidor escuche,
        // pero después de que la aplicación Express esté configurada.
        setupTelegramBotListeners(); // <-- ¡LLAMADA A LA FUNCIÓN AÑADIDA AQUÍ!
        console.log("Bot de Telegram iniciado y escuchando.");

        app.listen(PORT, () => {
            console.log(`=> Servidor corriendo en ${HOST}:${PORT}/api`);
        });
    } catch (error) {
        console.log("Error en index.js -> setupServer(), el error es: ", error);
    }
}

async function setupAPI() {
    try {
        await connectDB();
        console.log("Conexión a la base de datos establecida."); // Log para confirmar conexión DB
        await setupServer();
        // Estos se ejecutan después de que el servidor está escuchando
        await createUsers();
        await createEspaciosComunes();
    } catch (error) {
        console.log("Error en index.js -> setupAPI(), el error es: ", error);
    }
}

setupAPI()
    .then(() => console.log("=> API Iniciada exitosamente"))
    .catch((error) =>
        console.log("Error en index.js -> setupAPI(), el error es: ", error),
    );
