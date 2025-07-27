import { useState } from "react";
import { getReclamoPorId } from "@services/reclamos.service";

export default function useBuscarReclamoPorId() {
    const [reclamo, setReclamo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const procesarReclamo = (r) => {
        let soloFecha = "";
        let soloHora = "";
        if (r.fecha) {
            const partes = r.fecha.split(",");
            soloFecha = partes[0]?.trim() || "";
            let horaCompleta = partes[1]?.trim() || "";
            const horaPartes = horaCompleta.split(":");
            if (horaPartes.length >= 2) {
                const ampm = horaPartes[2]?.replace(/[0-9]/g, "").trim() || "";
                soloHora = `${horaPartes[0]}:${horaPartes[1]}${ampm ? " " + ampm : ""}`;
            } else {
                soloHora = horaCompleta;
            }
        }
        return { ...r, soloFecha, soloHora };
    };

    const buscarPorId = async (id) => {
        setLoading(true);
        setMensaje("");
        try {
            const res = await getReclamoPorId(id);
            // Procesa el reclamo para agregar soloFecha y soloHora
            setReclamo(procesarReclamo(res.data.data));
        } catch (error) {
            setReclamo(null);
            setMensaje("No se encontró el reclamo. Error: " +
                (error.response?.data?.error || error.response?.data?.mensaje || "Error al buscar reclamo"));
        } finally {
            setLoading(false);
        }
    };

    const limpiarBusqueda = () => {
        setReclamo(null);
        setMensaje("");
    };

    return { reclamo, loading, mensaje, buscarPorId, limpiarBusqueda };
}