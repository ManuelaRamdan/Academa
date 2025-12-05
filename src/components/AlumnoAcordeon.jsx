import { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa"; // Importar FaTrashAlt y FaTimes

const ASISTENCIA_ENUM = {
    PRESENTE: 'P', // O 'Presente' si quieres el nombre completo en la BD
    AUSENTE: 'A', // O 'Ausente'
    FERIADO: 'F', // O 'Feriado'
    PARO: 'X', // O 'Paro'
};

const getDayKey = (isoDate) => {
    if (!isoDate) return '';
    // Usamos split('T')[0] en la fecha ISO para obtener solo la parte YYYY-MM-DD.
    // Esto funciona porque el backend almacena UTC, y al añadir se usa toISOString().
    return isoDate.split('T')[0];
};

const getFixedDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    
    const date = new Date(isoDate);

    // FECHA: Usa UTC (Correcto para el día)
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; 
    const day = date.getUTCDate();
    const datePart = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

    // HORA: Usa LOCAL (getters sin UTC, que aplican la zona horaria)
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
}) {


    const [editMode, setEditMode] = useState(false);
    // Usamos el estado para los datos editables
    const [materias, setMaterias] = useState(materiasDelAlumno || []);
    const [notificationMessage, setNotificationMessage] = useState({ type: '', message: '' });

    // ESTADO DE CONFIRMACIÓN DE ELIMINACIÓN
    const [confirmDelete, setConfirmDelete] = useState({
        isActive: false,
        idCurso: null,
        itemType: null, // 'nota' o 'asistencia'
        index: null,
        itemName: '', // Nombre del ítem para mostrar en el modal
    });


    // Sincronizar el estado de 'materias' con 'materiasDelAlumno'
    useEffect(() => {
        setMaterias(materiasDelAlumno || []);
    }, [materiasDelAlumno]);

    const handleEditar = () => {
        setEditMode(true);
        setNotificationMessage({ type: '', message: '' });
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' }); // Limpiar confirmación
    };

    /* ==========================
        CANCELAR CAMBIOS
    ========================== */
    const handleCancelar = () => {
        setMaterias(materiasDelAlumno || []);
        setEditMode(false);
        setNotificationMessage({ type: 'info', message: 'ℹ️ Cambios descartados.' });
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' }); // Limpiar confirmación
    };

    /* ==========================
        MANEJO DE CAMBIOS (NOTA Y ASISTENCIA)
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

    /* ==========================
        AGREGAR NOTA / ASISTENCIA
    ========================== */

    const handleAgregarNota = (idCurso) => {
        const nuevaNota = {
            _id: crypto.randomUUID(), // Añadido para la key de React
            tipo: "",
            nota: 1,
        };

        setMaterias(prev =>
            prev.map(m =>
                m.idCurso === idCurso
                    ? {
                        ...m,
                        notas: [...m.notas, nuevaNota],
                    }
                    : m
            )
        );
    };

    const handleAgregarAsistencia = (idCurso) => {
        
        const nuevaFechaISO = new Date().toISOString();
        const nuevoDiaClave = getDayKey(nuevaFechaISO); // Clave: YYYY-MM-DD
        
        setMaterias(prev =>
            prev.map(m => {
                if (m.idCurso === idCurso) {
                    
                    // 1. VALIDACIÓN DE UNICIDAD AL AGREGAR
                    const yaExiste = m.asistencias.some(a => getDayKey(a.fecha) === nuevoDiaClave);

                    if (yaExiste) {
                        setNotificationMessage({
                            type: 'error',
                            message: `❌ Error: Ya existe una asistencia registrada para el día ${getFixedDateDisplay(nuevaFechaISO).split(' ')[0]}.`
                        });
                        return m; // Devuelve la materia sin cambios
                    }

                    // Si no existe, agregamos la nueva asistencia
                    setNotificationMessage({ type: '', message: '' });

                    return {
                        ...m,
                        asistencias: [
                            ...m.asistencias,
                            {
                                _id: crypto.randomUUID(),
                                fecha: nuevaFechaISO,
                                presente: ASISTENCIA_ENUM.PRESENTE
                            }
                        ]
                    };
                }
                return m;
            })
        );
    };

    /* ==========================
        ELIMINAR NOTA / ASISTENCIA
    ========================== */

    // Función que inicia el cuadro de confirmación
    const iniciarEliminacion = (idCurso, itemType, index, itemName) => {
        setConfirmDelete({
            isActive: true,
            idCurso,
            itemType,
            index,
            itemName,
        });
        setNotificationMessage({ type: '', message: '' });
    };

    // Función que ejecuta la eliminación después de la confirmación
    const ejecutarEliminacion = () => {
        const { idCurso, itemType, index } = confirmDelete;

        setMaterias(prev =>
            prev.map(m => {
                if (m.idCurso === idCurso) {
                    if (itemType === 'nota') {
                        // Eliminar nota por índice
                        const nuevasNotas = m.notas.filter((_, i) => i !== index);
                        return { ...m, notas: nuevasNotas };
                    }
                    if (itemType === 'asistencia') {
                        // Eliminar asistencia por índice
                        const nuevasAsistencias = m.asistencias.filter((_, i) => i !== index);
                        return { ...m, asistencias: nuevasAsistencias };
                    }
                }
                return m;
            })
        );
        // Limpiar confirmación después de eliminar
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });
        setNotificationMessage({ type: 'info', message: '🗑️ Elemento eliminado. Pulse Guardar para aplicar el cambio.' });
    };


    /* ==========================
        VALIDACIÓN DE FECHA DE ASISTENCIA
    ========================== */

    const handleCambioFechaHoraAsistencia = (idCurso, index, nuevaFechaHoraString) => {

        // 1. VALIDACIÓN DE FUTURO
        const fechaSeleccionada = new Date(nuevaFechaHoraString);
        const hoy = new Date();

        if (fechaSeleccionada.getTime() > hoy.getTime()) {
            setNotificationMessage({
                type: 'error',
                message: '❌ Error: No puedes registrar asistencias en el futuro.'
            });
            return;
        }

        const nuevaFechaISO = fechaSeleccionada.toISOString();
        const nuevoDiaClave = getDayKey(nuevaFechaISO);

        // 2. VALIDACIÓN DE UNICIDAD AL MODIFICAR
        let esValido = true;
        
        // La validación se hace de forma reactiva al intentar actualizar el estado
        // Mapeamos el estado actual para hacer la comprobación de unicidad
        setMaterias(prev =>
            prev.map(materia => {
                if (materia.idCurso === idCurso) {
                    
                    const asistenciaEncontrada = materia.asistencias.find((a, i) => 
                        // Compara si el DÍA de la nueva fecha coincide con el DÍA de otra asistencia
                        getDayKey(a.fecha) === nuevoDiaClave && 
                        // Y se asegura de que NO sea el mismo elemento que estamos editando
                        i !== index
                    );

                    if (asistenciaEncontrada) {
                        setNotificationMessage({
                            type: 'error',
                            message: `❌ Error: El día ${getFixedDateDisplay(nuevaFechaISO).split(' ')[0]} ya está registrado en otra asistencia.`
                        });
                        esValido = false; // Marca como inválido
                        return materia; // Devuelve la materia sin cambios
                    }
                }
                return materia;
            })
        );
        
        if (!esValido) {
            return; // Si la validación falló, salimos sin aplicar el cambio
        }


        // 3. APLICAR CAMBIO si es válido
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
    
    /* ==========================
        GUARDAR CAMBIOS
    ========================== */
    const handleGuardar = () => {
        const materiasAEnviar = JSON.parse(JSON.stringify(materias));
        let tipoVacioEncontrado = false;
        let hayErrorRango = false;
        let hayErrorAsistenciaDuplicada = false; // <-- Nuevo flag para duplicados de asistencia

        materiasAEnviar.forEach(materia => {
            materia.notas = materia.notas.map(nota => {

                // VALIDACIÓN DE TIPO
                if (!nota.tipo || nota.tipo.toString().trim() === "") {
                    tipoVacioEncontrado = true;
                }

                let notaNumerica = parseInt(nota.nota, 10);
                if (isNaN(notaNumerica) || notaNumerica < 1 || notaNumerica > 10) {
                    notaNumerica = Math.max(1, Math.min(10, notaNumerica || 1));
                    hayErrorRango = true;
                }
                nota.nota = notaNumerica;

                // Si fue agregado con _id temporal, lo eliminamos antes de enviar al backend
                if (nota._id && typeof nota.nota === 'number' && nota._id.startsWith('')) {
                    delete nota._id;
                }

                return nota;
            });

            // Limpiamos los _id temporales de asistencias si existen.
            materia.asistencias = materia.asistencias.map(asistencia => {
                if (asistencia._id && asistencia._id.startsWith('')) {
                    delete asistencia._id;
                }
                return asistencia;
            });

            // >>> INICIO DE LA NUEVA VALIDACIÓN DE ASISTENCIA DUPLICADA AL GUARDAR <<<
            const diasRegistrados = new Set();
            materia.asistencias.forEach(asistencia => {
                if (hayErrorAsistenciaDuplicada) return; // Si ya encontramos un error, no seguir
                
                // Usamos getDayKey para comparar solo la fecha (YYYY-MM-DD)
                const diaClave = getDayKey(asistencia.fecha);

                if (diasRegistrados.has(diaClave)) {
                    hayErrorAsistenciaDuplicada = true;
                }
                diasRegistrados.add(diaClave);
            });
            // >>> FIN DE LA NUEVA VALIDACIÓN <<<
        });

        if (tipoVacioEncontrado) {
            setNotificationMessage({
                type: 'error',
                message: '❌ Error: El campo "Tipo" de una o más notas está vacío.'
            });
            return;
        }

        // >>> MANEJO DEL NUEVO ERROR DE ASISTENCIA DUPLICADA <<<
        if (hayErrorAsistenciaDuplicada) {
            setNotificationMessage({
                type: 'error',
                message: '❌ Error: No se puede guardar ya existe una asistencia con esa fecha.'
            });
            return;
        }
        // ----------------------------------------------------------------------


        if (hayErrorRango) {
            setNotificationMessage({
                type: 'warning',
                message: '⚠️ Se corrigieron automáticamente notas fuera del rango (1-10).'
            });
        } else {
            setNotificationMessage({
                type: 'success',
                message: '✅ ¡Cambios guardados correctamente!'
            });
        }

        setEditMode(false);
        setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' });

        // onGuardarCambios ya maneja la normalización a null para notas vacías
        onGuardarCambios(materiasAEnviar[0]);
    };

    // Helper para determinar la clase CSS de la notificación
    const getNotificationClass = () => {
        switch (notificationMessage.type) {
            case 'error': return 'notification-error';
            case 'warning': return 'notification-warning';
            case 'success': return 'notification-success';
            case 'info': return 'notification-info';
            default: return '';
        }
    };

    const getAsistenciaDisplay = (value) => {
        switch (value) {
            case ASISTENCIA_ENUM.PRESENTE:
                return 'Presente'; // Modificado
            case ASISTENCIA_ENUM.AUSENTE:
                return 'Ausente'; // Modificado
            case ASISTENCIA_ENUM.FERIADO:
                return 'Feriado'; // Modificado
            case ASISTENCIA_ENUM.PARO:
                return 'Paro'; // Modificado
            default:
                return value;
        }
    };

    return (
        <div className="acordeon-alumno">
            {/* MODAL DE CONFIRMACIÓN */}
            {confirmDelete.isActive && (
                <div className="modal-confirmacion-overlay">
                    <div className="modal-confirmacion-box">
                        <p>¿Estás seguro que deseas eliminar {confirmDelete.itemType === 'nota' ? `la nota: ${confirmDelete.itemName}` : `la asistencia del ${new Date(confirmDelete.itemName).toLocaleDateString()}`}?</p>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setConfirmDelete({ isActive: false, idCurso: null, itemType: null, index: null, itemName: '' })}>
                                Cancelar
                            </button>
                            <button className="btn-eliminar-confirmar" onClick={ejecutarEliminacion}>
                                Sí, Eliminar
                            </button>
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
                    {notificationMessage.message && (
                        <div className={`notification-box ${getNotificationClass()}`}>
                            {notificationMessage.message}
                        </div>
                    )}
                    {/* FIN MENSAJE DE NOTIFICACIÓN */}


                    {materias.map(m => (
                        <div key={m.idCurso} className="materia-bloque">

                            <div className="materia-titulo">
                                {!editMode && (
                                    <button className="btn-editar" onClick={handleEditar}>
                                        <FaEdit size={20} />
                                    </button>
                                )}
                            </div>

                            <h3>Notas</h3>

                            {editMode && (
                                <button
                                    className="btn-agregar"
                                    onClick={() => handleAgregarNota(m.idCurso)}
                                >
                                    + Agregar Nota
                                </button>
                            )}

                            {m.notas?.length > 0 ? (
                                <table className="tabla">
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Nota</th>
                                            {editMode && <th className="th-accion"></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.notas.map((n, index) => (
                                            <tr key={n._id || index}>
                                                <td>
                                                    {editMode ? (
                                                        <input
                                                            value={n.tipo}
                                                            placeholder="Tipo (Obligatorio)"
                                                            onChange={(e) =>
                                                                handleCambioNota(
                                                                    m.idCurso,
                                                                    index,
                                                                    "tipo",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        n.tipo && n.tipo.trim() !== "" ? n.tipo : "(Tipo de nota vacío)"
                                                    )}
                                                </td>

                                                <td>
                                                    {editMode ? (
                                                        <input
                                                            type="number"
                                                            value={n.nota}
                                                            min="1"
                                                            max="10"
                                                            onChange={(e) =>
                                                                handleCambioNota(
                                                                    m.idCurso,
                                                                    index,
                                                                    "nota",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        n.nota
                                                    )}
                                                </td>
                                                {editMode && (
                                                    <td className="td-accion">
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => iniciarEliminacion(
                                                                m.idCurso,
                                                                'nota',
                                                                index,
                                                                n.tipo || 'Nueva Nota'
                                                            )}
                                                        >
                                                            <FaTrashAlt size={14} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No tiene notas cargadas</p>
                            )}

                            {/* ======================
                                        ASISTENCIAS
                                    ====================== */}

                            <h3>Asistencias</h3>

                            {editMode && (
                                <button
                                    className="btn-agregar"
                                    onClick={() => handleAgregarAsistencia(m.idCurso)}
                                >
                                    + Asistencia
                                </button>
                            )}

                            {m.asistencias?.length > 0 ? (
                                <table className="tabla">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Presente</th>
                                            {editMode && <th className="th-accion"></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {m.asistencias.map((a, index) => (
                                            <tr key={a._id || index}>

                                                {/* FECHA EDITABLE */}
                                                <td>
                                                    {editMode ? (
                                                        <input
                                                            type="datetime-local" // ⚠️ CAMBIO A datetime-local
                                                            max={getDatetimeLocalValue(new Date().toISOString())}
                                                            value={getDatetimeLocalValue(a.fecha)} // ⚠️ Uso del helper
                                                            onChange={(e) =>
                                                                handleCambioFechaHoraAsistencia( // ⚠️ Cambio de función
                                                                    m.idCurso,
                                                                    index,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        getFixedDateDisplay(a.fecha) // Uso de helper para mostrar fecha y hora
                                                    )}
                                                </td>

                                                {/* PRESENTE */}
                                                <td>
                                                    {editMode ? (
                                                        <select
                                                            // 3. ACTUALIZAR EL SELECT PARA USAR LOS VALORES DEL ENUM
                                                            value={a.presente}
                                                            onChange={(e) =>
                                                                handleCambioAsistencia(
                                                                    m.idCurso,
                                                                    index,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value={ASISTENCIA_ENUM.PRESENTE}>Presente</option>
                                                            <option value={ASISTENCIA_ENUM.AUSENTE}>Ausente</option>
                                                            <option value={ASISTENCIA_ENUM.FERIADO}>Feriado</option>
                                                            <option value={ASISTENCIA_ENUM.PARO}>Paro</option>
                                                        </select>
                                                    ) : (
                                                        getAsistenciaDisplay(a.presente)
                                                    )}
                                                </td>
                                                {editMode && (
                                                    <td className="td-accion">
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => iniciarEliminacion(
                                                                m.idCurso,
                                                                'asistencia',
                                                                index,
                                                                a.fecha
                                                            )}
                                                        >
                                                            <FaTrashAlt size={14} />
                                                        </button>
                                                    </td>
                                                )}

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No tiene asistencias cargadas</p>
                            )}

                        </div>
                    ))}

                    {/* GRUPO DE BOTONES AL FINAL DEL ACORDEÓN */}
                    {editMode && (
                        <div className="acordeon-actions">
                            <button
                                className="btn-cancelar"
                                onClick={handleCancelar}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-guardar"
                                onClick={handleGuardar}
                            >
                                Guardar cambios
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}