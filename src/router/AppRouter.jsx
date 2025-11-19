// BrowserRouter -> Es el contenedor principal que habilita el sistema de navegación de React Router.
//Routes -> Es un grupo donde se colocan todas las rutas disponibles en tu app.
// Route -> Define una ruta
// Login -> Es la página que se mostrará cuando el usuario vaya a /.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/login';

function AppRouter() {
    return (
        <BrowserRouter> {/* Es como “el modo navegación” de la app.*/}
            <Routes> {/* Es un contenedor donde van todas tus rutas */}
                <Route path="/" element={<Login />} />

                {/* Luego agregamos más rutas */}
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
