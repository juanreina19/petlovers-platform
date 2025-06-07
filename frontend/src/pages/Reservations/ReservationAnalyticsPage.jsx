// src/Reservations/ReservationAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ruta corregida
import { reservationsAPI } from '../../api'; // Importa la nueva API de reservas
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ReservationAnalyticsPage = () => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAdmin = isAuthenticated && user && user.role === 'Administrador';

    useEffect(() => {
        if (authLoading) return;

        if (!isAdmin) {
            console.warn('Acceso denegado. Redirigiendo a /login. User:', user);
            navigate('/login');
            return;
        }

        const fetchAnalytics = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await reservationsAPI.getReservationsAnalytics();
                setAnalyticsData(response.data);
            } catch (err) {
                console.error('Error al cargar analíticas de reservas:', err.response?.data || err.message);
                const errMsg = err.response?.data?.detail || err.response?.data?.message || 'No se pudieron cargar las analíticas de reservas.';
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [isAdmin, authLoading, navigate, user]);

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando analíticas de reservas...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    if (!analyticsData || !analyticsData.length) {
        return <div style={styles.noDataMessage}>No hay datos de analíticas disponibles.</div>;
    }

    // Preparar datos para los gráficos
    const petLabels = analyticsData.map(item => item.name);
    const petReservationCounts = analyticsData.map(item => item.total_reservations);

    const barChartData = {
        labels: petLabels,
        datasets: [{
            label: 'Número de Reservas por Mascota',
            data: petReservationCounts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    const pieChartData = {
        labels: petLabels,
        datasets: [{
            label: 'Porcentaje de Reservas',
            data: petReservationCounts,
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Analíticas de Reservas',
            },
        },
    };

    return (
        <div style={styles.analyticsContainer}>
            <div style={styles.header}>
                <h2 style={styles.title}>Analíticas de Reservas</h2>
                <button onClick={() => navigate('/admin/reservations')} style={styles.backButton}>
                    Volver a Reservas
                </button>
            </div>
            <div style={styles.chartGrid}>
                <div style={styles.chartCard}>
                    <h3>Reservas por Mascota (Barras)</h3>
                    <Bar data={barChartData} options={options} />
                </div>
                <div style={styles.chartCard}>
                    <h3>Reservas por Mascota (Torta)</h3>
                    <Pie data={pieChartData} options={options} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    analyticsContainer: {
        width: '100%',
        maxWidth: '1200px',
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        margin: '20px auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
    },
    title: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        margin: 0,
    },
    backButton: {
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.95em',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
    },
    chartGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        marginTop: '30px',
    },
    chartCard: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
    },
    'chartCard h3': {
        marginBottom: '20px',
        color: 'var(--text-dark)',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)',
        fontSize: '1.2em',
        color: '#555',
    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)',
        fontSize: '1.2em',
        color: 'red',
        textAlign: 'center',
    },
    noDataMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1.1em',
        marginTop: '50px',
    },
};

export default ReservationAnalyticsPage;