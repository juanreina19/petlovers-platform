// src/pages/Auth/ChangePasswordPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { authAPI } from '../../api';

const ChangePasswordPage = () => {
    // Ya no necesitamos 'logout' aquí si no vamos a cerrar sesión automáticamente
    // const { logout } = useContext(AuthContext);
    const { user, setUser } = useContext(AuthContext); // Necesitamos 'user' y 'setUser' para actualizar la sesión en el frontend

    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (newPassword !== confirmNewPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.changePassword({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword,
            });

            // === CAMBIO CLAVE: Mantener sesión y mostrar alerta ===
            setSuccess('¡Contraseña cambiada con éxito!');
            setOldPassword(''); // Limpiar campos del formulario
            setNewPassword('');
            setConfirmNewPassword('');
            setLoading(false);

            // Opcional: Si el backend devuelve los datos actualizados del usuario (sin la contraseña)
            // podrías querer actualizarlos aquí. En este caso, solo mostramos el mensaje.
            // Si tu backend fuerza un nuevo token al cambiar la contraseña, deberías manejarlo
            // recibiendo el nuevo token en la respuesta y actualizando localStorage.
            // Sin embargo, si el token no cambia, la sesión permanece activa.

        } catch (err) {
            console.error('Error al cambiar contraseña:', err.response?.data || err.message);
            setLoading(false);
            if (err.response && err.response.data) {
                const errors = err.response.data;
                if (errors.old_password) {
                    setError(`Contraseña antigua: ${errors.old_password[0]}`);
                } else if (errors.new_password) {
                    setError(`Nueva contraseña: ${errors.new_password[0]}`);
                } else if (errors.confirm_new_password) {
                    setError(`Confirmación: ${errors.confirm_new_password[0]}`);
                } else if (errors.non_field_errors) {
                    setError(errors.non_field_errors[0]);
                } else if (errors.detail) {
                    setError(errors.detail);
                } else if (Object.keys(errors).length > 0) {
                    setError(Object.values(errors).flat().join('; '));
                } else {
                    setError('Error al cambiar la contraseña. Inténtalo de nuevo.');
                }
            } else {
                setError('Error en el servidor. Inténtalo más tarde.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Cambiar Contraseña</h2>
                {/* === Alertas de éxito y error === */}
                {success && <p style={styles.successMessage}>{success}</p>}
                {error && <p style={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="form-group">
                        <label htmlFor="oldPassword" className="form-label">Contraseña Antigua:</label>
                        <input
                            type="password"
                            id="oldPassword"
                            className="form-input"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword" className="form-label">Nueva Contraseña:</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmNewPassword" className="form-label">Confirmar Nueva Contraseña:</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            className="form-input"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Estilos (mantén los que ya tienes, se han añadido los de success/error)
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
        maxWidth: '500px',
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
        color: '#dc3545', // Rojo para errores
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '16px',
        fontWeight: '500',
        border: '1px solid #f5c6cb',
    },
    successMessage: {
        color: '#155724', // Verde oscuro para éxito
        backgroundColor: '#d4edda',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '16px',
        fontWeight: '500',
        border: '1px solid #c3e6cb',
    },
};

export default ChangePasswordPage;