import axios from './root.service.js';

// Sancionar usuario
export async function sancionarUsuario(id, fecha_inicio, fecha_fin, motivo) {
    try {
        const response = await axios.patch(`/usuarios/${id}/sancionar`, { fecha_inicio, fecha_fin, motivo });
        return response.data;
    } catch (error) {
        return error.response.data || { error: "Error al sancionar usuario" };
    }
}

// Suspender sanción
export async function suspenderSancion(usuarioId) {
    if (!usuarioId || typeof usuarioId !== 'number') {
        throw new Error('Id de usuario inválido para suspender sanción');
    }
    const { data } = await axios.patch(`/usuarios/${usuarioId}/suspender`);
    return data;
}

// Obtener todas las sanciones
export async function obtenerSanciones() {
    try {
        const response = await axios.get(`/sancion/`);
        return response.data;
    } catch (error) {
        return error.response.data || { error: "Error al obtener sanciones" };
    }
}

// Obtener sanciones activas

export async function getSancionesActivas() {
    const { data } = await axios.get('/usuarios/activas');
    // El backend retorna { sanciones: [...] }
    return (data.sanciones || []).map(s => ({
        usuarioId: s.usuario.id,
        nombreCompleto: s.usuario.nombreCompleto || '',
        fecha_inicio: s.fecha_inicio,
        fecha_fin: s.fecha_fin,
        motivo: s.motivo
    }));
}