import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import ImageSlider from '../components/ImageSlider';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import './Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SimpleHome = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('rol');
    setUserRole(role);

    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/eventos');
        const data = await response.json();
        const eventsWithImages = data.map((event) => ({
          ...event,
          image: `https://source.unsplash.com/random/300x200?sig=${event.evento_id}`,
        }));
        setEvents(eventsWithImages);
      } catch (error) {
        console.error('Error al cargar los eventos:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setUserRole(null);
    navigate('/login');
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    console.log('Mensaje enviado:', message);
    setMessage('');
    setShowForm(false);
  };

  // Función que se llama cuando el usuario hace clic en el botón de dudas
  const handleDudasClick = () => {
    Swal.fire({
      title: '¿Quiénes somos?',
      text: 'Univalle es una universidad de prestigio con un compromiso firme con la educación, la investigación y el desarrollo social. Ofrecemos una amplia variedad de programas académicos para estudiantes de todas las edades.',
      icon: 'info',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Univalle_bol_cbb_logo.png', // Logo de Univalle
      imageWidth: 150, // Ajustar el tamaño de la imagen
      imageHeight: 150, // Ajustar el tamaño de la imagen
      imageAlt: 'Logo de Univalle',
      confirmButtonText: 'Entendido',
    });
  };

  return (
    <div className="home">
      <ImageSlider images={[
        'https://cc-prod.scene7.com/is/image/CCProdAuthor/concert-photography_P1_900x420?$pjpeg$&jpegSize=200&wid=900',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2dG99rerOdMqJd3Zkk6IMg0JV-htvQJjGVg&s',
        'https://cdn.agenciasinc.es/var/ezwebin_site/storage/images/_aliases/img_1col/reportajes/cuando-volveremos-a-ir-a-conciertos-con-normalidad/8867610-2-esl-MX/Cuando-volveremos-a-ir-a-conciertos-con-normalidad.png',
      ]} />

      <section className="event-list">
        {events.length > 0 ? (
          events.map((event) => <EventCard key={event.evento_id} event={event} />)
        ) : (
          <p>No hay eventos disponibles en este momento.</p>
        )}
      </section>

      {userRole && (
        <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      )}

      {/* Botón flotante con el signo de interrogación */}
      <div className="floating-icon" onClick={handleDudasClick}>
        <i className="fas fa-question"></i> {/* Ícono de duda */}
      </div>

      {showForm && (
        <div className="floating-form">
          <h3>Contáctanos</h3>
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="Escribe tu mensaje..."
            rows="4"
          />
          <button onClick={handleSendMessage}>Enviar</button>
          <button onClick={() => setShowForm(false)} type="button">Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default SimpleHome;
