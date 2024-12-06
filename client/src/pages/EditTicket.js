import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        es_de_pago: false,
        precio: '',
        limite_compra: '',
        stock: '',
        fecha_inicio_venta: '',
        evento_id: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTicket();
    }, []);

    const fetchTicket = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/tickets/${id}`);
            const result = await response.json();

            if (response.ok) {
                setFormData({
                    nombre: result.nombre,
                    es_de_pago: result.es_de_pago,
                    precio: result.precio,
                    limite_compra: result.limite_compra,
                    stock: result.stock,
                    fecha_inicio_venta: result.fecha_inicio_venta,
                    evento_id: result.evento_id
                });
            } else {
                setError('Error al cargar el ticket');
                console.error(result.error);
            }
        } catch (error) {
            setError('Error en la solicitud');
            console.error('Error en la solicitud:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (response.ok) {
                alert('Ticket actualizado con éxito');
                navigate('/');
            } else {
                setError('Error al actualizar el ticket');
                console.error(result.error);
            }
        } catch (error) {
            setError('Error en la solicitud');
            console.error('Error en la solicitud:', error);
        }
    };

    return (
        <div>
            <h2>Editar Ticket</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>Nombre del Ticket</label>
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                />

                <label>Tipo de Pago</label>
                <input
                    type="checkbox"
                    name="es_de_pago"
                    checked={formData.es_de_pago}
                    onChange={handleInputChange}
                />{' '}
                Pago

                <label>Precio</label>
                <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    disabled={!formData.es_de_pago}
                />

                <label>Límite de Compra</label>
                <input
                    type="number"
                    name="limite_compra"
                    value={formData.limite_compra}
                    onChange={handleInputChange}
                    required
                />

                <label>Stock</label>
                <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                />

                <label>Fecha de Inicio de Venta</label>
                <input
                    type="date"
                    name="fecha_inicio_venta"
                    value={formData.fecha_inicio_venta}
                    onChange={handleInputChange}
                    required
                />

                <button type="submit">Guardar cambios</button>
            </form>
        </div>
    );
};

export default EditTicket;
