import { useState, useEffect } from "react";
import { getAllReclamos } from "@services/reclamos.service";

export default function useTodosReclamos() {
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [verAnonimos, setVerAnonimos] = useState(false);
    const [ordenDesc, setOrdenDesc] = useState(true);
    const limit = 5;

    async function fetchReclamos() {
        setLoading(true);
        try {
            const res = await getAllReclamos(page, limit, ordenDesc ? "desc" : "asc");
            if (res && res.data && res.data.data && res.data.data.reclamos) {
                setReclamos(res.data.data.reclamos);
                setTotal(res.data.data.total || 0);
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
    }, [page, ordenDesc]);

    const totalPages = Math.ceil(total / limit);

    return { reclamos, loading, mensaje, page, setPage, totalPages, verAnonimos, setVerAnonimos, ordenDesc, setOrdenDesc, fetchReclamos };
}