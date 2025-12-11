// src/components/Admin/alumno/CrearAlumno.jsx

import { useEffect, useState, useCallback } from "react";
// Importar la función para crear alumno
import { createAlumno } from "../../../services/alumnoService";
// Importar los servicios necesarios para obtener datos de referencia
import { getAllCursos } from "../../../services/cursoService"; 
import { getAllProfesores } from "../../../services/profesorService"; 

export default function CrearAlumno({ open, onClose, onSuccess }) {
    const [nombre, setNombre] = useState("");
    const [dni, setDni] = useState("");
    
    // Lista de Cursos/Materias asignadas al alumno (Formato: [{idCurso: '...', profesor: {_id: '...', nombre: '...'}}])
    const [materiasForm, setMateriasForm] = useState([{ idCurso: "", profesorId: "" }]); 

    // Listas de datos de referencia (para los <select>)
    const [cursosDisponibles, setCursosDisponibles] = useState([]);
    const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // ===========================================
    // EFECTOS DE CARGA DE DATOS DE REFERENCIA
    // ===========================================

    // Carga inicial de Cursos y Profesores
    useEffect(() => {
        // Cargar Cursos
        getAllCursos(1, 999)
            .then((res) => setCursosDisponibles(res.data?.cursos ?? []))
            .catch(() => setCursosDisponibles([]));

        // Cargar Profesores
        // NOTA: Para Crear Alumno, generalmente necesitamos la lista COMPLETA de profesores,
        // sin preocuparnos si ya están asignados a un usuario, ya que un profesor puede
        // estar a cargo de muchos cursos/alumnos.
        getAllProfesores(1, 999) 
            .then((res) => setProfesoresDisponibles(res.data?.profesores ?? []))
            .catch(() => setProfesoresDisponibles([]));
    }, []);

    // ===========================================
    // MANEJO DEL FORMULARIO DE MATERIAS
    // ===========================================

    const agregarMateria = () => setMateriasForm([...materiasForm, { idCurso: "", profesorId: "" }]);

    const cambiarMateria = (i, campo, value) => {
        const copia = [...materiasForm];
        copia[i][campo] = value;
        setMateriasForm(copia);
    };

    const eliminarMateria = (i) => {
        const copia = materiasForm.filter((_, idx) => idx !== i);
        // Asegurarse de que siempre haya al menos una fila si se elimina la última,
        // o dejar vacío si el array original solo tenía una fila.
        if (copia.length === 0) {
            setMateriasForm([{ idCurso: "", profesorId: "" }]);
        } else {
            setMateriasForm(copia);
        }
    };

    // ===========================================
    // GESTIÓN DEL MODAL
    // ===========================================

    const reset = () => {
        setNombre("");
        setDni("");
        setMateriasForm([{ idCurso: "", profesorId: "" }]);
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
        const materiasParaEnviar = materiasForm
            .filter(m => m.idCurso && m.profesorId) // Filtra filas vacías
            .map(m => {
                const profesorData = profesoresDisponibles.find(p => p._id === m.profesorId);
                // El backend espera: {idCurso, profesor: {_id, nombre}}
                return {
                    idCurso: m.idCurso,
                    profesor: {
                        _id: m.profesorId,
                        nombre: profesorData?.nombre || "Profesor Desconocido" // Asegura el nombre
                    }
                };
            });

        // 2. Validaciones finales
        if (materiasParaEnviar.length === 0) {
             setError("Debe asignar al menos un curso/materia y un profesor.");
             setLoading(false);
             return;
        }

        const data = {
            nombre,
            dni,
            materias: materiasParaEnviar,
        };

        try {
            // Llama a tu función de servicio para crear el alumno
            await createAlumno(data);

            setSuccess("Alumno creado correctamente");
            onSuccess();
            // Opcionalmente, cierra el modal automáticamente:
            // setTimeout(cerrar, 1500); 

        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Error al crear alumno";

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

                {success && <p className="success">{success}</p>}
                {error && <p className="error">{error}</p>}

                <form onSubmit={submit} className="modal-form">
                    <label>Nombre Completo</label>
                    <input 
                        value={nombre} 
                        onChange={e => setNombre(e.target.value)} 
                        required 
                        placeholder="Ej: Juan Pérez"
                    />

                    <label>DNI</label>
                    <input 
                        type="text" 
                        value={dni} 
                        onChange={e => setDni(e.target.value)} 
                        required 
                        placeholder="Ej: 45123456"
                    />

                    <label className="label-grande">Asignación de Cursos</label>

                    {materiasForm.map((materia, i) => (
                        <div key={i} className="fila-materia">
                            <select
                                value={materia.idCurso}
                                onChange={(e) => cambiarMateria(i, "idCurso", e.target.value)}
                                required
                            >
                                <option value="">Seleccione Curso/Materia...</option>
                                {cursosDisponibles.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.nombreCurso} ({c.anio}° {c.division})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={materia.profesorId}
                                onChange={(e) => cambiarMateria(i, "profesorId", e.target.value)}
                                required
                            >
                                <option value="">Seleccione Profesor...</option>
                                {profesoresDisponibles.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => eliminarMateria(i)}
                                className="btn-eliminar"
                                disabled={materiasForm.length === 1}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}

                    <button type="button" className="btn-secundario" onClick={agregarMateria}>
                        + Añadir Curso
                    </button>

                    <div className="modal-actions">
                        <button type="button" className="btn-cerrar" onClick={cerrar}>
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