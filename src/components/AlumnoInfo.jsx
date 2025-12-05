import { useState } from "react";

export default function AlumnoInfo({ alumno }) {
    const [abierto, setAbierto] = useState(null);

    const getFixedDateDisplay = (isoDate) => {
        if (!isoDate) return '';
        
        const date = new Date(isoDate);

        // Forzar la extracción de los componentes de la fecha usando UTC
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // getUTCMonth es base 0
        const day = date.getUTCDate();
        
        // Formatear a DD/MM/YYYY con relleno para un solo dígito
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    return (
        <div className="alumno-card">
            <h1 className="alumno-nombre">{alumno.nombre}</h1>
            <p className="alumno-dato"><strong>DNI:</strong> {alumno.dni}</p>

            <h2 className="seccion-titulo">Materias</h2>

            {(!alumno.materias || alumno.materias.length === 0) && (
                <p>Este alumno no tiene materias cargadas.</p>
            )}

            {alumno.materias?.map((mat, index) => {
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
                                                <td>{getFixedDateDisplay(a.fecha)}</td>
                                                <td>{a.presente}</td>
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
