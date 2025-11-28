import { useEffect, useState } from "react";
import { getProfesorById } from "../../services/profesorService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/PanelProfesor.css";
import AlumnoAcordeon from "../../components/AlumnoAcordeon";

import { actualizarNotas } from "../../services/profesorService"; // asegurate que exista

export default function ProfesorPanel() {
    const { user, logout } = useAuth();

    const [profesor, setProfesor] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [openAlumnoId, setOpenAlumnoId] = useState(null);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtroMateria, setFiltroMateria] = useState("");
    const [filtroAlumno, setFiltroAlumno] = useState("");


    const toggleMenu = () => setMenuAbierto(prev => !prev);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);

                const res = await getProfesorById();
                const data = res.data ?? res;

                setProfesor(data);

                const dictadas = data.materiasDictadas || [];
                setMaterias(dictadas);

                if (dictadas.length > 0) {
                    const primera = dictadas[0];
                    setMateriaSeleccionada(primera);
                    setAlumnos(primera.alumnos || []);
                }

            } catch (err) {
                setError("No se pudieron cargar las materias del profesor");
            } finally {
                setLoading(false);
            }
        };

        if (user?.profesorId) cargar();
    }, [user]);

    const seleccionarMateria = (m) => {
        setMateriaSeleccionada(m);
        setAlumnos(m.alumnos || []);
        setOpenAlumnoId(null);
    };

    const toggleAlumno = (id) => {
        setOpenAlumnoId(prev => (prev === id ? null : id));
    };

    if (loading) return <h2 className="loading">Cargando...</h2>;
    if (error) return <p className="error">{error}</p>;



   const guardarCambiosAlumno = async (dni, materiaActualizada) => {
    try {
        const materiaNormalizada = {
            ...materiaActualizada,
            notas: materiaActualizada.notas.map(n => ({
                ...n,
                nota: n.nota === "" ? null : Number(n.nota)
            }))
        };

        const res = await actualizarNotas(dni, [materiaNormalizada]);
        const dataGuardada = res.data ?? res;

        // === ACTUALIZAR ALUMNOS EN EL ESTADO ===
        setAlumnos(prev =>
            prev.map(al => 
                al.dni === dni
                    ? { ...al, notas: materiaNormalizada.notas, asistencias: materiaNormalizada.asistencias }
                    : al
            )
        );

        // === ACTUALIZAR MATERIAS DEL PROFESOR ===
        setMaterias(prevMaterias =>
            prevMaterias.map(mat => {
                if (mat._id === materiaSeleccionada._id) {
                    return {
                        ...mat,
                        alumnos: mat.alumnos.map(al =>
                            al.dni === dni
                                ? { ...al, notas: materiaNormalizada.notas, asistencias: materiaNormalizada.asistencias }
                                : al
                        )
                    };
                }
                return mat;
            })
        );

    } catch (error) {
        console.log("ERROR DEL BACKEND:", error.response?.data);
    }
};




    return (
        <>
            <button className="hamburger" onClick={toggleMenu}>☰</button>

            <div className="prof-layout">

                {/* SIDEBAR */}
                <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
                    <h2 className="sidebar-title">Mis materias</h2>

                    <input
                        type="text"
                        className="buscar-materia"
                        placeholder="Buscar materia..."
                        value={filtroMateria}
                        onChange={(e) => setFiltroMateria(e.target.value)}
                    />

                    <div className="sidebar-scroll">
                        {materias
                            .filter(m =>
                                `${m.nombreMateria} ${m.nivel}${m.division} ${m.anio}`
                                    .toLowerCase()
                                    .includes(filtroMateria.toLowerCase())
                            )
                            .map(m => (
                                <button
                                    key={m._id}
                                    onClick={() => seleccionarMateria(m)}
                                    className={`sidebar-btn ${materiaSeleccionada?._id === m._id ? "active" : ""}`}
                                >
                                    {m.nombreMateria} {m.nivel}{m.division} {m.anio}
                                </button>
                            ))}
                    </div>
                    <button onClick={logout} className="logout-btn">Cerrar sesión</button>
                </aside>

                {/* CONTENIDO */}
                <main className="content">
                    {materiaSeleccionada ? (
                        <div className="materia-card">

                            <h1 className="materia-titulo">
                                {materiaSeleccionada.nombreMateria}{" "}
                                {materiaSeleccionada.nivel}{materiaSeleccionada.division}{" "}
                                {materiaSeleccionada.anio}
                            </h1>
                            <input
                                type="text"
                                className="buscar-alumno"
                                placeholder="Buscar alumno..."
                                value={filtroAlumno}
                                onChange={(e) => setFiltroAlumno(e.target.value)}
                            />

                            {alumnos
                                .filter(al =>
                                    al.nombre.toLowerCase().includes(filtroAlumno.toLowerCase())
                                )
                                .map(al => {
                                    const materiasDelAlumno = [
                                        {
                                            idCurso: materiaSeleccionada.idCurso,
                                            nombreCurso: materiaSeleccionada.nombreMateria,
                                            division: materiaSeleccionada.division,
                                            nivel: materiaSeleccionada.nivel,
                                            anio: materiaSeleccionada.anio,
                                            notas: al.notas,
                                            asistencias: al.asistencias
                                        }
                                    ];

                                    return (
                                        <AlumnoAcordeon
                                            key={al._id}
                                            alumno={al}
                                            dni={al.dni}
                                            materiasDelAlumno={materiasDelAlumno}
                                            isOpen={openAlumnoId === al._id}
                                            onToggle={() => toggleAlumno(al._id)}
                                            onGuardarCambios={(materiaActualizada) =>
                                                guardarCambiosAlumno(al.dni, materiaActualizada)
                                            }

                                        />
                                    );
                                })
                            }

                        </div>
                    ) : (
                        <p>No hay materias cargadas.</p>
                    )}
                </main>
            </div>
        </>
    );
}
