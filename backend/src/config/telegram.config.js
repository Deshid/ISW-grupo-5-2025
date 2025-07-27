
    import dotenv from "dotenv";
    dotenv.config();

    export const telegramConfig = {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        geminiApiKey: process.env.GEMINI_API_KEY,
    };
    