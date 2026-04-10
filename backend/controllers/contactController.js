const service = require('../services/contactService');

const contactController = {
    // Obtener todos los contactos
    getContacts: async (req, res) => {
        try {
            const contacts = await service.getAllContacts();
            res.json(contacts);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    },

    // Crear un contacto
    postContact: async (req, res) => {
        try {
            const contact = await service.createContact(req.body);
            res.status(201).json(contact);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    },

    // Eliminar un contacto
    removeContact: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`[DEBUG] Intentando borrar ID: ${id}`);
            const result = await service.deleteContact(id);
            res.json({ message: "Contacto eliminado", result });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    },

    // Actualizar un contacto
    putContact: async (req, res) => {
        try {
            const contact = await service.updateContact(req.params.id, req.body);
            res.json(contact);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
};

module.exports = contactController;


