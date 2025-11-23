import api from "./api";

export const getProfesorById = async () => {
    return api.get(`/api/profesores/me`); 
};
