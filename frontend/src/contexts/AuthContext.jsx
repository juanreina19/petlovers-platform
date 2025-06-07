// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Importa axios directamente
import { authAPI } from '../api';

// Define la URL base de tu backend
const BASE_URL = 'http://localhost:8000/api/'; // ASEGÚRATE DE QUE ESTA ES LA URL CORRECTA DE TU BACKEND

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await axios.get(`${BASE_URL}profile/`, {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    });
                    console.log("Datos de perfil obtenidos en initAuth:", response.data);
                    setUser(response.data);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (error) {
                    console.error('Token inválido o expirado al iniciar AuthProvider, cerrando sesión:', error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };
        initAuth();
    }, []);
    const register = async (userData) => { // userData contendrá { username, email, password }
        try {
            const response = await authAPI.register(userData);
            // Asumiendo que el registro exitoso también inicia sesión y devuelve tokens/usuario
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            setUser(response.data.user); // Ajusta según la respuesta de tu backend
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error('Error en el registro:', error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    };

    const login = async (credentials) => {
        try {
            const loginResponse = await axios.post(`${BASE_URL}login/`, credentials, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { token } = loginResponse.data;

            if (!token) {
                throw new Error("No se recibió un token de autenticación válido.");
            }

            localStorage.setItem('authToken', token);

            const profileResponse = await axios.get(`${BASE_URL}profile/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            const userData = profileResponse.data;
            console.log("Datos de perfil obtenidos después del login:", userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Error durante el login o al obtener perfil:', error.response?.data || error.message || error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            return {
                success: false,
                error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Error de inicio de sesión'
            };
        }
    };

    const logout = async () => {
        try {
            // Si tienes un endpoint de logout en el backend que invalida el token
            const token = localStorage.getItem('authToken');
            if (token) {
                await axios.post(`${BASE_URL}logout/`, {}, {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Error al cerrar sesión en el backend:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // === FUNCIÓN UPDATEPROFILE CORREGIDA ===
    const updateProfile = async (profileData) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                return { success: false, error: "No hay token de autenticación disponible." };
            }

            console.log("AuthContext - updateProfile: Enviando datos:", profileData);
            const response = await axios.patch(`${BASE_URL}profile/`, profileData, { // Usamos PATCH
                headers: {
                    Authorization: `Token ${token}`, // Asegúrate de que el prefijo sea 'Token'
                    'Content-Type': 'application/json',
                },
            });

            console.log("AuthContext - updateProfile: Respuesta exitosa:", response.data);

            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser); // Actualiza el usuario en el estado global

            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('AuthContext - Error al actualizar perfil:', error);
            let errorMessage = 'Error al actualizar el perfil.';

            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.non_field_errors) {
                    errorMessage = error.response.data.non_field_errors[0];
                } else if (Object.keys(error.response.data).length > 0) {
                    errorMessage = Object.values(error.response.data).flat().join('; ');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.error('AuthContext - Mensaje de error a mostrar:', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        setUser,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};