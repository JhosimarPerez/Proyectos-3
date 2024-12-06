import React, { useState } from 'react';
import '../pages/Register.css';
import '../pages/errormessage.css';

import logo from '../img/LogoUticket.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    cedula: '',
    email: '',
    password: '',
    repeatPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let validationErrors = {};

    if (!/^[a-zA-Z ñÑ]+$/.test(formData.nombre) || formData.nombre.length < 3 || formData.nombre.length > 15) {
      validationErrors.nombre = 'Nombre debe tener entre 3 y 15 letras.';
    }
    if (!/^[a-zA-Z ñÑ]+$/.test(formData.apellido) || formData.apellido.length < 3 || formData.apellido.length > 15) {
      validationErrors.apellido = 'Apellido debe tener entre 3 y 15 letras.';
    }

    if (!/^([67])[0-9]{7}$/.test(formData.celular)) {
      validationErrors.celular = 'Celular debe empezar con 6 o 7 y tener 8 números.';
    }

    if (!/^\d{4,10}([a-zA-Z]{1,2})?$/.test(formData.cedula)) {
      validationErrors.cedula = 'Cédula debe tener entre 4 y 10 dígitos y puede incluir 1 o 2 letras al final.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      validationErrors.email = 'Correo electrónico inválido.';
    }

    const { password, repeatPassword } = formData;
    if (password !== repeatPassword) {
      validationErrors.passwordMatch = 'Las contraseñas no coinciden.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      validationErrors.passwordStrength =
        'La contraseña debe tener entre 8 y 20 caracteres, una letra mayúscula, un número y un carácter especial.';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await axios.post('http://localhost:3001/api/usuarios', {
          nombres: formData.nombre,
          apellidos: formData.apellido,
          correo_electronico: formData.email,
          contrasena: formData.password,
          carnet: formData.cedula,
          numero_celular: formData.celular,
        });

        setSuccessMessage('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        setErrors({ server: error.response?.data?.error || 'Error al registrar usuario.' });
      }
    }
  };

  return (
    <div className="register-background">
      <div className="register-container">
        <div className="form-section">
          <h2>Crear cuenta</h2>
          <p>
            Si eres nuevo crea tu cuenta, sino{' '}
            <Link to="/login">inicia sesión aquí</Link>.
          </p>
          <form onSubmit={handleSubmit}>
          
            <input
              type="text"
              name="nombre"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            {errors.nombre && <p className="error">{errors.nombre}</p>}

            <input
              type="text"
              name="apellido"
              placeholder="Ingresa tu apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
            {errors.apellido && <p className="error">{errors.apellido}</p>}

            <input
              type="text"
              name="celular"
              placeholder="Ingresa tu celular"
              value={formData.celular}
              onChange={handleChange}
              required
            />
            {errors.celular && <p className="error">{errors.celular}</p>}

            <input
              type="text"
              name="cedula"
              placeholder="Ingresa tu cédula"
              value={formData.cedula}
              onChange={handleChange}
              required
            />
            {errors.cedula && <p className="error">{errors.cedula}</p>}

            <input
              type="email"
              name="email"
              placeholder="Ingresa tu correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.passwordStrength && <p className="error">{errors.passwordStrength}</p>}
            <input
              type="password"
              name="repeatPassword"
              placeholder="Repite tu contraseña"
              value={formData.repeatPassword}
              onChange={handleChange}
              required
            />
            {errors.passwordMatch && <p className="error">{errors.passwordMatch}</p>}

            {errors.server && <p className="error">{errors.server}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <button type="submit">Crear cuenta</button>
          </form>
        </div>
        <div className="logo-section">
          <img src={logo} alt="Logo Utickets" />
        </div>
      </div>
    </div>
  );
};

export default Register;
