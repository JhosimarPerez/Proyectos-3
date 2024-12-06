const db = require('../../db'); // Conexión a la base de datos

// Registrar la compra
const registrarCompra = async (req, res) => {
  const { carrito, usuarioId, metodoPago } = req.body;

  if (!carrito || !usuarioId || !metodoPago) {
      console.error('Error: Datos incompletos para registrar la compra:', { carrito, usuarioId, metodoPago });
      return res.status(400).json({ error: 'Datos incompletos para registrar la compra.' });
  }

  let connection;

  try {
      console.log('Datos recibidos en registrarCompra:', req.body);

      connection = await db.getConnection();
      await connection.beginTransaction();

      let ticketId = null; // Para almacenar el último ticket registrado
      let asientoId = null; // Para almacenar el último asiento procesado
      let zonaId = null; // Para almacenar la última zona procesada
      let eventoId = null; // Para almacenar el último evento procesado

      for (const item of carrito) {
          const { zonaId: currentZonaId, cantidad, precioExtra, asientoId: currentAsientoId } = item;

          if (!currentAsientoId) {
              console.error(`Error: asientoId no proporcionado para el carrito:`, item);
              throw new Error(`Asiento con ID no proporcionado.`);
          }

          // Verificar que la zona existe y obtener datos del evento
          const [zonaData] = await connection.query(
              'SELECT evento_id, capacidad FROM zonas WHERE id = ?',
              [currentZonaId]
          );

          if (!zonaData.length) {
              throw new Error(`Zona con ID ${currentZonaId} no encontrada.`);
          }

          const { evento_id, capacidad } = zonaData[0];

          if (capacidad < cantidad) {
              throw new Error(`No hay suficientes asientos disponibles en la zona ${currentZonaId}.`);
          }

          // Calcular el precio total de la compra
          const precioTotal = cantidad * precioExtra;

          // Registrar la compra en la base de datos
          const [compraResult] = await connection.query(
              `INSERT INTO compras 
                (usuario_id, zona_id, evento_id, cantidad, precio_extra, precio_total, metodo_pago) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [usuarioId, currentZonaId, evento_id, cantidad, precioExtra, precioTotal, metodoPago]
          );

          ticketId = compraResult.insertId; // Último ID de ticket registrado
          asientoId = currentAsientoId; // Último asiento procesado
          zonaId = currentZonaId; // Última zona procesada
          eventoId = evento_id; // Último evento procesado

          console.log(`Compra registrada con éxito. ID de compra: ${ticketId}`);

          // Actualizar el estado del asiento a "vendido"
          const [asientoResult] = await connection.query(
              'UPDATE asientos SET estado = ?, fecha_modificacion = NOW() WHERE id = ?',
              ['vendido', currentAsientoId]
          );

          if (asientoResult.affectedRows === 0) {
              throw new Error(`Asiento con ID ${currentAsientoId} no encontrado o no se pudo actualizar.`);
          }

          console.log(`Asiento actualizado. ID: ${currentAsientoId}`);

          // Descontar capacidad de la zona
          const [zonaUpdateResult] = await connection.query(
              'UPDATE zonas SET capacidad = capacidad - ? WHERE id = ?',
              [cantidad, currentZonaId]
          );

          console.log(`Capacidad de la zona actualizada para zona ID ${currentZonaId}.`);
      }

      await connection.commit();
      console.log('Transacción completada exitosamente.');

      // Enviar todos los datos relevantes al frontend
      res.status(200).json({
          success: true,
          message: 'Compra realizada con éxito.',
          ticketId,
          asientoId,
          zonaId,
          usuarioId,
          eventoId,
      });
  } catch (error) {
      console.error('Error al registrar la compra:', error);

      if (connection) await connection.rollback();
      res.status(500).json({ error: 'Error al registrar la compra.' });
  } finally {
      if (connection) connection.release();
  }
};


// Ruta para actualizar el estado de los asientos
const actualizarEstadoAsiento = async (req, res) => {
    const { asientoId, estado } = req.body;

    if (!asientoId || !estado) {
        return res.status(400).json({ error: 'Datos incompletos para actualizar el estado del asiento.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE asientos SET estado = ?, fecha_modificacion = NOW() WHERE id = ?',
            [estado, asientoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Asiento no encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Estado del asiento actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar el estado del asiento:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el estado del asiento.' });
    }
};

const obtenerHistorialAsistencia = async (req, res) => {
  try {
      const [result] = await db.query(`
          SELECT id, asiento_id, zona_id, usuario_id, evento_id, fecha 
          FROM historial_asistencia 
          ORDER BY fecha DESC
      `);

      res.status(200).json({ success: true, history: result });
  } catch (error) {
      console.error('Error al obtener el historial de asistencias:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el historial de asistencias.' });
  }
};

module.exports = { registrarCompra, actualizarEstadoAsiento,obtenerHistorialAsistencia  };
