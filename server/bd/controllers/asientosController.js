const db = require('../../db');


exports.getAllAsientos = async (req, res) => {
    try {
      const [asientos] = await db.query(`
        SELECT 
          Asientos.id AS asiento_id,
          Asientos.fila,
          Asientos.numero,
          Asientos.estado,
          Zonas.nombre AS zona_nombre
        FROM 
          Asientos
        JOIN 
          Zonas ON Asientos.zona_id = Zonas.id
      `);
      res.json(asientos);
    } catch (err) {
      console.error('Error al obtener los asientos:', err);
      res.status(500).json({ error: 'Error al obtener los asientos' });
    }
  };
  exports.createAsiento = async (req, res) => {
    const { zona_id, fila, numero, estado } = req.body;
  
    // Validar los datos requeridos
    if (!zona_id || !fila || !numero) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }
  
    try {
      const query = 'INSERT INTO Asientos (zona_id, fila, numero, estado) VALUES (?, ?, ?, ?)';
      const [result] = await db.query(query, [zona_id, fila, numero, estado || 'disponible']);
      res.status(201).json({ message: 'Asiento creado con éxito', asientoId: result.insertId });
    } catch (err) {
      console.error('Error al crear el asiento:', err);
      res.status(500).json({ error: 'Error al crear el asiento' });
    }
  };
  exports.getAsientoById = async (req, res) => {
    try {
      const [result] = await db.query('SELECT * FROM Asientos WHERE id = ?', [req.params.id]);
      if (result.length === 0) {
        return res.status(404).json({ error: 'Asiento no encontrado' });
      }
      res.json(result[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el asiento' });
    }
  };
  exports.updateAsiento = async (req, res) => {
    const { estado } = req.body;
    const { id } = req.params;
  
    try {
      const query = 'UPDATE Asientos SET estado = ? WHERE id = ?';
      const [result] = await db.query(query, [estado, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Asiento no encontrado' });
      }
      res.json({ message: 'Asiento actualizado con éxito' });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el asiento' });
    }
  };
  
  exports.deleteAsiento = async (req, res) => {
    try {
      const [result] = await db.query('DELETE FROM Asientos WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Asiento no encontrado' });
      }
      res.json({ message: 'Asiento eliminado con éxito' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar el asiento' });
    }
  };
        