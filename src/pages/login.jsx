import { useState, useContext, useEffect } from "react";
import { loginRequest } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/styles.css"; 

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (location.state?.logoutSuccess) {
            setSuccessMessage("Cierre de sesión exitoso.");
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await loginRequest(email, password);
            const { token, usuario } = response.data;

            login(token, usuario);

            if (usuario.rol === "administrador") navigate("/admin");
            if (usuario.rol === "profesor") navigate("/profesor");
            if (usuario.rol === "padre") navigate("/padre");

        } catch (error) {
            setErrorMessage("Credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2>Iniciar Sesión</h2>

                {successMessage && <p className="msg-success">{successMessage}</p>}
                {errorMessage && <p className="msg-error">{errorMessage}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Cargando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
