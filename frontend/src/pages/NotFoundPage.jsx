import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '40px 20px'
        }}>
            <h1 style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'var(--primary-purple)',
                marginBottom: '16px'
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: '24px',
                color: 'var(--text-dark)',
                marginBottom: '16px'
            }}>
                Página no encontrada
            </h2>
            <p style={{
                color: 'var(--text-gray)',
                marginBottom: '32px',
                maxWidth: '400px'
            }}>
                Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <Link to="/" className="btn btn-primary">
                Volver al Inicio
            </Link>
        </div>
    );
};

export default NotFoundPage;