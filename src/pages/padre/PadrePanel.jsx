// src/pages/Padre/PadrePanel.jsx
import { useEffect, useState } from "react";
import { getHijosPadre, getAlumnoById } from "../../services/padreService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/PanelPadre.css";

export default function PadrePanel() {
    const { logout } = useAuth();

    const [hijos, setHijos] = useState([]);
    const [alumno, setAlumno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hijoSeleccionado, setHijoSeleccionado] = useState(null);

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

    if (loading && !alumno) return <h2 className="loading">Cargando...</h2>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="padre-layout">
            
            <aside className="sidebar">
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
    );
}

function AlumnoInfo({ alumno }) {
    const [abierto, setAbierto] = useState(null);

    return (
        <div className="alumno-card">
            <h1 className="alumno-nombre">{alumno.nombre}</h1>
            <p className="alumno-dato"><strong>DNI:</strong> {alumno.dni}</p>

            <h2 className="seccion-titulo">Materias</h2>

            {alumno.materias.map((mat, index) => {
                const isOpen = abierto === index;

                return (
                    <div key={mat._id} className="materia-item">
                        
                        <div
                            className="materia-header"
                            onClick={() => setAbierto(isOpen ? null : index)}
                        >
                            {mat.nombreCurso} {mat.nivel}{mat.division} {mat.anio}
                        </div>

                        {isOpen && (
                            <div className="materia-body">
                                <h3>Notas</h3>
                                <table className="tabla">
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mat.notas.map(n => (
                                            <tr key={n._id}>
                                                <td>{n.tipo}</td>
                                                <td>{n.nota}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h3>Asistencias</h3>
                                <table className="tabla">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Presente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mat.asistencias.map(a => (
                                            <tr key={a._id}>
                                                <td>{new Date(a.fecha).toLocaleDateString()}</td>
                                                <td>{a.presente ? "✔️" : "❌"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
