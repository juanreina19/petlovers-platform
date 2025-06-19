// src/Pets/PetDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Ruta corregida
import { petsAPI } from '../../api'; // Ruta corregida

const PetDetail = () => {
    const { petId } = useParams();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (petId) {
            const fetchPet = async () => {
                setLoading(true);
                setError('');
                try {
                    // Llamada a la API para obtener el detalle de una mascota
                    const response = await petsAPI.getPet(petId);
                    setPet(response.data);
                } catch (err) {
                    console.error('Error al cargar detalle de mascota:', err.response?.data || err.message);
                    setError('No se pudo cargar la mascota. Inténtalo de nuevo más tarde.');
                } finally {
                    setLoading(false);
                }
            };
            fetchPet();
        }
    }, [isAuthenticated, authLoading, navigate, petId]);

    const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${pet.name}?`)) {
            try {
                await petsAPI.deletePet(petId);
                setDeleteMessage('Mascota eliminada con éxito. Redirigiendo...');
                setTimeout(() => {
                    navigate('/pets/list');
                }, 2000);
            } catch (err) {
                console.error('Error al eliminar mascota:', err.response?.data || err.message);
                setError('No se pudo eliminar la mascota.');
            }
        }
    };

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando detalles de mascota...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    if (!pet) {
        return <div style={styles.noPetMessage}>No se encontró la mascota.</div>;
    }

    return (
        <div style={styles.detailContainer}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Detalles de {pet.name}</h2>
                {deleteMessage && <p style={styles.successMessage}>{deleteMessage}</p>}
                <div style={styles.petDetailContent}>
                    <img src={pet.image} alt={pet.name} style={styles.petDetailImage} />
                    <div style={styles.petInfoGroup}>
                        <p style={styles.detailText}><strong>Especie:</strong> {pet.pet_type.name}</p>
                        <p style={styles.detailText}><strong>Raza:</strong> {pet.animal_breed}</p>
                        <p style={styles.detailText}><strong>Edad:</strong> {pet.age} años</p>
                        <p style={styles.detailText}><strong>Descripción:</strong> {pet.description}</p>
                    </div>
                </div>
                <div style={styles.buttonGroup}>
                    <Link to={`/pets/edit/${pet.id}`} className="btn btn-primary" style={styles.actionButton}>
                        Editar Mascota
                    </Link>
                    <button onClick={handleDelete} className="btn btn-secondary" style={styles.deleteButton}>
                        Eliminar Mascota
                    </button>
                    <Link to="/pets/list" className="btn btn-secondary" style={styles.backButton}>
                        Volver a la lista
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Estilos (mantenerlos igual)
const styles = {
    detailContainer: {
        width: '100%',
        maxWidth: '800px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    card: {
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        textAlign: 'center',
    },
    title: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        marginBottom: '25px',
    },
    petDetailContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '25px',
    },
    petDetailImage: {
        width: '250px',
        height: '250px',
        borderRadius: 'var(--border-radius)',
        objectFit: 'cover',
        border: '2px solid var(--border-color)',
    },
    petInfoGroup: {
        textAlign: 'left',
        width: '100%',
        maxWidth: '400px',
    },
    detailText: {
        color: 'var(--text-dark)',
        fontSize: '1.1em',
        marginBottom: '10px',
        lineHeight: '1.5',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px',
    },
    actionButton: {
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
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 'var(--border-radius-sm)',
        fontWeight: 'bold',
        fontSize: '1em',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    backButton: {
        backgroundColor: '#e1dfe1',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
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
    noPetMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1.1em',
        marginTop: '50px',
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
};

export default PetDetail;