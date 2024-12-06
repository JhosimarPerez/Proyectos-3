import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../img/LogoUticket.png';
import '../components/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null); // Limpiamos cualquier error previo
    
        try {
            const response = await axios.post('http://localhost:3001/api/usuarios/login', {
                correo_electronico: email,
                contrasena: password,
            });
    
            // Guardar el token, rol y userId en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('rol', response.data.rol); // Aquí guardamos el rol
            localStorage.setItem('userId', response.data.userId); // Guardamos el userId
    
            // Redirigir al usuario a la página principal
            navigate('/'); // Ya no diferenciamos por rutas aquí; el rol determinará la interfaz visible.
        } catch (error) {
            // Manejar el error y mostrar el mensaje adecuado
            if (error.response && error.response.status === 401) {
                setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
            } else {
                setError('Ocurrió un error al intentar iniciar sesión. Inténtelo más tarde.');
            }
        }
    };
    

    // Función para redirigir al inicio sin login
    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="login-background">
            <div className="login-container">
                <div className="logo-section">
                    <img src={logo} alt="Logo Utickets" />
                </div>

                <div className="form-section">
                    <h2>Bienvenido a <span className="highlight">UTICKET</span></h2>

                    <form onSubmit={handleLogin}>
                        <div className="input-container">
                            <input
                                type="email"
                                placeholder="Ingresa tu correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input type="checkbox" id="remember-me" />
                                <label htmlFor="remember-me">Recuérdame</label>
                            </div>
                            <Link to="/forgot-password" className="forgot-password">Olvidé mi contraseña</Link>
                        </div>

                        {error && <div className="error">{error}</div>}

                        <button type="submit" className="login-button">Ingresar</button>
                    </form>

                    <button onClick={goToHome} className="go-to-home-button">
                        Ir a Inicio
                    </button>

                    <p className="register-option">
                        ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
