import { useState, useEffect } from "react";
import { getMisReclamos } from "@services/reclamos.service";

export default function useMisReclamos() {
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        async function fetchReclamos() {
            setLoading(true);
            try {
                const res = await getMisReclamos();
                if (res && res.data && res.data.data && res.data.data.reclamos) {
                    setReclamos(res.data.data.reclamos);
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
        fetchReclamos();
    }, []);

    return { reclamos, loading, mensaje };
}