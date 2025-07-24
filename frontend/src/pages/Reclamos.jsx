import { useState } from "react";
import useUserRole from "../hooks/auth/useUserRole";
import "../styles/reclamos.css";
import ReclamoForm from "../components/ReclamoForm";
import MisReclamos from "../components/MisReclamos";
import TodosReclamos from "../components/TodosReclamos";


export default function Reclamos() {
    const [opcion, setOpcion] = useState(null);
    const { 
        isAdmin,
        isPresidente,
        isSecretario, 
        //isTesorero, 
        isUsuario, 
        rol
        } = useUserRole();

        console.log("ROL ACTUAL:", rol, { isUsuario, isSecretario });

    return (
    <div className = "containerReclamos">

        <h2>Gestión de Reclamos</h2>
        <div className = "containerCuerpo">
            <div className = "containerReclamos-btns">
                {isUsuario && (
                    <li>
                        <button onClick={() => setOpcion("crear")}>Crear Reclamo</button>
                    </li>
                )}
                {(isSecretario || isSecretario) && (
                    <li>
                        <button onClick={() => setOpcion("reclamos")}>Reclamos</button>
                    </li>
                )}

                {(isAdmin || isPresidente) && (
                    <li>
                        <button onClick={() => setOpcion("todosReclamos")}>Mostrar Reclamos</button>
                    </li>
                )}

                {isUsuario && (
                    <li>
                        <button onClick={() => setOpcion("misReclamos")}>Mis Reclamos</button>
                    </li>
                )}
            </div>

        {opcion === "crear" && <div className="formularioReclamo"><ReclamoForm /></div>}
        {opcion === "reclamos" && <div className="formularioReclamo">Aquí va la lista de reclamos</div>}
        {opcion === "misReclamos" && <div className="formularioReclamo"><MisReclamos /></div>}
        {opcion === "todosReclamos" && <div className="formularioReclamo"><TodosReclamos/></div>}
        </div>
    </div>
    );
}