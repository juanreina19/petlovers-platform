import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../../api'; // Importa productsAPI
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/FormStyles.css';

const ProductForm = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const isEditing = !!productId;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null,
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga inicial para el formulario
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Si la autenticación aún está cargando, no hacer nada y esperar
        if (authLoading) {
            return;
        }

        // === VERIFICACIÓN DE ROL ===
        // Redirigir si no está autenticado o no es "Administrador"
        if (!isAuthenticated || (user && user.role !== 'Administrador')) {
            console.warn('Acceso denegado. Redirigiendo a /login. User:', user);
            navigate('/login'); // O a una página de acceso denegado
            return;
        }

        const fetchProductAndCategories = async () => {
            setLoading(true); // Inicia el estado de carga para las peticiones de datos
            setError(''); // Limpia errores anteriores
            try {
                // 1. Obtener categorías
                const categoriesResponse = await productsAPI.getCategories();
                setCategories(categoriesResponse.data);

                // 2. Si estamos editando, obtener los datos del producto
                if (isEditing) {
                    const productResponse = await productsAPI.getProduct(productId);
                    const productData = productResponse.data;
                    setFormData({
                        name: productData.name || '',
                        description: productData.description || '',
                        price: productData.price || '',
                        stock: productData.stock || '',
                        category_id: productData.category ? productData.category.id : '',
                        image: null, // No precargamos el archivo
                        currentImage: productData.image || null, // URL actual de la imagen para mostrar
                    });
                }
            } catch (err) {
                console.error('Error al cargar datos en ProductForm:', err);
                const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Error desconocido al cargar los datos.';
                setError(`No se pudieron cargar los datos: ${errorMessage}`);
            } finally {
                setLoading(false); // Finaliza el estado de carga
            }
        };

        fetchProductAndCategories();
    }, [productId, isEditing, isAuthenticated, user, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            image: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage(''); // Limpiar cualquier mensaje de éxito anterior

        const dataToSend = new FormData();

        dataToSend.append('name', formData.name);
        dataToSend.append('description', formData.description);
        dataToSend.append('price', formData.price);
        dataToSend.append('stock', formData.stock);

        if (formData.category_id) {
            dataToSend.append('category_id', formData.category_id);
        }

        if (formData.image) {
            dataToSend.append('image', formData.image);
        }

        try {
            let message;
            if (isEditing) {
                await productsAPI.updateProduct(productId, dataToSend); // Llama a la API
                message = 'Producto actualizado con éxito!';
            } else {
                await productsAPI.createProduct(dataToSend); // Llama a la API
                message = 'Producto añadido con éxito!';
                // Limpiar formulario después de añadir si no es una edición
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    stock: '',
                    category_id: '',
                    image: null,
                });
            }

            // === CAMBIO CLAVE: Mostrar mensaje y luego redirigir ===
            setSuccessMessage(message); // Establece el mensaje de éxito
            console.log('Operación exitosa.');

            // Redirige después de un breve retraso (ej. 2 segundos)
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000); // 2000 milisegundos = 2 segundos

        } catch (err) {
            console.error('Error al guardar producto:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error desconocido al guardar el producto.';
            setError(`Error al guardar producto: ${errorMsg}`);
            setLoading(false); // Detiene la carga incluso si hay error
        } finally {
            // El loading se detiene en el catch o se mantiene activo hasta la redirección en el setTimeout
            // No ponemos setLoading(false) aquí si queremos que el botón muestre "Guardando..." hasta la redirección
            // Si el error ocurre, lo detiene en el catch.
        }
    };

    if (loading) {
        return <div className="form-loading">Cargando formulario y datos del producto...</div>;
    }

    // Muestra el mensaje de error si hay uno y no hay un mensaje de éxito (para evitar superposiciones)
    if (error && !successMessage) {
        return <div className="form-error">{error}</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>

            {/* Muestra el mensaje de éxito o error */}
            {successMessage && <p className="form-success-message">{successMessage}</p>}
            {error && <p className="form-error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="form-textarea"
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="price">Precio:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="stock">Stock:</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="0"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category_id">Categoría:</label>
                    <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">-- Selecciona una categoría --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Imagen del Producto:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="form-file-input"
                    />
                    {isEditing && formData.currentImage && (
                        <div className="current-image-preview">
                            <p>Imagen actual:</p>
                            <img src={formData.currentImage} alt="Producto actual" className="image-preview" />
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="form-submit-button" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Añadir Producto')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="form-cancel-button"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;