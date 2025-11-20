// src/pages/Padre/PadrePanel.jsx
import { useEffect, useState } from "react";
import { getHijosPadre, getAlumnoById } from "../../services/padreService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/PanelPadre.css";
import AlumnoInfo from "../../components/AlumnoInfo";



export default function PadrePanel() {
    const { logout } = useAuth();

    const [hijos, setHijos] = useState([]);
    const [alumno, setAlumno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hijoSeleccionado, setHijoSeleccionado] = useState(null);

const [menuAbierto, setMenuAbierto] = useState(false);

const toggleMenu = () => {
    setMenuAbierto(prev => !prev);
};

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await getHijosPadre();
                setHijos(res.data.hijos);

                if (res.data.hijos.length > 0) {
                    seleccionarHijo(res.data.hijos[0].id);
                }
            } catch {
                setError("No se pudieron cargar los hijos");
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, []);

    const seleccionarHijo = async (id) => {
        try {
            setLoading(true);
            setHijoSeleccionado(id);
            const res = await getAlumnoById(id);
            setAlumno(res.data);
        } catch {
            setError("Error al cargar datos del alumno");
        } finally {
            setLoading(false);
        }
    };

    // AHORA SÍ, YA ESTÁN TODOS LOS HOOKS DEFINIDOS:
    if (loading && !alumno) return <h2 className="loading">Cargando...</h2>;
    if (error) return <p className="error">{error}</p>;



    return (
        <>
            {/* BOTÓN HAMBURGUESA */}
            <button className="hamburger" onClick={toggleMenu}>☰</button>

            <div className="padre-layout">

                {/* SIDEBAR */}
                <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
                    <h2 className="sidebar-title">Mis Hijos</h2>

                    {hijos.map(h => (
                        <button
                            key={h.id}
                            onClick={() => seleccionarHijo(h.id)}
                            className={`sidebar-btn ${hijoSeleccionado === h.id ? "active" : ""}`}
                        >
                            {h.nombre}
                        </button>
                    ))}

                    <button onClick={logout} className="logout-btn">
                        Cerrar sesión
                    </button>
                </aside>

                {/* CONTENIDO */}
                <main className="content">
                    {loading ? (
                        <h2 className="loading">Cargando datos del alumno...</h2>
                    ) : alumno ? (
                        <AlumnoInfo alumno={alumno} />
                    ) : (
                        <p>No se encontró información del alumno.</p>
                    )}
                </main>
            </div>
        </>
    );

}
