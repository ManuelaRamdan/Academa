import { useState } from "react";

export default function AlumnoInfo({ alumno }) {
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
