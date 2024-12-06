const express = require('express');
const router = express.Router();
const eventoSelectController = require('../controllers/eventoSelectController');

// Obtener todos los eventos
router.get('/eventosSelect', eventoSelectController.getAllEventos);

// Obtener un evento específico por ID
router.get('/:id', eventoSelectController.getEventoById);



module.exports = router;
