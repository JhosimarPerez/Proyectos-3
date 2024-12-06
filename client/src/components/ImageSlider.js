import React, { useState, useEffect } from 'react';
import './ImageSlider.css'; // Estilos del slider
import { useNavigate } from 'react-router-dom';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Cambiar imagen cada 3 segundos

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, [images]);

  const handleImageClick = (link) => {
    navigate(link); // Navegar al detalle del evento
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  if (images.length === 0) {
    return <div className="slider-container">Cargando imágenes...</div>;
  }

  return (
    <div className="slider-container">
      <div className="slider">
        {/* Imagen actual */}
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="slider-image"
          onClick={() => handleImageClick(images[currentIndex].link)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Botones de navegación */}
      <button className="slider-button prev" onClick={handlePrev}>
        &#10094;
      </button>
      <button className="slider-button next" onClick={handleNext}>
        &#10095;
      </button>
    </div>
  );
};

export default ImageSlider;
