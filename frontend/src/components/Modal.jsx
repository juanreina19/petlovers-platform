// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, children, title = "Detalles" }) => {
    const modalRef = useRef();

    // Efecto para cerrar el modal al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Evita el scroll del body
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset'; // Restaura el scroll
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>{title}</h2>
                    <button onClick={onClose} style={modalStyles.closeButton}>
                        &times; {/* Multiplicación, comúnmente usada para cerrar */}
                    </button>
                </div>
                <div style={modalStyles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
};

const modalStyles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
        marginBottom: '24px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--text-dark)',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '32px',
        cursor: 'pointer',
        color: 'var(--text-gray)',
        padding: '0 8px',
        borderRadius: 'var(--border-radius-sm)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
    },
    // closeButton:hover está en index.css
    body: {
        // Estilos para el contenido del modal
    }
};

export default Modal;