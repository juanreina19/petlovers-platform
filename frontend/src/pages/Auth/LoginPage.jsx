// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../index.css';

const LoginPage = () => {
    // Mantener el nombre del estado 'username_or_email'
    const [username_or_email, setUsernameOrEmail] = useState(''); // Cambié el setter a setUsernameOrEmail
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { success, error: authError } = await login({
                username_or_email: username_or_email,
                password: password,
            });
            if (success) {
                navigate('/profile');
            } else {
                setError(authError || 'Error de inicio de sesión. Inténtalo de nuevo.');
            }
        } catch (err) {
            console.error('Error inesperado durante el login:', err);
            setError('Ocurrió un error inesperado. Inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Iniciar Sesión</h2>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label htmlFor="username_or_email" style={styles.label}>Nombre de Usuario o Email:</label>
                    <input
                        type="text"
                        id="username_or_email"
                        value={username_or_email} // Usamos el estado correcto
                        onChange={(e) => setUsernameOrEmail(e.target.value)} // Usamos el setter correcto
                        required
                        style={styles.input}
                        disabled={loading}
                    />

                    <label htmlFor="password" style={styles.label}>Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                        disabled={loading}
                    />

                    <button type="submit" className="btn-primary" style={styles.button} disabled={loading}>
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>
                <p style={styles.linkText}>
                    ¿No tienes una cuenta? <Link to="/register" style={styles.link}>Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--color-light-gray)',
    },
    card: {
        backgroundColor: 'var(--color-white)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center',
    },
    title: {
        color: 'var(--color-purple)',
        marginBottom: 'var(--spacing-lg)',
        fontSize: '2rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
    },
    label: {
        textAlign: 'left',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: 'var(--color-dark-gray)',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: 'var(--border-radius)',
        fontSize: '1rem',
    },
    button: {
        marginTop: 'var(--spacing-md)',
        padding: '12px 20px',
        fontSize: '1.1rem',
    },
    errorMessage: {
        color: 'var(--color-red)',
        marginBottom: 'var(--spacing-md)',
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 'var(--spacing-lg)',
        color: 'var(--color-dark-gray)',
    },
    link: {
        color: 'var(--color-purple)',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};

export default LoginPage;