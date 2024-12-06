import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MetodoPago = () => {
  const { zonaId } = useParams();  // Obtener el zonaId desde la URL
  const navigate = useNavigate();

  // Función para simular el pago
  const handlePago = () => {
    // Lógica de pago, o mostrar una alerta por ahora
    alert(`Realizando el pago para la zona con ID: ${zonaId}`);
    // Redirigir al usuario al inicio o a una página de confirmación
    navigate('/');  // Redirigir al inicio (puedes cambiarlo a una página de confirmación si lo deseas)
  };

  return (
    <div>
      <h2>Método de Pago para la Zona {zonaId}</h2>
      <p>Por favor, ingresa tus detalles de pago para completar la compra.</p>
      <button onClick={handlePago}>Pagar</button>
    </div>
  );
};

export default MetodoPago;
