// src/pages/Admin/AdminDashboardPage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
// import '../../styles/AdminDashboard.css'; // Asume que crearás este archivo CSS

const AdminDashboardPage = () => {
    const { user, loading, isAuthenticated } = useAuth(); // Obtén isAuthenticated
    const navigate = useNavigate();

    // Lógica para asegurar que solo los administradores accedan
    useEffect(() => {
        if (!loading) { // Una vez que la autenticación haya cargado
            // Si no está autenticado o el rol no es 'Administrador', redirige
            if (!isAuthenticated || user?.role !== 'Administrador') {
                console.warn('Acceso denegado: Intento de acceso a Admin Dashboard sin permisos.');
                navigate('/'); // Redirige a la página principal o a una página de acceso denegado
            }
        }
    }, [isAuthenticated, user, loading, navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Si el usuario no es administrador (y ya no está cargando), no renderizamos nada
    // El useEffect se encargará de la redirección.
    if (!user || user.role !== 'Administrador') {
        return null; // O podrías renderizar un mensaje de "Acceso denegado" si lo prefieres
    }

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Panel de Administración</h1>
                <h2 style={styles.welcomeMessage}>Bienvenido, {user.username}</h2>
                <p style={styles.description}>
                    Desde aquí puedes gestionar las diferentes secciones de tu aplicación.
                </p>
                <div style={styles.linksGrid}>
                    <Link to="/admin/users" style={styles.linkButton}>
                        Gestionar Usuarios
                    </Link>
                    <Link to="/admin/pets" style={styles.linkButton}>
                        Gestionar Mascotas
                    </Link>
                    <Link to="/admin/reservations" style={styles.linkButton}>
                        Gestionar Reservas
                    </Link>
                    <Link to="/admin/products" style={styles.linkButton}>
                        Gestionar Productos
                    </Link>
                    {/* Puedes añadir más enlaces aquí, por ejemplo, para analíticas, tipos de mascota, etc. */}
                    <Link to="/admin/pet-types" style={styles.linkButton}>
                        Tipos de Mascotas
                    </Link>
                    <Link to="/admin/reservation-statuses" style={styles.linkButton}>
                        Estados de Reserva
                    </Link>
                    <Link to="/admin/analytics" style={styles.linkButton}>
                        Ver Analíticas
                    </Link>
                </div>
            </div>
        </div>
    );
};

// --- Estilos CSS en línea (para este ejemplo, se recomienda usar un archivo CSS separado) ---
const styles = {
    dashboardContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)', // Ajusta según tu header/footer
        padding: '24px',
        backgroundColor: 'var(--bg-gray-light)',
    },
    card: {
        backgroundColor: 'var(--bg-white)',
        padding: '40px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '800px',
        textAlign: 'center',
    },
    title: {
        color: 'var(--primary-purple)',
        marginBottom: '15px',
        fontSize: '2.5em',
        fontWeight: 'bold',
    },
    welcomeMessage: {
        color: 'var(--text-dark)',
        marginBottom: '25px',
        fontSize: '1.5em',
    },
    description: {
        color: 'var(--text-gray)',
        marginBottom: '35px',
        fontSize: '1.1em',
        lineHeight: '1.6',
    },
    linksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        justifyContent: 'center',
    },
    linkButton: {
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        padding: '20px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.1em',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80px',
    },
    linkButtonHover: {
        backgroundColor: 'var(--primary-purple-dark)',
        transform: 'translateY(-3px)',
    },
};

export default AdminDashboardPage;