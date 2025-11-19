import { useState } from "react";
//useState: sirve para manejar valores que cambian en la pantalla (email y password).
import { loginRequest } from "../services/authService";
//loginRequest: es la función que hace el POST a tu API.

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        //e.preventDefault() evita que el form recargue la página.
        e.preventDefault();

        try {
            const response = await loginRequest(email, password);
            //console.log("Login exitoso:", response.data);
            alert("Bienvenido " + response.data.usuario.nombre);
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
