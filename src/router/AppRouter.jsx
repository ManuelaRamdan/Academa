import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from '../pages/login';
import Admin from "../pages/admin/AdminPanel";
import Profesor from "../pages/profesor/ProfesorPanel";
import PadrePanel from "../pages/padre/PadrePanel";

import ProtectRoute from "./ProtectRoute";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                {/* RUTA ADMIN */}
                <Route
                    path="/admin"
                    element={
                        <ProtectRoute allowedRole="administrador">
                            <Admin />
                        </ProtectRoute>
                    }
                />

                {/* RUTA PROFESOR */}
                <Route
                    path="/profesor"
                    element={
                        <ProtectRoute allowedRole="profesor">
                            <Profesor />
                        </ProtectRoute>
                    }
                />

                {/* RUTA PADRE */}
                <Route
                    path="/padre"
                    element={
                        <ProtectRoute allowedRole="padre">
                            <PadrePanel />
                        </ProtectRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
