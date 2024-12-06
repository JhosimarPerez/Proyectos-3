// Controlador para obtener todos los eventos disponibles
exports.getAllEventos = async (req, res) => {
  try {
    // Consulta SQL para obtener los eventos
    const [eventos] = await db.query(`
      SELECT 
        Eventos.id,
        Eventos.titulo,
        Eventos.fecha_hora,
        Eventos.ubicacion,
        Eventos.precio_base
      FROM 
        Eventos
      WHERE 
        Eventos.activo = 1  
    `);

    res.json(eventos);
  } catch (err) {
    console.error('Error al obtener los eventos:', err);
    res.status(500).json({ error: 'Error al obtener los eventos' });
  }
};

// Controlador para obtener un evento específico por su ID
exports.getEventoById = async (req, res) => {
  const { id } = req.params;

  try {
    const [evento] = await db.query(`
      SELECT 
        Eventos.id,
        Eventos.titulo,
        Eventos.fecha_hora,
        Eventos.ubicacion,
        Eventos.precio_base,
        Eventos.descripcion,
        Eventos.url
      FROM 
        Eventos
      WHERE 
        Eventos.id = ? AND Eventos.activo = 1
    `, [id]);

    if (evento.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado o no disponible' });
    }

    res.json(evento[0]);  // Devolver el evento seleccionado
  } catch (err) {
    console.error('Error al obtener el evento:', err);
    res.status(500).json({ error: 'Error al obtener el evento' });
  }
};

