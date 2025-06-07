// src/Pets/PetList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Ruta corregida: desde src/Pets/ subes a src/, luego bajas a hooks/
import { petsAPI } from '../../api'; // Ruta corregida: desde src/Pets/ subes a src/, luego bajas a api/ (donde está api.js)

const PetList = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Espera a que termine la carga de autenticación antes de verificarla
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login'); // Redirige si no está autenticado
            return;
        }

        const fetchPets = async () => {
            setLoading(true);
            setError('');
            try {
                // Aquí usamos la petsAPI real
                const response = await petsAPI.getPets();
                setPets(response.data);
            } catch (err) {
                console.error('Error al cargar mascotas:', err.response?.data || err.message);
                setError('No se pudieron cargar las mascotas. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchPets(); // Llama a la función de obtención de datos
    }, [isAuthenticated, authLoading, navigate]); // Dependencias

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando mascotas...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    return (
        <div style={styles.listContainer}>
            <div style={styles.listHeader}>
                <h2 style={styles.listTitle}>Nuestras Mascotas</h2>
                <Link to="/pets/add" className="btn btn-primary" style={styles.addButton}>
                    Añadir Nueva Mascota
                </Link>
            </div>
            {pets.length === 0 ? (
                <p style={styles.noPetsMessage}>No hay mascotas registradas todavía.</p>
            ) : (
                <div style={styles.petsGrid}>
                    {pets.map(pet => (
                        <div key={pet.id} className="card" style={styles.petCard}>
                            <img src={pet.image} alt={pet.name} style={styles.petImage} />
                            <div style={styles.petCardContent}>
                                <h3 style={styles.petName}>{pet.name}</h3>
                                <p style={styles.petInfo}>{pet.species} - {pet.breed}</p>
                                <p style={styles.petInfo}>{pet.age} años</p>
                                <Link to={`/pets/${pet.id}`} className="btn btn-secondary" style={styles.viewDetailButton}>
                                    Ver Detalles
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Estilos (mantenerlos igual)
const styles = {
    listContainer: {
        width: '100%',
        maxWidth: '1200px',
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
    },
    listTitle: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        margin: 0,
    },
    addButton: {
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
    petsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
    },
    petCard: {
        backgroundColor: 'var(--bg-white)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        textAlign: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    petImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        borderBottom: '1px solid var(--border-color)',
    },
    petCardContent: {
        padding: '15px',
    },
    petName: {
        color: 'var(--text-dark)',
        fontSize: '1.5em',
        marginBottom: '10px',
    },
    petInfo: {
        color: '#666',
        fontSize: '0.9em',
        marginBottom: '5px',
    },
    viewDetailButton: {
        display: 'inline-block',
        marginTop: '15px',
        backgroundColor: 'var(--secondary-color)',
        color: 'purple',
        border: 'none',
        padding: '8px 15px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease',
    },
    noPetsMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1.1em',
        marginTop: '50px',
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
};

export default PetList;