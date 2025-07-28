"use strict";

    import TelegramBot from "node-telegram-bot-api";
    import { telegramConfig } from "../config/telegram.config.js";

   
    const bot = new TelegramBot(telegramConfig.botToken, { polling: true });

    /**
     * Envía un documento PDF a un chat de Telegram.
     * @param {string} chatId 
     * @param {Buffer} pdfBuffer 
     * @param {string} fileName 
     * @param {string} caption 
     */
    export async function sendTelegramComprobante(chatId, pdfBuffer, fileName, caption = "") {
        try {
            if (!chatId) {
                console.warn(`[Telegram Service] No se puede 
                    enviar el comprobante por Telegram: Falta el chat ID del usuario.`);
                return null;
            }

            const sentMessage = await bot.sendDocument(chatId, pdfBuffer, {
                caption: caption,
            }, {
                filename: fileName,
                contentType: "application/pdf",
            });

            console.log(`[Telegram Service] Documento 
                Telegram enviado a chat ID ${chatId}. Message ID: ${sentMessage.message_id}`);
            return sentMessage;
        } catch (error) {
            console.error(`[Telegram Service] Error al enviar documento Telegram a chat ID ${chatId}:`, error);
            throw new Error(`Fallo el envío de documento Telegram: ${error.message}`);
        }
    }

    export { bot };
    