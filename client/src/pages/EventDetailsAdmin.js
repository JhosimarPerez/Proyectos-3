import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/eventDetails.css';


const EventDetailsAdmin = () => {
    const { eventId } = useParams(); // Capturar el ID del evento desde la URL
    const [event, setEvent] = useState(null); // Estado para almacenar los datos del evento
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/eventos/${eventId}`);
                const data = await response.json();
                setEvent(data);
            } catch (error) {
                console.error('Error al cargar los detalles del evento:', error);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleEdit = () => {
        navigate(`/editEvent/${eventId}`);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este evento?');
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:3001/api/eventos/${eventId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('Evento eliminado exitosamente');
                    navigate('/'); // Redirigir a la lista de eventos
                } else {
                    alert('Hubo un error al eliminar el evento');
                }
            } catch (error) {
                console.error('Error al eliminar el evento:', error);
            }
        }
    };

    if (!event) {
        return <p>Cargando detalles del evento...</p>;
    }

    return (
        <div>
       
       <div className="event-image">
                <img src="../Img/medusa2016_03.jpg" alt="Evento" />
            </div>

        <div 
            className="event-details-admin"
           
        >
            <div 
                className="content-wrapper"
            >
                <h2>Detalles del Evento</h2>
                <div className="event-info">
                    <p><strong>Nombre del Evento:</strong> {event.titulo}</p>
                    <p><strong>Descripción:</strong> {event.descripcion}</p>
                    <p><strong>Organizadores:</strong> {event.organizadores || 'No especificado'}</p>
                    <p><strong>Fecha y Hora:</strong> {new Date(event.fecha_hora).toLocaleString()}</p>
                    <p><strong>Ubicación:</strong> {event.ubicacion || 'No especificado'}</p>
                    <p><strong>Precio Base:</strong> {event.precio_base ? `$${event.precio_base}` : 'Gratis'}</p>
                    <p><strong>Cupo Disponible:</strong> {event.cupo_disponible || 'No especificado'}</p>
                    <p><strong>¿Es Virtual?</strong> {event.es_evento_virtual ? 'Sí' : 'No'}</p>
                    <p><strong>URL del Evento:</strong> <a href={event.url} target="_blank" rel="noopener noreferrer">{event.url}</a></p>
                    <p><strong>Estado del Evento:</strong> {event.evento_activo ? 'Activo' : 'Inactivo'}</p>
                    <p><strong>Fecha de Creación:</strong> {new Date(event.fecha_creacion).toLocaleString()}</p>
                    <p><strong>Última Modificación:</strong> {new Date(event.fecha_modificacion).toLocaleString()}</p>
                    <h3>Categoría del Evento</h3>
                    <p><strong>Nombre:</strong> {event.categoria_evento}</p>
                    <p><strong>Descripción:</strong> {event.categoria_evento_desc}</p>
                    <h3>Tipo de Evento</h3>
                    <p><strong>Nombre:</strong> {event.tipo_evento}</p>
                    <p><strong>Descripción:</strong> {event.tipo_evento_desc}</p>
                </div>
                <div className="buttons" style={{ marginTop: '20px' }}>
                    <button onClick={handleEdit} style={{ marginRight: '10px' }} className="btn btn-primary">Editar</button>
                    <button onClick={handleDelete} style={{ marginRight: '10px' }} className="btn btn-danger">Eliminar</button>
                    <button onClick={() => navigate('/ActiveEvents')} className="btn btn-secondary">Volver</button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default EventDetailsAdmin;
