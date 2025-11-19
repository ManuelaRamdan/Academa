import api from "./api";

export const getHijosPadre = async () => {
    return api.get("/api/padre");
};

// Traer un alumno por ID
export const getAlumnoById = async (id) => {
    return api.get(`/api/alumnos/${id}`);
};

