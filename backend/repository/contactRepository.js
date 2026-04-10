const fs = require('fs/promises'); // Importa el módulo de sistema de archivos (versión promesas)
const path = require('path');      // Módulo para manejar rutas de archivos

// Define la ubicación exacta del archivo JSON que actúa como base de datos
const dbPath = path.join(__dirname, '../data/DB.json');

// --- 1. FUNCIÓN PARA LEER TODOS LOS DATOS ---
const getAll = async () => {
    try {
        // Intenta leer el archivo con codificación UTF-8
        const data = await fs.readFile(dbPath, 'utf-8');
        
        // Convierte el texto plano a un objeto JS. Si el archivo está vacío, devuelve un array []
        return JSON.parse(data || "[]");
    } catch (error) {
        // Si el archivo no existe (error ENOENT) o falla la lectura, devuelve un array vacío
        return [];
    }
};

// --- 2. FUNCIÓN PARA GUARDAR DATOS (SOBRESCRITURA) ---
const saveAll = async (contacts) => {
    // Convierte el objeto JS a texto JSON. 
    // El "null, 2" sirve para que el archivo sea legible (con sangrías y espacios)
    await fs.writeFile(dbPath, JSON.stringify(contacts, null, 2));
};

// --- 3. FUNCIÓN PARA ELIMINAR POR ID ---
const deleteById = async (id) => {
    // Trae la lista actual de contactos
    const contacts = await getAll();
    
    // Crea una nueva lista excluyendo al contacto que tenga el ID recibido
    // Se usa String() para asegurar que la comparación funcione aunque uno sea número y otro texto
    const filteredContacts = contacts.filter(c => String(c.id) !== String(id));
    
    // Si el tamaño de la lista no cambió, significa que el ID no existía
    if (contacts.length === filteredContacts.length) return false;

    // Guarda la nueva lista (sin el contacto eliminado)
    await saveAll(filteredContacts);
    return true; // Indica que se eliminó con éxito
};

// --- 4. FUNCIÓN PARA ACTUALIZAR UN REGISTRO ---
const update = async (id, updatedData) => {
    // Obtiene todos los contactos
    const contacts = await getAll();
    
    // Busca la posición (índice) del contacto que queremos modificar
    const index = contacts.findIndex(c => String(c.id) === String(id));
    
    // Si no lo encuentra (index -1), termina la función devolviendo null
    if (index === -1) return null;

    // Crea un nuevo objeto mezclando:
    // 1. Los datos que ya tenía (...contacts[index])
    // 2. Los datos nuevos (...updatedData)
    // 3. Forzamos que el ID siga siendo el original para que no lo cambien por error
    contacts[index] = { ...contacts[index], ...updatedData, id: contacts[index].id };
    
    // Guarda la lista completa con el contacto ya actualizado
    await saveAll(contacts);
    
    // Devuelve el contacto tal como quedó guardado
    return contacts[index];
};

// --- EXPORTACIÓN DE LAS FUNCIONES ---
// Esto permite que el Service o el Controller puedan usar estas funciones
module.exports = { getAll, saveAll, deleteById, update };