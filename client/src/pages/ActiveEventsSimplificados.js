import React, { useState, useEffect } from 'react';

const ActiveEventsSimplificados = () => {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Llamada a la API para obtener los eventos simplificados
    fetch('/api/eventos/simplificados')
      .then((response) => response.json())
      .then((data) => setEventos(data))
      .catch((error) => console.error('Error al cargar eventos simplificados:', error));
  }, []);

  return (
    <div>
      <h1>Eventos Simplificados</h1>
      <ul>
        {eventos.map((evento) => (
          <li key={evento.evento_id}>
            <h3>{evento.nombre}</h3>
            <p>{evento.descripcion}</p>
            <p>Fecha y hora: {evento.fecha_hora}</p>
            <p>Ubicación: {evento.ubicacion}</p>
            {/* Botón para ver más detalles */}
            <button onClick={() => alert(`Detalles del evento: ${evento.nombre}`)}>
              Mostrar más
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveEventsSimplificados;
