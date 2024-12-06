import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import '../components/floatingCart.css';
import QRCode from 'qrcode'; // Elimina esta línea si no se utiliza.

const FloatingCart = ({ cart, onRemove, onClose, refreshSeats }) => {
    const [loading, setLoading] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const navigate = useNavigate();

    // Calcular totales
    const totalTickets = cart.reduce((acc, item) => acc + item.cantidad, 0);
    const totalAmount = cart.reduce((acc, item) => acc + item.precioExtra * item.cantidad, 0);
    const discountPercentage = 10;
    const totalWithDiscount = totalAmount - (totalAmount * (discountPercentage / 100));

    // Manejar compra
    const handlePurchase = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            Swal.fire({
                title: 'Error',
                text: 'Usuario no identificado. Por favor, inicia sesión antes de realizar la compra.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        setLoading(true);
        try {
            const { isConfirmed } = await Swal.fire({
                title: 'Confirmar compra',
                text: `Estás a punto de comprar ${totalTickets} entradas. ¿Deseas continuar?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, comprar',
                cancelButtonText: 'Cancelar',
            });

            if (!isConfirmed) {
                setLoading(false);
                return;
            }

            // Preparar datos para la compra
            const purchaseData = {
                carrito: cart.map(item => ({
                    zonaId: item.zonaId,
                    cantidad: item.cantidad,
                    precioExtra: item.precioExtra,
                    asientoId: item.asientoId, // Asegúrate de incluir asientoId aquí
                })),
                usuarioId: userId,
                metodoPago: 'tarjeta',
            };
            

            // Llamada al backend
            const response = await axios.post('http://localhost:3001/api/compras/registrar', purchaseData);

            if (response.data.success) {
                // Actualizar asientos después de la compra
                await updateSeats(cart);

                setPurchaseSuccess(true);
                Swal.fire({
                    title: 'Compra exitosa',
                    text: `Tu compra fue realizada con éxito. Acepta para descargar tu ticket con el QR.`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                }).then(() => {
                    // Supongamos que `response.data` tiene los datos necesarios
                    const { ticketId, asientoId, zonaId, usuarioId, eventoId } = response.data; // Asegúrate de que estos datos existan en la respuesta
                    generateTicketPDF(ticketId, asientoId, zonaId, usuarioId, eventoId);
                    navigate(`/`); // Redirige al evento actual
                });
                

                localStorage.removeItem('cart');
                if (onClose) onClose();
                if (refreshSeats) refreshSeats();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.data.message || 'Hubo un problema con tu compra.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                });
            }
        } catch (error) {
            console.error('Error al realizar la compra:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo completar la compra. Revise los asientos disponibles o inténtelo más tarde.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        } finally {
            setLoading(false);
        }
    };

    // Actualizar estados de los asientos
    const updateSeats = async (cart) => {
        try {
            for (const item of cart) {
                const response = await axios.post('http://localhost:3001/api/asientos/actualizarEstado', {
                    asientoId: item.asientoId,
                    estado: 'vendido', // Cambiar estado a 'vendido'
                });

                if (!response.data.success) {
                    console.error(`Error al actualizar el estado del asiento con ID ${item.asientoId}`);
                }
            }
        } catch (error) {
            console.error('Error al actualizar el estado de los asientos:', error);
        }
    };

    // Generar ticket en PDF
    const generateTicketPDF = async (ticketId, asientoId, zonaId, usuarioId, eventoId) => {
        const doc = new jsPDF();
        const qrData = JSON.stringify({
            ticketId,
            asientoId,
            zonaId,
            usuarioId,
            eventoId
        });
    
        try {
            const qrCodeUrl = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' });
    
            doc.addImage(qrCodeUrl, 'PNG', 75, 90, 60, 60);
            doc.setFontSize(18);
            doc.text('Ticket de Compra', 105, 20, null, null, 'center');
    
            doc.setDrawColor(0, 0, 0);
            doc.line(10, 25, 200, 25);
    
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(`ID del Ticket: ${ticketId || 'No disponible'}`, 10, 35);
            doc.text(`ID del Usuario: ${usuarioId || 'No disponible'}`, 10, 45);
            doc.text(`ID del Asiento: ${asientoId || 'No disponible'}`, 10, 55);
            doc.text(`ID de la Zona: ${zonaId || 'No disponible'}`, 10, 65);
            doc.text(`ID del Evento: ${eventoId || 'No disponible'}`, 10, 75);
    
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Gracias por tu compra. Presenta este ticket en la entrada del evento.', 105, 170, null, null, 'center');
    
            doc.save('ticket_compra.pdf');
        } catch (error) {
            console.error('Error al generar el QR:', error);
        }
    };
    
    
    

    // Cerrar carrito
    const handleClose = () => {
        localStorage.removeItem('cart');
        navigate('/');
        if (onClose) onClose();
    };

    return (
        <div className={`floating-cart ${cart.length > 0 ? 'open' : ''}`}>
            <div className="floating-cart-header">Tu Carrito</div>

            {cart.length === 0 ? (
                <p>No hay productos en el carrito.</p>
            ) : (
                <div className="floating-cart-items">
                    {cart.map((item, index) => (
                        <div key={index} className="floating-cart-item">
                            <span>{item.ticketType} x{item.cantidad}</span>
                            <span>${(item.precioExtra * item.cantidad).toFixed(2)}</span>
                            <button onClick={() => onRemove(index)}>&#10005;</button>
                        </div>
                    ))}
                </div>
            )}

            {cart.length > 0 && !purchaseSuccess && (
                <div className="floating-cart-footer">
                    <div className="total">
                        <span>Total de entradas: {totalTickets}</span>
                        <span>Total: ${totalAmount.toFixed(2)}</span>
                        <span>Con descuento: ${totalWithDiscount.toFixed(2)}</span>
                    </div>

                    <div className="floating-cart-buttons">
                        <button onClick={handlePurchase} disabled={loading}>
                            {loading ? 'Procesando...' : 'Comprar'}
                        </button>
                        <button onClick={handleClose}>Cerrar</button>
                    </div>
                </div>
            )}

            {purchaseSuccess && (
                <div className="floating-cart-footer">
                    <h3>Compra realizada con éxito.</h3>
                    <QRCodeCanvas 
                        value={`Compra exitosa. Usuario: ${localStorage.getItem('userId')}`} 
                        size={128} 
                    />
                    <div className="floating-cart-buttons">
                        <button onClick={handleClose}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingCart;
