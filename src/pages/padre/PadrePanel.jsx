// src/pages/Padre/PadreLayout.jsx
import { useEffect, useState } from "react";
import { getHijosPadre, getAlumnoById } from "../../services/padreService";
import { useAuth } from "../../context/AuthContext";

export default function PadreLayout() {
    const { logout } = useAuth();

    const [hijos, setHijos] = useState([]);
    const [alumno, setAlumno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hijoSeleccionado, setHijoSeleccionado] = useState(null);

    // Cargar hijos
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await getHijosPadre();
                setHijos(res.data.hijos);

                if (res.data.hijos.length > 0) {
                    // Selecciona el primero automáticamente
                    seleccionarHijo(res.data.hijos[0].id);
                }

            } catch (err) {
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

    if (loading && !alumno) return <h2>Cargando...</h2>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* MENÚ LATERAL */}
            <aside
                style={{
                    width: "250px",
                    background: "#f4f4f4",
                    padding: "15px",
                    borderRight: "1px solid #ccc"
                }}
            >
                <h2>Mis Hijos</h2>

                {hijos.map(h => (
                    <button
                        key={h.id}
                        onClick={() => seleccionarHijo(h.id)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "10px",
                            background: hijoSeleccionado === h.id ? "#ddd" : "white",
                            border: "1px solid #aaa",
                            cursor: "pointer",
                            borderRadius: "5px"
                        }}
                    >
                        {h.nombre}
                    </button>
                ))}

                <button
                    onClick={logout}
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        padding: "10px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Cerrar sesión
                </button>
            </aside>

            {/* PANEL DERECHO */}
            <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
                {loading ? (
                    <h2>Cargando datos del alumno...</h2>
                ) : alumno ? (
                    <AlumnoInfo alumno={alumno} />
                ) : (
                    <p>No se encontró información del alumno.</p>
                )}
            </main>
        </div>
    );
}

// Un componente separado para verlo más claro
function AlumnoInfo({ alumno }) {
    const [acordeonAbierto, setAcordeonAbierto] = useState(null);

    return (
        <div>
            <h1>{alumno.nombre}</h1>
            <p><strong>DNI:</strong> {alumno.dni}</p>

            <h2>Materias</h2>

            {alumno.materias.map((mat, index) => {
                const abierto = acordeonAbierto === index;

                return (
                    <div key={mat._id} style={{ marginBottom: "10px" }}>
                        <div
                            onClick={() =>
                                setAcordeonAbierto(abierto ? null : index)
                            }
                            style={{
                                cursor: "pointer",
                                background: "#eee",
                                padding: "10px",
                                borderRadius: "5px"
                            }}
                        >
                            <strong>
                                {mat.nombreCurso} {mat.nivel}{mat.division} {mat.anio}
                            </strong>
                        </div>

                        {abierto && (
                            <div style={{ padding: "10px", border: "1px solid #ccc" }}>
                                <h3>Notas</h3>
                                <table border="1" cellPadding="6">
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
                                <table border="1" cellPadding="6">
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
