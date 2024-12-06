const express = require('express');
const router = express.Router();
const { validarQR } = require('../controllers/qrController');

router.post('/validarQR', validarQR);

module.exports = router;
