import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import '../pages/registerZones.css';

const RegisterZones = () => {
    const [formData, setFormData] = useState({
        eventoId: '',
        nombreZona: '',
        zonaCapacidad: '',
        zonaPrecioExtra: '',
        descripcion: '',
    });

    const [eventos, setEventos] = useState([]);
    const [zonas, setZonas] = useState([]);
    const navigate = useNavigate();

    // Fetch events for dropdown
    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/eventos');
                const data = await response.json();
                setEventos(data);
            } catch (error) {
                console.error('Error al cargar los eventos:', error);
            }
        };

        fetchEventos();
    }, []);

    // Update zones when an event is selected
    useEffect(() => {
        if (formData.eventoId) {
            const selectedEvent = eventos.find(evento => evento.evento_id === parseInt(formData.eventoId));
            if (selectedEvent) {
                setZonas(selectedEvent.zonas || []);
            }
        }
    }, [formData.eventoId, eventos]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const { nombreZona, zonaCapacidad, zonaPrecioExtra, descripcion } = formData;

        const nombreZonaRegex = /^[a-zA-Z]{4,15}$/;
        if (!nombreZonaRegex.test(nombreZona)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El nombre de la zona debe tener entre 4 y 15 letras.',
            });
            return false;
        }

        if (zonaCapacidad <= 0 || !Number.isInteger(Number(zonaCapacidad))) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La capacidad debe ser un número entero positivo.',
            });
            return false;
        }

        if (zonaPrecioExtra <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El precio extra debe ser un número positivo.',
            });
            return false;
        }

        const descripcionRegex = /^[a-zA-Z,.:; ]+$/;
        if (!descripcionRegex.test(descripcion)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La descripción solo puede contener letras.',
            });
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/zonas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Zona registrada con éxito',
                });
                navigate('/zonasList');  // Redirige a la página de lista de zonas
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al registrar la zona',
                });
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al registrar la zona',
            });
        }
    };

    return (
        <form className="register-zones-form" onSubmit={handleSubmit}>
            <h2>Registro de Zona</h2>

            <label>Evento</label>
            <select
                name="eventoId"
                value={formData.eventoId}
                onChange={handleChange}
                required
            >
                <option value="">Seleccione un evento</option>
                {eventos.map((evento) => (
                    <option key={evento.evento_id} value={evento.evento_id}>
                        {evento.titulo}
                    </option>
                ))}
            </select>

            <div>
                <h3>Zonas existentes</h3>
                {zonas.length > 0 ? (
                    <ul>
                        {zonas.map((zona) => (
                            <li key={zona.zona}>
                                Zona: {zona.zona} | Capacidad: {zona.zona_capacidad} | Precio Extra: {zona.zona_precio_extra}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay zonas registradas para este evento.</p>
                )}
            </div>

            <label>Nombre de la zona</label>
            <input
                type="text"
                name="nombreZona"
                placeholder="Nombre de la zona"
                value={formData.nombreZona}
                onChange={handleChange}
                required
            />

            <label>Capacidad de la zona</label>
            <input
                type="number"
                name="zonaCapacidad"
                placeholder="Capacidad de la zona"
                value={formData.zonaCapacidad}
                onChange={handleChange}
                required
            />

            <label>Precio Extra</label>
            <input
                type="number"
                name="zonaPrecioExtra"
                placeholder="Precio extra de la zona"
                value={formData.zonaPrecioExtra}
                onChange={handleChange}
                required
            />

            <label>Descripción de la zona</label>
            <textarea
                name="descripcion"
                placeholder="Descripción de la zona"
                value={formData.descripcion}
                onChange={handleChange}
                required
            />

            <button type="submit">Registrar Zona</button>
        </form>
    );
};

export default RegisterZones;
