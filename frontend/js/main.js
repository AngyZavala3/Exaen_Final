import { fetchContacts, saveContact, deleteContact } from './api.js';

// --- ELEMENTOS DEL DOM ---
const contactForm = document.getElementById('contact-form');
const contactContainer = document.getElementById('contact-container');
const searchInput = document.getElementById('search-input');
const toastElement = document.getElementById('msgToast');
const toastBody = document.getElementById('toast-body-text');

// Variables para el Modal de Edición
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editForm = document.getElementById('edit-form');

// Inicializar Toast de Bootstrap
const toast = new bootstrap.Toast(toastElement);

// Estado global de la aplicación
let allContacts = [];

// --- FUNCIONES DE APOYO ---

const showMessage = (msg, isError = false) => {
    toastBody.textContent = msg;
    toastElement.classList.toggle('bg-danger', isError);
    toastElement.classList.toggle('bg-success', !isError);
    toast.show();
};

/**
 * RENDERIZADO: Organizado por categorías y lista vertical
 */
const renderContacts = (contacts) => {
    if (contacts.length === 0) {
        contactContainer.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="bi bi-person-x fs-1"></i>
                <p>No se encontraron contactos.</p>
            </div>`;
        return;
    }

    // 1. Ordenamiento alfabético inicial
    const sortedContacts = [...contacts].sort((a, b) => a.nombre.localeCompare(b.nombre));

    // 2. Agrupar contactos por categoría
    const groupedContacts = sortedContacts.reduce((groups, contact) => {
        const category = contact.categoria || 'Sin Categoría';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(contact);
        return groups;
    }, {});

    // 3. Generar el HTML dinámico
    let htmlContent = '';

    for (const category in groupedContacts) {
        // Añadir encabezado de categoría
        htmlContent += `
            <div class="col-12 mt-4 mb-2">
                <h5 class="text-uppercase fw-bold text-secondary border-bottom pb-2">
                    <i class="bi bi-tag-fill me-2"></i>${category}
                </h5>
            </div>
        `;

        // Añadir las tarjetas de contactos de esa categoría
        htmlContent += groupedContacts[category].map(c => `
            <div class="col-12 mb-3"> 
                <div class="card contact-card shadow-sm border-0">
                    <div class="row g-0 align-items-center">
                        <div class="col-auto">
                            <img src="${c.foto || 'https://via.placeholder.com/150'}" 
                                 alt="${c.nombre}" 
                                 class="rounded-start"
                                 style="width: 100px; height: 100px; object-fit: cover; background: #eee;">
                        </div>
                        
                        <div class="col">
                            <div class="card-body py-2 d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="card-title mb-1">${c.nombre} 
                                        ${c.favorito ? '<i class="bi bi-star-fill text-warning small"></i>' : ''}
                                    </h5>
                                    <span class="badge bg-light text-dark border mb-2">${c.categoria || 'General'}</span>
                                    <p class="small mb-0 text-muted">
                                        <i class="bi bi-envelope me-1"></i>${c.email}
                                    </p>
                                    <p class="small mb-0 text-muted">
                                        <i class="bi bi-telephone me-1"></i>${c.telefono}
                                    </p>
                                </div>
                                
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-warning btn-sm btn-edit" data-id="${c.id}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${c.id}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    contactContainer.innerHTML = htmlContent;
};

// --- EVENTOS ---

// 1. Cargar contactos al iniciar
window.addEventListener('DOMContentLoaded', async () => {
    try {
        allContacts = await fetchContacts();
        renderContacts(allContacts);
    } catch (err) {
        showMessage("Error al conectar con el servidor", true);
    }
});

// 2. Buscador Dinámico
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allContacts.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        c.email.toLowerCase().includes(term)
    );
    renderContacts(filtered);
});

// 3. Guardar Nuevo Contacto
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    data.favorito = formData.get('favorito') === 'on';

    try {
        await saveContact(data);
        showMessage("¡Usuario registrado con éxito!");
        contactForm.reset();
        
        allContacts = await fetchContacts();
        renderContacts(allContacts);
        document.getElementById('list-tab').click(); // Volver a la lista
    } catch (err) {
        showMessage(err.message, true);
    }
});

// 4. Delegación de eventos (Borrar y Abrir Modal Editar)
contactContainer.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('¿Eliminar este usuario?')) {
            try {
                await deleteContact(id);
                showMessage("Usuario eliminado");
                allContacts = await fetchContacts();
                renderContacts(allContacts);
            } catch (err) { showMessage(err.message, true); }
        }
        return;
    }

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
        const id = editBtn.dataset.id;
        const contact = allContacts.find(c => String(c.id) === String(id));
        
        document.getElementById('edit-id').value = contact.id;
        document.getElementById('edit-nombre').value = contact.nombre;
        document.getElementById('edit-telefono').value = contact.telefono;
        document.getElementById('edit-email').value = contact.email;
        document.getElementById('edit-foto').value = contact.foto || '';
        document.getElementById('edit-notas').value = contact.notas || '';
        
        // Cargar la categoría actual en el modal
        const editCat = document.getElementById('edit-categoria');
        if (editCat) {
            editCat.value = contact.categoria || '';
        }
        
        editModal.show();
    }
});

// 5. Enviar Edición (PUT)
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const formData = new FormData(editForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`http://localhost:3000/api/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error("No se pudo actualizar");

        editModal.hide();
        showMessage("¡Datos actualizados!");
        allContacts = await fetchContacts();
        renderContacts(allContacts);
    } catch (err) {
        showMessage(err.message, true);
    }
});