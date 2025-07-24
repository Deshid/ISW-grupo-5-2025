import { useState, useEffect } from "react";
import { getMisReclamos, cancelarReclamo } from "@services/reclamos.service";

export default function useMisReclamos() {
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Mueve la función aquí, fuera del useEffect
    async function fetchReclamos() {
        setLoading(true);
        try {
            const res = await getMisReclamos(page, limit);
            if (res && res.data && res.data.data && res.data.data.reclamos) {
                const reclamosProcesados = res.data.data.reclamos.map(r => {
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
                });
                setReclamos(reclamosProcesados);
                setTotal(res.data.data.total || 0);
                setMensaje("");
            } else {
                setMensaje(res?.data?.mensaje || "No se encontraron reclamos.");
            }
        } catch (error) {
            setMensaje(
                error.response?.data?.error ||
                error.response?.data?.mensaje ||
                "Error al obtener reclamos"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReclamos();
    }, [page]);

    const handleCancelarReclamo = async (id) => {
        if (!window.confirm("¿Seguro que deseas cancelar este reclamo?")) return;
        try {
            const res = await cancelarReclamo(id, { motivo: "Cancelado por el usuario" });
            setMensaje(res?.data?.mensaje || "Reclamo cancelado.");
            fetchReclamos();
        } catch (error) {
            setMensaje(
                error.response?.data?.error ||
                error.response?.data?.mensaje ||
                "Error al cancelar reclamo"
            );
        }
    };

    const totalPages = Math.ceil(total / limit);

    return { reclamos, loading, mensaje, handleCancelarReclamo, page, setPage, totalPages };
}