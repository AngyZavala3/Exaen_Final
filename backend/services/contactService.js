const repository = require('../repository/contactRepository');

// Función auxiliar para validar email
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// 1. Obtener todos los contactos (con ordenamiento alfabético
const getAllContacts = async () => {
    const contacts = await repository.getAll();
    // Ordenamiento alfabético A-Z por el campo 'nombre'
    return contacts.sort((a, b) => a.nombre.localeCompare(b.nombre));
};

// 2. Crear un nuevo contacto
const createContact = async (contactData) => {
    const contacts = await repository.getAll();

    // Validaciones
    if (!contactData.nombre || !contactData.telefono || !contactData.email) {
        throw { status: 400, message: "Campos obligatorios faltantes" };
    }
    if (!isValidEmail(contactData.email)) {
        throw { status: 400, message: "Email no válido" };
    }
    if (contacts.find(c => c.email === contactData.email)) {
        throw { status: 400, message: "El email ya está registrado" };
    }

    const newContact = {
        id: Date.now(),
        ...contactData,
        favorito: contactData.favorito === true || contactData.favorito === 'on',
        fechaCreacion: new Date().toISOString()
    };

    contacts.push(newContact);
    await repository.saveAll(contacts);
    return newContact;
};

// 3. Eliminar un contacto (La que te daba el error de ReferenceError)
const deleteContact = async (id) => {
    const success = await repository.deleteById(id);
    if (!success) {
        throw { status: 404, message: "Contacto no encontrado" };
    }
    return { message: "Eliminado con éxito" };
};

// 4. Actualizar un contacto
const updateContact = async (id, data) => {
    // Validamos datos antes de actualizar
    if (!data.nombre || !data.email) {
        throw { status: 400, message: "Nombre y email son requeridos para actualizar" };
    }

    const updated = await repository.update(id, data);
    if (!updated) {
        throw { status: 404, message: "No se encontró el contacto para editar" };
    }
    return updated;
};

// EXPORTACIÓN: Aquí es donde Node.js busca los nombres anteriores
module.exports = { 
    getAllContacts, 
    createContact, 
    deleteContact, 
    updateContact 
};
