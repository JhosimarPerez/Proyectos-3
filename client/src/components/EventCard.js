import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
    const navigate = useNavigate();

    const handleNavigateToDetails = () => {
        navigate(`/eventDetails/${event.evento_id}`);
    };

    return (
        <div className="event-card">
            <img
                src={`http://localhost:3001${event.rutaImagen}`}
                alt={event.titulo}
                className="event-card-image"
                onClick={handleNavigateToDetails}
                style={{ cursor: 'pointer' }}
            />
            <div className="event-card-content">
                <h3>{event.titulo}</h3>
                <p>{event.descripcion}</p>
                <p>
                    <strong>Fecha:</strong> {new Date(event.fecha_hora).toLocaleString()}
                </p>
                <button
                    className="event-card-button"
                    onClick={handleNavigateToDetails}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Ver detalles
                </button>
            </div>
        </div>
    );
};

export default EventCard;
