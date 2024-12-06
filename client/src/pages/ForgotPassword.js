import React, { useState } from 'react';
import '../components/ForgotPassword.css'; 

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    userOrEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

   
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    console.log('Datos de recuperación:', formData);
  };

  return (
    <div className="forgot-password-container">
        
      <h2>Olvidé mi contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userOrEmail"
          placeholder="Usuario o correo electrónico"
          value={formData.userOrEmail}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Nueva contraseña"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar nueva contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Restablecer contraseña</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
