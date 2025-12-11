// src/components/Admin/alumno/CrearAlumno.jsx

import { useEffect, useState, useCallback } from "react";
// Importar la función para crear alumno
import { createAlumno } from "../../../services/alumnoService";
// Importar solo el servicio de cursos (ya que el curso contiene al profesor)
import { getAllCursos } from "../../../services/cursoService"; 
// Eliminamos la importación de getAllProfesores ya que no se usará directamente

export default function CrearAlumno({ open, onClose, onSuccess }) {
    const [nombre, setNombre] = useState("");
    const [dni, setDni] = useState("");
    
    // Lista de Cursos/Materias asignadas: solo necesitamos el idCurso.
    const [materiasForm, setMateriasForm] = useState([{ idCurso: "" }]); 

    // Lista de datos de referencia (para el <select>).
    const [cursosDisponibles, setCursosDisponibles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // ===========================================
    // EFECTOS DE CARGA DE DATOS DE REFERENCIA
    // ===========================================

    // Carga inicial de Cursos
    useEffect(() => {
        setLoading(true);
        getAllCursos(1, 999)
            .then((res) => {
                // Asumimos que c.profesor ya está anidado en los datos del curso
                setCursosDisponibles(res.data?.cursos ?? []); 
            })
            .catch((err) => {
                setError("Error al cargar la lista de cursos disponibles.");
                setCursosDisponibles([]);
            })
            .finally(() => setLoading(false));
    }, []);


    // ===========================================
    // MANEJO DEL FORMULARIO DE MATERIAS
    // ===========================================

    const agregarMateria = () => {
        // Validación: Evitar duplicados y entradas vacías antes de añadir
        const tieneVacio = materiasForm.some(m => m.idCurso === "");
        if (tieneVacio) {
            setError("Primero debe seleccionar un curso en la fila vacía.");
            return;
        }
        setMateriasForm([...materiasForm, { idCurso: "" }]);
        setError(null);
    }

    const cambiarMateria = (i, value) => {
        // Validar duplicados antes de aplicar el cambio
        const esDuplicado = materiasForm.some((m, idx) => m.idCurso === value && idx !== i);
        if (esDuplicado) {
            setError("❌ Este curso ya fue asignado al alumno. Seleccione otro.");
            return;
        }

        const copia = [...materiasForm];
        copia[i].idCurso = value;
        setMateriasForm(copia);
        setError(null); // Limpiar error si el cambio es válido
    };

    const eliminarMateria = (i) => {
        const copia = materiasForm.filter((_, idx) => idx !== i);
        // Asegurar que siempre haya al menos una fila (a menos que el array original fuera 1)
        if (copia.length === 0) {
            setMateriasForm([{ idCurso: "" }]);
        } else {
            setMateriasForm(copia);
        }
        setError(null);
    };

    // ===========================================
    // GESTIÓN DEL MODAL
    // ===========================================

    const reset = () => {
        setNombre("");
        setDni("");
        setMateriasForm([{ idCurso: "" }]); // Reinicia a una fila vacía
        setError(null);
        setSuccess(null); 
    };

    const cerrar = () => {
        reset();
        onClose();
    };

    // ===========================================
    // SUBMIT
    // ===========================================

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // 1. Mapear las materias del formulario al formato esperado por el backend
        // El backend espera: {idCurso} (el profesor lo buscará el backend)
        const materiasParaEnviar = materiasForm
            .filter(m => m.idCurso) // Filtra filas donde no se ha seleccionado un curso
            .map(m => ({
                idCurso: m.idCurso,
            }));

        // 2. Validaciones finales
        if (!nombre.trim() || !dni.trim()) {
            setError("El nombre y el DNI son campos obligatorios.");
            setLoading(false);
            return;
        }
        
        if (materiasParaEnviar.length === 0) {
            setError("Debe asignar al menos un curso válido al alumno.");
            setLoading(false);
            return;
        }
        
        const data = {
            nombre: nombre.trim(),
            dni: dni.trim(),
            materias: materiasParaEnviar,
        };

        try {
            // Llama a tu función de servicio para crear el alumno
            await createAlumno(data);

            setSuccess("✅ Alumno creado correctamente.");
            onSuccess(); // Notifica al componente padre
            // Opcionalmente, cierra el modal automáticamente:
            setTimeout(cerrar, 2500); 

        } catch (err) {
            // Manejo de errores: Captura el mensaje de error del back-end
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Error desconocido al crear alumno";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card">

                <h2>Crear Alumno</h2>

                {success && <p className="success message-box">{success}</p>}
                {error && <p className="error message-box">{error.message}</p>}

                <form onSubmit={submit} className="modal-form">
                    <label>Nombre Completo</label>
                    <input 
                        value={nombre} 
                        onChange={e => setNombre(e.target.value)} 
                        required 
                        placeholder="Ej: Juan Pérez"
                        disabled={loading}
                    />

                    <label>DNI</label>
                    <input 
                        type="text" 
                        value={dni} 
                        onChange={e => setDni(e.target.value)} 
                        required 
                        placeholder="Ej: 45123456"
                        disabled={loading}
                    />

                    <label className="label-grande">Asignación de Cursos</label>

                    {materiasForm.map((materia, i) => (
                        // Estructura de la fila de materia simplificada
                        <div key={i} className="fila-materia-simple"> 
                            <select
                                value={materia.idCurso}
                                onChange={(e) => cambiarMateria(i, e.target.value)}
                                required
                                disabled={loading}
                            >
                                <option value="">Seleccione Curso y Profesor...</option>
                                {cursosDisponibles.map(c => (
                                    <option key={c._id} value={c._id} disabled={materiasForm.some(m => m.idCurso === c._id && m.idCurso !== materia.idCurso)}>
                                        {/* Mostramos el curso Y el profesor para que el usuario sepa la asignación */}
                                        {c.nombreMateria} ( {c.nivel}{c.division} - {c.anio}°) - Prof: {c.profesor?.nombre || 'N/A'}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => eliminarMateria(i)}
                                className="btn-eliminar"
                                disabled={materiasForm.length === 1 || loading}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}

                    <button type="button" className="btn-secundario" onClick={agregarMateria} disabled={loading}>
                        + Añadir Curso
                    </button>

                    <div className="modal-actions">
                        <button type="button" className="btn-cerrar" onClick={cerrar} disabled={loading}>
                            Cancelar
                        </button>

                        <button type="submit" disabled={loading} className="btn-crear">
                            {loading ? "Creando..." : "Crear Alumno"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}