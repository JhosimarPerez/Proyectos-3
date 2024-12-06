const db = require('../../db');

// Obtener todas las categorías de eventos
exports.getAllCategorias = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT CategoriaEventos.id, CategoriaEventos.nombre, CategoriaEventos.descripcion
            FROM CategoriaEventos
        `);
        res.json(results);
    } catch (err) {
        console.error('Error obteniendo las categorías:', err);
        res.status(500).json({ error: 'Error obteniendo las categorías' });
    }
};
