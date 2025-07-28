// frontend/src/pages/Pagos.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPago, getPagosService } from '../services/pago.services.js';
import '../styles/pago.css'; // Asegúrate de que esta ruta sea correcta
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";
// COMENTAMOS ESTA LÍNEA PARA NO USAR EL CONTEXTO DE AUTENTICACIÓN
// import { useAuth } from '../context/AuthContext'; 

function Pagos() {
    // YA NO OBTENEMOS TOKEN NI USERROLE DEL CONTEXTO DE AUTENTICACIÓN.
    // Simplemente definimos valores dummy para que el código compile si alguna parte los referencia.
    // Esto asegura que las condiciones de rol en el JSX siempre se evalúen como "permitido".
    //const token = null; // No enviamos token desde aquí
    // const user = null; // No usamos el objeto user directamente aquí

    const [pagoData, setPagoData] = useState({
        monto: '',
        mes: '',
        fechaPago: '',
        metodo: '',
        rut: '',
    });
    const [mensaje, setMensaje] = useState("");
    const [comprobanteLink, setComprobanteLink] = useState(null);

    const [showPaymentList, setShowPaymentList] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [allPayments, setAllPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    const months = [
        { value: '', label: 'Todos los meses' },
        { value: 'Enero', label: 'Enero' },
        { value: 'Febrero', label: 'Febrero' },
        { value: 'Marzo', label: 'Marzo' },
        { value: 'Abril', label: 'Abril' },
        { value: 'Mayo', label: 'Mayo' },
        { value: 'Junio', label: 'Junio' },
        { value: 'Julio', label: 'Julio' },
        { value: 'Agosto', label: 'Agosto' },
        { value: 'Septiembre', label: 'Septiembre' },
        { value: 'Octubre', label: 'Octubre' },
        { value: 'Noviembre', label: 'Noviembre' },
        { value: 'Diciembre', label: 'Diciembre' },
    ];

    const handleChange = (e) => {
        setPagoData({ ...pagoData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setComprobanteLink(null);

        // Validaciones básicas del lado del cliente antes de enviar
        if (!pagoData.monto || !pagoData.mes || !pagoData.fechaPago || !pagoData.metodo || !pagoData.rut) {
            setMensaje("Por favor, completa todos los campos.");
            showErrorAlert("Error de validación", "Por favor, completa todos los campos.");
            return; 
        }
        
        // Limpiar y formatear datos antes de enviar al backend
        const cleanedRut = pagoData.rut.replace(/[^0-9kK]/g, '').toUpperCase(); 
        const parsedMonto = parseFloat(pagoData.monto);

        if (isNaN(parsedMonto)) {
            setMensaje("El monto debe ser un número válido.");
            showErrorAlert("Error de validación", "El monto ingresado no es un número válido.");
            return;
        }

        const dataToSend = {
            monto: parsedMonto,
            mes: pagoData.mes,
            fechaPago: new Date(pagoData.fechaPago).toISOString(), 
            metodo: pagoData.metodo,
            rut: cleanedRut, 
        };

        try {
            // Llamada a createPago SIN pasar el token
            const response = await createPago(dataToSend); 

            if (response && response.error) {
                console.error("Error al registrar pago (desde servicio):", response.error);
                setMensaje(`Error: ${response.error}`);
                showErrorAlert("Error al registrar pago", response.error);
            } else if (response) {
                setMensaje(response.message || "¡Pago registrado con éxito!"); 
                showSuccessAlert("✅ Pago registrado exitosamente", response.message || "Tu pago fue registrado correctamente.");
                
                if (response.comprobanteUrl) {
                    setComprobanteLink(response.comprobanteUrl);
                }
                setPagoData({ monto: '', mes: '', fechaPago: '', metodo: '', rut: '' });
                
                if (showPaymentList) {
                    loadAllPayments(selectedMonth); 
                }
            } else {
                console.error("Respuesta inesperada del servicio de pago:", response);
                setMensaje("Respuesta inesperada del servidor.");
                showErrorAlert("Error", "Ocurrió un error inesperado con la respuesta del servidor.");
            }
        } catch (error) {
            console.error("Error al enviar pago:", error);
            setMensaje(`Error inesperado: ${error.message}`);
            showErrorAlert("Error inesperado", error.message);
        }
    };

    const loadAllPayments = useCallback(async (monthFilter = '') => {
        setLoadingPayments(true);
        
        try {
            // Llamada a getPagosService SIN pasar el token
            const data = await getPagosService(monthFilter); 

            if (data && data.error) {
                console.error("Error al cargar pagos (desde servicio):", data.error);
                setAllPayments([]); 
                showErrorAlert("Error al cargar pagos", data.error);
            } else {
                setAllPayments(data || []); 
            }
        } catch (error) {
            console.error("Error al cargar pagos:", error);
            setAllPayments([]);
            showErrorAlert("Error al cargar pagos", error.message || "Ocurrió un error desconocido.");
        } finally {
            setLoadingPayments(false);
        }
    }, []); // Ya no depende de 'token'

    useEffect(() => {
        if (showPaymentList) { 
            loadAllPayments(selectedMonth);
        }
    }, [showPaymentList, selectedMonth, loadAllPayments]); 

    const handleMonthFilterChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const formatRut = (rut) => {
        if (!rut) return '';
        const cleanRut = String(rut).replace(/[^0-9kK]/g, ''); 
        let formattedRut = '';
        if (cleanRut.length > 1) {
            const dv = cleanRut.slice(-1);
            const body = cleanRut.slice(0, -1);
            formattedRut = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
        } else {
            formattedRut = cleanRut;
        }
        return formattedRut;
    };

    return (
        <div className="pagos-page-container">
            <form onSubmit={handleSubmit} className="form-pago">
                <h2>💰 Registrar Nuevo Pago</h2>
                
                <label>
                    RUT del Usuario del Pago:
                    <input
                        type="text"
                        id="rut"
                        name="rut"
                        value={pagoData.rut}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 20738415-1" 
                        className="input-normal"
                    />
                </label>

                <label className="input-field">
                    Monto:
                    <input
                        type="number" 
                        id="monto"
                        name="monto"
                        value={pagoData.monto}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 47000"
                        className="input-normal"
                    />
                </label>
                <label className="input-field">
                    Mes:
                    <input
                        type="text"
                        id="mes"
                        name="mes"
                        value={pagoData.mes}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Agosto"
                        className="input-normal"
                    />
                </label>
                <label className="input-field">
                    Fecha de Pago:
                    <input
                        type="date"
                        id="fechaPago"
                        name="fechaPago"
                        value={pagoData.fechaPago}
                        onChange={handleChange}
                        required
                        className="input-normal"
                    />
                </label>
                <label className="input-field">
                    Método de Pago:
                    <select name="metodo" value={pagoData.metodo} onChange={handleChange} required className="input-normal">
                        <option value="">Selecciona un método</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                </label>
                
                <button type="submit" className="btn-submit-pago">Registrar Pago</button>
                
                {mensaje && <div className="mensaje">{mensaje}</div>}

                {comprobanteLink && (
                    <div className="comprobante-link-container">
                        <a 
                            href={comprobanteLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-download-comprobante"
                        >
                            Descargar Comprobante PDF
                        </a>
                    </div>
                )}
            </form>

            <button 
                onClick={() => setShowPaymentList(!showPaymentList)} 
                className="btn-toggle-payments"
            >
                {showPaymentList ? 'Ocultar Pagos Registrados' : 'Ver Pagos Registrados'}
            </button>

            {showPaymentList && (
                <div className="payments-list-container">
                    <h3>📋 Pagos Registrados</h3>
                    <div className="payments-filter-section">
                        <label htmlFor="monthFilter">Filtrar por Mes:</label>
                        <select 
                            id="monthFilter" 
                            value={selectedMonth} 
                            onChange={handleMonthFilterChange}
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loadingPayments ? (
                        <p className="loading-message">Cargando pagos...</p>
                    ) : allPayments.length === 0 ? (
                        <p className="no-payments-message">No hay pagos registrados para el mes seleccionado.</p>
                    ) : (
                        <div className="payments-grid">
                            {allPayments
                                .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
                                .map((pago) => (
                                <div key={pago.idPago} className="payment-item">
                                    <h4>Pago de {pago.mes}</h4>
                                    <p><strong>Usuario:</strong> {pago.user?.nombreCompleto || 'N/A'}</p>
                                    <p><strong>RUT:</strong> {pago.user?.rut ? formatRut(pago.user.rut) : 'N/A'}</p>
                                    <p><strong>Monto:</strong> ${pago.monto?.toLocaleString('es-CL') || 'N/A'}</p>
                                    <p><strong>Fecha:</strong> {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-CL') : 'N/A'}</p>
                                    <p><strong>Método:</strong> {pago.metodo || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Pagos;
