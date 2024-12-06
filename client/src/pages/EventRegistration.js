import React, { useState } from 'react';
import RegisterEvent from './RegisterEvent';
import RegisterEventDetails from './RegisterEventDetails';
import { useNavigate } from 'react-router-dom';

const EventRegistration = () => {
  const [eventData, setEventData] = useState({});
  const [step, setStep] = useState(1); // Controla el paso entre formularios
  const navigate = useNavigate();

  // Función para manejar los datos del evento
  const handleEventData = (data) => {
    setEventData((prevData) => ({
      ...prevData,
      ...data, // Combina los datos de ambos formularios
    }));
  };

  // Función para guardar los datos combinados al backend
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Evento creado con éxito:', data);
        navigate('/evento-registrado'); // Redirige a una página de éxito
      } else {
        console.error('Error al guardar el evento');
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  return (
    <div>
      {/* Renderiza el formulario dependiendo del paso */}
      {step === 1 && <RegisterEvent setEventData={handleEventData} />}
      {step === 2 && <RegisterEventDetails eventData={eventData} setEventData={handleEventData} />}

      <div className="navigation-buttons">
        {/* Botones para navegar entre los formularios */}
        {step === 1 && (
          <button onClick={() => setStep(2)}>Siguiente</button>
        )}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)}>Volver</button>
            <button onClick={handleSave}>Guardar</button>
          </>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
