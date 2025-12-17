// src/components/admin/cursos/CursoAcordeon.jsx

import React from 'react';


// Se reutilizan las clases de estilo de PanelUsuario.css
export default function CursoAcordeon({ curso, isOpen, onToggle }) {
    

    // Nombre visible en el header
    const cursoNombreVisible = `${curso.nombreMateria} - ${curso.nivel} ${curso.division} (${curso.anio})`;

    // Número total de alumnos
    const totalAlumnos = curso.alumnos ? curso.alumnos.length : 0;
    const [openAlumnoId, setOpenAlumnoId] = useState(null);

    const toggleAlumno = async (dni) => {
        setOpenAlumnoId(openAlumnoId === dni ? null : dni);

    };
    




    return (
        <div className="usuario-item-card">

            <div
                className="usuario-header-card"
                onClick={onToggle}
            >
                <span>
                    {cursoNombreVisible}
                </span>

                <span className="toggle-icon">
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {isOpen && (
                <div className="usuario-body-details">
                    <p><strong>ID Curso:</strong> {curso._id}</p>
                    <p>
                        <strong>Profesor:</strong> {curso.profesor?.nombre || 'Sin asignar'}
                    </p>
                    <p><strong>ID Profesor:</strong> {curso.profesor?.id}</p>
                    <p>
                        <strong>Nivel:</strong> {curso.nivel}
                    </p>
                    <p>
                        <strong>Año:</strong> {curso.anio}
                    </p>

                    {/* Lista de Alumnos */}
                    {totalAlumnos > 0 && (
                        <>
                            <h4>Alumnos ({totalAlumnos}):</h4>
                            <div className="detalle-hijos"> {/* Reutilizamos la clase de hijos de UsuariosPanel */}
                                <ul>
                                    {curso.alumnos.map(alumno => (
                                        <li key={alumno._id}>
                                            {alumno.nombre} (DNI: {alumno.dni})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                </div>
            )}
        </div>
    );
}