
import api from "./api";

export const getAllCursos = async (page = 1, limit = 2) => {
    return api.get(`/api/cursos?page=${page}&limit=${limit}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });
};


export const getCursoById = async (id) => {
    return api.get(`/api/cursos/${id}`);
};

export const getCursoByIdProfe = async (id) => {
    return api.get(`/api/cursos/profe/${id}`);
};



