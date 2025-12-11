// src/pages/Admin/AdminPanel.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/PanelAdmin.css";
import UsuariosPanel from "../../components/admin/usuarios/UsuarioPanel";
import MateriasPanel from "../../components/admin/materia/MateriaPanel";
import CursosPanel from "../../components/admin/cursos/CursoPanel";
import ProfesoresPanel from "../../components/admin/profesor/ProfesorPanel";
import AlumnosPanel from "../../components/admin/alumno/AlumnoPanel";

const SECCIONES = [
    { id: 'usuarios', nombre: 'Usuarios' },
    { id: 'alumnos', nombre: 'Alumnos' },
    { id: 'cursos', nombre: 'Cursos' },
    { id: 'materias', nombre: 'Materias' },
    { id: 'profesores', nombre: 'Profesores' },
];


// Función Helper para renderizar el componente de contenido
const renderContent = (seccionSeleccionada) => {
    switch (seccionSeleccionada) {
        case 'usuarios': return <UsuariosPanel />;
        case 'materias': return <MateriasPanel />;
        case 'cursos': return <CursosPanel />;
        case 'profesores': return <ProfesoresPanel />;
        case 'alumnos': return <AlumnosPanel />;
        default: return (
            <div>
                <h1>👋 Bienvenido, Administrador</h1>
                <p>Selecciona una sección en el menú lateral para gestionar la plataforma.</p>
            </div>
        );
    }
};

export default function AdminPanel() {
    const { logout } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Cambiamos la inicialización para que coincida con el primer elemento de SECCIONES
    const [seccionSeleccionada, setSeccionSeleccionada] = useState(SECCIONES[0].id);
    const [menuAbierto, setMenuAbierto] = useState(false);

    const toggleMenu = () => {
        setMenuAbierto(prev => !prev);
    };


    const seleccionarSeccion = (id) => {
        setSeccionSeleccionada(id);
        setMenuAbierto(false);
    };

    if (loading) return <h2 className="loading">Cargando...</h2>;
    if (error) return <p className="error">{error}</p>;

    return (
        <>
            {/* BOTÓN HAMBURGUESA */}
            <button className="hamburger" onClick={toggleMenu}>☰</button>

            <div className="admin-layout"> {/* CLASE PRINCIPAL: admin-layout */}

                {/* SIDEBAR */}
                <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
                    <h2 className="sidebar-title">Panel Admin</h2>

                    {SECCIONES.map(s => (
                        <button
                            key={s.id}
                            onClick={() => seleccionarSeccion(s.id)}
                            className={`sidebar-btn ${seccionSeleccionada === s.id ? "active" : ""}`}
                        >
                            {s.nombre}
                        </button>
                    ))}

                    {/* Separador visual opcional */}
                    <div className="sidebar-divider"></div>

                    <button onClick={logout} className="logout-btn">
                        Cerrar sesión
                    </button>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <main className="content">
                    {renderContent(seccionSeleccionada)}
                </main>
            </div>
        </>
    );

}