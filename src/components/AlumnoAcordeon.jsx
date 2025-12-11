import { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";

const ASISTENCIA_ENUM = {
    PRESENTE: 'Presente',
    AUSENTE: 'Ausente',
    FERIADO: 'Feriado',
    PARO: 'Paro',
};

// ... (getDayKey, getFixedDateDisplay, getDatetimeLocalValue - Helper functions remain unchanged) ...
const getDayKey = (isoDate) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};

const getFixedDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const datePart = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timePart = `${hours}:${minutes}`;
    return `${datePart} ${timePart}`;
};

const getDatetimeLocalValue = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset() * 60000;
    const dateLocal = new Date(date.getTime() - offset);
    return dateLocal.toISOString().slice(0, 16);
};


export default function AlumnoAcordeon({
    alumno,
    dni,
    materiasDelAlumno,
    isOpen,
    onToggle,
    onGuardarCambios,
    userRole,
    onActualizarAlumnoCompleto,
    onEliminarAlumno,
}) {
    // === SCROLL ADD ===
    const notificationRef = useRef(null);
    const modalRef = useRef(null);

    const [materiaEditandoId, setMateriaEditandoId] = useState(null); 
    const isEditingMateria = materiaEditandoId !== null;

    const [materias, setMaterias] = useState(materiasDelAlumno || []);
    
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

    // Sincronizar estados (se dispara al cambiar de alumno)
    useEffect(() => {
        setAlumnoEditado(prev => ({
            ...prev,
            nombre: alumno?.nombre || '',
            dni: alumno?.dni || '',
            editandoDatosPersonales: false,
        }));
        setMaterias(materiasDelAlumno || []);
        setMateriaEditandoId(null);
    }, [alumno, materiasDelAlumno]);

    // Efectos de scroll (permanecen iguales)
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


    /* ==========================
        FUNCIONES DE EDICIÓN POR MATERIA (PROFESOR/ADMIN)
    ========================== */

    const handleEditar = (idCurso) => {
        if (alumnoEditado.editandoDatosPersonales) {
             setNotificationMessage({ type: 'warning', message: '⚠️ Primero debe Guardar o Cancelar la edición de los Datos Personales.' });
             return;
        }
        setMateriaEditandoId(idCurso);
        setNotificationMessage({ type: '', message: '' });
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
    };

    const handleCancelar = (idCurso) => {
        setMaterias(materiasDelAlumno || []);
        setMateriaEditandoId(null); 
        setNotificationMessage({ type: 'info', message: `ℹ️ Cambios descartados para la materia ${materias.find(m => m.idCurso === idCurso)?.nombreCurso || 'seleccionada'}.` });
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
    };


    /* ==========================
        FUNCIONES DE EDICIÓN DATOS PERSONALES (SOLO ADMIN)
    ========================== */

    const iniciarEdicionDatosPersonales = () => {
        if (isEditingMateria) {
             setNotificationMessage({ type: 'warning', message: '⚠️ Primero debe Guardar o Cancelar la edición de la materia actual.' });
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

    const handleCambioAlumno = (campo, valor) => {
        setAlumnoEditado(prev => ({
            ...prev,
            [campo]: valor
        }));
        setNotificationMessage({ type: '', message: '' });
    };
    
    const handleGuardarDatosPersonales = () => {
        if (!alumnoEditado.nombre.trim() || !alumnoEditado.dni.trim()) {
            setNotificationMessage({
                type: 'error',
                message: '❌ Error: El nombre y DNI del alumno no pueden estar vacíos.'
            });
            return;
        }

        const cambiosCompletos = {
            alumnoId: alumno._id,
            datosAlumno: {
                nombre: alumnoEditado.nombre.trim(),
                dni: alumnoEditado.dni.trim(),
            },
            materias: materiasDelAlumno,
        };
        
        setAlumnoEditado(prev => ({ ...prev, editandoDatosPersonales: false }));
        setNotificationMessage({ type: 'success', message: '✅ Datos personales actualizados correctamente.' });
        onActualizarAlumnoCompleto(cambiosCompletos); 
    };

    /* ==========================
        FUNCIONES INTERNAS DE MANEJO DE ESTADO
    ========================== */

    const handleCambioNota = (idCurso, index, campo, valor) => {
        let nuevoValor = valor;
        setNotificationMessage({ type: '', message: '' });

        if (campo === "nota") {
            const numValor = parseInt(valor, 10);
            if (valor === "") {
                nuevoValor = "";
            } else if (isNaN(numValor)) {
                setNotificationMessage({ type: 'error', message: 'La nota debe ser un número válido.' });
                return;
            } else if (numValor < 1) {
                setNotificationMessage({ type: 'error', message: '❌ Error: La nota mínima permitida es 1.' });
                nuevoValor = 1;
            } else if (numValor > 10) {
                setNotificationMessage({ type: 'error', message: '❌ Error: La nota máxima permitida es 10.' });
                nuevoValor = 10;
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
                            message: `❌ Error: Ya existe una asistencia registrada para el día ${getFixedDateDisplay(nuevaFechaISO).split(' ')[0]}.`
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
            setNotificationMessage({ type: 'error', message: '❌ Error: No puedes registrar asistencias en el futuro.' });
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

    const iniciarEliminacion = (idCurso, itemType, index, itemName) => {
        setConfirmDelete({ isActive: true, idCurso, itemType, index, itemName });
        setNotificationMessage({ type: '', message: '' });
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
            materia.notas = materia.notas.map(nota => {
                if (!nota.tipo || nota.tipo.toString().trim() === "") { tipoVacioEncontrado = true; }
                let notaNumerica = parseInt(nota.nota, 10);
                if (isNaN(notaNumerica) || notaNumerica < 1 || notaNumerica > 10) {
                    notaNumerica = Math.max(1, Math.min(10, notaNumerica || 1));
                    hayErrorRango = true;
                }
                nota.nota = notaNumerica;
                if (nota._id && typeof nota.nota === 'number' && nota._id.startsWith('')) { delete nota._id; }
                return nota;
            });

            materia.asistencias = materia.asistencias.map(asistencia => {
                if (asistencia._id && asistencia._id.startsWith('')) { delete asistencia._id; }
                return asistencia;
            });

            const diasRegistrados = new Set();
            materia.asistencias.forEach(asistencia => {
                if (hayErrorAsistenciaDuplicada) return;
                const diaClave = getDayKey(asistencia.fecha);
                if (diasRegistrados.has(diaClave)) { hayErrorAsistenciaDuplicada = true; }
                diasRegistrados.add(diaClave);
            });
        });

        if (tipoVacioEncontrado) {
            setNotificationMessage({ type: 'error', message: '❌ Error: El campo "Tipo" de una o más notas está vacío.' });
            return { error: true };
        }
        if (hayErrorAsistenciaDuplicada) {
            setNotificationMessage({ type: 'error', message: '❌ Error: No se puede guardar, existe una asistencia duplicada en el mismo día.' });
            return { error: true };
        }
        return { materiasAEnviar, hayErrorRango };
    };


    /* ==========================
        GUARDAR CAMBIOS DE MATERIA (PROFESOR/ADMIN)
    ========================== */
    const handleGuardarMateria = (idCurso) => {
        const { materiasAEnviar, hayErrorRango, error } = validarYPrepararMaterias();

        if (error) return; 

        const materiaActualizada = materiasAEnviar.find(m => m.idCurso === idCurso);
        
        if (!materiaActualizada) return;

        setMateriaEditandoId(null); // Desactivar edición de materia

        if (userRole === 'ADMIN') {
            // Si es ADMIN, enviamos los datos personales actuales (sin cambios) + las materias completas
            const cambiosCompletos = {
                alumnoId: alumno._id,
                datosAlumno: {
                    nombre: alumnoEditado.nombre.trim(),
                    dni: alumnoEditado.dni.trim(),
                },
                materias: materiasAEnviar, // Enviamos todas las materias, la que cambió y las que no
            };
            onActualizarAlumnoCompleto(cambiosCompletos); 
            
        } else {
            // Si es PROFESOR, solo enviamos la materia cambiada
            onGuardarCambios(materiaActualizada);
        }

        // Mostrar notificación de éxito/advertencia
        if (hayErrorRango) {
            setNotificationMessage({ type: 'warning', message: '⚠️ Se corrigieron automáticamente notas fuera del rango (1-10).' });
        } else {
            setNotificationMessage({ type: 'success', message: '✅ Cambios de materia guardados correctamente!' });
        }
    };


    /* ==========================
        HELPER FUNCTIONS PARA RENDERIZADO
    ========================== */
    const getNotificationClass = () => {
        switch (notificationMessage.type) {
            case 'error': return 'notification-error';
            case 'warning': return 'notification-warning';
            case 'success': return 'notification-success';
            case 'info': return 'notification-info';
            default: return '';
        }
    };
    
    // 🆕 RESTAURADA: Función que faltaba para el error ReferenceError
    const getAsistenciaDisplay = (value) => {
        switch (value) {
            case ASISTENCIA_ENUM.PRESENTE:
                return 'Presente';
            case ASISTENCIA_ENUM.AUSENTE:
                return 'Ausente';
            case ASISTENCIA_ENUM.FERIADO:
                return 'Feriado';
            case ASISTENCIA_ENUM.PARO:
                return 'Paro';
            default:
                return value;
        }
    };


    return (
        <div className="acordeon-alumno">

            {/* MODAL DE CONFIRMACIÓN */}
            {confirmDelete.isActive && (
                <div className="modal-confirmacion-overlay">
                    <div className="modal-confirmacion-box" ref={modalRef}>
                        <p>
                            ¿Estás seguro que deseas eliminar
                            {confirmDelete.itemType === 'nota' ? ` la nota: ${confirmDelete.itemName}` :
                            confirmDelete.itemType === 'asistencia' ? ` la asistencia del ${getFixedDateDisplay(confirmDelete.itemName).split(' ')[0]}` :
                            ` al alumno ${confirmDelete.itemName}`
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
            {/* FIN MODAL DE CONFIRMACIÓN */}


            <div className="acordeon-header" onClick={onToggle}>
                {alumno?.nombre ?? "Alumno sin nombre"}
            </div>

            {isOpen && (
                <div className="acordeon-body">

                    {/* MENSAJE DE NOTIFICACIÓN */}
                    <div ref={notificationRef}>
                        {notificationMessage.message && (
                            <div className={`notification-box ${getNotificationClass()}`}>
                                {notificationMessage.message}
                            </div>
                        )}
                    </div>
                    {/* FIN MENSAJE DE NOTIFICACIÓN */}
                    
                    {/* ==============================================
                         BLOQUE: ACCIONES Y EDICIÓN DE DATOS PERSONALES (ADMIN)
                         ============================================== */}
                    {userRole === 'ADMIN' && (
                        <div className="admin-actions-personal" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: alumnoEditado.editandoDatosPersonales ? '#fff3e0' : 'inherit' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: alumnoEditado.editandoDatosPersonales ? '15px' : '0' }}>
                                <h3>Datos Personales</h3>
                                {!alumnoEditado.editandoDatosPersonales ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="btn-editar" 
                                            onClick={iniciarEdicionDatosPersonales}
                                            disabled={isEditingMateria} // Deshabilita si está editando una materia
                                        >
                                            <FaEdit size={16} /> Editar Datos Personales
                                        </button>
                                        <button
                                            className="btn-eliminar-alumno"
                                            style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            onClick={iniciarEliminacionAlumno}
                                            disabled={isEditingMateria} // Deshabilita si está editando una materia
                                        >
                                            <FaTrashAlt size={14} style={{ marginRight: '8px' }} /> Eliminar Alumno
                                        </button>
                                    </div>
                                ) : (
                                    <div className="botones-acciones">
                                        <button className="btn-cancelar" onClick={cancelarEdicionDatosPersonales}>
                                            Cancelar
                                        </button>
                                        <button className="btn-guardar" onClick={handleGuardarDatosPersonales}>
                                            Guardar Datos Personales
                                        </button>
                                    </div>
                                )}
                            </div>

                            {alumno?._id && (
                                <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
                                    <strong>ID:</strong> {alumno._id}
                                </p>
                            )}
                            
                            {/* Campos editables/visibles */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label>Nombre:
                                    <input
                                        type="text"
                                        value={alumnoEditado.nombre}
                                        readOnly={!alumnoEditado.editandoDatosPersonales}
                                        onChange={(e) => handleCambioAlumno('nombre', e.target.value)}
                                        style={{ border: alumnoEditado.editandoDatosPersonales ? '1px solid #000' : 'none', padding: '5px' }}
                                    />
                                </label>
                                <label>DNI:
                                    <input
                                        type="text"
                                        value={alumnoEditado.dni}
                                        readOnly={!alumnoEditado.editandoDatosPersonales}
                                        onChange={(e) => handleCambioAlumno('dni', e.target.value)}
                                        style={{ border: alumnoEditado.editandoDatosPersonales ? '1px solid #000' : 'none', padding: '5px' }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                    
                    {/* Información no editable de nombre/DNI para el Profesor */}
                    {userRole === 'PROFESOR' && (
                        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
                            <p><strong>DNI:</strong> {alumno?.dni ?? "N/A"}</p>
                        </div>
                    )}

                    {/* ==============================================
                         BLOQUE: EDICIÓN DE NOTAS/ASISTENCIAS POR MATERIA
                         ============================================== */}
                    {materias.map(m => {
                        const isEditingThisMateria = m.idCurso === materiaEditandoId;

                        return (
                            <div key={m.idCurso} className="materia-bloque" style={{ border: isEditingThisMateria ? '2px solid #1a73e8' : '1px solid #eee', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>

                                <div className="materia-titulo">
                                    
                                    {/* Mostrar título del curso para ADMINs */}
                                    {userRole === 'ADMIN' && (
                                        <h3 className="materia-curso-info" style={{ marginTop: '10px', marginBottom: '5px', color: '#1a73e8' }}>
                                            {m.nombreCurso} ({m.nivel}{m.division} {m.anio})
                                        </h3>
                                    )}

                                    {/* Botón de Editar por materia (Visible si no se está editando nada más) */}
                                    {!isEditingThisMateria && (
                                        <button 
                                            className="btn-editar" 
                                            onClick={() => handleEditar(m.idCurso)} 
                                            disabled={alumnoEditado.editandoDatosPersonales} // Deshabilita si el Admin está editando DNI/Nombre
                                        >
                                            <FaEdit size={16} /> Editar Notas/Asistencias
                                        </button>
                                    )}
                                </div>

                                <h3>Notas</h3>

                                {isEditingThisMateria && (
                                    <button
                                        className="btn-agregar"
                                        onClick={() => handleAgregarNota(m.idCurso)}
                                    >
                                        + Agregar Nota
                                    </button>
                                )}

                                {m.notas?.length > 0 ? (
                                    <div className="tabla-wrapper">
                                        <table className="tabla">
                                            <thead>
                                                <tr>
                                                    <th>Tipo</th>
                                                    <th>Nota</th>
                                                    {isEditingThisMateria && <th className="th-accion"></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {m.notas.map((n, index) => (
                                                    <tr key={n._id || index}>
                                                        <td>
                                                            {isEditingThisMateria ? (
                                                                <input
                                                                    value={n.tipo}
                                                                    placeholder="Tipo (Obligatorio)"
                                                                    onChange={(e) => handleCambioNota(m.idCurso, index, "tipo", e.target.value)}
                                                                />
                                                            ) : (
                                                                n.tipo && n.tipo.trim() !== "" ? n.tipo : "(Tipo de nota vacío)"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {isEditingThisMateria ? (
                                                                <input
                                                                    type="number"
                                                                    value={n.nota}
                                                                    min="1"
                                                                    max="10"
                                                                    onChange={(e) => handleCambioNota(m.idCurso, index, "nota", e.target.value)}
                                                                />
                                                            ) : (
                                                                n.nota
                                                            )}
                                                        </td>
                                                        {isEditingThisMateria && (
                                                            <td className="td-accion">
                                                                <button
                                                                    className="btn-eliminar"
                                                                    onClick={() => iniciarEliminacion(m.idCurso, 'nota', index, n.tipo || 'Nueva Nota')}
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

                                {/* ASISTENCIAS */}

                                <h3>Asistencias</h3>

                                {isEditingThisMateria && (
                                    <button
                                        className="btn-agregar"
                                        onClick={() => handleAgregarAsistencia(m.idCurso)}
                                    >
                                        + Asistencia
                                    </button>
                                )}

                                {m.asistencias?.length > 0 ? (
                                    <div className="tabla-wrapper">
                                        <table className="tabla">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Presente</th>
                                                    {isEditingThisMateria && <th className="th-accion"></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {m.asistencias.map((a, index) => (
                                                    <tr key={a._id || index}>
                                                        {/* FECHA EDITABLE */}
                                                        <td>
                                                            {isEditingThisMateria ? (
                                                                <input
                                                                    type="datetime-local"
                                                                    max={getDatetimeLocalValue(new Date().toISOString())}
                                                                    value={getDatetimeLocalValue(a.fecha)}
                                                                    onChange={(e) => handleCambioFechaHoraAsistencia(m.idCurso, index, e.target.value)}
                                                                />
                                                            ) : (
                                                                getFixedDateDisplay(a.fecha)
                                                            )}
                                                        </td>

                                                        {/* PRESENTE */}
                                                        <td>
                                                            {isEditingThisMateria ? (
                                                                <select
                                                                    value={a.presente}
                                                                    onChange={(e) => handleCambioAsistencia(m.idCurso, index, e.target.value)}
                                                                >
                                                                    <option value={ASISTENCIA_ENUM.PRESENTE}>Presente</option>
                                                                    <option value={ASISTENCIA_ENUM.AUSENTE}>Ausente</option>
                                                                    <option value={ASISTENCIA_ENUM.FERIADO}>Feriado</option>
                                                                    <option value={ASISTENCIA_ENUM.PARO}>Paro</option>
                                                                </select>
                                                            ) : (
                                                                // Uso del helper que estaba faltando
                                                                getAsistenciaDisplay(a.presente) 
                                                            )}
                                                        </td>
                                                        {isEditingThisMateria && (
                                                            <td className="td-accion">
                                                                <button
                                                                    className="btn-eliminar"
                                                                    onClick={() => iniciarEliminacion(m.idCurso, 'asistencia', index, a.fecha)}
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
                                {isEditingThisMateria && (
                                    <div className="botones-acciones" style={{ marginTop: '20px' }}> 
                                        <button className="btn-cancelar" onClick={() => handleCancelar(m.idCurso)}>
                                            Cancelar
                                        </button>
                                        <button className="btn-guardar" onClick={() => handleGuardarMateria(m.idCurso)}>
                                            Guardar cambios
                                        </button>
                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>
            )}
        </div>
    );
}