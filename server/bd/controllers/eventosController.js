const db = require('../../db');
const multer = require('multer');
const path = require('path');


// Configurar multer para guardar las imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Obtener todos los eventos con sus respectivas zonas y asientos (solo activos)
exports.getAllEventos = async (req, res) => {
    try {
        const [eventos] = await db.query(`
            SELECT 
                Eventos.id AS evento_id,
                Eventos.titulo AS evento_titulo,
                Eventos.descripcion,
                Eventos.fecha_hora,
                Eventos.precio_base,
                Eventos.cupo_disponible,
                Eventos.es_evento_virtual,
                Eventos.url_transmision,
                Eventos.plataforma_virtual,
                Eventos.ubicacion,
                Eventos.latitud,
                Eventos.longitud,
                Eventos.rutaImagen,
                Eventos.prioridadImagen,
                Eventos.organizadores,
                GROUP_CONCAT(DISTINCT Zonas.id ORDER BY Zonas.id) AS zona_ids,
                GROUP_CONCAT(DISTINCT Zonas.nombre ORDER BY Zonas.id) AS zona_nombres,
                GROUP_CONCAT(DISTINCT Zonas.capacidad ORDER BY Zonas.id) AS zona_capacidades,
                GROUP_CONCAT(DISTINCT Zonas.precio_extra ORDER BY Zonas.id) AS zona_precio_extra,
                GROUP_CONCAT(DISTINCT Asientos.id ORDER BY Asientos.id) AS asiento_ids,
                GROUP_CONCAT(DISTINCT Asientos.fila ORDER BY Asientos.fila) AS asiento_filas,
                GROUP_CONCAT(DISTINCT Asientos.numero ORDER BY Asientos.numero) AS asiento_numeros,
                GROUP_CONCAT(DISTINCT Asientos.estado ORDER BY Asientos.estado) AS asiento_estados
            FROM 
                Eventos
            LEFT JOIN 
                Zonas ON Eventos.id = Zonas.evento_id
            LEFT JOIN 
                Asientos ON Zonas.id = Asientos.zona_id
            WHERE
                Eventos.activo = 1
            GROUP BY
                Eventos.id;
        `);

        res.json(eventos);
    } catch (err) {
        console.error('Error al obtener los eventos:', err);
        res.status(500).json({ error: 'Error al obtener los eventos' });
    }
};

// Obtener evento por ID, incluyendo zonas y asientos (solo activos)
exports.getEventoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [evento] = await db.query(`
            SELECT 
                Eventos.*, 
                Zonas.id AS zona_id,
                Zonas.nombre AS zona_nombre,
                Zonas.capacidad AS zona_capacidad,
                Zonas.precio_extra AS zona_precio_extra,
                Asientos.id AS asiento_id,
                Asientos.fila AS asiento_fila,
                Asientos.numero AS asiento_numero,
                Asientos.estado AS asiento_estado
            FROM 
                Eventos
            LEFT JOIN 
                Zonas ON Eventos.id = Zonas.evento_id
            LEFT JOIN 
                Asientos ON Zonas.id = Asientos.zona_id
            WHERE 
                Eventos.id = ? AND
                Eventos.activo = 1
        `, [id]);

        if (evento.length === 0) {
            return res.status(404).json({ error: 'Evento no encontrado o no activo' });
        }

        res.json(evento);
    } catch (err) {
        console.error('Error al obtener el evento:', err);
        res.status(500).json({ error: 'Error al obtener el evento' });
    }
};


