import {ReservaForm, ListaReservasUsuario, VerReservasAdmin} from "@components/ReservaForm";
import '../styles/reserva.css';

const Reservas = () => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Reservas</h1>
            {isAdmin ? (
                <VerReservasAdmin />
            ) : (
                <>
                    <ReservaForm />
                    <ListaReservasUsuario />
                </>
            )}
        </div>
    );
};

export default Reservas;