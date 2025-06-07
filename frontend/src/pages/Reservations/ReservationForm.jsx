// src/Reservations/ReservationForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Asegúrate de importar Link
import { useAuth } from '../../contexts/AuthContext';
import { reservationsAPI, petsAPI } from '../../api'; // Importa ambas APIs
import '../../styles/FormStyles.css';

const ReservationForm = () => {
    const { reservationId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const isEditing = !!reservationId;

    const [formData, setFormData] = useState({
        pet_id: '',
        status_id: '',
        start_date: '',
        end_date: '',
        observations: '',
    });
    const [pets, setPets] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isAdmin = isAuthenticated && user && user.role === 'Administrador';

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            console.warn('Usuario no autenticado. Redirigiendo a /login.');
            navigate('/login');
            return;
        }

        const fetchFormData = async () => {
            setLoading(true);
            setError('');
            setSuccessMessage(''); // Limpiar mensajes de éxito/error al cargar

            try {
                // --- CAMBIO AQUÍ: Usar petsAPI.getPets() en lugar de petsAPI.getUserPets() ---
                const petsResponse = await petsAPI.getPets();
                setPets(petsResponse.data);

                if (isAdmin) {
                    const statusesResponse = await reservationsAPI.getReservationStatuses();
                    setStatuses(statusesResponse.data);
                }

                if (isEditing) {
                    const reservationResponse = await reservationsAPI.getReservation(reservationId);
                    const reservationData = reservationResponse.data;

                    if (!isAdmin && reservationData.pet.owner.id !== user.id) {
                        setError('No tienes permiso para editar esta reserva.');
                        setLoading(false);
                        return;
                    }

                    setFormData({
                        pet_id: reservationData.pet.id,
                        status_id: reservationData.status ? reservationData.status.id : '',
                        start_date: reservationData.start_date,
                        end_date: reservationData.end_date,
                        observations: reservationData.observations || '',
                    });
                } else {
                    if (petsResponse.data.length > 0) {
                        setFormData(prev => ({ ...prev, pet_id: petsResponse.data[0].id }));
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos del formulario de reserva:', err.response?.data || err.message);
                const errMsg = err.response?.data?.detail || err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error desconocido al cargar datos.';
                setError(`No se pudieron cargar los datos: ${errMsg}`);
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [reservationId, isEditing, isAuthenticated, user, authLoading, isAdmin, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const dataToSend = { ...formData };

        if (!isAdmin) {
            delete dataToSend.status_id;
        }

        if (dataToSend.start_date === '') dataToSend.start_date = null;
        if (dataToSend.end_date === '') dataToSend.end_date = null;

        try {
            let message;
            if (isEditing) {
                await reservationsAPI.updateReservation(reservationId, dataToSend);
                message = 'Reserva actualizada con éxito!';
            } else {
                await reservationsAPI.createReservation(dataToSend);
                message = 'Reserva creada con éxito!';
                setFormData({
                    pet_id: pets.length > 0 ? pets[0].id : '',
                    status_id: '',
                    start_date: '',
                    end_date: '',
                    observations: '',
                });
            }

            setSuccessMessage(message);
            setTimeout(() => {
                navigate(isAdmin ? '/admin/reservations' : '/my-reservations');
            }, 2000);

        } catch (err) {
            console.error('Error al guardar reserva:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error desconocido al guardar la reserva.';
            setError(`Error al guardar reserva: ${errorMsg}`);
            setLoading(false);
        } finally {
            // Loading se maneja dentro del setTimeout o en el catch
        }
    };

    if (loading) {
        return <div className="form-loading">Cargando formulario de reserva...</div>;
    }

    // Aquí cambiamos la lógica para mostrar el error si no hay éxito.
    // Si hay un mensaje de éxito, no mostramos el error.
    if (error && !successMessage) {
        return <div className="form-error">{error}</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">{isEditing ? 'Editar Reserva' : 'Crear Nueva Reserva'}</h2>

            {successMessage && <p className="form-success-message">{successMessage}</p>}
            {/* Mostrar el error solo si no hay mensaje de éxito */}
            {error && !successMessage && <p className="form-error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                    <label htmlFor="pet_id">Mascota:</label>
                    <select
                        id="pet_id"
                        name="pet_id"
                        value={formData.pet_id}
                        onChange={handleChange}
                        required
                        className="form-select"
                        disabled={isEditing && !isAdmin}
                    >
                        <option value="">-- Selecciona una mascota --</option>
                        {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                                {pet.name}
                            </option>
                        ))}
                    </select>
                    {pets.length === 0 && !loading && (
                        <p className="form-help-text">No tienes mascotas registradas. Por favor, <Link to="/pets/add">añade una mascota</Link> primero.</p>
                    )}
                </div>

                {isAdmin && (
                    <div className="form-group">
                        <label htmlFor="status_id">Estado:</label>
                        <select
                            id="status_id"
                            name="status_id"
                            value={formData.status_id}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">-- Selecciona un estado --</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="start_date">Fecha de Inicio:</label>
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="end_date">Fecha de Fin:</label>
                    <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group full-width">
                    <label htmlFor="observations">Observaciones:</label>
                    <textarea
                        id="observations"
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        rows="4"
                        className="form-textarea"
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="form-submit-button" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Actualizar Reserva' : 'Crear Reserva')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(isAdmin ? '/admin/reservations' : '/my-reservations')}
                        className="form-cancel-button"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReservationForm;