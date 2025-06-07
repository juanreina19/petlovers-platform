// src/pages/Auth/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProfilePage = () => {
    const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
    const location = useLocation();
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        username: '',// Solo para mostrar, no editable directamente aquí
        role: '',
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Determina la sub-ruta activa para el menú lateral
    const getNavLinkClass = (path) => {
        return location.pathname === path
            ? 'profile-sidebar-link active' // Clases CSS para enlace activo
            : 'profile-sidebar-link';      // Clases CSS para enlace normal
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (isAuthenticated && user) {
                setLoadingProfile(true);
                setError('');
                try {
                    // Ya el AuthContext hace un getProfile al inicio, pero si queremos recargar:
                    const response = await authAPI.getProfile();
                    setProfileData({
                        first_name: response.data.first_name || '',
                        last_name: response.data.last_name || '',
                        email: response.data.email || '',
                        username: response.data.username || ''
                    });
                } catch (err) {
                    console.error("Error al cargar datos del perfil:", err);
                    setError("No se pudo cargar la información del perfil.");
                } finally {
                    setLoadingProfile(false);
                }
            } else if (!isAuthenticated && !authLoading) {
                // Si no está autenticado y ya no está cargando AuthContext, no hay perfil que mostrar
                setLoadingProfile(false);
            }
        };

        // Solo carga el perfil si la ruta actual es /profile (la base)
        // o si es la primera carga y aún no tenemos los datos.
        if (location.pathname === '/profile' || (isAuthenticated && !user && !authLoading)) {
            fetchProfile();
        } else if (!isAuthenticated && !authLoading) {
            // Si no está autenticado y AuthContext terminó de cargar, y no es la ruta base,
            // no hay necesidad de cargar el perfil.
            setLoadingProfile(false);
        }
    }, [isAuthenticated, user, authLoading, location.pathname]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoadingProfile(true); // Usamos loadingProfile para el estado de guardado también
        setError('');
        setSuccess('');

        try {
            const { success: updateSuccess, error: updateError } = await updateProfile(profileData);
            if (updateSuccess) {
                setSuccess('¡Perfil actualizado con éxito!');
                setIsEditing(false); // Sale del modo edición
            } else {
                setError(updateError || 'Error al actualizar el perfil.');
            }
        } catch (err) {
            console.error("Error al guardar perfil:", err);
            setError("Error en la conexión o el servidor.");
        } finally {
            setLoadingProfile(false);
        }
    };

    if (authLoading || loadingProfile) {
        return (
            <div style={styles.loadingContainer}>
                <LoadingSpinner size="xl" />
                <p style={styles.loadingText}>Cargando información del perfil...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Si no está autenticado después de la carga, ProtectedRoute ya debería haber redirigido.
        // Esto es un fallback, pero no debería ejecutarse si ProtectedRoute funciona bien.
        return <p style={styles.errorMessage}>Debes iniciar sesión para ver tu perfil.</p>;
    }


    return (
        <div style={styles.pageContainer}>
            <div style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>Configuración de Perfil</h3>
                <Link to="/profile" className={getNavLinkClass('/profile')}>
                    Información General
                </Link>
                <Link to="/profile/change-password" className={getNavLinkClass('/profile/change-password')}>
                    Cambiar Contraseña
                </Link>
                {/* Aquí se podrían añadir más enlaces de seguridad o configuración */}
            </div>

            <div style={styles.contentArea}>
                {error && <p style={styles.errorMessage}>{error}</p>}
                {success && <p style={styles.successMessage}>{success}</p>}

                {/* <Outlet /> renderizará los componentes hijos de /profile/ */}
                {/* Si la ruta es /profile, renderizamos el formulario de perfil, si es /profile/change-password, Outlet renderiza ChangePasswordPage */}
                {location.pathname === '/profile' ? (
                    <div className="card" style={styles.profileCard}>
                        <h2 style={styles.sectionTitle}>Información General</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">Nombre de Usuario (no editable):</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-input"
                                    value={profileData.username}
                                    disabled={true} // El username no se puede cambiar desde aquí
                                    style={{ backgroundColor: 'var(--bg-gray-light)', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="first_name" className="form-label">Nombre:</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    className="form-input"
                                    value={profileData.first_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name" className="form-label">Apellido:</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    className="form-input"
                                    value={profileData.last_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    value={profileData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div style={styles.buttonsContainer}>
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Editar Perfil
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loadingProfile}
                                        >
                                            {loadingProfile ? <LoadingSpinner size="sm" /> : 'Guardar Cambios'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Restaurar datos originales si cancela
                                                setProfileData({
                                                    first_name: user?.first_name || '',
                                                    last_name: user?.last_name || '',
                                                    email: user?.email || '',
                                                    username: user?.username || ''
                                                });
                                                setError(''); // Limpiar errores al cancelar
                                            }}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    // Si la ruta es una sub-ruta (ej. /profile/change-password), Outlet renderiza el componente
                    <Outlet context={{ user, updateProfile }} /> // Pasar contexto a las sub-rutas
                )}
            </div>
        </div>
    );
};

const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: 'var(--bg-gray-light)',
    },
    loadingText: {
        marginTop: '16px',
        fontSize: '18px',
        color: 'var(--text-dark)',
    },
    pageContainer: {
        display: 'flex',
        gap: '32px',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap', // Permite que se envuelva en pantallas pequeñas
    },
    sidebar: {
        flex: '0 0 250px', // Ancho fijo para la barra lateral
        padding: '24px',
        background: 'var(--bg-white)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        height: 'fit-content', // Para que no ocupe toda la altura si el contenido es corto
    },
    sidebarTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'var(--text-dark)',
        marginBottom: '24px',
    },
    contentArea: {
        flex: '1', // Ocupa el espacio restante
        minWidth: 'calc(70% - 32px)', // Asegura que no se haga demasiado pequeña
        maxWidth: '800px',
    },
    profileCard: { // Usa la clase .card definida en index.css
        // Estilos específicos si ProfilePage renderiza el formulario directamente
        padding: '32px',
    },
    sectionTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: 'var(--text-dark)',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
    },
    errorMessage: {
        color: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid red',
        padding: '12px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '20px',
        fontWeight: '500',
    },
    successMessage: {
        color: 'var(--primary-purple-dark)',
        backgroundColor: 'var(--pale-pink)', // Cambiamos el color para que no sea solo verde
        border: '1px solid var(--primary-purple-light)',
        padding: '12px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '20px',
        fontWeight: '500',
    },
    buttonsContainer: {
        marginTop: '24px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end', // Alinea los botones a la derecha
    },
};

// Estilos para los enlaces de la barra lateral (deben ir en index.css o un archivo CSS dedicado)
// Ejemplo de cómo se verían en CSS
/*
.profile-sidebar-link {
    display: block;
    padding: 10px 16px;
    margin-bottom: 8px;
    text-decoration: none;
    color: var(--text-dark);
    font-weight: 500;
    border-radius: var(--border-radius-sm);
    transition: all 0.2s ease;
}

.profile-sidebar-link:hover {
    background-color: var(--bg-gray-light);
    color: var(--primary-purple);
}

.profile-sidebar-link.active {
    background-color: var(--primary-purple);
    color: white;
    box-shadow: var(--shadow-sm);
}

.profile-sidebar-link.active:hover {
    background-color: var(--primary-purple-dark);
    color: white;
}
*/

export default ProfilePage;