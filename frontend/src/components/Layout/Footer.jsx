// src/components/Layout/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-gray-light)',
            borderTop: '1px solid var(--border-color)',
            padding: '32px 0',
            marginTop: 'auto'
        }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-gray)',
                        fontSize: '14px'
                    }}>
                        <span>🐾</span>
                        <span>© 2025 PetLovers. Todos los derechos reservados.</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '24px'
                    }}>
                        <a href="#" style={{
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'color 0.2s ease'
                        }}>
                            Privacidad
                        </a>
                        <a href="#" style={{
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'color 0.2s ease'
                        }}>
                            Términos
                        </a>
                        <a href="#" style={{
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'color 0.2s ease'
                        }}>
                            Contacto
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;