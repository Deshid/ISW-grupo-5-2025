import { useState } from "react";
import "../styles/reclamos.css";
//import axios from "axios";
import ReclamoForm from "../components/ReclamoForm";

export default function Reclamos() {
    const [opcion, setOpcion] = useState(null);

    return (
    <div className = "containerReclamos">

        <h2>Gestión de Reclamos</h2>
        <div className = "containerCuerpo">
            <div className = "containerReclamos-btns">
                <li><button onClick={() => setOpcion("crear")}>Crear Reclamo</button></li>
                <li><button onClick={() => setOpcion("pendientes")}>Reclamos Pendientes</button></li>
                <li><button onClick={() => setOpcion("misReclamos")}>Mis Reclamos</button></li>
            </div>

        {opcion === "crear" && <div className="formularioReclamo"><ReclamoForm /></div>}
        {opcion === "pendientes" && <div className="formularioReclamo">Aquí va la lista de reclamos pendientes</div>}
        {opcion === "misReclamos" && <div className="formularioReclamo">Aquí va la lista de mis reclamos</div>}
        </div>
    </div>
    );
}