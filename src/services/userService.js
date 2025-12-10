
import api from "./api";

// Obtener todos los usuarios con paginación
export const getAllUsuarios = async (page = 1, limit = 2) => {
    return api.get(`/api/usuarios?page=${page}&limit=${limit}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });
};


// Obtener un usuario por ID
export const getUsuarioById = async (id) => {
    return api.get(`/api/usuarios/${id}`);
};

// Crear un usuario nuevo
export const createUsuario = async (usuarioData) => {
    return api.post(`/api/usuarios/register`, usuarioData);
};

