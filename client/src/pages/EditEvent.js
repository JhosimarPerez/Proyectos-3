import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
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
    iconAnchor: [12, 41], // Ancla del icono
    iconSize: [25, 41], // Tamaño del icono
    popupAnchor: [1, -34], // Ancla del popup
});

L.Marker.prototype.options.icon = defaultIcon;

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

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
        zonas: [], // Zonas relacionadas
    });

    const [imageFile, setImageFile] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/eventos/${eventId}`);
                const data = await response.json();

                const fechaHoraParts = data.fecha_hora.split(' ');
                setFormData({
                    ...data,
                    fechaInicio: fechaHoraParts[0],
                    horaInicio: fechaHoraParts[1].slice(0, 5),
                    es_evento_virtual: data.es_evento_virtual === 1,
                    zonas: data.zonas || [], // Cargar las zonas existentes
                });
            } catch (error) {
                console.error('Error al cargar el evento:', error);
            }
        };
        fetchEventDetails();
    }, [eventId]);

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
            setImageFile(files[0]);
            setPreviewImage(URL.createObjectURL(files[0]));
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    const handleZoneChange = (e, zoneIndex, field) => {
        const { value } = e.target;
        const updatedZonas = [...formData.zonas];
        updatedZonas[zoneIndex][field] = value;
        setFormData({ ...formData, zonas: updatedZonas });
    };

    const handleAddZone = () => {
        setFormData({
            ...formData,
            zonas: [...formData.zonas, { nombre: '', capacidad: '', precio_extra: '', filas: [] }],
        });
    };

    const handleRemoveZone = (zoneIndex) => {
        const updatedZonas = formData.zonas.filter((_, index) => index !== zoneIndex);
        setFormData({ ...formData, zonas: updatedZonas });
    };

    const handleAddRowToZone = (zoneIndex) => {
        const updatedZonas = [...formData.zonas];
        updatedZonas[zoneIndex].filas.push({ numero: updatedZonas[zoneIndex].filas.length + 1, asientos: '' });
        setFormData({ ...formData, zonas: updatedZonas });
    };

    const handleRemoveRowFromZone = (zoneIndex, rowIndex) => {
        const updatedZonas = [...formData.zonas];
        updatedZonas[zoneIndex].filas.splice(rowIndex, 1);
        setFormData({ ...formData, zonas: updatedZonas });
    };

    const handleRowChange = (e, zoneIndex, rowIndex) => {
        const { value } = e.target;
        const updatedZonas = [...formData.zonas];
        updatedZonas[zoneIndex].filas[rowIndex].asientos = value;
        setFormData({ ...formData, zonas: updatedZonas });
    };

    const handleMapClick = (e) => {
        setFormData({ ...formData, latitud: e.latlng.lat, longitud: e.latlng.lng });
    };

    const MapClickHandler = () => {
        useMapEvents({ click: handleMapClick });
        return null;
    };

    const validateFormData = () => {
        const errors = [];
        if (!formData.titulo || formData.titulo.length < 5) errors.push('El título debe tener al menos 5 caracteres.');
        if (formData.precio_base <= 0) errors.push('El precio base debe ser un número positivo.');
        if (formData.cupo_disponible <= 0) errors.push('El cupo disponible debe ser un número positivo.');
        if (!formData.fechaInicio || !formData.horaInicio) errors.push('La fecha y hora de inicio son obligatorias.');
        if (formData.es_evento_virtual && !formData.url_transmision) errors.push('El link de transmisión es obligatorio para eventos virtuales.');

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

            const response = await fetch(`http://localhost:3001/api/eventos/${eventId}`, {
                method: 'PUT',
                body: data,
            });

            const result = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Evento actualizado con éxito',
                    confirmButtonText: 'Aceptar',
                }).then(() => {
                    navigate('/activeevents');
                });
            } else {
                Swal.fire({ icon: 'error', title: '¡Error!', text: result.error || 'Error al actualizar el evento' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'Hubo un error al actualizar el evento.' });
        }
    };

    return (
        <form className="edit-event-form" onSubmit={handleSubmit}>
            <h2>Editar Evento</h2>
            <div className="image-upload">
                <label htmlFor="rutaImagen">Cargar Imagen:</label>
                <input type="file" name="rutaImagen" onChange={handleChange} accept="image/*" />
                {previewImage && <img src={previewImage} alt="Preview" className="preview-image" />}
            </div>
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
                <input
                    type="url"
                    name="url"
                    placeholder="URL del Evento"
                    value={formData.url}
                    onChange={handleChange}
                />
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
            <div className="categoria-section">
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
            <h3>Zonas y Asientos</h3>
            <div className="zonas-section">
                {formData.zonas.map((zona, zoneIndex) => (
                    <div key={zoneIndex} className="zona">
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre de la Zona"
                            value={zona.nombre}
                            onChange={(e) => handleZoneChange(e, zoneIndex, 'nombre')}
                            required
                        />
                        <input
                            type="number"
                            name="capacidad"
                            placeholder="Capacidad"
                            value={zona.capacidad}
                            onChange={(e) => handleZoneChange(e, zoneIndex, 'capacidad')}
                            required
                        />
                        <input
                            type="number"
                            name="precio_extra"
                            placeholder="Precio Extra"
                            value={zona.precio_extra}
                            onChange={(e) => handleZoneChange(e, zoneIndex, 'precio_extra')}
                        />
                        <div className="filas-section">
                            {zona.filas.map((fila, rowIndex) => (
                                <div key={rowIndex} className="fila">
                                    <input
                                        type="number"
                                        name="asientos"
                                        placeholder={`Asientos en fila ${fila.numero}`}
                                        value={fila.asientos}
                                        onChange={(e) => handleRowChange(e, zoneIndex, rowIndex)}
                                    />
                                    <button
                                        type="button"
                                        className="button-row-remove"
                                        onClick={() => handleRemoveRowFromZone(zoneIndex, rowIndex)}
                                    >
                                        Eliminar Fila
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="button-row-add"
                                onClick={() => handleAddRowToZone(zoneIndex)}
                            >
                                Añadir Fila
                            </button>
                        </div>
                        <button
                            type="button"
                            className="button-zone-remove"
                            onClick={() => handleRemoveZone(zoneIndex)}
                        >
                            Eliminar Zona
                        </button>
                    </div>
                ))}
                <button type="button" className="button-zone-add" onClick={handleAddZone}>
                    Añadir Zona
                </button>
            </div>
            <h1>Mapa</h1>
            <MapContainer
                center={[formData.latitud || -17.3935, formData.longitud || -66.1570]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler />
                {formData.latitud && formData.longitud && <Marker position={[formData.latitud, formData.longitud]} />}
            </MapContainer>
            <button type="submit" className="button-primary">
                Guardar Cambios
            </button>
        </form>
    );
};

export default EditEvent;
