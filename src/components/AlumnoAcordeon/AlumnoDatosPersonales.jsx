import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function AlumnoDatosPersonales({
    alumno,
    alumnoEditado,
    setAlumnoEditado,
    isEditingMateria,
    onGuardar,
    onCancelar,
    onEditar,
    onIniciarEliminacion
}) {
    return (
        <>
            <div className="personal-header-actions">
                <h3>Datos Personales</h3>

                {!alumnoEditado.editandoDatosPersonales ? (
                    <div className="admin-acciones-datos-personales">
                        <button
                            className="btn-editar"
                            onClick={onEditar}
                            disabled={isEditingMateria}
                        >
                            <FaEdit size={16} className="btn-icon-right" /> Editar Datos Personales
                        </button>

                        <button
                            className="btn-eliminar-alumno"
                            onClick={onIniciarEliminacion}
                            disabled={isEditingMateria}
                        >
                            <FaTrashAlt size={14} className="btn-icon-right" /> Eliminar Alumno
                        </button>
                    </div>
                ) : (
                    <div className="botones-acciones">
                        <button
                            className="btn-cancelar"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>

                        <button className="btn-guardar" onClick={onGuardar}>
                            Guardar Datos Personales
                        </button>
                    </div>
                )}
            </div>

            {/* CLASE CORREGIDA: Usa alumno-id para forzar la ruptura del ID largo */}
            <p className="usuario-body-details"> 
                <strong>ID:</strong>
                <span>{alumno._id}</span>
            </p>

            <div className="personal-info-fields">
                <label>Nombre:
                    <input
                        type="text"
                        value={alumnoEditado.nombre}
                        onChange={e =>
                            setAlumnoEditado(p => ({ ...p, nombre: e.target.value }))
                        }
                        readOnly={!alumnoEditado.editandoDatosPersonales}
                        className={alumnoEditado.editandoDatosPersonales ? 'input-editable' : 'input-readonly'}
                    />
                </label>

                <label>DNI:
                    <input
                        type="text"
                        value={alumnoEditado.dni}
                        onChange={e =>
                            setAlumnoEditado(p => ({ ...p, dni: e.target.value }))
                        }
                        readOnly={!alumnoEditado.editandoDatosPersonales}
                        className={alumnoEditado.editandoDatosPersonales ? 'input-editable' : 'input-readonly'}
                    />
                </label>
            </div>
        </>
    );
}