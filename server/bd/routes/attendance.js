// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { getAttendanceHistory } = require('../controllers/attendanceController');

// Define la ruta para obtener el historial de asistencias
router.get('/history', getAttendanceHistory);

module.exports = router;
