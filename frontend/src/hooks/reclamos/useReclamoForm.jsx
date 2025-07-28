import { useState } from "react";
import { crearReclamo } from "@services/reclamos.service";

export default function useReclamoForm(ReclamoCreado) {
    const [form, setForm] = useState({
        descripcion: "",
        categoria: "",
        anonimo: false
    });
    const [mensaje, setMensaje] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        try {
            const res = await crearReclamo(form);
            if (res && res.data && res.data.data) {
                setMensaje("Reclamo creado exitosamente");
                setForm({ descripcion: "", categoria: "", anonimo: false });
                if (ReclamoCreado) ReclamoCreado();
            } 
        } catch (error) {
            setMensaje(
                error.response?.data?.error ||
                error.response?.data?.mensaje ||
                "Error al crear reclamo"
            );
        }
    };

    return {
        form,
        setForm,
        mensaje,
        setMensaje,
        handleChange,
        handleSubmit
    };
}