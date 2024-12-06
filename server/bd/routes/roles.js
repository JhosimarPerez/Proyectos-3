// routes/rolesRoutes.js
const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

// Definir las rutas para el CRUD de roles
router.get('/', rolesController.getAllRoles);
router.get('/:id', rolesController.getRolById);
router.post('/', rolesController.createRol);
router.put('/:id', rolesController.updateRol);
router.delete('/:id', rolesController.deleteRol);

module.exports = router;
