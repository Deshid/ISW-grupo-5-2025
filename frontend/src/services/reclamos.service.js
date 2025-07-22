import axios from "./root.service.js";

const API_URL = "/reclamos";

export async function crearReclamo(data){
    const token = localStorage.getItem("token");
    return await axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getMisReclamos(){
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/mis-reclamos`, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getReclamosPendientes(){
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/pendientes`, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getReclamosConIdentidad(){
    const token = localStorage.getItem("token");
    return await axios.get(`${API_URL}/identidades`, { headers: { Authorization: `Bearer ${token}` } });
};
export async function updateEstadoReclamo(id, data){
    const token = localStorage.getItem("token");
    return await axios.patch(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
};
export async function cancelarReclamo(id, data){
    const token = localStorage.getItem("token");
    return await axios.patch(`${API_URL}/${id}/cancelar`, data, { headers: { Authorization: `Bearer ${token}` } });
};
export async function getAllReclamos(){
    const token = localStorage.getItem("token");
    return await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
};
