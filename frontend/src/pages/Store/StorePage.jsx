// src/Store/StorePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // <--- Ajusta la ruta a tu AuthContext
import { productsAPI } from '../../api'; // Importa productsAPI

const StorePage = () => {
    // === CAMBIO CLAVE: Desestructurar 'user' del useAuth hook ===
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Variable para verificar si el usuario es administrador
    // === CAMBIO CLAVE: Lógica para isAdmin ===
    const isAdmin = isAuthenticated && user && user.role === 'Administrador';

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await productsAPI.getProducts(); // Usa productsAPI.getProducts()
                setProducts(response.data);
            } catch (err) {
                console.error('Error al cargar productos:', err.response?.data || err.message);
                setError('No se pudieron cargar los productos. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [authLoading, navigate]); // Dependencias: authLoading, navigate

    if (loading) {
        return <div style={styles.loadingContainer}>Cargando productos...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    return (
        <div style={styles.listContainer}>
            <div style={styles.listHeader}>
                <h2 style={styles.listTitle}>Nuestros Productos</h2>
                {/* === CAMBIO CLAVE: Renderizado condicional del botón === */}
                {isAdmin && (
                    <Link to="/admin/products" className="btn btn-primary" style={styles.adminButton}>
                        Administrar Productos
                    </Link>
                )}
            </div>
            {products.length === 0 ? (
                <p style={styles.noProductsMessage}>No hay productos registrados todavía.</p>
            ) : (
                <div style={styles.productsGrid}>
                    {products.map(product => (
                        <div key={product.id} className="card" style={styles.productCard}>
                            <img src={product.image} alt={product.name} style={styles.productImage} />
                            <div style={styles.productCardContent}>
                                <h3 style={styles.productName}>{product.name}</h3>
                                <p style={styles.productPrice}>${product.price}</p>
                                {product.category && (
                                    <p style={styles.productCategory}>{product.category.name}</p>
                                )}
                                <Link to={`/store/products/${product.id}`} className="btn btn-secondary" style={styles.viewDetailButton}>
                                    Ver Detalles
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    listContainer: {
        margin: '10px auto',
        width: '100%',
        maxWidth: '1200px',
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
    },
    listTitle: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        margin: 0,
    },
    adminButton: {
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
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
    },
    productCard: {
        backgroundColor: 'var(--bg-white)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        textAlign: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    productImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        borderBottom: '1px solid var(--border-color)',
    },
    productCardContent: {
        padding: '15px',
    },
    productName: {
        color: 'var(--text-dark)',
        fontSize: '1.5em',
        marginBottom: '10px',
    },
    productPrice: {
        color: 'var(--primary-purple)',
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    productCategory: {
        color: '#666',
        fontSize: '0.9em',
        marginBottom: '10px',
    },
    viewDetailButton: {
        display: 'inline-block',
        marginTop: '15px',
        backgroundColor: 'var(--secondary-color)',
        color: 'purple',
        border: 'none',
        padding: '8px 15px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease',
    },
    noProductsMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1.1em',
        marginTop: '50px',
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
};

export default StorePage;