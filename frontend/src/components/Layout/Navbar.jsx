import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsDropdownOpen(false);
    };

    return (
        <nav style={{
            background: 'var(--bg-white)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px'
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'var(--primary-purple)',
                    fontWeight: 'bold',
                    fontSize: '20px'
                }}>
                    🐾 PetLovers
                </Link>

                {/* Navigation Links */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '32px'
                }}>
                    {isAuthenticated && (
                        <>
                            <Link to="/pets" style={{
                                textDecoration: 'none',
                                color: 'var(--text-dark)',
                                fontWeight: '500',
                                transition: 'color 0.2s ease'
                            }}>
                                Mis Mascotas
                            </Link>
                            <Link to="/store" style={{
                                textDecoration: 'none',
                                color: 'var(--text-dark)',
                                fontWeight: '500',
                                transition: 'color 0.2s ease'
                            }}>
                                Tienda
                            </Link>
                            <Link to="/my-reservations" style={{
                                textDecoration: 'none',
                                color: 'var(--text-dark)',
                                fontWeight: '500',
                                transition: 'color 0.2s ease'
                            }}>
                                Reservas
                            </Link>
                            {user?.role == 'Administrador' && (
                                <Link to="/admin" style={{
                                    textDecoration: 'none',
                                    color: 'var(--primary-purple)',
                                    fontWeight: '500',
                                    transition: 'color 0.2s ease'
                                }}>
                                    Admin
                                </Link>
                            )}
                        </>
                    )}

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--border-radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-white)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-purple)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>
                                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                                </div>
                                <span style={{ fontWeight: '500' }}>
                                    {user?.first_name || user?.username}
                                </span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: 'var(--bg-white)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius)',
                                    boxShadow: 'var(--shadow-lg)',
                                    minWidth: '200px',
                                    zIndex: 1000
                                }}>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        style={{
                                            display: 'block',
                                            padding: '12px 16px',
                                            textDecoration: 'none',
                                            color: 'var(--text-dark)',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                        Ver Perfil
                                    </Link>
                                    <Link
                                        to="/profile/security"
                                        onClick={() => setIsDropdownOpen(false)}
                                        style={{
                                            display: 'block',
                                            padding: '12px 16px',
                                            textDecoration: 'none',
                                            color: 'var(--text-dark)',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                        Ajustes de Seguridad
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            background: '#ff2e2e',
                                            color: 'white',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link to="/login" className="btn btn-secondary">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;