import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectRoute({ allowedRole, children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.rol !== allowedRole.toLowerCase()) {
        return <Navigate to="/" replace />;
    }

    return children;
}
