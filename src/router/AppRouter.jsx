// BrowserRouter -> Es el contenedor principal que habilita el sistema de navegación de React Router.
//Routes -> Es un grupo donde se colocan todas las rutas disponibles en tu app.
// Route -> Define una ruta
// Login -> Es la página que se mostrará cuando el usuario vaya a /.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import Admin from "../pages/admin/admin";
import Profesor from "../pages/profesor/profesor";
import PadrePanel from "../pages/padre/PadrePanel";
import { useAuth } from "../context/AuthContext";
import ProtectedRoutePadre from "./ProtectRoutePadre";

function AppRouter() {
    const { user } = useAuth();
    return (
        <BrowserRouter> {/* Es como “el modo navegación” de la app.*/}
            <Routes> {/* Es un contenedor donde van todas tus rutas */}
                <Route path="/" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profesor" element={<Profesor />} />



                <Route
                    path="/padre"
                    element={
                        <ProtectedRoutePadre allowedRole="Padre">
                            <PadrePanel />
                        </ProtectedRoutePadre>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
