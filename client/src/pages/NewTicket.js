import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/newTicketForm.css';

const NewTicket = () => {
    const [formData, setFormData] = useState({
        nombreTicket: '',
        tipoPago: '',
        precio: '',
        limiteCompra: '',
        stock: '',
        fechaInicioVenta: '',
        fechaFinalVenta: '',
        tipoCierre: '',
        eventoId: '',
    });

    const [eventos, setEventos] = useState([]);
    const [message, setMessage] = useState(null); // Para manejar el mensaje de éxito/error
    const [isError, setIsError] = useState(false); // Para indicar si es un mensaje de error

    useEffect(() => {
        axios.get('http://localhost:3001/api/eventos')
            .then(response => {
                console.log('Eventos recibidos:', response.data);
                setEventos(response.data);
            })
            .catch(error => {
                console.error('Error al obtener eventos:', error);
                setMessage('Error al cargar los eventos.');
                setIsError(true);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Datos enviados al backend:', formData);

        axios.post('http://localhost:3001/api/tickets', formData)
            .then(response => {
                alert('Ticket creado con éxito:', response.data);
                setMessage('Ticket creado con éxito.');
                setIsError(false);

                // Limpiar el formulario después de la creación exitosa
                setFormData({
                    nombreTicket: '',
                    tipoPago: '',
                    precio: '',
                    limiteCompra: '',
                    stock: '',
                    fechaInicioVenta: '',
                    fechaFinalVenta: '',
                    tipoCierre: '',
                    eventoId: '',
                });
            })
            .catch(error => {
                console.error('Error creando el ticket:', error);
                setMessage('Error al crear el ticket.');
                setIsError(true);
            });
    };

    return (
        <form className="new-ticket-form" onSubmit={handleSubmit}>
            <h2>Nuevo tipo de ticket</h2>

            {message && (
                <div className={`message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <label>Nombre del ticket</label>
            <input
                type="text"
                name="nombreTicket"
                placeholder="Ej: VIP"
                value={formData.nombreTicket}
                onChange={handleChange}
                required
            />

            <div className="tipo-pago">
                <label>
                    <input 
                        type="radio" 
                        name="tipoPago" 
                        value="Pago" 
                        onChange={handleChange} 
                        checked={formData.tipoPago === 'Pago'} 
                    /> Pago
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="tipoPago" 
                        value="Sin costo" 
                        onChange={handleChange} 
                        checked={formData.tipoPago === 'Sin costo'} 
                    /> Sin costo
                </label>
            </div>

            <label>Precio del ticket</label>
            <input
                type="number"
                name="precio"
                placeholder="Monto"
                value={formData.precio}
                onChange={handleChange}
                disabled={formData.tipoPago === 'Sin costo'}
                required={formData.tipoPago === 'Pago'}
            />

            <label>Límite de Compra de ticket</label>
            <input
                type="number"
                name="limiteCompra"
                placeholder="Ej: 5"
                value={formData.limiteCompra}
                onChange={handleChange}
                required
            />

            <label>Stock del ticket</label>
            <input
                type="number"
                name="stock"
                placeholder="0000"
                value={formData.stock}
                onChange={handleChange}
                required
            />

            <label>Fecha de inicio de venta del ticket</label>
            <input
                type="date"
                name="fechaInicioVenta"
                value={formData.fechaInicioVenta}
                onChange={handleChange}
                required
            />

            <label>Fecha de finalización de venta del ticket</label>
            <input
                type="date"
                name="fechaFinalVenta"
                value={formData.fechaFinalVenta}
                onChange={handleChange}
                required
            />

            <div className="tipo-cierre">
                <label>
                    <input 
                        type="radio" 
                        name="tipoCierre" 
                        value="Por fecha y hora" 
                        onChange={handleChange} 
                        checked={formData.tipoCierre === 'Por fecha y hora'} 
                    /> Por fecha y hora
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="tipoCierre" 
                        value="Por tiempo limitado" 
                        onChange={handleChange} 
                        checked={formData.tipoCierre === 'Por tiempo limitado'} 
                    /> Por tiempo limitado
                </label>
            </div>

            <label>Evento</label>
            <select
                name="eventoId"
                value={formData.eventoId}
                onChange={handleChange}
                required
            >
                <option value="">Seleccionar Evento</option>
                {eventos.map((evento) => (
                    <option key={evento.evento_id} value={evento.evento_id}>
                        {evento.titulo}
                    </option>
                ))}
            </select>

            <button type="submit">Agregar</button>
        </form>
    );
};

export default NewTicket;
