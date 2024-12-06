const express = require('express');
const router = express.Router();
const { registrarCompra, actualizarEstadoAsiento } = require('../controllers/compraController');

// Ruta para registrar la compra
router.post('/registrar', registrarCompra);

// Ruta para actualizar estado de asientos
router.post('/actualizarEstado', actualizarEstadoAsiento);

module.exports = router;
