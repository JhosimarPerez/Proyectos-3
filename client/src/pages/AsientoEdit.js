import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../pages/editAsiento.css';
import Swal from 'sweetalert2';


const EditAsiento = () => {
  const { id } = useParams();
  const [asiento, setAsiento] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [formData, setFormData] = useState({
    zona_id: '',
    fila: '',
    numero: '',
    estado: 'disponible',
  });
  const navigate = useNavigate();

  // Cargar el asiento a editar
  useEffect(() => {
    const fetchAsiento = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/asientos/${id}`);
        const data = await response.json();
        setAsiento(data);
        setFormData({
          zona_id: data.zona_id,
          fila: data.fila,
          numero: data.numero,
          estado: data.estado,
        });
      } catch (error) {
        console.error('Error al cargar el asiento:', error);
      }
    };

    // Cargar las zonas disponibles
    const fetchZonas = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/zonas');
        const data = await response.json();
        setZonas(data);
      } catch (error) {
        console.error('Error al cargar las zonas:', error);
      }
    };

    fetchAsiento();
    fetchZonas();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3001/api/asientos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Asiento actualizado con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          navigate('/asientos');
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el asiento',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      console.error('Error al actualizar el asiento:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el asiento',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  if (!asiento) return <div>Cargando...</div>;

  return (
    <div className='container-aEdit'>
      <h2>Editar Asiento</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="zona_id">Zona</label>
          <select
            id="zona_id"
            name="zona_id"
            value={formData.zona_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una zona</option>
            {zonas.map((zona) => (
              <option key={zona.zona_id} value={zona.zona_id}>
                {zona.zona_nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fila">Fila</label>
          <input
            type="text"
            id="fila"
            name="fila"
            value={formData.fila}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="numero">Número</label>
          <input
            type="number"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
          </select>
        </div>

        <button type="submit">Actualizar Asiento</button>
      </form>
    </div>
  );
};

export default EditAsiento;
