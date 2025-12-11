
import api from "./api";

export const getAllMaterias = async (page = 1, limit = 2) => {
    return api.get(`/api/materias?page=${page}&limit=${limit}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });
};


export const getMateriaById = async (id) => {
    return api.get(`/api/materias/${id}`);
};


