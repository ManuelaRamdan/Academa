import { useEffect, useState } from "react";
import { getProfesorById } from "../../services/profesorService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/PanelProfesor.css";
import AlumnoAcordeon from "../../components/AlumnoAcordeon";

export default function ProfesorPanel() {
    const { user, logout } = useAuth();

    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [menuAbierto, setMenuAbierto] = useState(false);
    const toggleMenu = () => setMenuAbierto(prev => !prev);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await getProfesorById(user.profesorId);
                setMaterias(res.data.materiasDictadas || []);

                if (res.data.materiasDictadas?.length > 0) {
                    setMateriaSeleccionada(res.data.materiasDictadas[0]);
                }

            } catch (err) {
                setError("No se pudieron cargar las materias del profesor");
            } finally {
                setLoading(false);
            }
        };

        if (user?.profesorId) cargar();
    }, [user]);

    if (loading) return <h2 className="loading">Cargando...</h2>;
    if (error) return <p className="error">{error}</p>;

    return (
        <>
            <button className="hamburger" onClick={toggleMenu}>☰</button>

            <div className="profesor-layout">

                <aside className={`prof-sidebar ${menuAbierto ? "open" : ""}`}>
                    <h2 className="prof-sidebar-title">Mis Materias</h2>

                    {materias.map(mat => (
                        <button
                            key={mat._id}
                            className={`materia-btn ${materiaSeleccionada?._id === mat._id ? "active" : ""}`}
                            onClick={() => {
                                setMateriaSeleccionada(mat);
                                setAlumnoSeleccionado(null);
                            }}
                        >
                            {mat.nombreMateria} {mat.nivel}{mat.division} {mat.anio}
                        </button>
                    ))}

                    <button onClick={logout} className="prof-logout">Cerrar sesión</button>
                </aside>


                <main className="prof-content">

                    {!materiaSeleccionada && <p>Seleccione una materia</p>}

                    {materiaSeleccionada && (
                        <>
                            <h1>
                                {materiaSeleccionada.nombreMateria} {materiaSeleccionada.nivel}
                                {materiaSeleccionada.division} {materiaSeleccionada.anio}
                            </h1>

                            <div className="lista-alumnos">
                                {materiaSeleccionada.alumnos?.map(alumno => (
                                    <AlumnoAcordeon
                                        key={alumno._id}
                                        alumno={alumno}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                </main>


            </div>
        </>
    );
}
