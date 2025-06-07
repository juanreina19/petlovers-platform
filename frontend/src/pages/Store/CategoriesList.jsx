// src/Store/CategoriesList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { productsAPI } from '../../api'; // Importa productsAPI

const CategoriesList = ({ isAdmin = false }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await productsAPI.getCategories(); // Usa productsAPI.getCategories()
            setCategories(response.data);
        } catch (err) {
            console.error('Error al cargar categorías:', err.response?.data || err.message);
            setError('No se pudieron cargar las categorías.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        fetchCategories();
    }, [authLoading]);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSubmitting(true);
        if (!newCategoryName.trim()) {
            setError('El nombre de la categoría no puede estar vacío.');
            setSubmitting(false);
            return;
        }
        try {
            // productsAPI solo tiene getCategories, getProducts, etc.
            // No tiene un método directo para crear/actualizar/eliminar categorías si '/product-categories/'
            // no es un endpoint de CRUD para categorías en tu backend.
            // Si quieres habilitar esto, necesitarías añadir createCategory, updateCategory, deleteCategory
            // a tu productsAPI o crear un categoriesAPI separado.
            // Por ahora, asumiré que productsAPI.createCategory NO existe para categorías.
            // Si tu backend permite crear una categoría con un POST a '/product-categories/', entonces:
            // await api.post('/product-categories/', { name: newCategoryName }); // Directamente usando 'api'
            // O añade un método `createCategory` a `productsAPI` si lo necesitas.
            alert('La creación de categorías no está directamente expuesta en productsAPI.createCategory.');
            // Puedes usar: await api.post('/product-categories/', { name: newCategoryName });
            // si tu `api` axios instance está disponible o añadirlo a `productsAPI`.
        } catch (err) {
            console.error('Error al crear categoría:', err.response?.data || err.message);
            setError(`Error al crear categoría: ${err.response?.data?.name || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditStart = (category) => {
        setEditCategoryId(category.id);
        setEditCategoryName(category.name);
        setError('');
        setMessage('');
    };

    const handleUpdateCategory = async (e, categoryId) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSubmitting(true);
        if (!editCategoryName.trim()) {
            setError('El nombre de la categoría no puede estar vacío.');
            setSubmitting(false);
            return;
        }
        try {
            // Similar al caso de creación, productsAPI no tiene un método directo para actualizar categorías.
            // await api.put(`/product-categories/${categoryId}/`, { name: editCategoryName }); // Directamente usando 'api'
            alert('La actualización de categorías no está directamente expuesta en productsAPI.updateCategory.');
        } catch (err) {
            console.error('Error al actualizar categoría:', err.response?.data || err.message);
            setError(`Error al actualizar categoría: ${err.response?.data?.name || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!isAuthenticated) {
            setError('Debes iniciar sesión para eliminar categorías.');
            return;
        }
        if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
            setError('');
            setMessage('');
            try {
                // Similar al caso de creación/actualización, productsAPI no tiene un método directo para eliminar categorías.
                // await api.delete(`/product-categories/${categoryId}/`); // Directamente usando 'api'
                alert('La eliminación de categorías no está directamente expuesta en productsAPI.deleteCategory.');
            } catch (err) {
                console.error('Error al eliminar categoría:', err.response?.data || err.message);
                setError(`Error al eliminar categoría: ${err.response?.data?.detail || err.message}`);
            }
        }
    };

    if (loading) {
        return <div style={styles.loadingContainer}>Cargando categorías...</div>;
    }

    if (error && !isAdmin) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    return (
        <div style={isAdmin ? styles.adminCategoriesContainer : styles.categoriesListContainer}>
            <h3 style={styles.categoriesTitle}>{isAdmin ? 'Administrar Categorías' : 'Categorías de Productos'}</h3>
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}

            {isAdmin && isAuthenticated && (
                <div style={styles.formSection}>
                    <form onSubmit={handleCreateCategory} style={styles.addCategoryForm}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de la nueva categoría"
                            style={styles.formInput}
                            disabled={submitting}
                            required
                        />
                        <button type="submit" disabled={submitting} style={styles.actionButton}>
                            {submitting ? 'Añadiendo...' : 'Añadir Categoría'}
                        </button>
                    </form>
                    <p style={{ fontSize: '0.9em', color: '#888', marginTop: '10px' }}>
                        **Nota:** Los métodos para crear/actualizar/eliminar categorías no están en `productsAPI` según tu definición.
                        Necesitarías añadirlos explícitamente o crear un `categoriesAPI` separado si tu backend los expone.
                    </p>
                </div>
            )}

            {categories.length === 0 ? (
                <p style={styles.noCategoriesMessage}>No hay categorías registradas.</p>
            ) : (
                <ul style={styles.categoryList}>
                    {categories.map(category => (
                        <li key={category.id} style={styles.categoryListItem}>
                            {editCategoryId === category.id && isAdmin ? (
                                <form onSubmit={(e) => handleUpdateCategory(e, category.id)} style={styles.editCategoryForm}>
                                    <input
                                        type="text"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        style={styles.formInput}
                                        disabled={submitting}
                                        required
                                    />
                                    <button type="submit" disabled={submitting} style={styles.actionButton}>Guardar</button>
                                    <button type="button" onClick={() => setEditCategoryId(null)} style={styles.cancelButton}>Cancelar</button>
                                </form>
                            ) : (
                                <>
                                    <span style={styles.categoryName}>{category.name}</span>
                                    {isAdmin && isAuthenticated && (
                                        <div style={styles.categoryActions}>
                                            <button onClick={() => handleEditStart(category)} style={styles.editButton}>Editar</button>
                                            <button onClick={() => handleDeleteCategory(category.id, category.name)} style={styles.deleteButton}>Eliminar</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles = {
    categoriesListContainer: {
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--bg-white)',
        padding: '20px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '20px',
    },
    adminCategoriesContainer: {
        width: '100%',
        maxWidth: '800px',
        backgroundColor: 'var(--bg-white)',
        padding: '30px',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '20px',
    },
    categoriesTitle: {
        color: 'var(--primary-purple)',
        fontSize: '1.5em',
        marginBottom: '20px',
        textAlign: 'center',
    },
    categoryList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    categoryListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
        marginBottom: '5px',
    },
    categoryName: {
        fontSize: '1.1em',
        color: 'var(--text-dark)',
    },
    categoryActions: {
        display: 'flex',
        gap: '10px',
    },
    formSection: {
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
    },
    addCategoryForm: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    editCategoryForm: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        width: '100%',
    },
    formInput: {
        flexGrow: 1,
        padding: '8px 10px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: '1em',
    },
    actionButton: {
        backgroundColor: 'var(--primary-purple)',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: 'var(--border-radius-sm)',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    editButton: {
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: 'var(--border-radius-sm)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: 'var(--border-radius-sm)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: 'var(--border-radius-sm)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    noCategoriesMessage: {
        textAlign: 'center',
        color: '#888',
        fontSize: '1em',
        marginTop: '20px',
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
        padding: '10px 15px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '15px',
        border: '1px solid #c3e6cb',
        textAlign: 'center',
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px 15px',
        borderRadius: 'var(--border-radius-sm)',
        marginBottom: '15px',
        border: '1px solid #f5c6cb',
        textAlign: 'center',
    },
};

export default CategoriesList;