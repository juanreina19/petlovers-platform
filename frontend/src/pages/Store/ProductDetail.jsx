import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ajusta la ruta a tu AuthContext, no hooks/useAuth
import { productsAPI } from '../../api'; // Importa productsAPI

const ProductDetail = () => {
    const { productId } = useParams();
    const { isAuthenticated, user, loading: authLoading } = useAuth(); // <-- AHORA DESESTRUCTURAMOS 'user'
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');

    // Variable para verificar si el usuario es administrador
    const isAdmin = isAuthenticated && user && user.role === 'Administrador';

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (productId) {
            const fetchProduct = async () => {
                setLoading(true);
                setError('');
                try {
                    const response = await productsAPI.getProduct(productId);
                    setProduct(response.data);
                } catch (err) {
                    console.error('Error al cargar detalle del producto:', err.response?.data || err.message);
                    setError('No se pudo cargar el producto. Inténtalo de nuevo más tarde.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [authLoading, navigate, productId]); // Dependencias: authLoading, navigate, productId

    const handleDelete = async () => {
        // Solo permitir eliminar si es administrador
        if (!isAdmin) { // <-- USAMOS isAdmin AQUÍ
            alert('No tienes permisos para eliminar productos.');
            // Opcional: Redirigir a login si el usuario no tiene permisos
            // navigate('/login');
            return;
        }

        if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
            try {
                await productsAPI.deleteProduct(productId);
                setDeleteMessage('Producto eliminado con éxito. Redirigiendo...');
                setTimeout(() => {
                    navigate('/admin/products'); // Redirige a la lista de administración de productos
                }, 2000);
            } catch (err) {
                console.error('Error al eliminar producto:', err.response?.data || err.message);
                setError('No se pudo eliminar el producto.');
            }
        }
    };

    if (loading) {
        return <div style={styles.loadingContainer}>Cargando detalles del producto...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    if (!product) {
        return <div style={styles.noProductMessage}>No se encontró el producto.</div>;
    }

    return (
        <div style={styles.detailContainer}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>Detalles de {product.name}</h2>
                {deleteMessage && <p style={styles.successMessage}>{deleteMessage}</p>}
                <div style={styles.productDetailContent}>
                    <img src={product.image} alt={product.name} style={styles.productDetailImage} />
                    <div style={styles.productInfoGroup}>
                        <p style={styles.detailText}><strong>Categoría:</strong> {product.category ? product.category.name : 'N/A'}</p>
                        <p style={styles.detailText}><strong>Descripción:</strong> {product.description || 'Sin descripción'}</p>
                        <p style={styles.detailText}><strong>Precio:</strong> ${product.price}</p>
                        <p style={styles.detailText}><strong>Stock:</strong> {product.stock}</p>
                        <p style={styles.detailText}><strong>Añadido:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div style={styles.buttonGroup}>
                    {/* === CAMBIO CLAVE: Renderizado condicional de botones para admin === */}
                    {isAdmin && ( // <-- SOLO RENDERIZA ESTOS BOTONES SI isAdmin ES TRUE
                        <>
                            <Link to={`/admin/products/edit/${product.id}`} className="btn btn-primary" style={styles.actionButton}>
                                Editar Producto
                            </Link>
                            <button onClick={handleDelete} className="btn btn-secondary" style={styles.deleteButton}>
                                Eliminar Producto
                            </button>
                        </>
                    )}
                    <Link to="/store" className="btn btn-secondary" style={styles.backButton}>
                        Volver a la Tienda
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // ... (Mantén tus estilos CSS aquí o importados desde un archivo)
    detailContainer: {
        width: '100%',
        maxWidth: '800px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin: '0 auto',

    },
    card: {
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        textAlign: 'center',
    },
    title: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        marginBottom: '25px',
    },
    productDetailContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '25px',
    },
    productDetailImage: {
        width: '250px',
        height: '250px',
        borderRadius: 'var(--border-radius)',
        objectFit: 'cover',
        border: '2px solid var(--border-color)',
    },
    productInfoGroup: {
        textAlign: 'left',
        width: '100%',
        maxWidth: '400px',
    },
    detailText: {
        color: 'var(--text-dark)',
        fontSize: '1.1em',
        marginBottom: '10px',
        lineHeight: '1.5',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px',
    },
    actionButton: {
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 'var(--border-radius-sm)',
        fontWeight: 'bold',
        fontSize: '1em',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    backButton: {
        backgroundColor: '#e1dfe1',
        color: 'black',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
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
    noProductMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1.1em',
        marginTop: '50px',
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 20px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '20px',
        border: '1px solid #c3e6cb',
        textAlign: 'center',
    },
};

export default ProductDetail;