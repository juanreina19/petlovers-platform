// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => { // No necesita children props si usas Outlet
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div>Cargando autenticación...</div>;
    }

    // AHORA ESTAMOS SEGUROS DE QUE 'user' contendrá la propiedad 'role'
    // Asegúrate de que el valor 'admin' coincida con lo que tu backend envía
    const isAdmin = isAuthenticated && user && user.role === 'Administrador';
    // O si tu backend usa 'is_staff':
    // const isAdmin = isAuthenticated && user && user.is_staff;
    // O si usa 'is_superuser':
    // const isAdmin = isAuthenticated && user && user.is_superuser;


    if (isAdmin) {
        return <Outlet />; // Renderiza el componente anidado
    } else if (isAuthenticated && !isAdmin) {
        // Autenticado pero no admin
        console.warn('Acceso denegado: Usuario autenticado pero no es administrador.');
        return <Navigate to="/dashboard" replace />; // O a una página de "acceso denegado"
    } else {
        // No autenticado
        console.warn('Acceso denegado: Usuario no autenticado. Redirigiendo a login.');
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;