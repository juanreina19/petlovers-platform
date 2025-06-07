// src/Reservations/AdminReservationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ruta corregida
import { reservationsAPI } from '../../api'; // Importa la nueva API de reservas

const AdminReservationsPage = () => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Para mensajes de éxito/error en operaciones

    const isAdmin = isAuthenticated && user && user.role === 'Administrador';

    const fetchReservations = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await reservationsAPI.getAllReservations();
            setReservations(response.data);
        } catch (err) {
            console.error('Error al cargar reservas para administración:', err.response?.data || err.message);
            const errMsg = err.response?.data?.detail || err.response?.data?.message || 'No se pudieron cargar las reservas.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (!isAdmin) {
            console.warn('Acceso denegado. Redirigiendo a /login. User:', user);
            navigate('/login');
            return;
        }

        fetchReservations();
    }, [isAdmin, authLoading, navigate, user]);

    const handleUpdateStatus = async (reservationId, newStatusId, currentPetName) => {
        if (!isAdmin) {
            alert('No tienes permisos para actualizar el estado de las reservas.');
            return;
        }

        try {
            // Obtener la reserva actual para no perder los campos que no se envían
            const currentReservationResponse = await reservationsAPI.getReservation(reservationId);
            const currentReservation = currentReservationResponse.data;

            const dataToUpdate = {
                pet_id: currentReservation.pet.id, // Requerido por el serializer en PUT
                start_date: currentReservation.start_date, // Requerido
                end_date: currentReservation.end_date,     // Requerido
                observations: currentReservation.observations, // Requerido
                status_id: newStatusId,
            };

            await reservationsAPI.updateReservation(reservationId, dataToUpdate);
            setMessage(`Estado de la reserva para ${currentPetName} actualizado con éxito.`);
            fetchReservations(); // Recargar lista
        } catch (err) {
            console.error('Error al actualizar estado de reserva:', err.response?.data || err.message);
            const errMsg = err.response?.data?.detail || err.response?.data?.message || JSON.stringify(err.response?.data) || 'No se pudo actualizar el estado.';
            setError(`Error al actualizar estado: ${errMsg}`);
        }
    };

    const handleDelete = async (reservationId, petName) => {
        if (!isAdmin) {
            alert('No tienes permisos para eliminar reservas.');
            return;
        }
        if (window.confirm(`¿Estás seguro de que quieres eliminar la reserva de "${petName}"?`)) {
            try {
                await reservationsAPI.deleteReservation(reservationId);
                setMessage(`Reserva para ${petName} eliminada con éxito.`);
                fetchReservations(); // Recargar lista
            } catch (err) {
                console.error('Error al eliminar reserva:', err.response?.data || err.message);
                const errMsg = err.response?.data?.detail || err.response?.data?.message || 'No se pudo eliminar la reserva.';
                setError(`Error al eliminar: ${errMsg}`);
            }
        }
    };

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando reservas para administración...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    if (!reservations.length && !loading) {
        return <div style={styles.noDataMessage}>No hay reservas para administrar.</div>;
    }

    return (
        <div style={styles.adminContainer}>
            <div style={styles.header}>
                <h2 style={styles.title}>Administración de Reservas</h2>
                <Link to="/reservations/add" className="btn btn-primary" style={styles.addButton}>
                    Crear Nueva Reserva
                </Link>
                <Link to="/reservations/analytics" className="btn btn-secondary" style={styles.analyticsButton}>
                    Ver Analíticas
                </Link>
            </div>
            {message && <p style={styles.successMessage}>{message}</p>}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Mascota</th>
                            <th>Usuario Dueño</th>
                            <th>Estado</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(reservation => (
                            <tr key={reservation.id}>
                                <td>{reservation.pet ? reservation.pet.name : 'N/A'}</td>
                                <td>{reservation.pet && reservation.pet.owner ? reservation.pet.owner.username : 'N/A'}</td>
                                <td>{reservation.status ? reservation.status.name : 'N/A'}</td>
                                <td>{reservation.start_date}</td>
                                <td>{reservation.end_date}</td>
                                <td>{reservation.observations || 'N/A'}</td>
                                <td style={styles.actionsCell}>
                                    <Link to={`/reservations/edit/${reservation.id}`} className="btn btn-edit" style={styles.actionBtn}>
                                        Editar
                                    </Link>
                                    {/* Botones de acción rápida para administradores */}
                                    {reservation.status && reservation.status.name === 'Pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(reservation.id, /* ID de estado Aceptado */ 'YOUR_ACCEPTED_STATUS_UUID', reservation.pet.name)}
                                            className="btn btn-approve"
                                            style={styles.actionBtn}
                                        >
                                            Aprobar
                                        </button>
                                    )}
                                    {reservation.status && reservation.status.name !== 'Cancelled' && (
                                        <button
                                            onClick={() => handleUpdateStatus(reservation.id, /* ID de estado Cancelado */ 'YOUR_CANCELLED_STATUS_UUID', reservation.pet.name)}
                                            className="btn btn-reject"
                                            style={styles.actionBtn}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(reservation.id, reservation.pet ? reservation.pet.name : 'Reserva')}
                                        className="btn btn-delete"
                                        style={styles.actionBtn}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    adminContainer: {
        width: '100%',
        maxWidth: '1400px',
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        margin: '20px auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
    },
    title: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        margin: 0,
    },
    addButton: {
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.95em',
        transition: 'background-color 0.2s ease',
        marginLeft: '10px',
    },
    analyticsButton: {
        backgroundColor: '#0cc600', // Un color diferente para analíticas
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.95em',
        transition: 'background-color 0.2s ease',
        marginLeft: '10px',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    },
    'table th': {
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        padding: '12px 15px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
    },
    'table td': {
        padding: '10px 15px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'middle',
    },
    'table tr': {
        backgroundColor: 'var(--bg-white)',
    },
    actionsCell: {
        display: 'flex',
        gap: '5px', // Espacio entre botones
        flexWrap: 'wrap', // Permite que los botones se envuelvan si hay muchos
    },
    actionBtn: {
        padding: '6px 10px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.85em',
        transition: 'background-color 0.2s ease',
        border: 'none',
        cursor: 'pointer',
    },
    'table .btn-edit': {
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
    },
    'table .btn-approve': {
        backgroundColor: '#28a745', // Verde para aprobar
        color: 'white',
    },
    'table .btn-reject': {
        backgroundColor: '#ffc107', // Amarillo/Naranja para cancelar/rechazar
        color: 'white',
    },
    'table .btn-delete': {
        backgroundColor: '#dc3545',
        color: 'white',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)',
        fontSize: '1.2em',
        color: '#555',
    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)',
        fontSize: '1.2em',
        color: 'red',
        textAlign: 'center',
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 20px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '20px',
        border: '1px solid #c3e6cb',
        textAlign: 'center',
    },
    noDataMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1.1em',
        marginTop: '50px',
    },
};

export default AdminReservationsPage;