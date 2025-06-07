// src/pages/Auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Asegúrate de que useAuth contenga la lógica de registro
import LoadingSpinner from '../../components/LoadingSpinner'; // Asegúrate de que este componente exista

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState(''); // Para la confirmación de la contraseña en frontend
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth(); // Asume que 'register' es una función de tu AuthContext/hook
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar cualquier error previo
        setLoading(true);

        // --- VALIDACIÓN DE CONFIRMACIÓN DE CONTRASEÑA EN EL FRONTEND ---
        if (password === '' || password2 === '' || username === '' || email === '') {
            setError('Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }

        if (password !== password2) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        // Si las contraseñas coinciden y los campos están llenos,
        // procedemos a llamar a la función de registro enviando solo
        // username, email y la PRIMERA contraseña (password) al backend.
        // El backend espera 'password', no 'password2' ni 'password_confirmation'.
        const { success, error: authError } = await register({
            username,
            email,
            password,
            // NO enviamos password2 al backend, ya que la validación se hizo en el frontend.
            // Si tu backend realmente espera un campo 'password2' o 'password_confirmation',
            // necesitarías volver a incluirlo y asegurarte de que el nombre sea el que el backend espera.
            // PERO según el error que indicas ("This field is required" para username, email, password),
            // lo más probable es que solo espere esos 3.
        });

        if (success) {
            navigate('/'); // Redirige a la página principal después del registro exitoso e inicio de sesión automático
        } else {
            // Manejar errores específicos de la API
            let errorMessage = 'Error al registrar. Inténtalo de nuevo.';
            if (authError) {
                // Aquí, 'authError' podría ser un objeto con los errores de validación del backend
                // como: { username: ["ya existe"], password: ["es demasiado corta"] }
                if (typeof authError === 'object' && authError !== null) {
                    const errorKeys = Object.keys(authError);
                    if (errorKeys.length > 0) {
                        // Intentar obtener el primer mensaje de error de cualquier campo
                        const firstKey = errorKeys[0];
                        errorMessage = `${firstKey.charAt(0).toUpperCase() + firstKey.slice(1)}: ${authError[firstKey][0]}`;
                        // Si hay un error general no asociado a un campo específico
                        if (authError.non_field_errors) {
                            errorMessage = authError.non_field_errors[0];
                        }
                    } else {
                        errorMessage = JSON.stringify(authError); // En caso de un objeto vacío o inesperado
                    }
                } else if (typeof authError === 'string') {
                    errorMessage = authError; // Si el error es una cadena simple
                }
            }
            setError(errorMessage);
        }
        setLoading(false); // Detener el spinner de carga al final de la operación
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Registrarse</h2>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">Nombre de Usuario:</label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password2" className="form-label">Confirmar Contraseña:</label>
                        <input
                            type="password"
                            id="password2"
                            className="form-input"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <LoadingSpinner size="sm" /> : 'Registrarse'}
                    </button>
                </form>
                <p style={styles.loginText}>
                    ¿Ya tienes una cuenta? <Link to="/login" style={styles.loginLink}>Inicia Sesión</Link>
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
        padding: '24px',
        backgroundColor: 'var(--bg-gray-light)',
    },
    card: {
        backgroundColor: 'var(--bg-white)',
        padding: '32px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        color: 'var(--primary-purple)',
        marginBottom: '24px',
        fontSize: '28px',
        fontWeight: 'bold',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    errorMessage: {
        color: 'red',
        marginBottom: '16px',
        fontWeight: '500',
    },
    loginText: {
        marginTop: '20px',
        color: 'var(--text-gray)',
        fontSize: '14px',
    },
    loginLink: {
        color: 'var(--primary-purple)',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s ease',
    },
    loginLinkHover: {
        color: 'var(--primary-purple-dark)',
    },
};

export default RegisterPage;