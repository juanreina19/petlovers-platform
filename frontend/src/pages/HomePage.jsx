// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    return (
        <div style={{ padding: '60px 0' }}>
            <div className="container">
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '80px'
                }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: 'var(--text-dark)',
                        marginBottom: '24px',
                        lineHeight: '1.2'
                    }}>
                        Gestiona el cuidado de tus mascotas
                        <span style={{ color: 'var(--primary-purple)' }}> con amor</span>
                    </h1>
                    <p style={{
                        fontSize: '20px',
                        color: 'var(--text-gray)',
                        marginBottom: '40px',
                        maxWidth: '600px',
                        margin: '0 auto 40px'
                    }}>
                        Una plataforma integral para el cuidado, seguimiento y bienestar
                        de tus compañeros peludos.
                    </p>

                    {!isAuthenticated ? (
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link to="/register" className="btn btn-primary" style={{
                                padding: '16px 32px',
                                fontSize: '16px'
                            }}>
                                Comenzar Ahora
                            </Link>
                            <Link to="/login" className="btn btn-secondary" style={{
                                padding: '16px 32px',
                                fontSize: '16px'
                            }}>
                                Iniciar Sesión
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <h2 style={{
                                fontSize: '24px',
                                color: 'var(--text-dark)',
                                marginBottom: '24px'
                            }}>
                                ¡Bienvenido de vuelta, {user?.first_name || user?.username}! 👋
                            </h2>
                            <div style={{
                                display: 'flex',
                                gap: '16px',
                                justifyContent: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <Link to="/pets" className="btn btn-primary" style={{
                                    padding: '16px 32px',
                                    fontSize: '16px'
                                }}>
                                    Ver Mis Mascotas
                                </Link>
                                <Link to="/store" className="btn btn-secondary" style={{
                                    padding: '16px 32px',
                                    fontSize: '16px'
                                }}>
                                    Explorar Tienda
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '32px',
                    marginBottom: '80px'
                }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-purple-light))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '24px'
                        }}>
                            🐕
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'var(--text-dark)',
                            marginBottom: '12px'
                        }}>
                            Gestión de Mascotas
                        </h3>
                        <p style={{
                            color: 'var(--text-gray)',
                            lineHeight: '1.6'
                        }}>
                            Mantén un registro completo de la información, historial médico
                            y cuidados de todas tus mascotas en un solo lugar.
                        </p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--mint-green), #7dd3b8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '24px'
                        }}>
                            📅
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'var(--text-dark)',
                            marginBottom: '12px'
                        }}>
                            Sistema de Reservas
                        </h3>
                        <p style={{
                            color: 'var(--text-gray)',
                            lineHeight: '1.6'
                        }}>
                            Agenda citas veterinarias, sesiones de grooming y otros
                            servicios de manera fácil y organizada.
                        </p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-gray), #8da2b5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '24px'
                        }}>
                            🛍️
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'var(--text-dark)',
                            marginBottom: '12px'
                        }}>
                            Tienda Integrada
                        </h3>
                        <p style={{
                            color: 'var(--text-gray)',
                            lineHeight: '1.6'
                        }}>
                            Accede a una amplia gama de productos y accesorios
                            para el cuidado y bienestar de tus mascotas.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                {!isAuthenticated && (
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-purple-light))',
                        color: 'white',
                        textAlign: 'center',
                        padding: '48px'
                    }}>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: 'white'
                        }}>
                            ¿Listo para comenzar?
                        </h2>
                        <p style={{
                            fontSize: '18px',
                            marginBottom: '32px',
                            opacity: 0.9
                        }}>
                            Únete a miles de dueños de mascotas que ya confían en nuestra plataforma.
                        </p>
                        <Link to="/register" className="btn" style={{
                            background: 'white',
                            color: 'var(--primary-purple)',
                            padding: '16px 32px',
                            fontSize: '16px',
                            boxShadow: 'var(--shadow-md)' // Agregamos una sombra más pronunciada al botón de CTA
                        }}>
                            Crear una Cuenta
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;