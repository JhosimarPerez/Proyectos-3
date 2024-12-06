import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ConfirmacionCompra = () => {
  const { zonaId, metodoId } = useParams();
  const [compra, setCompra] = useState(null);
  const navigate = useNavigate();

  // Cargar detalles de la compra según la zona y el método de pago
  useEffect(() => {
    const fetchCompra = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/compra/${zonaId}/${metodoId}`);
        const data = await response.json();
        setCompra(data);
      } catch (error) {
        console.error('Error al cargar los detalles de la compra:', error);
      }
    };

    fetchCompra();
  }, [zonaId, metodoId]);

  const handleImprimir = () => {
    window.print();  // Imprime el ticket de compra
  };

  return (
    <div>
      <h2>Confirmación de Compra</h2>
      {compra ? (
        <div>
          <p><strong>Evento:</strong> {compra.evento.titulo}</p>
          <p><strong>Zona:</strong> {compra.zona.nombre}</p>
          <p><strong>Precio Total:</strong> ${compra.precio_total}</p>
          <p><strong>Método de Pago:</strong> {compra.metodo_pago}</p>
          <p>¡Gracias por tu compra!</p>
          <button onClick={handleImprimir}>Imprimir Ticket</button>
        </div>
      ) : (
        <p>Cargando los detalles de la compra...</p>
      )}
    </div>
  );
};

export default ConfirmacionCompra;
