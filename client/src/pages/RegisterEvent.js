import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuración del icono predeterminado de Leaflet
const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41], // Ancla del icono (ajusta si es necesario)
    iconSize: [25, 41], // Tamaño del icono
    popupAnchor: [1, -34], // Ancla del popup relativo al icono
});

L.Marker.prototype.options.icon = defaultIcon;

const RegisterEventDetails = ({ eventId }) => {
    const [formData, setFormData] = useState({
        categoria_evento_id: '',
        titulo: '',
        descripcion: '',
        url: '',
        organizadores: '',
        ubicacion: '',
        fechaInicio: '',
        horaInicio: '',
        precio_base: '',
        cupo_disponible: '',
        es_evento_virtual: false,
        url_transmision: '',
        plataforma_virtual: '',
        latitud: '',
        longitud: '',
        rutaImagen: '',
        zonas: [],
    });
    const [imageFile, setImageFile] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();
    const validateCapacity = () => {
        const totalCapacity = formData.zonas.reduce((sum, zona) => sum + zona.capacidad, 0);
        return totalCapacity === parseInt(formData.cupo_disponible, 10);
    };
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/categorias');
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
            }
        };
        fetchCategorias();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
    
        if (type === 'file') {
            const file = files[0]; // Obtiene el archivo seleccionado
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Vista previa
        } else {
            setFormData({
                ...formData,
                [name]: name === 'cupo_disponible' ? parseInt(value || 0, 10) : type === 'checkbox' ? checked : value,
            });
        }
    };

    const handleZoneChange = (e, zoneIndex, field) => {
        const { name, value } = e.target;
        const updatedZonas = [...formData.zonas];
        updatedZonas[zoneIndex][field] = value;
        // Actualizar los datos del formulario
        setFormData({
            ...formData,
            zonas: updatedZonas,
            cupo_disponible: calculateTotalCapacity(updatedZonas), // Recalcular capacidad total
        });
        
    };
    
    // Función para validar y recalcular cupo restante
    const getRemainingCapacity = () => {
        const totalCapacity = calculateTotalCapacity(formData.zonas);
        const remainingCapacity = parseInt(formData.cupo_disponible, 10) - totalCapacity;
        return remainingCapacity;
    };

    // Calcula la capacidad total del evento
    const calculateZoneCapacity = (filas) =>
        filas.reduce((total, fila) => total + parseInt(fila.asientos || 0, 10), 0);

    const calculateTotalCapacity = (zonas) =>
        zonas.reduce((total, zona) => total + calculateZoneCapacity(zona.filas), 0);

    // Al agregar una zona
    const handleAddZone = () => {
        const totalCapacity = formData.zonas.reduce((sum, zona) => sum + zona.capacidad, 0);

        if (totalCapacity >= parseInt(formData.cupo_disponible, 10)) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'No puedes agregar más zonas. El cupo disponible ya está completo.',
            });
            return;
        }

        const newZone = {
            nombre: `Zona ${formData.zonas.length + 1}`,
            capacidad: 0, // Iniciar sin capacidad
            precio_extra: '',
            filas: [],
        };

        setFormData((prevFormData) => ({
            ...prevFormData,
            zonas: [...prevFormData.zonas, newZone],
        }));
    };

    const handleRemoveZone = (zoneIndex) => {
        const updatedZonas = [...formData.zonas];
        updatedZonas.splice(zoneIndex, 1);

        setFormData((prevFormData) => ({
            ...prevFormData,
            zonas: updatedZonas,
        }));
    };

    // Al agregar una fila a una zona
    const handleAddRowToZone = (zoneIndex) => {
        const updatedZonas = [...formData.zonas];
        const zone = updatedZonas[zoneIndex];

        const totalCapacity = formData.zonas.reduce((sum, z) => sum + z.capacidad, 0);

        if (totalCapacity >= parseInt(formData.cupo_disponible, 10)) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'No puedes agregar más filas. El cupo disponible ya está completo.',
            });
            return;
        }

        const newRow = {
            numero: zone.filas.length + 1,
            asientos: Math.min(
                parseInt(formData.cupo_disponible, 10) - totalCapacity,
                10 // Máximo 10 asientos por fila como predeterminado
            ),
        };

        zone.filas.push(newRow);
        zone.capacidad += newRow.asientos;

        setFormData((prevFormData) => ({
            ...prevFormData,
            zonas: updatedZonas,
        }));
    };


    // Al eliminar una fila de una zona
    const handleRemoveRowFromZone = (zoneIndex, rowIndex) => {
        const updatedZonas = [...formData.zonas];
        const zone = updatedZonas[zoneIndex];
        const removedSeats = zone.filas[rowIndex].asientos;

        zone.filas.splice(rowIndex, 1);
        zone.capacidad -= removedSeats;

        setFormData((prevFormData) => ({
            ...prevFormData,
            zonas: updatedZonas,
        }));
    };

    // Al editar una fila de una zona
    const handleRowChange = (e, zoneIndex, rowIndex) => {
        const { value } = e.target;
        const updatedZonas = [...formData.zonas];
        const zone = updatedZonas[zoneIndex];

        const newAsientos = parseInt(value || 0, 10);

        if (newAsientos < 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'El número de asientos no puede ser negativo.',
            });
            return;
        }

        const currentTotalCapacity = calculateTotalCapacity(formData.zonas);
        const remainingCapacity = parseInt(formData.cupo_disponible, 10) - currentTotalCapacity;

        if (newAsientos - zone.filas[rowIndex].asientos > remainingCapacity) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: `No puedes exceder el cupo disponible. Asientos restantes: ${remainingCapacity}.`,
            });
            return;
        }

        zone.capacidad += newAsientos - zone.filas[rowIndex].asientos; // Ajustar capacidad
        zone.filas[rowIndex].asientos = newAsientos;

        setFormData({
            ...formData,
            zonas: updatedZonas,
        });
    };



    const handleMapClick = (e) => {
        setFormData({ ...formData, latitud: e.latlng.lat, longitud: e.latlng.lng });
    };

    const MapClickHandler = () => {
        useMapEvents({ click: handleMapClick });
        return null;
    };
    // Sincroniza la capacidad de cada zona automáticamente
    const syncZoneCapacity = (updatedZonas) => {
        return updatedZonas.map((zona) => {
            // Calcula la capacidad total (asientos) de la zona
            const totalAsientos = zona.filas.reduce((sum, fila) => sum + parseInt(fila.asientos || 0, 10), 0);
            return { ...zona, capacidad: totalAsientos }; // Actualiza la capacidad
        });
    };
    const validateFormData = () => {
        const errors = [];
        if (!validateCapacity()) {
            const totalCapacity = formData.zonas.reduce((sum, zona) => sum + zona.capacidad, 0);
            errors.push(
                `La capacidad total de las zonas (${totalCapacity}) debe coincidir con el cupo disponible (${formData.cupo_disponible}).`
            );
        }

        formData.zonas.forEach((zona, index) => {
            if (zona.filas.length === 0) {
                errors.push(`La zona "${zona.nombre || `Zona ${index + 1}`}" debe tener al menos una fila.`);
            }
        });
        if (!formData.titulo || formData.titulo.length < 5) errors.push('El título debe tener al menos 5 caracteres.');
        if (formData.precio_base <= 0) errors.push('El precio base debe ser un número positivo.');
        if (formData.cupo_disponible <= 0) errors.push('El cupo disponible debe ser un número positivo.');
        if (!formData.fechaInicio || !formData.horaInicio) errors.push('La fecha y hora de inicio son obligatorias.');
        if (formData.es_evento_virtual && !formData.url_transmision) errors.push('El link de transmisión es obligatorio para eventos virtuales.');
        if (formData.zonas.length === 0) errors.push('Debe agregar al menos una zona.');

        const fechaHoraInicio = new Date(`${formData.fechaInicio}T${formData.horaInicio}:00`);
        if (fechaHoraInicio < new Date()) errors.push('La fecha y hora de inicio no pueden ser en el pasado.');

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const errors = validateFormData();
        if (errors.length > 0) {
            Swal.fire({ icon: 'error', title: '¡Error!', html: errors.join('<br />') });
            return;
        }
    
        try {
            const data = new FormData();
    
            // Serializar zonas como JSON
            data.append('zonas', JSON.stringify(formData.zonas));
    
            // Agregar otros campos al FormData
            Object.keys(formData).forEach((key) => {
                if (key !== 'zonas') {
                    data.append(key, key === 'es_evento_virtual' ? (formData[key] ? 1 : 0) : formData[key]);
                }
            });
    
            // Agregar archivo de imagen si existe
            if (imageFile) {
                data.append('rutaImagen', imageFile);
            }
    
            const response = await fetch(eventId ? `http://localhost:3001/api/eventos/${eventId}` : 'http://localhost:3001/api/eventos', {
                method: eventId ? 'PUT' : 'POST',
                body: data,
            });
    
            const result = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Evento registrado con éxito',
                    confirmButtonText: 'Aceptar',
                }).then(() => {
                    // Limpiar los campos
                    setFormData({
                        categoria_evento_id: '',
                        titulo: '',
                        descripcion: '',
                        url: '', // Asegurarte de limpiar la URL también
                        organizadores: '',
                        ubicacion: '',
                        fechaInicio: '',
                        horaInicio: '',
                        precio_base: '',
                        cupo_disponible: '',
                        es_evento_virtual: false,
                        url_transmision: '',
                        plataforma_virtual: '',
                        latitud: '',
                        longitud: '',
                        rutaImagen: '',
                        zonas: [],
                    });
    
                    // Redirigir a la vista de ActiveEvents
                    navigate('/activeevents');
                });
            } else {
                Swal.fire({ icon: 'error', title: '¡Error!', text: result.error || 'Error al registrar el evento' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'Hubo un error al registrar el evento.' });
        }
    };
    

    return (
        <form className="register-event-details-form" onSubmit={handleSubmit}>
            <h2>{eventId ? 'Actualizar Evento' : 'Registrar Evento'}</h2>
            <div className="image-upload">
                <label htmlFor="rutaImagen">Cargar Imagen:</label>
                <input type="file" name="rutaImagen" onChange={handleChange} accept="image/*" />
                {previewImage && <img src={previewImage} alt="Preview" className="preview-image" />}
            </div>
            {/* Información General del Evento */}
            <div className="general-info-section">
                <input
                    type="text"
                    name="titulo"
                    placeholder="Título del Evento"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="descripcion"
                    placeholder="Descripción del Evento"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="organizadores"
                    placeholder="Organizadores"
                    value={formData.organizadores}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="ubicacion"
                    placeholder="Ubicación"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="precio_base"
                    placeholder="Precio Base"
                    value={formData.precio_base}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="cupo_disponible"
                    placeholder="Cupo Disponible"
                    value={formData.cupo_disponible}
                    onChange={handleChange}
                    disabled={formData.zonas.length > 0} // Bloqueado si ya hay zonas
                    required
                />
                <label>
                    <input
                        type="checkbox"
                        name="es_evento_virtual"
                        checked={formData.es_evento_virtual}
                        onChange={handleChange}
                    />
                    Evento Virtual
                </label>

                {/* Campo URL del Evento */}
                <input
                    type="url"
                    name="url"
                    placeholder="URL del Evento"
                    value={formData.url}
                    onChange={handleChange}
                    required
                />


                {/* Campos de Fecha y Hora */}
                <div className="fecha-hora-section">
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

                {/* Link de transmisión (solo si es virtual) */}
                {formData.es_evento_virtual && (
                    <div className="transmision-section">
                        <input
                            type="url"
                            name="url_transmision"
                            placeholder="URL de Transmisión"
                            value={formData.url_transmision}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
            </div>

            {/* Selección de Categoría */}
            <div className="categoria-section">
                <h3>Selecciona la Categoría del Evento</h3>
                <select
                    name="categoria_evento_id"
                    value={formData.categoria_evento_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                        </option>
                    ))}
                </select>
            </div>
            <h3>Prioridad de Evento</h3>
            <select name="prioridadImagen" value={formData.prioridadImagen} onChange={handleChange}>
                            <option value="0">Normal</option>
                            <option value="1">Alta</option>
            </select>
            <h1>Maps</h1>
            <MapContainer
                center={[-17.3935, -66.1570]} // Coordenadas de Cochabamba
                zoom={13}
                style={{ height: '300px', width: '100%' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler />
                {formData.latitud && formData.longitud && (
                    <Marker position={[formData.latitud, formData.longitud]} />
                )}
            </MapContainer>



            {/* Zonas del Evento */}
            <div className="zonas-section">
                <h3>Define las Zonas del Evento</h3>
                {formData.zonas.map((zona, zoneIndex) => (
                    <div key={zoneIndex}>
                        <input
                            type="text"
                            placeholder="Nombre de la zona"
                            value={zona.nombre}
                            onChange={(e) => {
                                const updatedZonas = [...formData.zonas];
                                updatedZonas[zoneIndex].nombre = e.target.value;
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    zonas: updatedZonas,
                                }));
                            }}
                        />
                        <p>Capacidad calculada: {calculateZoneCapacity(zona.filas)}</p>
                        <button type="button" onClick={() => handleAddRowToZone(zoneIndex)}>Añadir Fila</button>
                        {zona.filas.map((fila, rowIndex) => (
                            <div key={rowIndex}>
                                <input
                                    type="number"
                                    placeholder="Asientos"
                                    value={fila.asientos}
                                    onChange={(e) => handleRowChange(e, zoneIndex, rowIndex)}
                                />
                                <button type="button" onClick={() => handleRemoveRowFromZone(zoneIndex, rowIndex)}>Eliminar Fila</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => handleRemoveZone(zoneIndex)}>Eliminar Zona</button>
                    </div>
                ))}
                <button type="button" className="button-zone-add" onClick={handleAddZone}>Añadir Zona</button>
            </div>

            <button type="submit" className="button-primary">
                {eventId ? 'Actualizar Evento' : 'Registrar Evento'}
            </button>
        </form>
    );
};

export default RegisterEventDetails;

