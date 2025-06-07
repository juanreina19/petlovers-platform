// src/hooks/useAuth.js
import { useContext } from 'react';
// IMPORTACIÓN NOMBRADA DE AuthContext (CON LLAVES)
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};