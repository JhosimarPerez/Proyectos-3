import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FloatingCart from '../components/FloatingCart'; // Ventana flotante modularizada
import '../pages/eventDetails.css';

const EventDetailsNoL = () => {
  const { eventId } = useParams();
  const navigate = useNavigate(); // Hook para redirección

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [tickets, setTickets] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [price, setPrice] = useState(0);
  const [cart, setCart] = useState([]);

  // Recuperar el carrito desde localStorage al cargar la página
  useEffect(() => {
    const savedCart = localStorage.getItem('cart'); // Leer el carrito de localStorage
    if (savedCart) {
      setCart(JSON.parse(savedCart)); // Si existe, cargarlo en el estado
    }
  }, []);

  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart)); // Guardar el carrito en localStorage
    }
  }, [cart]);

  // Obtener detalles del evento
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

  // Obtener tipos de tickets del backend
  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/tickets?evento_id=${eventId}`);
        const data = await response.json();
        setTicketTypes(data);
      } catch (error) {
        console.error('Error al cargar los tipos de tickets:', error);
      }
    };

    fetchTicketTypes();
  }, [eventId]);

  const handleTicketTypeChange = (e) => {
    const selectedType = e.target.value;
    setTicketType(selectedType);

    const selectedTicket = ticketTypes.find(ticket => ticket.nombre === selectedType);
    setPrice(selectedTicket ? selectedTicket.precio : 0);
  };

  const handleAddToCart = () => {
    if (tickets && ticketType) {
      const ticketDetails = {
        eventId,
        eventName: event.titulo,
        ticketType,
        quantity: tickets,
        price: price * tickets,
      };
      setCart((prevCart) => [...prevCart, ticketDetails]); // Actualizar el carrito
    } else {
      alert('Por favor seleccione tipo y cantidad de entradas');
    }
  };

  const handlePurchase = async () => {
    alert('Compra realizada exitosamente.');
    setCart([]); // Limpiar carrito después de la compra
    localStorage.removeItem('cart'); // Limpiar carrito de localStorage
  };

  const handleImageError = (e) => {
    e.target.src = 'https://img.freepik.com/fotos-premium/fuegos-artificiales-confeti-sobre-multitud-festival-musica_989072-16.jpg';
  };

  const handleLoginRedirect = () => {
    navigate('/login'); // Redirigir al login
  };

  if (!event) {
    return <p>Cargando detalles del evento...</p>;
  }

  return (
    <div className="event-details-container">
      <h2 className="event-title">{event.titulo}</h2>
      <img
        src={event.rutaImagen.startsWith('http') ? event.rutaImagen : `/${event.rutaImagen}`}
        alt={event.titulo}
        className="event-image"
        onError={handleImageError}
      />
      <p className="event-description">{event.descripcion}</p>
      <p className="event-detail"><strong>Fecha:</strong> {new Date(event.fecha_hora).toLocaleString()}</p>
      <p className="event-detail"><strong>Lugar:</strong> {event.ubicacion || 'No especificado'}</p>
      <p className="event-detail"><strong>Capacidad:</strong> {event.cupo_disponible || 'No especificado'}</p>
      <p className="event-detail"><strong>Categoría:</strong> {event.categoria_evento || 'Sin categoría'}</p>

      <div className="ticket-options">
        <div className="ticket-option">
          <label htmlFor="ticketQuantity">Cantidad de entradas:</label>
          <select
            id="ticketQuantity"
            value={tickets}
            onChange={(e) => setTickets(Number(e.target.value))}
          >
            <option value="">Seleccione cantidad</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="ticket-option">
          <label htmlFor="ticketType">Tipo de entrada:</label>
          <select
            id="ticketType"
            value={ticketType}
            onChange={handleTicketTypeChange}
          >
            <option value="">Seleccione tipo</option>
            {ticketTypes.map((ticket) => (
              <option key={ticket.id} value={ticket.nombre}>
                {ticket.nombre} - ${ticket.precio}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tickets && ticketType && (
        <div className="ticket-total">
          <p><strong>Total:</strong> ${price * tickets}</p>
        </div>
      )}

      <button
        className="btn-login"
        onClick={handleLoginRedirect}
      >
        Iniciar sesión
      </button>

      <FloatingCart cart={cart} onPurchase={handlePurchase} onRemove={(index) => {
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
      }} />
    </div>
  );
};

export default EventDetailsNoL;
