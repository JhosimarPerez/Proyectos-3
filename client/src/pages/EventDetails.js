import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FloatingCart from '../components/FloatingCart'; // Ventana flotante modularizada
import './eventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Obtener detalles del evento
  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/eventos/${eventId}`);
      const data = await response.json();

      const zonasMap = new Map();
      data.forEach((item) => {
        if (!zonasMap.has(item.zona_id)) {
          zonasMap.set(item.zona_id, {
            zona_id: item.zona_id,
            nombre: item.zona_nombre,
            capacidad: item.zona_capacidad,
            precio_extra: item.zona_precio_extra,
            asientos: [],
          });
        }
        zonasMap.get(item.zona_id).asientos.push({
          asiento_id: item.asiento_id,
          fila: item.asiento_fila,
          numero: item.asiento_numero,
          estado: item.asiento_estado,
        });
      });

      const formattedEvent = {
        ...data[0],
        zonas: Array.from(zonasMap.values()),
      };

      setEvent(formattedEvent);
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Manejar clics en los asientos
  const handleSeatClick = async (zonaId, asiento) => {
    if (asiento.estado === 'vendido') return;

    console.log(`Clic en asiento ID: ${asiento.asiento_id}, estado actual: ${asiento.estado}`);

    const nuevoEstado = asiento.estado === 'disponible' ? 'reservado' : 'disponible';

    try {
        // Actualizar el estado del asiento en el frontend
        asiento.estado = nuevoEstado;

        // Actualizar asientos seleccionados
        setSelectedSeats((prev) =>
            nuevoEstado === 'reservado'
                ? [...prev, { ...asiento, zonaId }] // Asegúrate de incluir asientoId
                : prev.filter((s) => s.asiento_id !== asiento.asiento_id)
        );

        // Actualizar el carrito
        const selectedZone = event.zonas.find((zona) => zona.zona_id === zonaId);

        setCart((prevCart) => {
            const updatedCart = nuevoEstado === 'reservado'
                ? [...prevCart, {
                    ticketType: `Zona ${selectedZone.nombre} Fila ${asiento.fila} Asiento ${asiento.numero}`,
                    cantidad: 1,
                    precioExtra: parseFloat(selectedZone.precio_extra),
                    zonaId: zonaId,
                    asientoId: asiento.asiento_id, // Incluye asientoId aquí
                }]
                : prevCart.filter((item) => item.asientoId !== asiento.asiento_id);
            return updatedCart;
        });
    } catch (error) {
        console.error('Error al actualizar el estado del asiento en la base de datos:', error);
    }
};


  // Realizar la compra
  const handleCheckout = async () => {
    if (!selectedSeats.length) {
        alert('No hay asientos seleccionados.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/compras/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                carrito: selectedSeats.map((seat) => ({
                    zonaId: seat.zonaId,
                    cantidad: 1,
                    precioExtra: seat.precioExtra,
                    asientoId: seat.asiento_id, // Incluye asientoId aquí
                })),
                usuarioId: localStorage.getItem('userId'),
                metodoPago: 'tarjeta',
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Compra realizada con éxito');
            setSelectedSeats([]);
            setTotalPrice(0);
            fetchEventDetails(); // Recargar datos del evento
        } else {
            alert(result.message || 'Hubo un error al realizar la compra');
        }
    } catch (error) {
        console.error('Error al realizar la compra:', error);
    }
};


  if (!event) {
    return <p>Cargando detalles del evento...</p>;
  }

  return (
    <div className="event-details-container">
      <h2 className="event-title">{event.titulo}</h2>
      <img
        src={`http://localhost:3001${event.rutaImagen}`}
        alt={event.titulo}
        className="event-image"
      />
      <p className="event-description">{event.descripcion}</p>
      <p><strong>Fecha:</strong> {new Date(event.fecha_hora).toLocaleString()}</p>
      <p><strong>Lugar:</strong> {event.ubicacion || 'No especificado'}</p>

      <div className="zones-container">
        {event.zonas.map((zona) => (
          <div key={zona.zona_id} className="zone">
            <h3>{zona.nombre}</h3>
            <p>Capacidad disponible: {zona.capacidad}</p>
            <p>Precio extra: ${zona.precio_extra}</p>
            <table className="seat-table">
              <tbody>
                {Object.entries(
                  zona.asientos.reduce((acc, asiento) => {
                    acc[asiento.fila] = acc[asiento.fila] || [];
                    acc[asiento.fila].push(asiento);
                    return acc;
                  }, {})
                ).map(([fila, asientos]) => (
                  <tr key={fila}>
                    <td>Fila {fila}</td>
                    {asientos.map((asiento) => (
                      <td
                        key={asiento.asiento_id}
                        className={`seat ${asiento.estado}`}
                        onClick={() => handleSeatClick(zona.zona_id, asiento)}
                      >
                        {asiento.numero}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="summary">
        <h4>Total: ${totalPrice.toFixed(2)}</h4>
        <button onClick={handleCheckout} disabled={!selectedSeats.length}>
          Comprar
        </button>
      </div>

      <FloatingCart cart={cart} />
    </div>
  );
};

export default EventDetails;
