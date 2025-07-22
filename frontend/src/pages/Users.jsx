
import Table from '@components/Table';
import useUsers from '@hooks/users/useGetUsers.jsx';
import Search from '../components/Search';
import Popup from '../components/Popup';
import DeleteIcon from '../assets/deleteIcon.svg';
import UpdateIcon from '../assets/updateIcon.svg';
import UpdateIconDisable from '../assets/updateIconDisabled.svg';
import DeleteIconDisable from '../assets/deleteIconDisabled.svg';
import { useCallback, useState } from 'react';
import '@styles/users.css';
import '@styles/sancion.css';
import useEditUser from '@hooks/users/useEditUser';
import useDeleteUser from '@hooks/users/useDeleteUser';

const Users = () => {
  // Popup sanción propio
  const [showSancionPopup, setShowSancionPopup] = useState(false);
  const [sancionForm, setSancionForm] = useState({ fecha_inicio: '', fecha_fin: '', motivo: '' });
  const [sancionError, setSancionError] = useState('');
  const [sancionandoUserId, setSancionandoUserId] = useState(null);
  const { users, fetchUsers, setUsers } = useUsers();
  const [filterRut, setFilterRut] = useState('');

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditUser(setUsers);

  const { handleDelete } = useDeleteUser(fetchUsers, setDataUser);

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const handleSelectionChange = useCallback((selectedUsers) => {
    setDataUser(selectedUsers);
  }, [setDataUser]);

  const columns = [
    { title: "Nombre", field: "nombreCompleto", width: 350, responsive: 0 },
    { title: "Correo electrónico", field: "email", width: 300, responsive: 3 },
    { title: "Rut", field: "rut", width: 150, responsive: 2 },
    { title: "Rol", field: "rol", width: 200, responsive: 2 },
    { title: "Creado", field: "createdAt", width: 200, responsive: 2 },
  ];

  // Popup para mostrar sanciones activas
  const [showSancionesPopup, setShowSancionesPopup] = useState(false);
  const [sancionesActivas, setSancionesActivas] = useState([]);
  const handleOpenSanciones = async () => {
    const { getSancionesActivas } = await import('../services/sancion.service');
    const sanciones = await getSancionesActivas();
    setSancionesActivas(sanciones);
    setShowSancionesPopup(true);
  };

  return (
    <div className='main-container-user'>
      <div className='table-container'>
        <div className='top-table' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className='title-table'>Usuarios</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className='filter-actions'>
              <Search value={filterRut} onChange={handleRutFilterChange} placeholder={'Filtrar por rut'} />
              <button onClick={handleClickUpdate} disabled={dataUser.length === 0}>
                {dataUser.length === 0 ? (
                  <img src={UpdateIconDisable} alt="edit-disabled" />
                ) : (
                  <img src={UpdateIcon} alt="edit" />
                )}
              </button>
              <button className='delete-user-button' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
                {dataUser.length === 0 ? (
                  <img src={DeleteIconDisable} alt="delete-disabled" />
                ) : (
                  <img src={DeleteIcon} alt="delete" />
                )}
              </button>
            </div>
            <button
              className='sanciones-btn-top'
              style={{ padding: '0.5rem 1rem', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={handleOpenSanciones}
            >
              Sanciones
            </button>
            <button
              className='sancionar-btn-top'
              style={{ padding: '0.5rem 1rem', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => {
                if (dataUser && dataUser.length > 0) {
                  setSancionandoUserId(dataUser[0].id);
                  setShowSancionPopup(true);
                  setSancionForm({ fecha_inicio: '', fecha_fin: '', motivo: '' });
                  setSancionError('');
                } else {
                  setSancionError('Selecciona un usuario para sancionar.');
                  setShowSancionPopup(true);
                }
              }}
            >
              Sancionar
            </button>
      {showSancionPopup && (
        <div className="popup-sancion">
          <div className="popup-content">
            <h2>Sancionar usuario</h2>
            {sancionError && <p style={{ color: 'red' }}>{sancionError}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="date" value={sancionForm.fecha_inicio} onChange={e => setSancionForm(f => ({ ...f, fecha_inicio: e.target.value }))} placeholder="Fecha inicio" />
              <input type="date" value={sancionForm.fecha_fin} onChange={e => setSancionForm(f => ({ ...f, fecha_fin: e.target.value }))} placeholder="Fecha fin" />
              <input type="text" value={sancionForm.motivo} onChange={e => setSancionForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Motivo" />
            </div>
            <div>
              <button className="confirm" onClick={async () => {
                if (!sancionandoUserId) return;
                const { fecha_inicio, fecha_fin, motivo } = sancionForm;
                if (!fecha_inicio || !fecha_fin || !motivo) {
                  setSancionError('Completa todos los campos.');
                  return;
                }
                try {
                  const { sancionarUsuario } = await import('../services/sancion.service');
                  const res = await sancionarUsuario(sancionandoUserId, fecha_inicio, fecha_fin, motivo);
                  console.log('Respuesta sanción:', res);
                  if (res && !res.error) {
                    setSancionError('Sanción aplicada correctamente.');
                    setTimeout(() => {
                      setShowSancionPopup(false);
                      setSancionForm({ fecha_inicio: '', fecha_fin: '', motivo: '' });
                      setSancionandoUserId(null);
                      setSancionError('');
                      fetchUsers();
                    }, 1200);
                  } else if (res && res.error === 'Este usuario ya tiene una sanción activa') {
                    setSancionError('Este usuario ya tiene una sanción activa.');
                    fetchUsers();
                  } else {
                    setSancionError('No se pudo sancionar.');
                  }
                } catch (error) {
                  setSancionError('Error al sancionar usuario.');
                }
              }}>Confirmar</button>
              <button className="cancel" onClick={() => setShowSancionPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
        <Table
          data={users}
          columns={columns.filter(c => c.field !== 'estado')}
          filter={filterRut}
          dataToFilter={'rut'}
          initialSortName={'nombreCompleto'}
          onSelectionChange={handleSelectionChange}
        />
      {showSancionesPopup && (
        <div className="popup-sanciones">
          <div className="popup-content">
            <h2>Sanciones activas</h2>
            {sancionesActivas.length === 0 ? (
              <p>No hay sanciones activas.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Motivo</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sancionesActivas.map((s, i) => (
                    <tr key={i}>
                      <td>{s.nombreCompleto}</td>
                      <td>{s.fecha_inicio}</td>
                      <td>{s.fecha_fin}</td>
                      <td>{s.motivo}</td>
                      <td>
                        <button className="suspender"
                          onClick={async () => {
                            const { suspenderSancion } = await import('../services/sancion.service');
                            const { showSuccessAlert, showErrorAlert } = await import('../helpers/sweetAlert');
                            try {
                            if (!s.usuarioId) {
                              showErrorAlert('Error','No se encontró el id del usuario sancionado.');
                              return;
                            }
                            await suspenderSancion(s.usuarioId);
                              showSuccessAlert('¡Sanción suspendida!','La sanción ha sido suspendida correctamente.');
                              handleOpenSanciones();
                            } catch (err) {
                              showErrorAlert('Error','No se pudo suspender la sanción.');
                            }
                          }}
                        >Suspender sanción</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="cancel" onClick={() => setShowSancionesPopup(false)}>Cerrar</button>
          </div>
        </div>
      )}
      </div>
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} action={handleUpdate} />
    </div>
  );
};

export default Users;