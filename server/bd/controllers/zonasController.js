const db = require('../../db');


// Obtener todas las Zonas
exports.getAllZonas = async (req, res) => {
    try {
        const [zonas] = await db.query(`
            SELECT 
                Zonas.id AS zona_id,
                Zonas.nombre AS zona_nombre,
                Zonas.capacidad,
                Zonas.precio_extra,
                Zonas.descripcion,
                Eventos.titulo AS evento_titulo
            FROM 
                Zonas
            JOIN 
                Eventos ON Zonas.evento_id = Eventos.id
        `);
        
        res.json(zonas);
    } catch (err) {
        console.error('Error al obtener las zonas:', err);
        res.status(500).json({ error: 'Error al obtener las zonas' });
    }
};



exports.createZona = async (req, res) => {
    const { nombreZona, zonaCapacidad, zonaPrecioExtra, eventoId, descripcion } = req.body;  

    console.log('Datos recibidos para crear zona:', req.body);

    // Validación de los datos recibidos
    if (!eventoId || !nombreZona || !zonaCapacidad || !zonaPrecioExtra) {
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    // Asegurarse de que los valores son correctos
    const capacidad = parseInt(zonaCapacidad, 10);  // Convertir a número
    const precioExtra = parseFloat(zonaPrecioExtra); // Convertir a número decimal

    if (isNaN(capacidad) || isNaN(precioExtra)) {
        return res.status(400).json({ error: 'Capacidad o precio extra no son números válidos.' });
    }

    try {
        // Consulta SQL para insertar la zona
        const query = 'INSERT INTO Zonas (nombre, capacidad, precio_extra, evento_id, descripcion) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [nombreZona, capacidad, precioExtra, eventoId, descripcion]);  
        console.log('Zona creada con éxito:', result);
        res.status(201).json({ message: 'Zona creada con éxito', zonaId: result.insertId });
    } catch (err) {
        console.error('Error al crear la zona:', err);
        res.status(500).json({ error: 'Error al crear la zona' });
    }
};



// Obtener Zona por ID
exports.getZonaById = async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM Zonas WHERE id = ?', [req.params.id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Zona no encontrada' });
        }
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la zona' });
    }
};

// Actualizar Zona
exports.updateZona = async (req, res) => {
    const { nombre, capacidad, precio_extra } = req.body;
    try {
        const query = 'UPDATE Zonas SET nombre = ?, capacidad = ?, precio_extra = ? WHERE id = ?';
        const [result] = await db.query(query, [nombre, capacidad, precio_extra, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Zona no encontrada' });
        }
        res.json({ message: 'Zona actualizada con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la zona' });
    }
};

// Eliminar Zona
exports.deleteZona = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Zonas WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Zona no encontrada' });
        }
        res.json({ message: 'Zona eliminada con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la zona' });
    }
};

