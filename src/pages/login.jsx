import { useState, useContext } from "react";
//useState: sirve para manejar valores que cambian en la pantalla (email y password).
import { loginRequest } from "../services/authService";
//loginRequest: es la función que hace el POST a tu API.

import { AuthContext } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = async (e) => {
        //e.preventDefault() evita que el form recargue la página.
        e.preventDefault();

        try {
            const response = await loginRequest(email, password);
            //console.log("Login exitoso:", response.data);
            const { token, usuario } = response.data;

            // Guardar token + usuario en el contexto
            login(token, usuario);

            // Redirección según rol
            if (usuario.rol === "administrador") {
                navigate("/admin");
            } else if (usuario.rol === "profesor") {
                navigate("/profesor");
            } else if (usuario.rol === "padre") {
                navigate("/padre");
            } else {
                alert("Rol no reconocido");
            }
        } catch (error) {
            //console.error(error);
            alert("Error en login");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Ingresar</button>
        </form>
    );
}

export default Login;
