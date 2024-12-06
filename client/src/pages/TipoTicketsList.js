import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/TipoTicketsList.css';

const TipoTicketsList = () => {
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/tickets');
                const data = await response.json();
                setTickets(data);
            } catch (error) {
                console.error("Error al cargar los tickets:", error);
            }
        };

        fetchTickets();
    }, []);

    const handleEdit = (id) => {
        navigate(`/tipotickets/${id}`);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas borrar este ticket?");
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setTickets(tickets.filter(ticket => ticket.id !== id));
                    alert("Ticket eliminado con éxito.");
                } else {
                    alert("Error al eliminar el ticket.");
                }
            } catch (error) {
                console.error("Error al eliminar el ticket:", error);
            }
        }
    };

    return (
        <div className="tipo-tickets-list">
            <h2>Listado de Tipo de Tickets</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Es de Pago</th>
                        <th>Precio</th>
                        <th>Límite de Compra</th>
                        <th>Stock</th>
                        <th>Fecha Inicio de Venta</th>
                        <th>Fecha Final de Venta</th>
                        <th>Es por Fecha</th>
                        <th>ID Evento</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td>{ticket.id}</td>
                            <td>{ticket.nombre}</td>
                            <td>{ticket.es_de_pago ? 'Sí' : 'No'}</td>
                            <td>{ticket.precio}</td>
                            <td>{ticket.limite_compra}</td>
                            <td>{ticket.stock}</td>
                            <td>{new Date(ticket.fecha_inicio_venta).toLocaleString()}</td>
                            <td>{new Date(ticket.fecha_final_venta).toLocaleString()}</td>
                            <td>{ticket.es_por_fecha ? 'Sí' : 'No'}</td>
                            <td>{ticket.evento_id}</td>
                            <td>{ticket.activo ? 'Activo' : 'Inactivo'}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleEdit(ticket.id)}>Editar</button>
                                <button className="delete-btn" onClick={() => handleDelete(ticket.id)}>Borrar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TipoTicketsList;
