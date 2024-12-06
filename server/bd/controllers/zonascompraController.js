const db = require('../../db');  // Asegúrate de usar la base de datos correctamente

// Obtener zonas por eventoId
exports.getZonasByEventoId = async (req, res) => {
  const { eventoId } = req.params;  // Obtener eventoId de la URL

  try {
    // Consulta SQL para obtener las zonas correspondientes al eventoId
    const query = `
      SELECT 
        Zonas.id AS zona_id,
        Zonas.nombre AS zona_nombre,
        Zonas.capacidad,
        Zonas.precio_extra
      FROM 
        Zonas
      WHERE 
        Zonas.evento_id = ? 
    `;
    const [zonas] = await db.query(query, [eventoId]);

    // Verificar si se encontraron zonas para el evento
    if (zonas.length === 0) {
      return res.status(404).json({ error: 'No se encontraron zonas para este evento.' });
    }

    res.json(zonas);  // Devolver las zonas en formato JSON
  } catch (err) {
    console.error('Error al obtener las zonas:', err);
    res.status(500).json({ error: 'Error al obtener las zonas' });
  }
};
