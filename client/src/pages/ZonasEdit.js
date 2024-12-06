import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import '../pages/zonasedit.css';

const EditZona = () => {
  const { id } = useParams();  // Obtener el id de la zona a editar desde la URL
  const [zona, setZona] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    precio_extra: '',
    descripcion: '',
    evento_id: ''
  });

  const navigate = useNavigate();

  // Cargar la zona a editar y los eventos disponibles
  useEffect(() => {
    const fetchZona = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/zonas/${id}`);
        const data = await response.json();
        setZona(data);
        setFormData({
          nombre: data.nombre,
          capacidad: data.capacidad,
          precio_extra: data.precio_extra,
          descripcion: data.descripcion,
          evento_id: data.evento_id
        });
      } catch (error) {
        console.error('Error al cargar la zona:', error);
      }
    };

    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/eventos');
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error('Error al cargar los eventos:', error);
      }
    };

    fetchZona();
    fetchEventos();
  }, [id]);

  // Actualizar los datos del formulario al cambiar un campo
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar los datos actualizados al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    const errors = [];

    if (formData.nombre.length < 4 || formData.nombre.length > 10) {
      errors.push("El nombre de la zona debe tener entre 4 y 10 caracteres.");
    }
    if (formData.capacidad <= 0 || !Number.isInteger(Number(formData.capacidad))) {
      errors.push("La capacidad debe ser un número entero positivo.");
    }
    if (formData.precio_extra <= 0) {
      errors.push("El precio extra debe ser un número positivo.");
    }
    if (!/^[a-zA-Z0-9\s,.:;]+$/.test(formData.descripcion)) {
      errors.push("La descripción solo puede contener letras y los caracteres: \",:.;\"");
    }

    if (errors.length > 0) {
      // Mostrar SweetAlert si hay errores
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        html: errors.join('<br />'),
        confirmButtonText: 'Aceptar',
        customClass: {
          container: 'my-swal-container',
          popup: 'my-swal-popup'
        }
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/zonas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Mostrar SweetAlert en caso de éxito
        Swal.fire({
          icon: 'success',
          title: 'Zona actualizada con éxito',
          confirmButtonText: 'Aceptar',
          customClass: {
            container: 'my-swal-container',
            popup: 'my-swal-popup'
          }
        });
        navigate('/ZonasList');  // Redirigir a la lista de zonas
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar la zona',
          confirmButtonText: 'Aceptar',
          customClass: {
            container: 'my-swal-container',
            popup: 'my-swal-popup'
          }
        });
      }
    } catch (error) {
      console.error('Error al actualizar la zona:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar la zona',
        confirmButtonText: 'Aceptar',
        customClass: {
          container: 'my-swal-container',
          popup: 'my-swal-popup'
        }
      });
    }
  };

  return (
    <div className='zona-container'>
      <h2>Editar Zona</h2>
      {zona && (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="nombre">Nombre de la Zona</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="capacidad">Capacidad</label>
              <input
                type="number"
                id="capacidad"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="precio_extra">Precio Extra</label>
              <input
                type="number"
                id="precio_extra"
                name="precio_extra"
                value={formData.precio_extra}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="evento_id">Evento</label>
              <select
                id="evento_id"
                name="evento_id"
                value={formData.evento_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un evento</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="button-row">
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={() => navigate('/ZonasList')}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditZona;
