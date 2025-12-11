import { useState } from "react";

const ASISTENCIA_ENUM = {
    PRESENTE: "Presente",
    AUSENTE: "Ausente",
    FERIADO: "Feriado",
    PARO: "Paro",
};

const getFixedDateDisplay = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("es-AR");
};

export default function MateriaProfesorDetalle({ materiaCurso }) {
    const [openMateria, setOpenMateria] = useState(false);
    const [openAlumnoId, setOpenAlumnoId] = useState(null);

    const toggleAlumno = (dni) => {
        setOpenAlumnoId(openAlumnoId === dni ? null : dni);
    };

    return (
        <div className="mpd-card">

            {/* CABECERA DE MATERIA */}
            <div
                className="mpd-header"
                onClick={() => setOpenMateria(!openMateria)}
            >
                <div className="mpd-titles">
                    <h3 className="mpd-materia">{materiaCurso.nombreMateria}</h3>
                    <p className="mpd-curso">{materiaCurso.nombreCurso}</p>
                </div>

                <span className="mpd-arrow">{openMateria ? "▲" : "▼"}</span>
            </div>

            {openMateria && (
                <div className="mpd-body">

                    {/* INFO GENERAL */}
                    <div className="mpd-info">
                        <p><strong>ID Curso:</strong> {materiaCurso.idCurso}</p>
                        <p><strong>Alumnos:</strong> {materiaCurso.alumnos?.length || 0}</p>
                    </div>

                    {/* LISTA DE ALUMNOS */}
                    <div className="mpd-alumnos">

                        {materiaCurso.alumnos?.map((alumno) => (
                            <div key={alumno.dni} className="mpd-alumno-card">

                                {/* HEADER ALUMNO */}
                                <div
                                    className="mpd-alumno-header"
                                    onClick={() => toggleAlumno(alumno.dni)}
                                >
                                    <div>
                                        <strong>{alumno.nombre}</strong>
                                        <p className="mpd-alumno-dni">{alumno.dni}</p>
                                    </div>
                                    <span className="mpd-arrow">
                                        {openAlumnoId === alumno.dni ? "▲" : "▼"}
                                    </span>
                                </div>

                                {/* DETALLE ALUMNO */}
                                {openAlumnoId === alumno.dni && (
                                    <div className="mpd-alumno-body">

                                        {/* NOTAS */}
                                        <div className="mpd-section">
                                            <h4>Notas</h4>
                                            <table className="mpd-table">
                                                <thead>
                                                    <tr>
                                                        <th>Tipo</th>
                                                        <th>Nota</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {alumno.notas?.map((n) => (
                                                        <tr key={n._id}>
                                                            <td>{n.tipo}</td>
                                                            <td>{n.nota}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* ASISTENCIAS */}
                                        <div className="mpd-section">
                                            <h4>Asistencias</h4>
                                            <table className="mpd-table">
                                                <thead>
                                                    <tr>
                                                        <th>Fecha</th>
                                                        <th>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {alumno.asistencias?.map((a) => (
                                                        <tr key={a._id}>
                                                            <td>{getFixedDateDisplay(a.fecha)}</td>
                                                            <td>{a.presente}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            )}

        </div>
    );
}
