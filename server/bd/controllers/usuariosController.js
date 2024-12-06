const db = require('../../db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Función para encriptar la contraseña
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Usuarios');
        res.json(results);
    } catch (err) {
        console.error('Error obteniendo los usuarios:', err);
        res.status(500).json({ error: 'Error obteniendo los usuarios' });
    }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Usuarios WHERE id = ?', [req.params.id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error obteniendo el usuario:', err);
        res.status(500).json({ error: 'Error obteniendo el usuario' });
    }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    const { nombres, apellidos, correo_electronico, contrasena, carnet, numero_celular, rol_id } = req.body;

    if (!nombres || !correo_electronico || !contrasena || !carnet || !numero_celular) {
        return res.status(400).json({ error: 'Nombre, correo electrónico, contraseña, carnet y número celular son obligatorios.' });
    }

    try {
        const checkQuery = 'SELECT * FROM Usuarios WHERE correo_electronico = ? OR carnet = ?';
        const [existingUser] = await db.query(checkQuery, [correo_electronico, carnet]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico o el carnet ya están registrados.' });
        }

        const hashedPassword = await hashPassword(contrasena);
        const query = 'INSERT INTO Usuarios (nombres, apellidos, correo_electronico, contrasena, carnet, numero_celular, rol_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [results] = await db.query(query, [nombres, apellidos, correo_electronico, hashedPassword, carnet, numero_celular, rol_id || 2]);

        res.status(201).json({
            message: 'Usuario creado con éxito',
            userId: results.insertId
        });
    } catch (err) {
        console.error('Error creando el usuario:', err);
        res.status(500).json({ error: 'Hubo un error al crear el usuario. Intenta nuevamente.' });
    }
};

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    const { nombres, apellidos, correo_electronico, contrasena, carnet, numero_celular, rol_id } = req.body;
    const { id } = req.params;

    try {
        const hashedPassword = contrasena ? hashPassword(contrasena) : undefined;
        const query = `
            UPDATE Usuarios SET nombres = COALESCE(?, nombres), apellidos = COALESCE(?, apellidos), correo_electronico = COALESCE(?, correo_electronico), 
            ${contrasena ? 'contrasena = ?, ' : ''} numero_celular = COALESCE(?, numero_celular), carnet = COALESCE(?, carnet), rol_id = COALESCE(?, rol_id) WHERE id = ?`;

        const values = contrasena ? 
            [nombres, apellidos, correo_electronico, hashedPassword, numero_celular, carnet, rol_id, id] : 
            [nombres, apellidos, correo_electronico, numero_celular, carnet, rol_id, id];

        const [results] = await db.query(query, values);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado con éxito' });
    } catch (err) {
        console.error('Error actualizando el usuario:', err);
        res.status(500).json({ error: 'Error actualizando el usuario' });
    }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const query = 'DELETE FROM Usuarios WHERE id = ?';
        const [results] = await db.query(query, [req.params.id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado con éxito' });
    } catch (err) {
        console.error('Error eliminando el usuario:', err);
        res.status(500).json({ error: 'Error eliminando el usuario' });
    }
};

// Iniciar sesión (Login)
exports.loginUsuario = async (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
        return res.status(400).json({ error: 'Correo electrónico y contraseña son obligatorios' });
    }

    try {
        // Consulta para obtener al usuario con el rol_id
        const query = `
            SELECT id, correo_electronico, contrasena, rol_id 
            FROM Usuarios 
            WHERE correo_electronico = ?;
        `;
        
        const [results] = await db.query(query, [correo_electronico]);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = results[0];
        const hashedPassword = hashPassword(contrasena);

        // Verificar la contraseña
        if (hashedPassword !== usuario.contrasena) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Generar un token JWT con el rol_id incluido
        const token = jwt.sign(
            { id: usuario.id, correo_electronico: usuario.correo_electronico, rol_id: usuario.rol_id },
            'secreto', // Clave secreta (debería estar en una variable de entorno)
            { expiresIn: '1h' } // Expiración del token
        );

        // Responder con el token, el rol_id y el id del usuario
        res.json({
            token,
            rol: usuario.rol_id, // Enviamos el rol_id (1 o 2)
            userId: usuario.id, // Ahora incluimos el userId explícitamente en la respuesta
        });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};
// Función para obtener el historial de compras de un usuario
exports.getHistorialCompras = async (req, res) => {
    const { id } = req.params;  // Obtenemos el ID del usuario desde los parámetros de la URL

    try {
        // Consulta SQL para obtener las compras del usuario
        const query = `
            SELECT * FROM Compras WHERE usuario_id = ? ORDER BY fecha_compra DESC;
        `;
        
        const [compras] = await db.query(query, [id]);

        if (compras.length === 0) {
            return res.status(404).json({ error: 'No se encontraron compras para este usuario.' });
        }

        // Responder con el historial de compras
        res.status(200).json({ historial: compras });
    } catch (err) {
        console.error('Error obteniendo el historial de compras:', err);
        res.status(500).json({ error: 'Hubo un error al obtener el historial de compras' });
    }
};