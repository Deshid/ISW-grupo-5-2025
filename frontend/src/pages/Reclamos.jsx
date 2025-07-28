import { useState } from "react";
import useUserRole from "../hooks/auth/useUserRole";
import "../styles/reclamos.css";
import ReclamoForm from "../components/ReclamoForm";
import MisReclamos from "../components/MisReclamos";
import TodosReclamos from "../components/TodosReclamos";
import ReclamosPendientes from "../components/ReclamosPendientes";


export default function Reclamos() {
    const [opcion, setOpcion] = useState("crear"); // Mostrar crear reclamo por defecto
    const { isAdmin, isPresidente, isSecretario, isTesorero, isUsuario } = useUserRole();

    return (
        <div className="containerReclamos">
            <div className="containerCuerpo">
                <div className="containerReclamos-btns">
                {isUsuario && (
                    <li>
                        <button
                            className={
                                opcion === "crear"
                                    ? "btn-CrearReclamo btn-activo"
                                    : "btn-CrearReclamo btn-palida"
                            }
                            onClick={() => setOpcion("crear")}
                        >
                            Crear Reclamo
                        </button>
                    </li>
                )}
                    {(isSecretario || isTesorero) && (
                        <li>
                            <button className="btn-ReclamosPendientes" onClick={() => setOpcion("reclamos")}>Reclamos Pendientes</button>
                        </li>
                    )}
                    {(isAdmin || isPresidente) && (
                        <li>
                            <button className="btn-MostrarReclamos" onClick={() => setOpcion("todosReclamos")}>Mostrar Reclamos</button>
                        </li>
                    )}
                    {isUsuario && (
                        <li>
                            <button
                                className={
                                    opcion === "misReclamos"
                                        ? "btn-MisReclamos btn-activo"
                                        : "btn-MisReclamos btn-palida"
                                }
                                onClick={() => setOpcion("misReclamos")}
                            >
                                Mis Reclamos
                            </button>
                        </li>
                    )}
                </div>

                {opcion === "crear" && <div className="formularioReclamo"><ReclamoForm /></div>}
                {opcion === "reclamos" && <div className="formularioReclamo"><ReclamosPendientes /></div>}
                {opcion === "misReclamos" && <div className="formularioReclamo"><MisReclamos /></div>}
                {opcion === "todosReclamos" && <div className="formularioReclamo"><TodosReclamos /></div>}
            </div>
        </div>
    );
}