// Crear o actualizar un evento, incluyendo zonas y asientos
exports.createOrUpdateEvento = [
    upload.single('rutaImagen'),
    async (req, res) => {
        try {
            const {
                titulo,
                descripcion,
                categoria_evento_id,
                fechaInicio,
                horaInicio,
                precio_base,
                cupo_disponible,
                es_evento_virtual,
                url, // URL del evento
                url_transmision,
                plataforma_virtual,
                ubicacion,
                latitud,
                longitud,
                prioridadImagen,
                organizadores,
                zonas,
            } = req.body;

            const rutaImagen = req.file ? `/uploads/${req.file.filename}` : null;

            const eventDetails = {
                titulo,
                descripcion,
                categoria_evento_id: parseInt(categoria_evento_id, 10) || null,
                fecha_hora: `${fechaInicio} ${horaInicio}`,
                precio_base: parseFloat(precio_base) || 0,
                cupo_disponible: parseInt(cupo_disponible, 10) || 0,
                es_evento_virtual: es_evento_virtual === 'true' || es_evento_virtual === true ? 1 : 0,
                url: url || '', // Manejo de URL de evento
                url_transmision: url_transmision || '',
                plataforma_virtual: plataforma_virtual || '',
                ubicacion: ubicacion || '',
                latitud: parseFloat(latitud) || null,
                longitud: parseFloat(longitud) || null,
                rutaImagen,
                prioridadImagen: parseInt(prioridadImagen, 10) || 0,
                organizadores: organizadores || '',
                activo: 1,
            };

            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                let eventId = req.params.id; // Obtener el ID del evento
                if (eventId) {
                    // Actualizar el evento existente
                    await connection.query('UPDATE Eventos SET ? WHERE id = ?', [eventDetails, eventId]);
                    eventDetails.id = eventId;
                } else {
                    // Insertar un nuevo evento
                    const [result] = await connection.query('INSERT INTO Eventos SET ?', eventDetails);
                    eventDetails.id = result.insertId; // Asignar el ID del evento recién creado
                    eventId = eventDetails.id; // Usar el mismo ID para las zonas
                }

                if (eventId) {
                    // Eliminar zonas y asientos previos si el evento ya existe
                    await connection.query(
                        'DELETE FROM Asientos WHERE zona_id IN (SELECT id FROM Zonas WHERE evento_id = ?)',
                        [eventId]
                    );
                    await connection.query('DELETE FROM Zonas WHERE evento_id = ?', [eventId]);
                }

                // Crear zonas
                if (zonas) {
                    let zonasParsed = [];
                    try {
                        zonasParsed = typeof zonas === 'string' ? JSON.parse(zonas) : zonas;
                    } catch (err) {
                        throw new Error('Formato inválido para zonas. Asegúrate de enviar un JSON válido.');
                    }

                    for (let zona of zonasParsed) {
                        const [zonaResult] = await connection.query(
                            'INSERT INTO Zonas (nombre, capacidad, precio_extra, evento_id) VALUES (?, ?, ?, ?)',
                            [zona.nombre, parseInt(zona.capacidad, 10) || 0, parseFloat(zona.precio_extra) || 0, eventId]
                        );

                        for (let fila of zona.filas || []) {
                            const filaNumero = parseInt(fila.numero, 10) || 0;
                            const totalAsientos = parseInt(fila.asientos, 10) || 0;

                            for (let i = 1; i <= totalAsientos; i++) {
                                await connection.query(
                                    'INSERT INTO Asientos (zona_id, fila, numero, estado) VALUES (?, ?, ?, ?)',
                                    [zonaResult.insertId, filaNumero, i, 'disponible']
                                );
                            }
                        }
                    }
                }

                await connection.commit();
                res.status(200).json({ message: 'Evento registrado/actualizado con éxito' });
            } catch (err) {
                await connection.rollback();
                console.error('Error al registrar/actualizar el evento:', err);
                res.status(500).json({ error: 'Error al registrar/actualizar el evento' });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error en el procesamiento del evento:', error);
            res.status(400).json({ error: error.message || 'Error en los datos enviados' });
        }
    },
];

// Eliminar un evento, sus zonas y asientos
exports.deleteEvento = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'UPDATE Eventos SET activo = FALSE WHERE id = ?';
        const [results] = await db.query(query, [id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        res.json({ message: 'Evento marcado como inactivo' });
    } catch (err) {
        console.error('Error marcando el evento como inactivo:', err);
        res.status(500).json({ error: 'Error marcando el evento como inactivo' });
    }
};

// Realizar compra y aplicar descuento
exports.realizarCompra = async (req, res) => {
    const { id } = req.params;  // ID del evento
    const { cantidadEntradas, aplicarDescuento = false } = req.body; // La cantidad de entradas y si aplica descuento

    try {
        // Verificar si el evento existe y tiene suficiente cupo
        const [evento] = await db.query('SELECT cupo_disponible, precio_base FROM Eventos WHERE id = ?', [id]);

        if (!evento.length) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        const cupoDisponible = evento[0].cupo_disponible;
        if (cupoDisponible < cantidadEntradas) {
            return res.status(400).json({ message: 'No hay suficientes entradas disponibles' });
        }

        // Calcular el precio con descuento (si aplica)
        let precioTotal = evento[0].precio_base * cantidadEntradas;
        if (aplicarDescuento) {
            const descuento = 0.10; // 10% de descuento
            precioTotal = precioTotal - (precioTotal * descuento);
        }

        // Actualizar el cupo
        const nuevoCupo = cupoDisponible - cantidadEntradas;
        await db.query('UPDATE Eventos SET cupo_disponible = ? WHERE id = ?', [nuevoCupo, id]);

        // Responder con el éxito de la compra
        res.status(200).json({ 
            message: 'Compra realizada con éxito', 
            cupoRestante: nuevoCupo, 
            precioTotal 
        });
    } catch (err) {
        console.error('Error en la compra:', err);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
};
// Obtener eventos con prioridadImagen = 1
exports.getEventosPrioritarios = async (req, res) => {
    try {
        const [eventos] = await db.query(`
            SELECT id AS evento_id, titulo, rutaImagen 
            FROM Eventos 
            WHERE prioridadImagen = 1 AND activo = 1
        `);
        res.json(eventos);
    } catch (err) {
        console.error('Error al obtener los eventos prioritarios:', err);
        res.status(500).json({ error: 'Error al obtener los eventos prioritarios' });
    }
};
