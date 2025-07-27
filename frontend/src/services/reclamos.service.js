import axios from "./root.service.js";

export const API_URL = "/reclamos";

export async function crearReclamo(data){//LISTO
    const token = localStorage.getItem("token");
    return await axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getMisReclamos(){//LISTO
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/mis-reclamos`, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getReclamosPendientes(page = 1, limit = 10, order = "desc"){
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/pendientes?page=${page}&limit=${limit}&order=${order}`,
        { headers: { Authorization: `Bearer ${token}` } });
};
export async function getReclamosConIdentidad(){// LISTO
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/identidades`, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getReclamoPorId(id) { // LISTO
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}
export async function updateEstadoReclamo(id, data){// LISTO
    const token = localStorage.getItem("token");
    return await axios.patch(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
};
export async function cancelarReclamo(id, data){//LISTO
    const token = localStorage.getItem("token");
    return await axios.patch(`${API_URL}/${id}/cancelar`, data, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getAllReclamos(page = 1, limit = 10, order = "desc") {//LISTO
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}?page=${page}&limit=${limit}&order=${order}`, { headers: { Authorization: `Bearer ${token}` } });
};
