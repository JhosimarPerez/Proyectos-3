// routes/zonas.js
const express = require('express');
const router = express.Router();
const zonasController = require('../controllers/zonasController'); // Importar el controlador correctamente

// Rutas de zonas
router.get('/', zonasController.getAllZonas);             // Obtener todas las zonas
router.get('/:id', zonasController.getZonaById);          // Obtener zona por ID
router.post('/', zonasController.createZona);             // Crear una nueva zona
router.put('/:id', zonasController.updateZona);           // Actualizar zona
router.delete('/:id', zonasController.deleteZona);        // Eliminar zona

module.exports = router;
