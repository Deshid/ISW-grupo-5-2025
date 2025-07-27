import { useState, useEffect } from 'react';
import { getUsers } from '@services/user.service.js';

const useUsers = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            const formattedData = response.map(user => {
                let estado = 'Activo';
                if (user.sanciones && Array.isArray(user.sanciones)) {
                  const hoy = new Date();
                  const sancionActiva = user.sanciones.find(s => {
                    const inicio = new Date(s.fecha_inicio);
                    const fin = new Date(s.fecha_fin);
                    return inicio <= hoy && fin >= hoy;
                  });
                  if (sancionActiva) estado = 'Sancionado';
                }
                return {
                  id: user.id,
                  nombreCompleto: user.nombreCompleto,
                  rut: user.rut,
                  email: user.email,
                  rol: user.rol,
                  createdAt: user.createdAt,
                  estado
                };
            });
            dataLogged(formattedData);
            setUsers(formattedData);
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const dataLogged = (formattedData) => {
        try {
            const { rut } = JSON.parse(sessionStorage.getItem('usuario'));
            for(let i = 0; i < formattedData.length ; i++) {
                if(formattedData[i].rut === rut) {
                    formattedData.splice(i, 1);
                    break;
                }
            }
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    return { users, fetchUsers, setUsers };
};

export default useUsers;