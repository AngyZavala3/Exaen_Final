const express = require('express');
const cors = require('cors');
const path = require('path');
const controller = require('./controllers/contactController');

const app = express();


app.use(cors());
app.use(express.json());

// 1. Esto sirve los archivos de la carpeta frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 2. Rutas de la API para los datos
app.get('/api/contactos', controller.getContactos);
app.post('/api/contactos', controller.postContacto);
app.delete('/api/contactos/:id', controller.deleteContacto);

// 3. Esta ruta es la "llave" para que no salga el Cannot GET /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor encendido en: http://localhost:${PORT}`);
});