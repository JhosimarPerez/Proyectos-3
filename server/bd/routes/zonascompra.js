const express = require('express');
const router = express.Router();

// Supongamos que tienes un modelo ZonaCompra
const ZonaCompra = require('../controllers/zonascompraController');  // Ajusta la importación según tu estructura

// Ruta para obtener las zonas de compra para un evento específico
router.get('/:eventoId', (req, res) => {
    const eventoId = req.params.eventoId;
    console.log('Evento ID:', eventoId);  // Asegúrate de que el eventoId esté llegando correctamente
  
    ZonaCompra.find({ eventoId: eventoId })
      .then(zonas => {
        if (zonas.length > 0) {
          res.json(zonas);
        } else {
          res.status(404).json({ error: 'No se encontraron zonas para este evento' });
        }
      })
      .catch(error => {
        console.error('Error al obtener las zonas:', error);
        res.status(500).json({ error: 'Error en la base de datos' });
      });
  });
  
module.exports = router;
