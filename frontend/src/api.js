// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const BASE_DOMAIN_URL = 'http://localhost:8000';

// Configuración de Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json', // Default for most JSON requests
    },
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejo de respuestas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/login/', credentials),
    register: (userData) => api.post('/register/', userData),
    logout: () => api.post('/logout/'),
    getProfile: (config = {}) => api.get('profile/', config),
    updateProfile: (data) => api.put('/profile/', data), // Make sure your Django backend supports PUT for profile updates, otherwise use PATCH.
    changePassword: (data) => api.post('/change-password/', data),
};

// Users API (Admin)
export const usersAPI = {
    getUsers: () => api.get('/admin/users/'),
    assignRole: (userId, roleData) => api.post(`/admin/users/${userId}/assign-role/`, roleData),
};

// --- Pets API (Adjusted for image upload) ---
export const petsAPI = {
    getPets: () => api.get('/pets/'),
    getPet: (id) => api.get(`/pets/${id}/`),
    createPet: (data) => api.post('/pets/', data, {
        headers: {
            'Content-Type': 'multipart/form-data', // Explicitly set for file uploads
        },
    }),
    updatePet: (id, data) => api.patch(`/pets/${id}/`, data, { // Changed to PATCH for partial updates, more common for forms
        headers: {
            'Content-Type': 'multipart/form-data', // Explicitly set for file uploads
        },
    }),
    deletePet: (id) => api.delete(`/pets/${id}/`),
    getPetTypes: () => api.get('/pet-types/'),
};

// Reservations API
export const reservationsAPI = {
    // Endpoints para Reservation
    getAllReservations: () => api.get('/reservations/'), // Para administradores
    getUserReservations: () => api.get('/reservations/'), // Para usuarios (filtrado por el backend)
    getReservation: (id) => api.get(`/reservations/${id}/`),
    createReservation: (data) => api.post('/reservations/', data),
    updateReservation: (id, data) => api.put(`/reservations/${id}/`, data), // Puede ser PUT o PATCH
    deleteReservation: (id) => api.delete(`/reservations/${id}/`),

    // Endpoints para ReservationStatus
    getReservationStatuses: () => api.get('/reservation-statuses/'),

    // Endpoints para Analíticas
    getReservationsAnalytics: () => api.get('/reservations/analytics/'), // Ajusta este endpoint a tu URL real
};

// Products API
export const productsAPI = { // Renombrado de storeAPI a productsAPI
    getCategories: () => api.get('/categories/'), // Usando tu endpoint exacto
    getProducts: () => api.get('/products/'),
    getProduct: (id) => api.get(`/products/${id}/`),
    createProduct: (data) => api.post('/products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Importante para la imagen
    }),
    updateProduct: (id, data) => api.put(`/products/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Importante para la imagen
    }),
    deleteProduct: (id) => api.delete(`/products/${id}/`),
};

export default api;