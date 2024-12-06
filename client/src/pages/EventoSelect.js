import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EventoList = () => {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);  // Estado para manejar errores
  const navigate = useNavigate();

  // Función para formatear la fecha
  const formatDate = (fecha) => {
    const date = new Date(fecha);
    return `${date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })} ${date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  // Cargar eventos desde el backend
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/eventos');
        if (!response.ok) throw new Error('Error al cargar los eventos');
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        setError(error.message);  // Establecer mensaje de error
        console.error('Error al cargar los eventos:', error);
      }
    };

    fetchEventos();
  }, []);

  // Función para manejar la selección del evento
  const handleSelectEvento = async (id) => {
    try {
      // Llamamos al backend para obtener más detalles del evento
      const response = await fetch(`http://localhost:3001/api/eventos/${id}`);
      if (!response.ok) throw new Error('Error al obtener el evento');
      const evento = await response.json();
      
      alert(`Has seleccionado el evento con ID: ${id} - Título: ${evento.titulo}`);
      navigate(`/ZonaEntrada/${id}`);  // Redirige a la ventana de selección de zona
    } catch (error) {
      alert('Hubo un error al obtener los detalles del evento.');
      console.error('Error al obtener el evento:', error);
    }
  };

  return (
    <div>
      <h2>Selecciona el Evento</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar mensaje de error */}
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Ubicación</th>
            <th>Precio Base</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <tr key={evento.id}>  
                <td>{evento.titulo}</td>
                <td>{formatDate(evento.fecha_hora)}</td>
                <td>{evento.ubicacion}</td>
                <td>${evento.precio_base}</td>
                <td>
                  <button onClick={() => handleSelectEvento(evento.id)}>Seleccionar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No hay eventos disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventoList;
