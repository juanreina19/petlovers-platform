// src/Pets/PetForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { petsAPI } from '../../api';

const PetForm = () => {
    const { petId } = useParams();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        pet_type_id: '', // Cambiado de 'species' a 'pet_type_id'
        animal_breed: '', // Cambiado de 'breed' a 'animal_breed'
        age: '',
        description: '',
        photo: null, // Cambiado de 'image' a 'photo' para coincidir con el modelo
        photoUrl: '', // Cambiado de 'imageUrl' a 'photoUrl'
    });

    const [petTypes, setPetTypes] = useState([]); // Nuevo estado para los tipos de mascota
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isEditMode = !!petId;

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Obtener Tipos de Mascota (siempre necesario para el select)
                const typesResponse = await petsAPI.getPetTypes();
                setPetTypes(typesResponse.data);

                // 2. Si estamos en modo edición, obtener datos de la mascota
                if (isEditMode) {
                    const petResponse = await petsAPI.getPet(petId);
                    const petData = petResponse.data;

                    setFormData({
                        name: petData.name,
                        pet_type_id: petData.pet_type ? petData.pet_type.id : '', // Asegúrate de obtener el ID
                        animal_breed: petData.animal_breed,
                        age: petData.age,
                        description: petData.description,
                        photo: null, // No precargar el archivo, solo la URL
                        photoUrl: petData.photo, // Usar 'photo' para la URL de la imagen
                    });
                }
            } catch (err) {
                console.error('Error al cargar datos o tipos de mascota:', err.response?.data || err.message);
                setError('No se pudieron cargar los datos o tipos de mascota. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, authLoading, navigate, isEditMode, petId]);


    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo' && files && files[0]) { // Cambiado de 'image' a 'photo'
            setFormData(prev => ({ ...prev, photo: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setSubmitting(true);

        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('pet_type_id', formData.pet_type_id); // Enviando pet_type_id
        dataToSend.append('animal_breed', formData.animal_breed); // Enviando animal_breed
        dataToSend.append('age', formData.age);
        dataToSend.append('description', formData.description);

        if (formData.photo) { // Cambiado de 'image' a 'photo'
            dataToSend.append('photo', formData.photo);
        }
        // Si no se selecciona una nueva foto en modo edición, no se envía el campo 'photo' en FormData
        // Esto permite que el backend de DRF no modifique la foto existente en PATCH

        try {
            if (isEditMode) {
                await petsAPI.updatePet(petId, dataToSend);
                setSuccessMessage('Mascota actualizada con éxito!');
            } else {
                await petsAPI.createPet(dataToSend);
                setSuccessMessage('Mascota creada con éxito!');
                setFormData({ // Limpiar el formulario
                    name: '',
                    pet_type_id: '',
                    animal_breed: '',
                    age: '',
                    description: '',
                    photo: null,
                    photoUrl: '',
                });
            }
            setTimeout(() => {
                navigate('/pets/list');
            }, 2000);
        } catch (err) {
            console.error('Error al guardar mascota:', err.response?.data || err.message);
            if (err.response && err.response.data) {
                const errors = err.response.data;
                let errorMessage = 'Error al guardar la mascota. Revise los datos:';

                // Manejo de errores de campo específicos
                if (errors.name) errorMessage += ` Nombre: ${errors.name[0]}`;
                if (errors.pet_type_id) errorMessage += ` Tipo de Mascota: ${errors.pet_type_id[0]}`;
                if (errors.animal_breed) errorMessage += ` Raza: ${errors.animal_breed[0]}`;
                if (errors.age) errorMessage += ` Edad: ${errors.age[0]}`;
                if (errors.description) errorMessage += ` Descripción: ${errors.description[0]}`;
                if (errors.photo) errorMessage += ` Imagen: ${errors.photo[0]}`;
                if (errors.detail) errorMessage += ` ${errors.detail}`;
                if (errors.non_field_errors) errorMessage += ` ${errors.non_field_errors[0]}`;

                // Si no hay errores específicos, o hay errores globales
                if (errorMessage === 'Error al guardar la mascota. Revise los datos:' && Object.keys(errors).length > 0) {
                    // Si Object.values(errors) no es un array de cadenas, es un array de arrays o objetos
                    const genericErrors = Object.values(errors).flat().map(e => {
                        if (typeof e === 'string') return e;
                        // Si es un objeto, intenta acceder a la propiedad 'detail' o 'message'
                        return e.detail || e.message || JSON.stringify(e);
                    }).join('; ');
                    if (genericErrors) {
                        errorMessage += ` ${genericErrors}`;
                    } else {
                        errorMessage += ' Se produjo un error desconocido.';
                    }
                } else if (errorMessage === 'Error al guardar la mascota. Revise los datos:') {
                    errorMessage = 'Error desconocido al guardar la mascota.';
                }
                setError(errorMessage);
            } else {
                setError('Error de conexión con el servidor. Inténtalo de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando formulario...</div>;
    }

    // No mostrar el error si ya estamos intentando enviar el formulario (submitting)
    // El error se mostrará *dentro* del formulario en el return de abajo.
    // Esta condición solo afectaría a un renderizado fuera del formulario, que ya no hacemos.

    return (
        <div style={styles.formContainer}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>{isEditMode ? 'Editar Mascota' : 'Añadir Nueva Mascota'}</h2>
                {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
                {error && <p style={styles.errorMessage}>{error}</p>} {/* Muestra el error dentro del formulario */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pet_type_id" className="form-label">Tipo de Mascota:</label> {/* Cambiado el label */}
                        <select
                            id="pet_type_id"
                            name="pet_type_id"
                            className="form-input"
                            value={formData.pet_type_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un tipo</option>
                            {petTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="animal_breed" className="form-label">Raza:</label> {/* Cambiado el label y el nombre */}
                        <input
                            type="text"
                            id="animal_breed"
                            name="animal_breed"
                            className="form-input"
                            value={formData.animal_breed}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="age" className="form-label">Edad (años):</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            className="form-input"
                            value={formData.age}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description" className="form-label">Descripción:</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-input"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="photo" className="form-label">Foto:</label> {/* Cambiado el label */}
                        {isEditMode && formData.photoUrl && (
                            <div style={styles.currentImageContainer}>
                                <p>Foto actual:</p>
                                <img src={formData.photoUrl} alt="Foto de mascota" style={styles.currentImage} />
                            </div>
                        )}
                        <input
                            type="file"
                            id="photo"
                            name="photo"
                            className="form-input-file"
                            onChange={handleChange}
                        />
                        <p style={styles.imageHint}>Sube una nueva foto para reemplazar la actual (solo en edición).</p>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir Mascota')}
                        </button>
                        <button type="button" onClick={() => navigate('/pets/list')} className="btn btn-secondary">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Estilos (mantenerlos igual)
const styles = {
    formContainer: {
        width: '100%',
        maxWidth: '700px',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px',
    },
    actionButton: {
        minWidth: '150px',
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
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px 20px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '20px',
        border: '1px solid #f5c6cb',
        textAlign: 'center',
    },
    currentImageContainer: {
        marginBottom: '10px',
        textAlign: 'center',
    },
    currentImage: {
        maxWidth: '150px',
        maxHeight: '150px',
        borderRadius: 'var(--border-radius-sm)',
        objectFit: 'cover',
        border: '1px solid var(--border-color)',
        marginTop: '5px',
    },
    imageHint: {
        fontSize: '0.85em',
        color: '#777',
        marginTop: '5px',
    },
};

export default PetForm;