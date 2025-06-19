const multer = require('multer');

// Almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
