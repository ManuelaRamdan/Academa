import { useState } from "react";

export default function AlumnoInfo({ alumno }) {
    const [abierto, setAbierto] = useState(null);
    const [filtroMateria, setFiltroMateria] = useState(""); // <-- ✔ buscador

    const getFixedDateDisplay = (isoDate) => {
        if (!isoDate) return '';

        const date = new Date(isoDate);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();

        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    // ✔ Filtrar materias según el texto buscado
    const materiasFiltradas = alumno.materias?.filter(m =>
        `${m.nombreCurso} ${m.nivel}${m.division} ${m.anio}`
            .toLowerCase()
            .includes(filtroMateria.toLowerCase())
    ) || [];

    return (
        <div className="alumno-card">
            <h1 className="alumno-nombre">{alumno.nombre}</h1>
            <p className="alumno-dato"><strong>DNI:</strong> {alumno.dni}</p>

            <h2 className="seccion-titulo">Materias</h2>

            {/* 🔎 BUSCADOR DE MATERIAS — justo debajo del título */}
            <input
                type="text"
                className="buscar-materia"
                placeholder="Buscar materia..."
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
            />

            {materiasFiltradas.length === 0 && (
                <p>No se encontraron materias.</p>
            )}

            {materiasFiltradas.map((mat, index) => {
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
                                <div className="tabla-wrapper">
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
                                </div>
                                <h3>Asistencias</h3>
                                <div className="tabla-wrapper">
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
                );
            })}
        </div>
    );
}
