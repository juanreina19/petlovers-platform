// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Muestra un spinner mientras la autenticación inicial está en curso
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Si no está autenticado, redirige a la página de login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children; // Si está autenticado, renderiza los componentes hijos
};

export default ProtectedRoute;