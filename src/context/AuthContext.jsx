// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("usuario");

        if (t && u) {
            setToken(t);
            setUser(JSON.parse(u));
        }
    }, []);

    const login = (token, usuario) => {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        setToken(token);
        setUser(usuario);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
