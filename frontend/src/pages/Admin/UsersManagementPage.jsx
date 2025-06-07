// src/pages/Admin/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usersAPI } from '../../api'; // Asegúrate de que esta ruta sea correcta
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/TableStyles.css'; // Asume que tienes estilos para tablas

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [pendingChanges, setPendingChanges] = useState({}); // Para almacenar cambios de rol temporales

    const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Roles disponibles en tu sistema. AJUSTA ESTO SEGÚN LOS ROLES DE TU BACKEND.
    // Podrías cargarlos dinámicamente desde una API si tienes un endpoint para roles.
    const ROLES = [
        { id: 'Administrador', name: 'Administrador' },
        { id: 'Cliente', name: 'Cliente' },
        // Agrega cualquier otro rol que manejes
    ];

    // Control de acceso y carga inicial de usuarios
    useEffect(() => {
        if (authLoading) return; // Esperar a que la autenticación cargue

        // Redirigir si no está autenticado o no es administrador
        if (!isAuthenticated || currentUser?.role !== 'Administrador') {
            console.warn('Acceso denegado: Intento de acceso a Gestión de Usuarios sin permisos.');
            navigate('/login'); // O a una página de acceso denegado
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await usersAPI.getUsers();
                setUsers(response.data);
            } catch (err) {
                console.error('Error al cargar usuarios:', err.response?.data || err.message);
                setError('No se pudieron cargar los usuarios.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAuthenticated, currentUser, authLoading, navigate]);

    // Manejar cambio en el selector de rol
    const handleRoleChange = (userId, newRoleId) => {
        setPendingChanges(prev => ({
            ...prev,
            [userId]: newRoleId,
        }));
    };

    // Asignar rol a un usuario
    const handleAssignRole = async (userId) => {
        const newRole = pendingChanges[userId];
        if (!newRole) {
            setError('Por favor, selecciona un rol para asignar.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // El backend espera 'roleData' como { role: 'NuevoRol' }
            await usersAPI.assignRole(userId, { role_name: newRole });
            setSuccessMessage(`Rol de usuario actualizado con éxito para el usuario ID: ${userId}`);

            // Actualizar el rol en la lista de usuarios en el estado local
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role_name: newRole } : user
                )
            );
            // Limpiar el cambio pendiente para este usuario
            setPendingChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[userId];
                return newChanges;
            });

        } catch (err) {
            console.error('Error al asignar rol:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Error desconocido al asignar rol.';
            setError(`Error al asignar rol: ${errorMessage}`);
        } finally {
            setLoading(false);
            // Limpiar mensajes después de un tiempo
            setTimeout(() => {
                setSuccessMessage('');
                setError('');
            }, 3000);
        }
    };

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    // Si el usuario no es administrador (y ya no está cargando), no renderizamos nada
    // El useEffect se encargará de la redirección.
    if (!isAuthenticated || currentUser?.role !== 'Administrador') {
        return null;
    }

    return (
        <div className="admin-page-container">
            <h1 className="admin-page-title">Gestión de Usuarios</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre de Usuario</th>
                            <th>Email</th>
                            <th>Rol Actual</th>
                            <th>Asignar Nuevo Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6">No hay usuarios registrados.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <select
                                            value={pendingChanges[user.id] || user.role} // Muestra el cambio pendiente o el rol actual
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="select-role"
                                            // No permitir cambiar el propio rol si es admin
                                            disabled={user.id === currentUser.id && user.role === 'Administrador'}
                                        >
                                            {ROLES.map(role => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        {/* Solo mostrar el botón si hay un cambio pendiente para este usuario */}
                                        {pendingChanges[user.id] && pendingChanges[user.id] !== user.role && (
                                            <button
                                                onClick={() => handleAssignRole(user.id)}
                                                className="btn btn-primary btn-sm"
                                                disabled={loading} // Deshabilitar si ya está cargando otra acción
                                            >
                                                Guardar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;