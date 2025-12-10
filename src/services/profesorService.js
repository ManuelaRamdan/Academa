import api from "./api";

export const getProfesorById = async () => {
    return api.get(`/api/profesores/me`);
};

export const actualizarNotas = async (dni, materias) => {
    return api.put(`/api/profesores/alumno/dni/${dni}`, { materias });
};


export const getAllProfesores = (page = 1, limit = 10) => {
    return api.get(`/api/profesores?page=${page}&limit=${limit}`);
};
