// src/router/ProtectedRoutePadre.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoutePadre({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.rol !== "padre") {
        return <Navigate to="/" replace />;
    }

    return children;
}
