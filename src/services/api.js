import axios from "axios";

const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",

});


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
        const manualLogout = localStorage.getItem("MANUAL_LOGOUT"); 

        if ((status === 401 || status === 403) && !manualLogout) {
            localStorage.setItem("SESSION_EXPIRED", "true");
            window.location.replace("/"); 
        }
        
        return Promise.reject(error);
    }
);

export default api;
