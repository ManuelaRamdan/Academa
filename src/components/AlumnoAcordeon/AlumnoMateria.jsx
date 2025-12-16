import { FaEdit, FaTrashAlt } from "react-icons/fa";

// Helper para el display de asistencias (lo movimos del acordeón viejo)
const getAsistenciaDisplay = (value, ASISTENCIA_ENUM) => {
    switch (value) {
        case ASISTENCIA_ENUM.PRESENTE: return 'Presente';
        case ASISTENCIA_ENUM.AUSENTE: return 'Ausente';
        case ASISTENCIA_ENUM.FERIADO: return 'Feriado';
        case ASISTENCIA_ENUM.PARO: return 'Paro';
        default: return value;
    }
};

export default function AlumnoMateria({
    materia,
    isEditing,
    setEditing,
    cancelarEdicion,
    onGuardar,
    userRole,
    ASISTENCIA_ENUM,

    // Funciones de manejo de estado y helpers pasadas desde AlumnoAcordeon
    handleCambioNota,
    handleAgregarNota,
    handleCambioAsistencia,
    handleAgregarAsistencia,
    handleCambioFechaHoraAsistencia,
    iniciarEliminacion,
    getFixedDateDisplay,
    getDatetimeLocalValue,
}) {
    return (
        <div className={`materia-bloque ${isEditing ? "is-editing-materia" : ""}`}>
            <div className="materia-titulo">
                {/* Título de materia/curso */}
                <h3 className="materia-curso-info">
                    {materia.nombreCurso} ({materia.nivel}{materia.division})
                </h3>

                {!isEditing && (
                    <button
                        className="btn-editar"
                        onClick={setEditing}
                    >
                        <FaEdit size={16} className="btn-icon-right" /> Editar Notas/Asistencias
                    </button>
                )}
            </div>

            {/* =======================
                 1. SECCIÓN NOTAS
                 ======================= */}
            <h3>Notas</h3>

            {isEditing && (
                <button
                    className="btn-agregar"
                    onClick={() => handleAgregarNota(materia.idCurso)}
                >
                    + Agregar Nota
                </button>
            )}

            {materia.notas?.length > 0 ? (
                <div className="tabla-wrapper">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Nota</th>
                                {isEditing && <th className="th-accion"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {materia.notas.map((n, index) => (
                                <tr key={n._id || index}>
                                    <td>
                                        {/* INPUT TIPO DE NOTA */}
                                        {isEditing ? (
                                            <input
                                                className="input-tabla"
                                                value={n.tipo}
                                                placeholder="Tipo (Obligatorio)"
                                                onChange={(e) => handleCambioNota(materia.idCurso, index, "tipo", e.target.value)}
                                            />
                                        ) : (
                                            n.tipo && n.tipo.trim() !== "" ? n.tipo : "(Tipo vacío)"
                                        )}
                                    </td>
                                    <td>
                                        {/* INPUT NOTA */}
                                        {isEditing ? (
                                            <input
                                                className="input-tabla"
                                                type="number"
                                                value={n.nota}
                                                min="1" max="10"
                                                onChange={(e) => handleCambioNota(materia.idCurso, index, "nota", e.target.value)}
                                            />
                                        ) : (
                                            n.nota
                                        )}
                                    </td>
                                    {isEditing && (
                                        <td className="td-accion">
                                            <button
                                                className="btn-eliminar-tabla"
                                                onClick={() => iniciarEliminacion(materia.idCurso, 'nota', index, n.tipo || 'Nueva Nota')}
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No tiene notas cargadas</p>
            )}

            {/* =======================
                 2. SECCIÓN ASISTENCIAS
                 ======================= */}
            <h3>Asistencias</h3>

            {isEditing && (
                <button
                    className="btn-agregar"
                    onClick={() => handleAgregarAsistencia(materia.idCurso)}
                >
                    + Asistencia
                </button>
            )}

            {materia.asistencias?.length > 0 ? (
                <div className="tabla-wrapper">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Presente</th>
                                {isEditing && <th className="th-accion"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {materia.asistencias.map((a, index) => (
                                <tr key={a._id || index}>
                                    <td>
                                        {/* INPUT FECHA/HORA */}
                                        {isEditing ? (
                                            <input
                                                className="input-tabla"
                                                type="datetime-local"
                                                max={getDatetimeLocalValue(new Date().toISOString())}
                                                value={getDatetimeLocalValue(a.fecha)}
                                                onChange={(e) => handleCambioFechaHoraAsistencia(materia.idCurso, index, e.target.value)}
                                            />
                                        ) : (
                                            getFixedDateDisplay(a.fecha)
                                        )}
                                    </td>
                                    <td>
                                        {/* SELECT PRESENTE/AUSENTE */}
                                        {isEditing ? (
                                            <select
                                                className="input-tabla"
                                                value={a.presente}
                                                onChange={(e) => handleCambioAsistencia(materia.idCurso, index, e.target.value)}
                                            >
                                                {Object.values(ASISTENCIA_ENUM).map(estado => (
                                                    <option key={estado} value={estado}>{estado}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            getAsistenciaDisplay(a.presente, ASISTENCIA_ENUM)
                                        )}
                                    </td>
                                    {isEditing && (
                                        <td className="td-accion">
                                            <button
                                                className="btn-eliminar-tabla"
                                                onClick={() => iniciarEliminacion(materia.idCurso, 'asistencia', index, a.fecha)}
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No tiene asistencias cargadas</p>
            )}

            {/* Botones de Guardar/Cancelar por Materia */}
            {isEditing && (
                <div className="botones-acciones" style={{ marginTop: '20px' }}>
                    <button className="btn-cancelar" onClick={cancelarEdicion}>
                        Cancelar
                    </button>
                    <button className="btn-guardar" onClick={() => onGuardar(materia)}>
                        Guardar cambios
                    </button>
                </div>
            )}
        </div>
    );
}