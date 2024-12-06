// server/multerConfig.js
const multer = require('multer');

// Configuración de multer para guardar archivos en la carpeta 'public/img'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Definir la carpeta de destino donde se guardan las imágenes
        cb(null, './public/img/');
    },
    filename: (req, file, cb) => {
        // Darle un nombre único a cada archivo usando la fecha y el nombre original
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Crear un middleware de multer con la configuración
const upload = multer({ storage: storage });

module.exports = upload;
