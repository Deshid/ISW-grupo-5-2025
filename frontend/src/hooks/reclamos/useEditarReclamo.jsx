import { useState } from "react";

export function useEditarReclamoForm(reclamo) {
    const [estado, setEstado] = useState(reclamo.estado);
    const [comentarioInterno, setComentarioInterno] = useState(reclamo.comentarioInterno || "");

    const resetForm = () => {
        setEstado(reclamo.estado);
        setComentarioInterno(reclamo.comentarioInterno || "");
    };

    return {
        estado,
        setEstado,
        comentarioInterno,
        setComentarioInterno,
        resetForm
    };
}