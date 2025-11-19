import api from "./api";

export const loginRequest = async (email, password) => {
    return api.post("/api/usuarios/login", { email, password });

};
