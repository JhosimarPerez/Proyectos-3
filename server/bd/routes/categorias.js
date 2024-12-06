const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

// Ruta para obtener todas las categorías
router.get('/', categoriasController.getAllCategorias);

module.exports = router;
