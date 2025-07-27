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

// Actualizar reserva (usuario)
export async function actualizarReserva(id, data) {
    try {
        const res = await axios.patch(`/reservas/${id}`, data);
        return res.data;
    } catch (error) {
        return error.response?.data || { error: "Error al actualizar reserva" };
    }
}

// Obtener reservas pendientes (admin)
export async function getReservasPendientes() {
    try {
        const response = await axios.get('/reservas/admin/pendientes');
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener reservas" };
    }
}
// Obtener reservas aprobadas (admin)
export async function getReservasAprobadas() {
    try {
        const response = await axios.get('/reservas/admin/aprobadas');
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener reservas aprobadas" };
    }
}
// Obtener reservas rechazadas (admin)
export async function getReservasRechazadas() {
    try {
        const response = await axios.get('/reservas/admin/rechazadas');
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener reservas rechazadas" };
    }
}

// obtener reservas canceladas (admin)
export async function getReservasCanceladas() {
    try {
        const response = await axios.get('/reservas/admin/canceladas');
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener reservas canceladas" };
    }
}

// aprobar reserva (admin)
export async function aprobarReserva(id) {
    try {
        const response = await axios.patch(`/reservas/${id}/estado`, { estado: 'aprobada' });
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al aprobar reserva" };
    }
}

// rechazar reserva (admin)
export async function rechazarReserva(id) {
    try {
        const response = await axios.patch(`/reservas/${id}/estado`, { estado: 'rechazada' });
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al rechazar reserva" };
    }
}
// cancelar reserva (admin)
export async function cancelarReserva(id) {
    try {
        const response = await axios.patch(`/reservas/${id}/cancelar`);
        return response.data;
    } catch (error) {
        return error.response?.data || { error: "Error al cancelar reserva" };
    }
}