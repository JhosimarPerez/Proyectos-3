const db = require('../../db');

// Obtener todos los tickets activos con nombre del evento
exports.getAllTickets = async (req, res) => {
    try {
        const query = `
            SELECT TipoTickets.*, Eventos.titulo AS evento_titulo 
            FROM TipoTickets 
            LEFT JOIN Eventos ON TipoTickets.evento_id = Eventos.id 
            WHERE TipoTickets.activo = TRUE
        `;
        const [results] = await db.query(query);
        res.json(results); // Devuelve todos los tickets activos con el nombre del evento
    } catch (err) {
        console.error('Error obteniendo los tickets:', err);
        res.status(500).json({ error: 'Error al obtener la lista de tickets activos.' });
    }
};

// Obtener ticket por ID si está activo, incluyendo nombre del evento
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT TipoTickets.*, Eventos.titulo AS evento_titulo 
            FROM TipoTickets 
            LEFT JOIN Eventos ON TipoTickets.evento_id = Eventos.id 
            WHERE TipoTickets.id = ? AND TipoTickets.activo = TRUE
        `;
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado o inactivo.' });
        }

        res.json(results[0]); // Devuelve el ticket encontrado
    } catch (err) {
        console.error('Error obteniendo el ticket:', err);
        res.status(500).json({ error: 'Error al obtener el ticket.' });
    }
};

// Crear nuevo ticket
exports.createTicket = async (req, res) => {
    const { nombreTicket, tipoPago, precio, limiteCompra, stock, fechaInicioVenta, fechaFinalVenta, tipoCierre, eventoId } = req.body;
    
    try {
        const query = `
            INSERT INTO TipoTickets 
            (nombre, es_de_pago, precio, limite_compra, stock, fecha_inicio_venta, fecha_final_venta, es_por_fecha, evento_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [results] = await db.query(query, [
            nombreTicket,
            tipoPago === 'Pago',
            precio,
            limiteCompra,
            stock,
            fechaInicioVenta,
            fechaFinalVenta,
            tipoCierre === 'Por fecha y hora',
            eventoId
        ]);
        res.status(201).json({ message: 'El ticket ha sido creado exitosamente.', id: results.insertId });
    } catch (err) {
        console.error('Error creando el ticket:', err);
        res.status(500).json({ error: 'Hubo un problema al crear el ticket.' });
    }
};

// Actualizar ticket
exports.updateTicket = async (req, res) => {
    const { nombre, es_de_pago, precio, limite_compra, stock, fecha_inicio_venta, fecha_final_venta, es_por_fecha, evento_id } = req.body;
    const { id } = req.params;
    try {
        const query = `
            UPDATE TipoTickets SET 
            nombre = ?, 
            es_de_pago = ?, 
            precio = ?, 
            limite_compra = ?, 
            stock = ?, 
            fecha_inicio_venta = ?, 
            fecha_final_venta = ?, 
            es_por_fecha = ?, 
            evento_id = ? 
            WHERE id = ? AND activo = TRUE
        `;
        
        const [results] = await db.query(query, [
            nombre, es_de_pago, precio, limite_compra, stock, fecha_inicio_venta, fecha_final_venta, es_por_fecha, evento_id, id
        ]);
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado o inactivo para actualización.' });
        }
        
        res.json({ message: 'El ticket ha sido actualizado exitosamente.' });
    } catch (err) {
        console.error('Error actualizando el ticket:', err);
        res.status(500).json({ error: 'Hubo un problema al actualizar el ticket.' });
    }
};

// Marcar ticket como inactivo
exports.deleteTicket = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'UPDATE TipoTickets SET activo = FALSE WHERE id = ?';
        const [results] = await db.query(query, [id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado para desactivación.' });
        }
        res.json({ message: 'El ticket ha sido marcado como inactivo.' });
    } catch (err) {
        console.error('Error marcando el ticket como inactivo:', err);
        res.status(500).json({ error: 'Hubo un problema al marcar el ticket como inactivo.' });
    }
};
