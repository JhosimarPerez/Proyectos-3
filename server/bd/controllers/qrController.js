const db = require('../../db'); // Conexión a la base de datos

const validarQR = async (req, res) => {
    const { qrData, validadoPor } = req.body;

    if (!qrData || !validadoPor) {
        return res.status(400).json({ error: 'Datos incompletos para validar el QR.' });
    }

    const { ticketId, eventoId, usuarioId } = qrData;

    let connection;
    try {
        connection = await db.getConnection();

        // Verificar si el ticket es válido
        const [ticketData] = await connection.query(
            'SELECT * FROM compras WHERE id = ? AND evento_id = ? AND usuario_id = ?',
            [ticketId, eventoId, usuarioId]
        );

        if (!ticketData.length) {
            return res.status(404).json({ success: false, message: 'El ticket no es válido.' });
        }

        // Verificar si ya se registró la asistencia
        const [historial] = await connection.query(
            'SELECT * FROM historial_asistencia WHERE ticket_id = ?',
            [ticketId]
        );

        if (historial.length) {
            return res.status(400).json({ success: false, message: 'Este ticket ya fue validado.' });
        }

        // Registrar asistencia en la tabla `historial_asistencia`
        await connection.query(
            'INSERT INTO historial_asistencia (evento_id, ticket_id, usuario_id, validado_por) VALUES (?, ?, ?, ?)',
            [eventoId, ticketId, usuarioId, validadoPor]
        );

        res.status(200).json({ success: true, message: 'Asistencia registrada con éxito.' });
    } catch (error) {
        console.error('Error al validar el QR:', error);
        res.status(500).json({ error: 'Error al validar el QR.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { validarQR };
