import { useEffect, useState } from "react";
import { getReservasAprobadas, getReservasRechazadas, getReservasPendientes, getReservasCanceladas, aprobarReserva, rechazarReserva, cancelarReserva } from "@services/reserva.service.js";

export default function ReservasAdmin() {
  const [aprobadas, setAprobadas] = useState([]);
  const [rechazadas, setRechazadas] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [canceladas, setCanceladas] = useState([]);
  const [showPendientes, setShowPendientes] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [showCancelPendientes, setShowCancelPendientes] = useState(false);

  useEffect(() => {
    setCargando(true);
    Promise.all([
      getReservasAprobadas(),
      getReservasRechazadas(),
      getReservasPendientes(),
      getReservasCanceladas()
    ]).then(([aprobadasData, rechazadasData, pendientesData, canceladasData]) => {
      setAprobadas(aprobadasData || []);
      setRechazadas(rechazadasData || []);
      setPendientes(pendientesData || []);
      setCanceladas(canceladasData || []);
      setCargando(false);
    });
  }, []);

  return (
    <div className="main-container-reserva" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100%', margin: '40px auto 0 auto', height: '100%', overflowY: 'auto' }}>
      <div className="form-reserva" style={{ maxWidth: 950, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 24, justifyContent: 'center', width: '100%' }}>
          <button className="visualizar-reservas-btn" style={{ marginBottom: 0, background: '#ff9800', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, padding: '8px 12px', border: 'none', cursor: 'pointer', minWidth: 160, maxWidth: 250 }} onClick={() => setShowPendientes(true)}>
            Reservas pendientes
          </button>
          <button className="visualizar-reservas-btn" style={{ marginBottom: 0, background: '#975dadff', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, padding: '8px 12px', border: 'none', cursor: 'pointer', minWidth: 160, maxWidth: 250 }} onClick={() => setShowCancelPendientes(true)}>
            Cancelaciones pendientes
          </button>
        </div>
      {/* Popup cancelaciones pendientes */}
      {showCancelPendientes && (
        <div className="popup-sanciones">
          <div className="popup-contentido-sanciones">
            <h2 style={{ fontSize: 20, marginBottom: 18, letterSpacing: '0.5px', color: '#975dadff' }}>🕒 Cancelaciones pendientes de aprobación</h2>
            {(() => {
              // Filtrar reservas con estado cancelacion_pendiente
              const cancelPendientes = pendientes.filter(r => r.estado === 'cancelacion_pendiente');
              if (cancelPendientes.length === 0) {
                return <p style={{ textAlign: 'center', color: '#757575', fontWeight: 500 }}>No hay cancelaciones pendientes.</p>;
              }
              return (
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Espacio</th>
                      <th>Fecha</th>
                      <th>Hora inicio</th>
                      <th>Hora fin</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelPendientes.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{r.usuario?.nombreCompleto || r.nombreCompleto || r.usuario || "-"}</td>
                        <td>{r.usuario?.email || r.email || "-"}</td>
                        <td>{r.espacioComun?.nombre || r.espacioComun || "-"}</td>
                        <td>{r.fecha}</td>
                        <td>{r.horaInicio ? r.horaInicio.slice(0,5) : '-'}</td>
                        <td>{r.horaFin ? r.horaFin.slice(0,5) : '-'}</td>
                        <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn-aprobar"
                            onClick={async () => {
                              await cancelarReserva(r.id);
                              setCargando(true);
                              const [aprobadasData, rechazadasData, pendientesData, canceladasData] = await Promise.all([
                                getReservasAprobadas(),
                                getReservasRechazadas(),
                                getReservasPendientes(),
                                getReservasCanceladas()
                              ]);
                              setAprobadas(aprobadasData || []);
                              setRechazadas(rechazadasData || []);
                              setPendientes(pendientesData || []);
                              setCanceladas(canceladasData || []);
                              setCargando(false);
                            }}
                          >Cancelar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
            <button className="btn-cerrar" onClick={() => setShowCancelPendientes(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {/* Popup reservas pendientes */}
      {showPendientes && (
        <div className="popup-sanciones">
          <div className="popup-contentido-sanciones">
            <h2 style={{ fontSize: 20, marginBottom: 18, letterSpacing: '0.5px' }}>🕒 Reservas pendientes de aprobación</h2>
            {(() => {
              // Filtrar pendientes para mostrar solo las que no han pasado
              const ahora = new Date();
              const pendientesVigentes = pendientes.filter(r => {
                const fechaFin = new Date(`${r.fecha}T${r.horaFin}`);
                return fechaFin >= ahora && r.estado !== 'cancelacion_pendiente';
              });
              if (pendientesVigentes.length === 0) {
                return <p style={{ textAlign: 'center', color: '#757575', fontWeight: 500 }}>No hay reservas pendientes.</p>;
              }
              return (
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Espacio</th>
                      <th>Fecha</th>
                      <th>Hora inicio</th>
                      <th>Hora fin</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientesVigentes.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{r.usuario?.nombreCompleto || r.nombreCompleto || r.usuario || "-"}</td>
                        <td>{r.usuario?.email || r.email || "-"}</td>
                        <td>{r.espacioComun?.nombre || r.espacioComun || "-"}</td>
                        <td>{r.fecha}</td>
                        <td>{r.horaInicio ? r.horaInicio.slice(0,5) : '-'}</td>
                        <td>{r.horaFin ? r.horaFin.slice(0,5) : '-'}</td>
                        <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn-aprobar"
                            onClick={async () => {
                              await aprobarReserva(r.id);
                              setCargando(true);
                              const [aprobadasData, rechazadasData, pendientesData] = await Promise.all([
                                getReservasAprobadas(),
                                getReservasRechazadas(),
                                getReservasPendientes()
                              ]);
                              setAprobadas(aprobadasData || []);
                              setRechazadas(rechazadasData || []);
                              setPendientes(pendientesData || []);
                              setCargando(false);
                            }}
                          >Aprobar</button>
                          <button className="confirm"
                            onClick={async () => {
                              await rechazarReserva(r.id);
                              setCargando(true);
                              const [aprobadasData, rechazadasData, pendientesData] = await Promise.all([
                                getReservasAprobadas(),
                                getReservasRechazadas(),
                                getReservasPendientes()
                              ]);
                              setAprobadas(aprobadasData || []);
                              setRechazadas(rechazadasData || []);
                              setPendientes(pendientesData || []);
                              setCargando(false);
                            }}
                          >Rechazar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
            <button className="btn-cerrar" onClick={() => setShowPendientes(false)}>Cerrar</button>
          </div>
        </div>
      )}
        <h2 style={{ color: '#119970', marginBottom: 18 }}>Reservas aprobadas</h2>
        {cargando ? <p>Cargando...</p> :
          aprobadas.length === 0 ? <p>No hay reservas aprobadas</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#F4FFED", borderRadius: 16, marginBottom: 24 }}>
              <thead>
                <tr style={{ background: "#119970", color: "#fff" }}>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Hora inicio</th>
                  <th>Hora fin</th>
                </tr>
              </thead>
              <tbody>
                {aprobadas.map((r, idx) => (
                  <tr key={idx} style={{ textAlign: "center" }}>
                    <td>{r.usuario?.nombreCompleto || r.nombreCompleto || r.usuario || "-"}</td>
                    <td>{r.usuario?.email || r.email || "-"}</td>
                    <td>{r.espacioComun?.nombre || r.espacioComun || "-"}</td>
                    <td>{r.fecha}</td>
                    <td>{r.horaInicio ? r.horaInicio.slice(0,5) : '-'}</td>
                    <td>{r.horaFin ? r.horaFin.slice(0,5) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        <h2 style={{ color: '#e74c3c', marginBottom: 18 }}>Reservas rechazadas</h2>
        {cargando ? <p>Cargando...</p> :
          rechazadas.filter(r => r.estado !== 'cancelada_admin').length === 0 ? <p>No hay reservas rechazadas</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#F4FFED", borderRadius: 16 }}>
              <thead>
                <tr style={{ background: "#e74c3c", color: "#fff" }}>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Hora inicio</th>
                  <th>Hora fin</th>
                </tr>
              </thead>
              <tbody>
                {rechazadas.filter(r => r.estado !== 'cancelada_admin').map((r, idx) => (
                  <tr key={idx} style={{ textAlign: "center" }}>
                    <td>{r.usuario?.nombreCompleto || r.nombreCompleto || r.usuario || "-"}</td>
                    <td>{r.usuario?.email || r.email || "-"}</td>
                    <td>{r.espacioComun?.nombre || r.espacioComun || "-"}</td>
                    <td>{r.fecha}</td>
                    <td>{r.horaInicio ? r.horaInicio.slice(0,5) : '-'}</td>
                    <td>{r.horaFin ? r.horaFin.slice(0,5) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        <h2 style={{ color: '#975dadff', marginBottom: 18 }}>Reservas canceladas</h2>
        {cargando ? <p>Cargando...</p> :
          canceladas.length === 0 ? <p>No hay reservas canceladas</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#F4FFED", borderRadius: 16 }}>
              <thead>
                <tr style={{ background: "#975dadff", color: "#fff" }}>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Hora inicio</th>
                  <th>Hora fin</th>
                </tr>
              </thead>
              <tbody>
                {canceladas.map((r, idx) => (
                  <tr key={idx} style={{ textAlign: "center" }}>
                    <td>{r.usuario?.nombreCompleto || r.nombreCompleto || r.usuario || "-"}</td>
                    <td>{r.usuario?.email || r.email || "-"}</td>
                    <td>{r.espacioComun?.nombre || r.espacioComun || "-"}</td>
                    <td>{r.fecha}</td>
                    <td>{r.horaInicio ? r.horaInicio.slice(0,5) : '-'}</td>
                    <td>{r.horaFin ? r.horaFin.slice(0,5) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
