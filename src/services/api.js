import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
});

let isLoggingOut = false;

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const manualLogout = localStorage.getItem("MANUAL_LOGOUT"); // Lo lee

        // Si es 401/403 Y NO es un logout manual
        if ((status === 401 || status === 403) && !manualLogout) {
            localStorage.setItem("SESSION_EXPIRED", "true");
            // Usar .replace('/') para redirigir (borra el historial)
            window.location.replace("/"); 
        }

        // Si es 401/403 Y SÍ es un logout manual, simplemente rechaza
        // la promesa, pero NO hace la redirección global.

        return Promise.reject(error);
    }
);

export default api;
