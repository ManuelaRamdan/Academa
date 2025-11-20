import api from "./api";

export const getProfesorById = async (id) => {
    return api.get(`/api/profesores/${id}`); 
};
