import ReclamoForm from "../components/ReclamoForm";
import axios from "axios";
import { useState } from "react";
import { Button, Snackbar, Alert, Typography, Box } from "@mui/material";

export default function Reclamos() {
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = async (form) => {
        try {
        // Reemplaza 'TU_TOKEN' por la obtención real del token (ej: desde contexto o localStorage)
        const token = localStorage.getItem("token");
        await axios.post("/api/reclamos", form, { headers: { Authorization: `Bearer ${token}` } });
        setSnackbar({ open: true, message: "Reclamo creado con éxito", severity: "success" });
        setOpen(false);
        } catch (err) {
        setSnackbar({ open: true, message: err?.response?.data?.message || "Error al crear reclamo", severity: "error" });
        }
    };

    return (
        <Box sx={{ mt: 12, p: 2 }}>
        <Typography variant="h4" gutterBottom>Gestión de Reclamos</Typography>
        <Button variant="contained" onClick={handleOpen}>Nuevo Reclamo</Button>
        <ReclamoForm open={open} onClose={handleClose} onSubmit={handleSubmit} />
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
            </Alert>
        </Snackbar>
        </Box>
    );
    }