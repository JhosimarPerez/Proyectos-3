import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import '../pages/ActiveEvents.css';
import Swal from 'sweetalert2';

const ActiveEvents = () => {
    const [events, setEvents] = useState([]);
    const [expandedEvent, setExpandedEvent] = useState(null);  // Para controlar qué evento está expandido
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/eventos');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error al cargar los eventos:', error);
            }
        };

        fetchEvents();
    }, []);

    const handleEdit = (eventId) => {
        navigate(`/editEvent/${eventId}`);
    };

    const handleViewMore = (eventId) => {
        navigate(`/eventDetailsAdmin/${eventId}`);
    };

    const handleDelete = async (eventId) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Estás seguro de que quieres eliminar este evento?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3001/api/eventos/${eventId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setEvents(events.filter(event => event.evento_id !== eventId));
                    Swal.fire('¡Eliminado!', 'El evento ha sido eliminado exitosamente.', 'success');
                } else {
                    Swal.fire('Error', 'Hubo un error al eliminar el evento', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar el evento:', error);
                Swal.fire('Error', 'Hubo un error al eliminar el evento', 'error');
            }
        }
    };

    const toggleExpand = (eventId) => {
        // Alterna la expansión de un evento
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };

    return (
        <div className="active-events">
            <h2>Eventos Activos</h2>

            {/* Botón "Crear Evento" */}
            <button 
                onClick={() => navigate('/RegisterEvent')} 
                style={{
                    marginBottom: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#A86666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Crear Evento
            </button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Nombre del Evento</th>
                        <th>Descripción</th>
                        <th>Fecha y Hora</th>
                        <th>Lugar</th>
                        <th>Zona</th>
                        <th>Capacidad de la Zona</th>
                        <th>Precio Extra</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length > 0 ? (
                        events.map(event => (
                            <React.Fragment key={event.evento_id}>
                                <tr onClick={() => toggleExpand(event.evento_id)}>
                                    <td>{event.evento_titulo}</td>
                                    <td>{event.descripcion}</td>
                                    <td>{new Date(event.fecha_hora).toLocaleString()}</td>
                                    <td>{event.ubicacion || 'No especificado'}</td>
                                    <td>
                                        {event.zona_nombres ? (
                                            event.zona_nombres.split(',').map((zona, index) => (
                                                <div key={index}>
                                                    <strong>{zona}</strong>
                                                </div>
                                            ))
                                        ) : (
                                            'No asignada'
                                        )}
                                    </td>
                                    <td>
                                        {event.zona_capacidades ? (
                                            event.zona_capacidades.split(',').map((capacidad, index) => (
                                                <div key={index}>
                                                    <strong>Capacidad: {capacidad}</strong>
                                                </div>
                                            ))
                                        ) : (
                                            'No disponible'
                                        )}
                                    </td>
                                    <td>
                                        {event.zona_precio_extra ? (
                                            event.zona_precio_extra.split(',').map((precio, index) => (
                                                <div key={index}>
                                                    <strong>Precio Extra: {precio}</strong>
                                                </div>
                                            ))
                                        ) : (
                                            'No disponible'
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={() => handleViewMore(event.evento_id)} className="btn btn-info">Más Información</button>
                                        <button onClick={() => handleEdit(event.evento_id)} className="btn btn-warning">Editar</button>
                                        <button onClick={() => handleDelete(event.evento_id)} className="btn btn-danger">Eliminar</button>
                                    </td>
                                </tr>

                                {/* Mostrar las zonas con su correlación de capacidad y precio extra */}
                                {expandedEvent === event.evento_id && (
                                    <tr>
                                        <td colSpan="8">
                                            <div>
                                                <h5>Detalles de Zonas:</h5>
                                                {event.zona_nombres && event.zona_nombres.split(',').map((zona, index) => (
                                                    <div key={index}>
                                                        <h6>{`Zona ${index + 1}: ${zona}`}</h6>
                                                        <p>Capacidad: {event.zona_capacidades.split(',')[index]}</p>
                                                        <p>Precio Extra: {event.zona_precio_extra.split(',')[index]}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No hay eventos activos</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveEvents;
