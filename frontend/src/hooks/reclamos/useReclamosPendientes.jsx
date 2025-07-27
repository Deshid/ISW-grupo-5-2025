import { useEffect, useState } from "react";
import { getReclamosPendientes } from "@services/reclamos.service";

export default function useReclamosPendientes(page = 1, ordenDesc = true) {
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    function procesarReclamos(lista) {

        const reclamosProcesados = lista.map(r => {
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
        return reclamosProcesados.sort((a, b) => {
            const [fechaA, horaA] = a.fecha.split(",").map(s => s.trim());
            const [fechaB, horaB] = b.fecha.split(",").map(s => s.trim());
            const [diaA, mesA, anioA] = fechaA.split("-");
            const [diaB, mesB, anioB] = fechaB.split("-");
            const dateA = new Date(`${anioA}-${mesA}-${diaA}T${horaA || "00:00"}`);
            const dateB = new Date(`${anioB}-${mesB}-${diaB}T${horaB || "00:00"}`);
            return ordenDesc ? dateB - dateA : dateA - dateB;
        });
    }

    async function fetchPendientes() {
        setLoading(true);
        try {
            const res = await getReclamosPendientes(page, 10, ordenDesc ? "desc" : "asc");
            if (res && res.data && res.data.data && res.data.data.reclamos) {
                setReclamos(procesarReclamos(res.data.data.reclamos));
                setTotalPages(res.data.data.totalPages || 1);
                setMensaje("");
            } else {
                setMensaje(res?.data?.mensaje || "No se encontraron reclamos pendientes.");
            }
        } catch (error) {
            setMensaje(
                error.response?.data?.error ||
                error.response?.data?.mensaje ||
                "Error al obtener reclamos pendientes"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPendientes();
        // eslint-disable-next-line
    }, [page, ordenDesc]);

    return { reclamos, loading, mensaje, totalPages, fetchPendientes };
}