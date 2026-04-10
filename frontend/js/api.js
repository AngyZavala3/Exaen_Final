const API_URL = 'http://localhost:3000/api/contacts';

// Función para obtener todos los contactos
export const fetchContacts = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener contactos');
    return await response.json();
};

// Función para guardar un nuevo contacto
export const saveContact = async (contactData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al guardar');
    return result;
};
export const deleteContact = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo eliminar el contacto');
    return await res.json();
};