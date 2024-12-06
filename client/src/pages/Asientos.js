import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Asientos.css'; 
import Swal from 'sweetalert2'; 

const AsientosList = () => {
  const [asientos, setAsientos] = useState([]);
  const navigate = useNavigate();

  // Cargar los asientos desde el backend
  useEffect(() => {
    const fetchAsientos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/asientos');
        const data = await response.json();
        setAsientos(data);
      } catch (error) {
        console.error('Error al cargar los asientos:', error);
      }
    };

    fetchAsientos();
  }, []);

  // Eliminar asiento
  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro de que deseas eliminar este asiento?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost:3001/api/asientos/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setAsientos(asientos.filter((asiento) => asiento.asiento_id !== id));
          Swal.fire('¡Eliminado!', 'El asiento ha sido eliminado con éxito.', 'success');
        } else {
          Swal.fire('Error', 'Hubo un problema al eliminar el asiento', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar el asiento:', error);
        Swal.fire('Error', 'Hubo un problema al eliminar el asiento', 'error');
      }
    }
  };

  return (
    <div className="asientos-container">
      <h2 className="asientos-title">Listado de Asientos</h2>

      {/* Botón "Crear Nuevo Asiento" */}
      <button
        className="btn-create-asiento"
        onClick={() => navigate('/AsientosCreate')}
      >
        Crear Nuevo Asiento
      </button>

      <table className="asientos-table">
        <thead>
          <tr>
            <th>Zona</th>
            <th>Fila</th>
            <th>Número</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asientos.length > 0 ? (
            asientos.map((asiento) => (
              <tr key={asiento.asiento_id}>
                <td>{asiento.zona_nombre}</td>
                <td>{asiento.fila}</td>
                <td>{asiento.numero}</td>
                <td>{asiento.estado}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/AsientoEdit/${asiento.asiento_id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(asiento.asiento_id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-asientos">
                No hay asientos disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AsientosList;
