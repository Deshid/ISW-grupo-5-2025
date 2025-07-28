// frontend/src/services/pago.services.js
import axios from './root.service.js'; 

export const createPago = async (pagoData) => {
    try {
        const response = await axios.post('/pagos', pagoData);
        return response.data; 
    } catch (error) {
        console.error("Error en createPago service (frontend):", error);
        return error.response?.data || { error: "Error al registrar el pago" }; 
    }
};

export const getPagosService = async (monthFilter = '') => {
    try {
        let url = '/pagos';
        if (monthFilter) {
            url += `?mes=${encodeURIComponent(monthFilter)}`;
        }
        const response = await axios.get(url);
        return response.data; 
    } catch (error) {
        console.error("Error en getPagosService (frontend):", error);
        return error.response?.data || { error: "Error al obtener los pagos" }; 
    }
};