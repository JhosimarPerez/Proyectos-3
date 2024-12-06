import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import './Header.css';

const Header = () => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Obtener el rol del usuario desde el localStorage
  useEffect(() => {
    const role = localStorage.getItem('rol');
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setUserRole(null);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg custom-bg">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          Uticket.
        </Link>

        {/* Botón de colapso en pantallas pequeñas */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido del menú */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
          

            {/* Opciones exclusivas para el administrador (rol 1) */}
            {userRole === '1' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/ActiveUsers">
                    Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/ActiveUsers">
                    Asistencia a Eventos
                  </Link>
                </li>
                
                
                <li className="nav-item">
                  <Link className="nav-link" to="/ActiveEvents">
                    Eventos
                  </Link>
                </li>
              </>
            )}

            {/* Opciones exclusivas para usuarios estándar (rol 2) */}
            {userRole === '2' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Inicio
                  </Link>
                </li>
              </>
            )}

            {/* Botón para login o cerrar sesión */}
            {userRole ? (
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
