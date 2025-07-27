"use strict";

import fetch from "node-fetch"; 
import { bot, sendTelegramComprobante } from "../services/telegram.service.js";
import { getPagoService } from "../services/pago.service.js"; 
import { generarComprobantePago } from "../services/pdf.services.js"; 
import { telegramConfig } from "../config/telegram.config.js";


const userStates = {}; 
const chatHistories = {}; 

// Configuración de Gemini
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";


//PROMT
const ADMIN_ROLE_PROMPT = {
    role: "user",
    parts: [{
        text: "Eres un asistente de inteligencia artificial para la administración de un condominio. Tu función es responder a la solicitud de enviar el comprobante de pago de gastos comunes.El usuario puede escribir necesito mi comprobante, necesito mi comprobante de pago, necesito mi boleta y todo eso lo tienes que realacionar al pago de los gatos comunes. Mantén un tono formal, útil y siempre enfocado en la información del condominio. Si un residente necesita un comprobante de pago, debes indicarle que el bot tiene una función específica para ello y que debe seguir las instrucciones para obtenerlo, solicitando el ID de pago. No tienes acceso directo a bases de datos personales o de pagos, pero el bot puede ayudarte a obtener comprobantes si proporcionas el ID. Si te preguntan algo fuera de tu ámbito (ej. chistes, recetas), redirige amablemente al usuario a temas del condominio o a preguntar sobre comprobantes de pago."
    }]
};
const ADMIN_ROLE_INITIAL_RESPONSE = {
    role: "model",
    parts: [{ text: "Hola, soy tu asistente de administración del condominio. ¿En qué puedo ayudarte hoy?" }]
};

const mensajeBienvenida = "¡Hola! Soy tu asistente del condominio. Puedes decirme: \"necesito mi comprobante de pago\" o simplemente chatear conmigo.";


/**
 * @param {string} userMessage
 * @param {Array<{ role: string, parts: Array<{ text: string }> }>} history
 * @returns {Promise<string>}
 */
async function getGeminiResponse(userMessage, history) {
    const apiKey = telegramConfig.geminiApiKey;
    if (!apiKey) {
        console.error("GEMINI_API_KEY no está configurada.");
        return "Lo siento, no puedo responder en este momento. La configuración de la IA no está completa.";
    }

    const chatHistoryForGemini = history && history.length > 0
        ? [...history]
        : [ADMIN_ROLE_PROMPT, ADMIN_ROLE_INITIAL_RESPONSE];

    chatHistoryForGemini.push({ role: "user", parts: [{ text: userMessage }] });

    const payload = {
        contents: chatHistoryForGemini,
        generationConfig: { temperature: 0.7 },
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error de la API de Gemini:", response.status, errorData);
            return "Lo siento, tuve un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
        }

        const result = await response.json();
        const respuesta = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        return respuesta || "No pude obtener una respuesta clara de la IA. ¿Puedes reformular tu pregunta?";
    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        return "Hubo un problema de conexión con la IA. Por favor, inténtalo de nuevo.";
    }
}

export function setupTelegramBotListeners() {
    console.log("[TelegramBot] Escuchando mensajes de Telegram y habilitando Gemini con rol de administrador...");

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId]; 
        chatHistories[chatId] = []; 
        bot.sendMessage(chatId, mensajeBienvenida);
    });

    bot.onText(/\/reset/, (msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        chatHistories[chatId] = [];
        bot.sendMessage(chatId, "He reiniciado el historial. ¿En qué puedo ayudarte ahora como tu asistente de administración?");
    });

    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        try {
            if (!text || text.startsWith("/")) return;

            console.log(`[TelegramBot] Mensaje recibido de chat ${chatId}: "${text}"`);
            console.log(`[TelegramBot] Estado actual: ${userStates[chatId]}`);

            if (text.toLowerCase().includes("necesito mi comprobante de pago")) {
                userStates[chatId] = "waitingForPagoId";
                bot.sendMessage(chatId, "Claro, por favor, envíame el ID de tu pago.");
                return;
            }
            
             if (text.toLowerCase().includes("necesito mi comprobante")) {
                userStates[chatId] = "waitingForPagoId";
                bot.sendMessage(chatId, "Claro, por favor, envíame el ID de tu pago.");
                return;
            }

             if (text.toLowerCase().includes("necesito mi boleta")) {
                userStates[chatId] = "waitingForPagoId";
                bot.sendMessage(chatId, "Claro, por favor, envíame el ID de tu pago.");
                return;
            }
   
            if (userStates[chatId] === "waitingForPagoId") {
                const idPago = text.trim();
                const idPagoNumber = Number(idPago);

                if (!Number.isInteger(idPagoNumber) || idPagoNumber <= 0) {
                    bot.sendMessage(chatId, "El ID de pago debe ser un número entero positivo. Por favor, inténtalo de nuevo.");
                    return;
                }

                try {
                    const [pago, errorPago] = await getPagoService({ idPago: idPagoNumber });

                    if (errorPago || !pago) {
                        bot.sendMessage(chatId, "Lo siento, no encontré un pago con ese ID. Por favor, verifica el ID e inténtalo de nuevo.");
                        return;
                    }

                    const pdfBuffer = await generarComprobantePago(pago);
                    const fileName = `comprobante_pago_${pago.idPago}.pdf`;
                 
                    const caption = `Aquí tienes tu comprobante de pago de gastos comunes del mes de ${pago.mes} por $${pago.monto.toLocaleString()}.`;

                    await sendTelegramComprobante(chatId, pdfBuffer, fileName, caption);
                    bot.sendMessage(chatId, "¡Comprobante enviado con éxito!");

                    delete userStates[chatId]; 
                    chatHistories[chatId] = []; 

                } catch (error) {
                    console.error(`[TelegramBot] Error al procesar comprobante para chat ${chatId}:`, error);
                    bot.sendMessage(chatId, "Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.");
                }
                return; 
            }

          
            const currentHistory = chatHistories[chatId] || [];
            bot.sendChatAction(chatId, "typing");
            const geminiResponse = await getGeminiResponse(text, currentHistory);

            if (geminiResponse && !geminiResponse.includes("Lo siento, tuve un problema")) {
                currentHistory.push({ role: "user", parts: [{ text: text }] });
                currentHistory.push({ role: "model", parts: [{ text: geminiResponse }] });
                chatHistories[chatId] = currentHistory;
            }

            bot.sendMessage(chatId, geminiResponse);

        } catch (err) {
            console.error("[TelegramBot] Error inesperado en on('message'):", err);
            bot.sendMessage(chatId, "Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.");
        }
    });

    bot.on("polling_error", (error) => {
        console.error("[TelegramBot] Error de Polling:", error.code, error.message);
    });

    bot.on("webhook_error", (error) => {
        console.error("[TelegramBot] Error de Webhook:", error.code, error.message);
    });
}
