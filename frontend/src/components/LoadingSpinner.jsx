// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    // Las clases de tamaño (w-4 h-4, etc.) asumirían Tailwind CSS.
    // Como estamos usando estilos en línea o index.css, lo manejaremos con CSS directamente.
    const spinnerStyle = {
        width: { sm: '16px', md: '24px', lg: '32px', xl: '48px' }[size],
        height: { sm: '16px', md: '24px', lg: '32px', xl: '48px' }[size],
    };

    return (
        <div className={`loading-spinner ${className}`} style={spinnerStyle}></div>
    );
};

export default LoadingSpinner;