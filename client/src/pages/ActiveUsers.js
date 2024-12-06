import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import Swal from 'sweetalert2';


const ActiveUsers = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/usuarios');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error al cargar los usuarios:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleEdit = (userId) => {
        navigate(`/editUser/${userId}`);
    };

    const handleViewMore = (userId) => {
        navigate(`/userDetails/${userId}`);
    };

    const handleDelete = async (userId) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Estás seguro de que quieres eliminar este usuario?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3001/api/usuarios/${userId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setUsers(users.filter(user => user.id !== userId));
                    Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado exitosamente.', 'success');
                } else {
                    Swal.fire('Error', 'Hubo un error al eliminar el usuario', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar el usuario:', error);
                Swal.fire('Error', 'Hubo un error al eliminar el usuario', 'error');
            }
        }
    };

    return (
        <div className="active-users">
            <h2>Usuarios Activos</h2>


            <table className="users-table table table-striped">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo Electrónico</th>
                        <th>Número Celular</th>
                        <th>Rol</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.nombres} {user.apellidos}</td>
                                <td>{user.correo_electronico}</td>
                                <td>{user.numero_celular}</td>
                                <td>{user.rol_id === 1 ? 'Administrador' : 'Usuario'}</td>
                               
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No hay usuarios registrados</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveUsers;
