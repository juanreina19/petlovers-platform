// src/Store/AdminProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productsAPI } from '../../api'; // Importa productsAPI

const AdminProductsPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        setDeleteMessage('');
        try {
            const response = await productsAPI.getProducts(); // Usa productsAPI.getProducts()
            setProducts(response.data);
        } catch (err) {
            console.error('Error al cargar productos para administración:', err.response?.data || err.message);
            setError('No se pudieron cargar los productos para administración.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchProducts();
    }, [isAuthenticated, authLoading, navigate]);

    const handleDelete = async (productId, productName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
            try {
                await productsAPI.deleteProduct(productId); // Usa productsAPI.deleteProduct()
                setDeleteMessage(`Producto "${productName}" eliminado con éxito.`);
                fetchProducts(); // Vuelve a cargar la lista de productos después de eliminar
            } catch (err) {
                console.error('Error al eliminar producto:', err.response?.data || err.message);
                setError('No se pudo eliminar el producto.');
            }
        }
    };

    if (authLoading || loading) {
        return <div style={styles.loadingContainer}>Cargando productos para administración...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    return (
        <div style={styles.adminContainer}>
            <div style={styles.adminHeader}>
                <h2 style={styles.adminTitle}>Administración de Productos</h2>
                <Link to="/admin/products/add" className="btn btn-primary" style={styles.addButton}>
                    Añadir Nuevo Producto
                </Link>
            </div>
            {deleteMessage && <p style={styles.successMessage}>{deleteMessage}</p>}
            {products.length === 0 ? (
                <p style={styles.noProductsMessage}>No hay productos para administrar.</p>
            ) : (
                <div style={styles.productsTableContainer}>
                    <table style={styles.productsTable}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.category ? product.category.name : 'N/A'}</td>
                                    <td>${product.price}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <Link to={`/admin/products/edit/${product.id}`} className="btn btn-edit">
                                            Editar
                                        </Link>
                                        <button onClick={() => handleDelete(product.id, product.name)} className="btn btn-delete">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    adminContainer: {
        width: '100%',
        margin: '10px auto',
        maxWidth: '1200px',
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
    },
    adminHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
    },
    adminTitle: {
        color: 'var(--primary-purple)',
        fontSize: '2em',
        margin: 0,
    },
    addButton: {
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
    productsTableContainer: {
        overflowX: 'auto',
    },
    productsTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',


    },

    // Corrección de sintaxis en las propiedades de estilo
    'productsTable th': { // Deben ser strings si contienen caracteres especiales
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        padding: '12px 15px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
    },
    'productsTable td': { // Deben ser strings si contienen caracteres especiales
        padding: '10px 15px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'middle',
    },
    'productsTable tr': { // Deben ser strings si contienen caracteres especiales
        backgroundColor: 'var(--bg-white)',
    },
    // Estas propiedades CSS no se pueden aplicar directamente como objetos de estilo en línea
    // Necesitarías usar CSS global o una biblioteca CSS-in-JS para :nth-child(even) y :hover
    // 'productsTable tr:nth-child(even)': {
    //     backgroundColor: '#f9f9f9',
    // },
    // 'productsTable tr:hover': {
    //     backgroundColor: '#f1f1f1',
    // },
    'productsTable .btn': { // Asegúrate de que las propiedades sean camelCase
        marginRight: '10px',
        padding: '6px 12px',
        borderRadius: 'var(--border-radius-sm)',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease',
        border: 'none',
        cursor: 'pointer',
    },
    'productsTable .btn-edit': {
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
    },
    'productsTable .btn-delete': {
        backgroundColor: '#dc3545',
        color: 'white',
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

export default AdminProductsPage;