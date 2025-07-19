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

// Solicitar cancelación de reserva (usuario)
export async function solicitarCancelacionReservaUsuario(id) {
    try {
        const res = await axios.patch(`/reservas/${id}/solicitar-cancelacion`);
        return res.data;
    } catch (error) {
        return error.response?.data || { error: "Error al solicitar cancelación" };
    }
}