const express = require('express');
const cors = require('cors'); // ¡Vital para que el frontend pueda conectarse!
const contactController = require('./controllers/contactController');

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite que el servidor entienda JSON en el cuerpo de la petición

// Rutas (Endpoints)
app.get('/api/contacts', contactController.getContacts);
app.post('/api/contacts', contactController.postContact);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.delete('/api/contacts/:id', contactController.removeContact);
app.put('/api/contacts/:id', contactController.putContact);