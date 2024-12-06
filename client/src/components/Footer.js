import React from 'react';
import './Footer.css'; // Archivo de estilos

const Footer = () => {
  return (
    <footer className="footer">
     

      {/* Sección de copyright */}
      <div className="footer-bottom">
        <h3 className="footer-logo">UTicket</h3>
        <p>
          Uticket es una página web creada por los estudiantes de la 
          Universidad del Valle: Diana A, Kelvin, Juan Rojas, Valeria R.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
