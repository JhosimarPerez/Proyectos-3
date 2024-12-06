// controllers/attendanceController.js
const db = require('../../db'); // Conexión a la base de datos

const getAttendanceHistory = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                ha.id AS asistencia_id,
                ha.asiento_id,
                ha.zona_id,
                ha.usuario_id,
                ha.evento_id,
                ha.fecha AS fecha_asistencia,
                CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario,
                u.correo_electronico AS email_usuario,
                z.nombre AS nombre_zona,
                e.titulo AS nombre_evento,
                e.descripcion AS descripcion_evento,
                e.fecha_hora AS fecha_evento,
                CONCAT('Fila ', a.fila, ', Asiento ', a.numero) AS ubicacion_asiento
            FROM 
                historial_asistencia ha
            LEFT JOIN asientos a ON ha.asiento_id = a.id
            LEFT JOIN zonas z ON ha.zona_id = z.id
            LEFT JOIN usuarios u ON ha.usuario_id = u.id
            LEFT JOIN eventos e ON ha.evento_id = e.id;
        `);

        console.log("Resultados de la consulta:", results); // Verifica lo que devuelve la consulta

        if (results.length > 0) {
            return res.json({
                success: true,
                history: results,
            });
        } else {
            return res.json({
                success: false,
                message: 'No se encontraron registros de asistencia.',
            });
        }
    } catch (error) {
        console.error('Error al obtener el historial de asistencias:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de asistencias.',
        });
    }
};

module.exports = {
    getAttendanceHistory,
};