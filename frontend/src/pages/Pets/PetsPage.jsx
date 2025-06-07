// src/Pets/PetsPage.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Usamos Outlet si la ruta principal es un layout

const PetsPage = () => {
    return (
        <div style={styles.pageContainer}>
            <div style={styles.header}>
                <h1 style={styles.title}>Gestión de Mascotas</h1>
                <nav style={styles.nav}>
                    <Link to="/pets/list" style={styles.navLink}>Ver Mascotas</Link>
                    <Link to="/pets/add" style={styles.navLink}>Añadir Mascota</Link>
                </nav>
            </div>
            {/* Outlet renderizará las rutas hijas, como PetList o PetDetail */}
            <div style={styles.contentArea}>
                <Outlet />
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-gray-light)',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        backgroundColor: 'var(--bg-white)',
        padding: '20px 30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '24px',
        textAlign: 'center',
    },
    title: {
        color: 'var(--primary-purple)',
        fontSize: '2.5em',
        marginBottom: '15px',
    },
    nav: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    navLink: {
        color: 'var(--primary-purple)',
        textDecoration: 'none',
        fontSize: '1.1em',
        fontWeight: 'bold',
        padding: '8px 15px',
        borderRadius: 'var(--border-radius-sm)',
        transition: 'background-color 0.3s ease',
    },
    navLinkHover: {
        backgroundColor: 'var(--primary-purple-light)',
    },
    contentArea: {
        flexGrow: 1, // Ocupa el espacio restante
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Alinea el contenido arriba
        paddingTop: '20px', // Espacio para el contenido debajo del header
    }
};

export default PetsPage;