import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectRoute({ allowedRole, children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando sesión...</div>; 
    }

    const isAuthorized = user && user.rol === allowedRole.toLowerCase();

    return isAuthorized
        ? children
        : <Navigate to="/" replace />;
}
