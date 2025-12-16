import { useState, useEffect, useRef } from "react";
import AlumnoHeader from "./AlumnoHeader";
import AlumnoDatosPersonales from "./AlumnoDatosPersonales";
import AlumnoMateria from "./AlumnoMateria";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; 

const ASISTENCIA_ENUM = {
    PRESENTE: 'Presente',
    AUSENTE: 'Ausente',
    FERIADO: 'Feriado',
    PARO: 'Paro',
};

const getDayKey = (isoDate) => isoDate ? isoDate.split('T')[0] : '';

const getFixedDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const datePart = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
    const timePart = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `${datePart} ${timePart}`;
};

const getDatetimeLocalValue = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};


export default function AlumnoAcordeon({
    alumno,
    materiasDelAlumno,
    isOpen,
    onToggle,
    onGuardarCambios,
    userRole,
    onActualizarAlumnoCompleto,
    onEliminarAlumno, 
}) {
    const notificationRef = useRef(null);
    const modalRef = useRef(null);

    const [materias, setMaterias] = useState(materiasDelAlumno || []);
    const [materiaEditandoId, setMateriaEditandoId] = useState(null);

    const [alumnoEditado, setAlumnoEditado] = useState({
        nombre: alumno?.nombre || '',
        dni: alumno?.dni || '',
        editandoDatosPersonales: false,
    });

    const [notificationMessage, setNotificationMessage] = useState({ type: '', message: '' });

    const [confirmDelete, setConfirmDelete] = useState({
        isActive: false,
        idCurso: null,
        itemType: null,
        index: null,
        itemName: '',
    });

    const isEditingMateria = materiaEditandoId !== null;


    useEffect(() => {
        setAlumnoEditado({
            nombre: alumno?.nombre || '',
            dni: alumno?.dni || '',
            editandoDatosPersonales: false,
        });
        setMaterias(materiasDelAlumno || []);
        setMateriaEditandoId(null);
    }, [alumno, materiasDelAlumno]);

    useEffect(() => {
        if (notificationMessage.message && notificationRef.current) {
            notificationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [notificationMessage]);

    useEffect(() => {
        if (confirmDelete.isActive && modalRef.current) {
            modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [confirmDelete.isActive]);



    const iniciarEdicionMateria = (idCurso) => {
        if (alumnoEditado.editandoDatosPersonales) {
            setNotificationMessage({ type: 'warning', message: 'Primero debe Guardar o Cancelar la edición de los Datos Personales.' });
            return;
        }
        setMateriaEditandoId(idCurso);
        setNotificationMessage({ type: '', message: '' });
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
    };

    const handleCancelarMateria = (idCurso) => {
        setMaterias(materiasDelAlumno || []);
        setMateriaEditandoId(null);
        setNotificationMessage({ type: 'info', message: `ℹ️ Cambios descartados para la materia ${materias.find(m => m.idCurso === idCurso)?.nombreCurso || 'seleccionada'}.` });
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
    };

    const handleCambioNota = (idCurso, index, campo, valor) => {
        let nuevoValor = valor;
        setNotificationMessage({ type: '', message: '' });

        if (campo === "nota") {
            const numValor = parseInt(valor, 10);
            if (valor === "") {
                nuevoValor = "";
            } else if (isNaN(numValor) || numValor < 1 || numValor > 10) {
                setNotificationMessage({ type: 'error', message: 'La nota debe ser un número entre 1 y 10.' });
                return;
            } else {
                nuevoValor = numValor;
            }
        }
        setMaterias(prev =>
            prev.map(m =>
                m.idCurso === idCurso
                    ? {
                        ...m,
                        notas: m.notas.map((n, i) =>
                            i === index ? { ...n, [campo]: nuevoValor } : n
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

    const handleAgregarNota = (idCurso) => {
        const nuevaNota = {
            _id: crypto.randomUUID(),
            tipo: "",
            nota: 1,
        };
        setMaterias(prev =>
            prev.map(m =>
                m.idCurso === idCurso
                    ? { ...m, notas: [...m.notas, nuevaNota] }
                    : m
            )
        );
    };

    const handleAgregarAsistencia = (idCurso) => {
        const nuevaFechaISO = new Date().toISOString();
        const nuevoDiaClave = getDayKey(nuevaFechaISO);

        setMaterias(prev =>
            prev.map(m => {
                if (m.idCurso === idCurso) {
                    const yaExiste = m.asistencias.some(a => getDayKey(a.fecha) === nuevoDiaClave);
                    if (yaExiste) {
                        setNotificationMessage({
                            type: 'error',
                            message: `Error: Ya existe una asistencia registrada para el día ${getFixedDateDisplay(nuevaFechaISO).split(' ')[0]}.`
                        });
                        return m;
                    }
                    setNotificationMessage({ type: '', message: '' });
                    return {
                        ...m,
                        asistencias: [
                            ...m.asistencias,
                            { _id: crypto.randomUUID(), fecha: nuevaFechaISO, presente: ASISTENCIA_ENUM.PRESENTE }
                        ]
                    };
                }
                return m;
            })
        );
    };

    const handleCambioFechaHoraAsistencia = (idCurso, index, nuevaFechaHoraString) => {
        const fechaSeleccionada = new Date(nuevaFechaHoraString);
        const hoy = new Date();
        if (fechaSeleccionada.getTime() > hoy.getTime()) {
            setNotificationMessage({ type: 'error', message: 'Error: No puedes registrar asistencias en el futuro.' });
            return;
        }
        const nuevaFechaISO = fechaSeleccionada.toISOString();
        const nuevoDiaClave = getDayKey(nuevaFechaISO);
        let esValido = true;

        setMaterias(prev =>
            prev.map(materia => {
                if (materia.idCurso === idCurso) {
                    const asistenciaEncontrada = materia.asistencias.find((a, i) => getDayKey(a.fecha) === nuevoDiaClave && i !== index);
                    if (asistenciaEncontrada) {
                        setNotificationMessage({ type: 'error', message: `❌ Error: El día ${getFixedDateDisplay(nuevaFechaISO).split(' ')[0]} ya está registrado en otra asistencia.` });
                        esValido = false;
                        return materia;
                    }
                }
                return materia;
            })
        );

        if (!esValido) return;

        setNotificationMessage({ type: '', message: '' });
        setMaterias(prev =>
            prev.map(m =>
                m.idCurso === idCurso
                    ? {
                        ...m,
                        asistencias: m.asistencias.map((a, i) =>
                            i === index ? { ...a, fecha: nuevaFechaISO } : a
                        )
                    }
                    : m
            )
        );
    };

    const iniciarEdicionDatosPersonales = () => {
        if (isEditingMateria) {
            setNotificationMessage({ type: 'warning', message: 'Primero debe Guardar o Cancelar la edición de la materia actual.' });
            return;
        }
        setAlumnoEditado(prev => ({ ...prev, editandoDatosPersonales: true }));
        setNotificationMessage({ type: '', message: '' });
    };

    const cancelarEdicionDatosPersonales = () => {
        setAlumnoEditado({
            nombre: alumno?.nombre || '',
            dni: alumno?.dni || '',
            editandoDatosPersonales: false,
        });
        setNotificationMessage({ type: 'info', message: 'ℹ️ Edición de Datos Personales cancelada.' });
    };

    const handleGuardarDatosPersonales = () => {
        if (!alumnoEditado.nombre.trim() || !alumnoEditado.dni.trim()) {
            setNotificationMessage({
                type: 'error',
                message: 'Error: El nombre y DNI del alumno no pueden estar vacíos.'
            });
            return;
        }

        onActualizarAlumnoCompleto({
            alumnoId: alumno._id,
            datosAlumno: {
                nombre: alumnoEditado.nombre.trim(),
                dni: alumnoEditado.dni.trim(),
            },
            materias,
        });
        setAlumnoEditado(prev => ({ ...prev, editandoDatosPersonales: false }));
        setNotificationMessage({ type: 'success', message: 'Datos personales actualizados correctamente.' });
    };

    const iniciarEliminacionAlumno = () => {
        setConfirmDelete({
            isActive: true,
            idCurso: null,
            itemType: 'alumno',
            index: null,
            itemName: alumno.nombre || 'el alumno',
        });
        setNotificationMessage({ type: '', message: '' });
    };

    const ejecutarEliminacionAlumno = () => {
        if (onEliminarAlumno) {
            onEliminarAlumno(alumno._id);
            setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
            setAlumnoEditado(prev => ({ ...prev, editandoDatosPersonales: false }));
        }
    };

    const iniciarEliminacion = (idCurso, itemType, index, itemName) => {
        setConfirmDelete({ isActive: true, idCurso, itemType, index, itemName });
        setNotificationMessage({ type: '', message: '' });
    };

    const ejecutarEliminacion = () => {
        const { itemType, idCurso, index } = confirmDelete;

        if (itemType === 'alumno') {
            ejecutarEliminacionAlumno();
            return;
        }

        setMaterias(prev =>
            prev.map(m => {
                if (m.idCurso === idCurso) {
                    if (itemType === 'nota') {
                        const nuevasNotas = m.notas.filter((_, i) => i !== index);
                        return { ...m, notas: nuevasNotas };
                    }
                    if (itemType === 'asistencia') {
                        const nuevasAsistencias = m.asistencias.filter((_, i) => i !== index);
                        return { ...m, asistencias: nuevasAsistencias };
                    }
                }
                return m;
            })
        );
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
        setNotificationMessage({ type: 'info', message: '🗑️ Elemento eliminado. Pulse Guardar para aplicar el cambio.' });
    };


    const validarYPrepararMaterias = () => {
        const materiasAEnviar = JSON.parse(JSON.stringify(materias));
        let tipoVacioEncontrado = false;
        let hayErrorRango = false;
        let hayErrorAsistenciaDuplicada = false;

        materiasAEnviar.forEach(materia => {
            // Validar Notas
            materia.notas = materia.notas.map(nota => {
                if (!nota.tipo || nota.tipo.toString().trim() === "") { tipoVacioEncontrado = true; }
                let notaNumerica = parseInt(nota.nota, 10);
                if (isNaN(notaNumerica) || notaNumerica < 1 || notaNumerica > 10) {
                    notaNumerica = Math.max(1, Math.min(10, notaNumerica || 1));
                    hayErrorRango = true;
                }
                nota.nota = notaNumerica;
                // Limpiar _id si es nuevo (crypto.randomUUID) antes de enviar al backend
                if (nota._id && !nota._id.startsWith('6')) { delete nota._id; } 
                return nota;
            });
            // Limpiar _id de asistencias nuevas
            materia.asistencias = materia.asistencias.map(asistencia => {
                if (asistencia._id && !asistencia._id.startsWith('6')) { delete asistencia._id; } 
                return asistencia;
            });

            // Validar Asistencias Duplicadas
            const diasRegistrados = new Set();
            materia.asistencias.forEach(asistencia => {
                if (hayErrorAsistenciaDuplicada) return;
                const diaClave = getDayKey(asistencia.fecha);
                if (diasRegistrados.has(diaClave)) { hayErrorAsistenciaDuplicada = true; }
                diasRegistrados.add(diaClave);
            });
        });

        if (tipoVacioEncontrado) {
            setNotificationMessage({ type: 'error', message: 'Error: El campo "Tipo" de una o más notas está vacío.' });
            return { error: true };
        }
        if (hayErrorAsistenciaDuplicada) {
            setNotificationMessage({ type: 'error', message: 'Error: No se puede guardar, existe una asistencia duplicada en el mismo día.' });
            return { error: true };
        }
        return { materiasAEnviar, hayErrorRango };
    };


    const handleGuardarMateria = (idCurso) => {
        const { materiasAEnviar, hayErrorRango, error } = validarYPrepararMaterias();

        if (error) return; 

        const materiaActualizada = materiasAEnviar.find(m => m.idCurso === idCurso);

        if (!materiaActualizada) return;

        setMateriaEditandoId(null); // Desactivar edición de materia

        if (userRole === 'ADMIN') {
            const cambiosCompletos = {
                alumnoId: alumno._id,
                datosAlumno: {
                    nombre: alumnoEditado.nombre.trim(),
                    dni: alumnoEditado.dni.trim(),
                },
                materias: materiasAEnviar,
            };
            onActualizarAlumnoCompleto(cambiosCompletos); 

        } else {
            onGuardarCambios(materiaActualizada);
        }

        if (hayErrorRango) {
            setNotificationMessage({ type: 'warning', message: 'Se corrigieron automáticamente notas fuera del rango (1-10).' });
        } else {
            setNotificationMessage({ type: 'success', message: 'Cambios de materia guardados correctamente!' });
        }
    };

    const getNotificationClass = (type) => {
        switch (type) {
            case 'error': return 'notification-error';
            case 'warning': return 'notification-warning';
            case 'success': return 'notification-success';
            case 'info': return 'notification-info';
            default: return '';
        }
    };


    return (
        <div className="acordeon-alumno">

            {confirmDelete.isActive && (
                <div className="modal-confirmacion-overlay">
                    <div className="modal-confirmacion-box" ref={modalRef}>
                        <p>
                            ¿Estás seguro que deseas eliminar
                            {confirmDelete.itemType === 'alumno' ? ` al alumno ${confirmDelete.itemName}` :
                                ` el elemento ${confirmDelete.itemName}`
                            }?
                        </p>
                        <div className="modal-actions">
                            <div className="botones-acciones">
                                <button className="btn-cancelar" onClick={() => setConfirmDelete({ isActive: false, itemType: null, idCurso: null, index: null, itemName: '' })}>
                                    Cancelar
                                </button>
                                <button className="btn-eliminar-confirmar" onClick={ejecutarEliminacion}>
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AlumnoHeader
                nombre={alumno?.nombre}
                isOpen={isOpen}
                onToggle={onToggle}
            />

            {isOpen && (
                <div className="acordeon-body">

                    <div ref={notificationRef}>
                        {notificationMessage.message && (
                            <div className={`notification-box ${getNotificationClass(notificationMessage.type)}`}>
                                {notificationMessage.message}
                            </div>
                        )}
                    </div>

                    {userRole === 'ADMIN' && (
                        <div className={`admin-actions-personal ${alumnoEditado.editandoDatosPersonales ? 'is-editing' : ''}`}>
                            <AlumnoDatosPersonales
                                alumno={alumno}
                                alumnoEditado={alumnoEditado}
                                isEditingMateria={isEditingMateria}
                                setAlumnoEditado={setAlumnoEditado}
                                onGuardar={handleGuardarDatosPersonales}
                                onCancelar={cancelarEdicionDatosPersonales}
                                onEditar={iniciarEdicionDatosPersonales}
                                onIniciarEliminacion={iniciarEliminacionAlumno}
                            />
                        </div>
                    )}
                    
                    {/* Información no editable de nombre/DNI para el Profesor */}
                    {userRole === 'PROFESOR' && (
                        <div className="profesor-info-display">
                            <p><strong>DNI:</strong> {alumno?.dni ?? "N/A"}</p>
                        </div>
                    )}

                    {materias.map(materia => (
                        <AlumnoMateria
                            key={materia.idCurso}
                            materia={materia}
                            isEditing={materia.idCurso === materiaEditandoId}
                            setEditing={() => iniciarEdicionMateria(materia.idCurso)} 
                            cancelarEdicion={() => handleCancelarMateria(materia.idCurso)}
                            userRole={userRole}
                            ASISTENCIA_ENUM={ASISTENCIA_ENUM}
                            getDayKey={getDayKey}
                            getFixedDateDisplay={getFixedDateDisplay}
                            getDatetimeLocalValue={getDatetimeLocalValue}
                            onGuardar={(m) => handleGuardarMateria(m.idCurso)}

                            handleCambioNota={handleCambioNota}
                            handleAgregarNota={handleAgregarNota}
                            handleCambioAsistencia={handleCambioAsistencia}
                            handleAgregarAsistencia={handleAgregarAsistencia}
                            handleCambioFechaHoraAsistencia={handleCambioFechaHoraAsistencia}
                            iniciarEliminacion={iniciarEliminacion}
                            setNotificationMessage={setNotificationMessage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}