import { useState } from "react";

export default function AlumnoAcordeon({ alumno }) {
    const [abierto, setAbierto] = useState(false);

    return (
        <div className="acordeon-alumno">
            <div
                className="acordeon-header"
                onClick={() => setAbierto(!abierto)}
            >
                {alumno.nombre} — {alumno.dni}
            </div>

            {abierto && (
                <div className="acordeon-body">
                    <h3>Notas</h3>
                    {alumno.notas.length === 0 ? (
                        <p>No tiene notas cargadas</p>
                    ) : (
                        <table className="tabla">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Nota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumno.notas.map(n => (
                                    <tr key={n._id}>
                                        <td>{n.tipo}</td>
                                        <td>{n.nota}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <h3>Asistencias</h3>
                    {alumno.asistencias.length === 0 ? (
                        <p>No tiene asistencias cargadas</p>
                    ) : (
                        <table className="tabla">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Presente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumno.asistencias.map(a => (
                                    <tr key={a._id}>
                                        <td>{new Date(a.fecha).toLocaleDateString()}</td>
                                        <td>{a.presente ? "✔️" : "❌"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
