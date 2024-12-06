const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Rutas de usuarios
router.get('/', usuariosController.getAllUsuarios);
router.get('/:id', usuariosController.getUsuarioById);
router.get('/:id/historial', usuariosController.getHistorialCompras); // Nueva ruta para obtener el historial de compras
router.post('/', usuariosController.createUsuario);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deleteUsuario);

// Ruta de inicio de sesión
router.post('/login', usuariosController.loginUsuario);

module.exports = router;
