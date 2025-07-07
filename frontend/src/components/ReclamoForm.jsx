import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, FormControlLabel, Checkbox, DialogActions } from "@mui/material";

export default function ReclamoForm({ open, onClose, onSubmit }) {
    const [form, setForm] = useState({ descripcion: "", categoria: "", anonimo: false });

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
    const handleCheck = e => setForm({ ...form, anonimo: e.target.checked });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
        setForm({ descripcion: "", categoria: "", anonimo: false });
    };

    return (
        <Dialog open={open} onClose={onClose}>
        <DialogTitle>Nuevo Reclamo</DialogTitle>
        <form onSubmit={handleSubmit}>
            <DialogContent>
            <TextField
                label="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                fullWidth
                multiline
                margin="normal"
                required
            />
            <Select
                label="Categoría"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                fullWidth
                displayEmpty
                margin="normal"
                required
            >
                <MenuItem value="">Seleccione categoría</MenuItem>
                <MenuItem value="servicio">Servicio</MenuItem>
                <MenuItem value="edificio">Edificio</MenuItem>
                <MenuItem value="residente">Residente</MenuItem>
            </Select>
            <FormControlLabel
                control={<Checkbox checked={form.anonimo} onChange={handleCheck} />}
                label="Enviar como anónimo"
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="contained">Enviar</Button>
            </DialogActions>
        </form>
        </Dialog>
    );
}
