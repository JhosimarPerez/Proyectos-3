import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ZonaEntrada = () => {
  const { id: eventoId } = useParams();  // Obtener el eventoId desde la URL
  const [zonas, setZonas] = useState([]);
  const navigate = useNavigate();

  // Cargar las zonas para el evento específico
  useEffect(() => {
    if (eventoId) {
      const fetchZonas = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/zonascompra/${eventoId}`);
          const data = await response.json();
          console.log('Zonas cargadas:', data);  // Verifica que las zonas se carguen correctamente
          setZonas(data);
        } catch (error) {
          console.error('Error al cargar las zonas:', error);
        }
      };
      fetchZonas();
    }
  }, [eventoId]);  // Esto se ejecutará cada vez que `eventoId` cambie
  

  // Manejar la selección de una zona
  const handleSelectZona = (zonaId) => {
    navigate(`/metodo-pago/${zonaId}`);  // Redirige a la página de pago con el zonaId
  };

  return (
    <div>
      <h2>Selecciona la Zona para el Evento {eventoId}</h2>
      {zonas.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Zona</th>
              <th>Capacidad</th>
              <th>Precio Extra</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {zonas.map((zona) => (
              <tr key={zona.zona_id}>
                <td>{zona.zona_nombre}</td>
                <td>{zona.capacidad}</td>
                <td>${zona.precio_extra}</td>
                <td>
                  <button onClick={() => handleSelectZona(zona.zona_id)}>Seleccionar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay zonas disponibles para este evento.</p>
      )}
    </div>
  );
};

export default ZonaEntrada;
