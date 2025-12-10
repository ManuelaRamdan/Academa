import api from "./api"; // tu axios configurado con baseURL y token

// ---------------------------------------------------------
// Obtener todos los alumnos (con paginación opcional)
// ---------------------------------------------------------
export const getAllAlumnos = (page = 1, limit = 50) => {
    return api.get(`api/alumnos?page=${page}&limit=${limit}`);
};

// ---------------------------------------------------------
// Crear alumno
// ---------------------------------------------------------
export const createAlumno = (data) => {
    return api.post("api/alumnos", data);
};

// ---------------------------------------------------------
// Actualizar alumno por ID
// ---------------------------------------------------------
export const updateAlumno = (id, data) => {
    return api.put(`api/alumnos/${id}`, data);
};

// ---------------------------------------------------------
// Eliminar alumno
// ---------------------------------------------------------
export const deleteAlumno = (id) => {
    return api.delete(`api/alumnos/${id}`);
};

// ---------------------------------------------------------
// Obtener alumno por ID
// (esta ruta NO requiere rol admin, solo estar autenticado)
// ---------------------------------------------------------
export const getAlumnoById = (id) => {
    return api.get(`api/alumnos/${id}`);
};

// ---------------------------------------------------------
// Obtener alumno por DNI
// (ruta con protección de admin)
// ---------------------------------------------------------
export const getAlumnoByDni = (dni) => {
    return api.get(`api/alumnos/dni/${dni}`);
};
