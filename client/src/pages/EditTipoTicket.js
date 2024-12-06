import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../pages/EditTipoTicket.css';

const EditTipoTicket = () => {
    const { id } = useParams(); // Obtener el ID del ticket desde la URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        es_de_pago: false,
        precio: 0,
        limite_compra: 1,
        stock: 0,
        fecha_inicio_venta: '',
        fecha_final_venta: '',
        es_por_fecha: false,
        evento_id: '',
        activo: true,
    });

    // Cargar los datos del ticket cuando el componente se monte
    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/tickets/${id}`);
                const data = await response.json();
                setFormData(data);
            } catch (error) {
                console.error("Error al cargar los datos del ticket:", error);
            }
        };

        fetchTicket();
    }, [id]);

    // Manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('Ticket actualizado con éxito');
                navigate('/TipoTicketsList'); // Navegar de vuelta a la lista de tickets
            } else {
                alert('Error al actualizar el ticket');
            }
        } catch (error) {
            console.error("Error al actualizar el ticket:", error);
            alert('Hubo un error al actualizar el ticket');
        }
    };

    return (
        <div className="edit-tipo-ticket">
            <h2>Editar Tipo de Ticket</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </label>
                <label>
                    Es de Pago:
                    <input type="checkbox" name="es_de_pago" checked={formData.es_de_pago} onChange={handleChange} />
                </label>
                <label>
                    Precio:
                    <input type="number" name="precio" value={formData.precio} onChange={handleChange} required />
                </label>
                <label>
                    Límite de Compra:
                    <input type="number" name="limite_compra" value={formData.limite_compra} onChange={handleChange} required />
                </label>
                <label>
                    Stock:
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                </label>
                <label>
                    Fecha Inicio de Venta:
                    <input type="datetime-local" name="fecha_inicio_venta" value={formData.fecha_inicio_venta} onChange={handleChange} />
                </label>
                <label>
                    Fecha Final de Venta:
                    <input type="datetime-local" name="fecha_final_venta" value={formData.fecha_final_venta} onChange={handleChange} />
                </label>
                <label>
                    Es por Fecha:
                    <input type="checkbox" name="es_por_fecha" checked={formData.es_por_fecha} onChange={handleChange} />
                </label>
                <label>
                    ID Evento:
                    <input type="number" name="evento_id" value={formData.evento_id} onChange={handleChange} required />
                </label>
                <label>
                    Activo:
                    <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
                </label>
                <button type="submit">Guardar Cambios</button>
            </form>
        </div>
    );
};

export default EditTipoTicket;
