import { useState, useContext, useEffect } from "react";
import { loginRequest } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/styles.css";
import Loading from "../components/Loading";

function Login() {
  const { login, logout, sessionExpired } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 🔹 logout manual exitoso (ya lo tenías)
  useEffect(() => {
    // 1. Manejo del logout por expiración (viniendo del interceptor)
    const expired = localStorage.getItem("SESSION_EXPIRED");

    if (expired) {
      logout(true); // El 'true' indica que fue por expiración
      localStorage.removeItem("SESSION_EXPIRED");
    }

    // 2. Limpieza de la bandera de logout manual.
    // Esto es crucial para que si el usuario hace logout manual 
    // y luego regresa a esta página, la bandera se borre para que 
    // el siguiente login sea "limpio".
    localStorage.removeItem("MANUAL_LOGOUT");

    // Opcional: limpiar la variable sessionExpired del contexto si el usuario ya está aquí.
    if (sessionExpired) {
      logout(false);
    }

  }, [logout]);

  // 🔹 sesión expirada (NUEVO)
  useEffect(() => {
    const expired = localStorage.getItem("SESSION_EXPIRED");

    if (expired) {
      logout(true);
      localStorage.removeItem("SESSION_EXPIRED");
    }
  }, [logout]);

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

        {/* 🔹 MENSAJES */}
        {sessionExpired && (
          <p className="msg-error">
            Tu sesión expiró. Volvé a iniciar sesión.
          </p>
        )}

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

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <Loading size={18} color="#ffffff" /> : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
