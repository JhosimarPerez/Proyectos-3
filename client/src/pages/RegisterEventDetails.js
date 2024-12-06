import React, { useState } from 'react';
import '../components/RegisterEventDetails.css';

const RegisterEventDetails = ({ eventData }) => {
    const [formData, setFormData] = useState({
        fechaInicio: '',
        horaInicio: '',
        fechaFin: '',
        horaFin: '',
        aperturaPuertas: '',
        modalidad: '',
        nombreLugar: '',
        ciudad: 'Cochabamba',
        enlaceUbicacion: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Crear la fecha y hora de inicio combinadas
        const fechaHoraInicio = new Date(formData.fechaInicio + 'T' + formData.horaInicio);
        // Crear la fecha y hora de fin combinadas
        const fechaHoraFin = new Date(formData.fechaFin + 'T' + formData.horaFin);

        // Verificar si las fechas son válidas
        if (isNaN(fechaHoraInicio) || isNaN(fechaHoraFin)) {
            alert("Las fechas y horas no son válidas.");
            return;
        }

        // Crear la apertura de puertas (si es proporcionada) como una fecha de hoy con la hora proporcionada
        let aperturaPuertas = null;
        if (formData.aperturaPuertas) {
            aperturaPuertas = new Date();
            const [hours, minutes] = formData.aperturaPuertas.split(":");
            aperturaPuertas.setHours(hours, minutes, 0, 0);
        }

        // Combinamos los datos del evento con los detalles adicionales
        const eventDetails = {
            ...eventData, // Datos del evento
            fecha_hora_inicio: fechaHoraInicio.toISOString(),  // Convertir a formato ISO
            fecha_hora_fin: fechaHoraFin.toISOString(),  // Convertir a formato ISO
            apertura_puertas: aperturaPuertas ? aperturaPuertas.toISOString() : null,
            ...formData,  // Datos adicionales
        };

        try {
            const response = await fetch('http://localhost:3001/api/eventos/detalles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventDetails),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Evento creado con éxito');
            } else {
                alert(data.error || 'Error al guardar los detalles del evento');
            }
        } catch (error) {
            console.error('Error al guardar los detalles del evento:', error);
            alert('Hubo un error al guardar los detalles del evento.');
        }
    };

    return (
        <form className="register-event-details-form" onSubmit={handleSubmit}>
            <h2>Detalles del Evento</h2>
            <p>Ingresa la información detallada de tu evento.</p>

            <div className="fecha-section">
                <h3>Fecha</h3>
                <div className="fecha-fields">
                    <div>
                        <label>Fecha y hora de inicio del evento</label>
                        <input
                            type="date"
                            name="fechaInicio"
                            value={formData.fechaInicio}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="time"
                            name="horaInicio"
                            value={formData.horaInicio}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Fecha y hora de fin del evento</label>
                        <input
                            type="date"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="time"
                            name="horaFin"
                            value={formData.horaFin}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Apertura de puertas</label>
                        <input
                            type="time"
                            name="aperturaPuertas"
                            value={formData.aperturaPuertas}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="lugar-section">
                <h3>Lugar</h3>
                <div className="modalidad-options">
                    <label>
                        <input
                            type="radio"
                            name="modalidad"
                            value="Presencial"
                            checked={formData.modalidad === 'Presencial'}
                            onChange={handleChange}
                            required
                        />
                        Presencial
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="modalidad"
                            value="Virtual"
                            checked={formData.modalidad === 'Virtual'}
                            onChange={handleChange}
                            required
                        />
                        Virtual
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="modalidad"
                            value="Híbrido"
                            checked={formData.modalidad === 'Híbrido'}
                            onChange={handleChange}
                            required
                        />
                        Híbrido
                    </label>
                </div>
                <input
                    type="text"
                    name="nombreLugar"
                    placeholder="Nombre del lugar"
                    value={formData.nombreLugar}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="ciudad"
                    placeholder="Ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                />
                <input
                    type="url"
                    name="enlaceUbicacion"
                    placeholder="Enlace de Google Maps"
                    value={formData.enlaceUbicacion}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">Guardar Evento</button>
        </form>
    );
};

export default RegisterEventDetails;
