import { useState } from "react";
import { FaEdit } from "react-icons/fa";

export default function AlumnoAcordeon({
    alumno,
    dni,
    materiasDelAlumno,
    isOpen,
    onToggle,
    onGuardarCambios,
}) {

    const [editMode, setEditMode] = useState(false);
    const [materias, setMaterias] = useState(materiasDelAlumno || []);

    const handleEditar = () => {
        setEditMode(true);
    };

    const handleCambioNota = (idCurso, index, campo, valor) => {
        setMaterias(prev =>
            prev.map(m =>
                m.idCurso === idCurso
                    ? {
                        ...m,
                        notas: m.notas.map((n, i) =>
                            i === index ? { ...n, [campo]: valor } : n
                        ),
                    }
                    : m
            )
        );
    };

    const handleCambioAsistencia = (idCurso, index, valor) => {
        setMaterias(prev =>
            prev.map(m =>
                m.idCurso === idCurso
                    ? {
                        ...m,
                        asistencias: m.asistencias.map((a, i) =>
                            i === index ? { ...a, presente: valor } : a
                        ),
                    }
                    : m
            )
        );
    };

    return (
        <div className="acordeon-alumno">

            <div className="acordeon-header" onClick={onToggle}>
                {alumno?.nombre ?? "Alumno sin nombre"}
            </div>

            {isOpen && (
                <div className="acordeon-body">

                    {materias.map(m => (
                        <div key={m.idCurso} className="materia-bloque">

                            <div className="materia-titulo">

                                {!editMode && (
                                    <button className="btn-editar" onClick={handleEditar}>
                                        <FaEdit size={20}/>
                                    </button>
                                )}
                            </div>


                            {/* NOTAS */}
                            <h3>Notas</h3>

                            {m.notas?.length > 0 ? (
                                <table className="tabla">
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.notas.map((n, index) => (
                                            <tr key={n._id}>
                                                <td>
                                                    {editMode ? (
                                                        <input
                                                            value={n.tipo}
                                                            onChange={(e) =>
                                                                handleCambioNota(m.idCurso, index, "tipo", e.target.value)
                                                            }
                                                        />
                                                    ) : (
                                                        n.tipo
                                                    )}
                                                </td>

                                                <td>
                                                    {editMode ? (
                                                        <input
                                                            type="number"
                                                            value={n.nota}
                                                            onChange={(e) =>
                                                                handleCambioNota(m.idCurso, index, "nota", e.target.value)
                                                            }
                                                        />
                                                    ) : (
                                                        n.nota
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No tiene notas cargadas</p>
                            )}


                            {/* ASISTENCIAS */}
                            <h3>Asistencias</h3>

                            {m.asistencias?.length > 0 ? (
                                <table className="tabla">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Presente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.asistencias.map((a, index) => (
                                            <tr key={a._id}>
                                                <td>{new Date(a.fecha).toLocaleDateString()}</td>

                                                <td>
                                                    {editMode ? (
                                                        <select
                                                            value={a.presente ? "1" : "0"}
                                                            onChange={(e) =>
                                                                handleCambioAsistencia(
                                                                    m.idCurso,
                                                                    index,
                                                                    e.target.value === "1"
                                                                )
                                                            }
                                                        >
                                                            <option value="1">Presente</option>
                                                            <option value="0">Ausente</option>
                                                        </select>
                                                    ) : (
                                                        a.presente ? "✔️" : "❌"
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No tiene asistencias cargadas</p>
                            )}

                        </div>
                    ))}


                    {/* SOLO aparece en modo edición */}
                    {editMode && (
                        <button
                            className="btn-guardar"
                            onClick={() => {
                                setEditMode(false);
                                onGuardarCambios(materias[0]);
                            }}
                        >
                            Guardar cambios
                        </button>
                    )}

                </div>
            )}
        </div>
    );
}
