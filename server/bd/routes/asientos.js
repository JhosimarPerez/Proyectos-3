const express = require('express');
const router = express.Router();
const asientosController = require('../controllers/asientosController');


router.get('/', asientosController.getAllAsientos);

router.post('/', asientosController.createAsiento);

router.get('/:id', asientosController.getAsientoById);

router.put('/:id', asientosController.updateAsiento);

router.delete('/:id', asientosController.deleteAsiento);

module.exports = router;
