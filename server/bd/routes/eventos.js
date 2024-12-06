const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');
const db = require('../../db'); // Configuración de conexión MySQL

// Ruta para obtener todos los eventos
router.get('/', eventosController.getAllEventos);

// Ruta para obtener un evento por ID
router.get('/:id', eventosController.getEventoById);

// Ruta para crear o actualizar un evento
router.post('/', eventosController.createOrUpdateEvento); // Usamos la función createOrUpdateEvento en lugar de createEvento
router.put('/:id', eventosController.createOrUpdateEvento); // Usamos la misma función para la actualización, ya que maneja ambos casos

// Ruta para eliminar un evento
router.delete('/:id', eventosController.deleteEvento);

// Ruta para manejar la compra y actualizar el stock (puedes mover esta lógica al controlador si prefieres)
// Ruta para manejar la compra y actualizar el stock
router.post('/:id/compra', eventosController.realizarCompra);

//Trae al slider 
router.get('/prioritarios', eventosController.getEventosPrioritarios);

module.exports = router;
