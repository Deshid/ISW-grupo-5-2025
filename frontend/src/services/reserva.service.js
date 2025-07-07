import axios from './root.service.js';

// crear una reserva
export async function createReserva(data) {
    try {
        const response = await axios.post('/reservas', data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

// Obtener mis reservas
export async function getMisReservas() {
    const res = await axios.get("/reservas/mis-reservas");
    return res.data;
}