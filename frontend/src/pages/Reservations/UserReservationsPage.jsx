// src/Reservations/UserReservationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ruta corregida
import { reservationsAPI } from '../../api'; // Importa la API de reservas

const UserReservationsPage = () => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Para mensajes de éxito/error en operaciones

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            console.warn('Usuario no autenticado. Redirigiendo a /login.');
            navigate('/login');
            return;
        }

        const fetchUserReservations = async () => {
            setLoading(true);
            setError('');
            setMessage('');
            try {
                const response = await reservationsAPI.getUserReservations(); // Obtiene solo las reservas del usuario
                setReservations(response.data);
            } catch (err) {
                console.error('Error al cargar mis reservas:', err.response?.data || err.message);
                const errMsg = err.response?.data?.detail || err.response?.data?.message || 'No se pudieron cargar tus reservas.';
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchUserReservations();
    }, [isAuthenticated, authLoading, navigate, user]);

    const handleDelete = async (reservationId, petName) => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para eliminar reservas.');
            navigate('/login');
            return;
        }
        if (window.confirm(`¿Estás seguro de que quieres eliminar la reserva de "${petName}"?`)) {
            try {
                await reservationsAPI.deleteReservation(reservationId);
                setMessage(`Reserva para ${petName} eliminada con éxito.`);
                // Recargar lista después de eliminar
                setReservations(prevReservations => prevReservations.filter(res => res.id !== reservationId));
            } catch (err) {
                console.error('Error al eliminar reserva:', err.response?.data || err.message);
                const errMsg = err.response?.data?.detail || err.response?.data?.message || 'No se pudo eliminar la reserva.';
                setError(`Error al eliminar: ${errMsg}`);
            }
        }
    };

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando mis reservas...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    if (!reservations.length && !loading) {
        return <div style={styles.noDataMessage}>No tienes reservas registradas todavía.</div>;
    }

    return (
        <div style={styles.userReservationsContainer}>
            <div style={styles.header}>
                <h2 style={styles.title}>Mis Reservas</h2>
                <Link to="/reservations/add" className="btn btn-primary" style={styles.addReservationButton}>
                    Crear Nueva Reserva
                </Link>
            </div>
            {message && <p style={styles.successMessage}>{message}</p>}
            <div style={styles.reservationsGrid}>
                {reservations.map(reservation => (
                    <div key={reservation.id} className="card" style={styles.reservationCard}>
                        <h3 style={styles.cardTitle}>Reserva para: {reservation.pet ? reservation.pet.name : 'N/A'}</h3>
                        <p style={styles.cardText}><strong>Estado:</strong> {reservation.status ? reservation.status.name : 'N/A'}</p>
                        <p style={styles.cardText}><strong>Inicio:</strong> {reservation.start_date}</p>
                        <p style={styles.cardText}><strong>Fin:</strong> {reservation.end_date}</p>
                        <p style={styles.cardText}><strong>Observaciones:</strong> {reservation.observations || 'Ninguna'}</p>
                        <div style={styles.cardActions}>
                            <Link to={`/reservations/edit/${reservation.id}`} className="btn btn-edit" style={styles.actionButton}>
                                Editar
                            </Link>
                            <button
                                onClick={() => handleDelete(reservation.id, reservation.pet ? reservation.pet.name : 'Reserva')}
                                className="btn btn-delete"
                                style={styles.actionButton}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    userReservationsContainer: {
        width: '100%',
        maxWidth: '1200px',
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
    addReservationButton: {
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
    },
    reservationsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    reservationCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    cardTitle: {
        color: 'var(--primary-purple)',
        fontSize: '1.4em',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
    },
    cardText: {
        color: 'var(--text-dark)',
        fontSize: '1em',
        marginBottom: '8px',
    },
    cardActions: {
        marginTop: '15px',
        display: 'flex',
        gap: '10px',
    },
    actionButton: {
        padding: '8px 12px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease',
        border: 'none',
        cursor: 'pointer',
    },
    'cardActions .btn-edit': {
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
    },
    'cardActions .btn-delete': {
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

export default UserReservationsPage;