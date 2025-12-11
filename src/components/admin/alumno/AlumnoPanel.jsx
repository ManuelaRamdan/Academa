import { useEffect, useState, useCallback } from 'react';
import { 
    getAllAlumnos, 
    getAlumnoById, 
    getAlumnoByDni,
    updateAlumno, // 🆕 Importar servicio de actualización
    deleteAlumno, // 🆕 Importar servicio de eliminación
} from '../../../services/alumnoService'; // Asegúrate de que estos servicios estén disponibles aquí

import "../../../styles/PanelUsuario.css"; 
import AlumnoAcordeon from "../../AlumnoAcordeon";
import CrearAlumno from "./CrearAlumno";

// Detecta si el texto es un ID de MongoDB
const isMongoId = (text) => {
    return text.length === 24 && /^[0-9a-fA-F]+$/.test(text);
};

export default function AlumnosPanel() {

    const [allAlumnos, setAllAlumnos] = useState([]);
    const [alumnosPagina, setAlumnosPagina] = useState([]);
    const [alumnosFiltradosPagina, setAlumnosFiltradosPagina] = useState([]);

    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [openedAlumno, setOpenedAlumno] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    
    // 🆕 Estado de carga/error para operaciones de actualización/eliminación
    const [operationMessage, setOperationMessage] = useState({ type: '', message: '' });

    const limit = 4;
    // 🆕 El rol en este componente es fijo: Administrador
    const userRole = 'ADMIN'; 


    // Cargar TODOS los alumnos para filtrar globalmente
    const cargarTodosLosAlumnos = useCallback(async () => {
        try {
            const response = await getAllAlumnos(1, 9999);
            const listaCompleta = response.data.alumnos ?? [];
            setAllAlumnos(listaCompleta);
        } catch (err) {
            console.error("Error al cargar todos los alumnos:", err);
            // No seteamos error aquí para no bloquear la vista principal si falla el listado completo
        }
    }, []);

    // Cargar alumnos con paginación
    const cargarPaginaAlumnos = useCallback(async (page) => {
        if (page < 1) return;
        // 💡 Solo verificar si busqueda está vacía para evitar bugs de paginación
        if (!busqueda.trim() && pagination.totalPages && page > pagination.totalPages) return; 

        setCurrentPage(page);
        setLoading(true);
        setError(null);

        try {
            const response = await getAllAlumnos(page, limit);
            const lista = response.data.alumnos ?? [];

            setAlumnosPagina(lista);
            setAlumnosFiltradosPagina(lista);
            setPagination(response.data.pagination ?? {});
            
            // Si estábamos buscando, y ahora estamos paginando, borramos la búsqueda
            if (busqueda.trim() !== "") setBusqueda(""); 

        } catch (err) {
            setError("Error al cargar la lista de alumnos.");
        } finally {
            setLoading(false);
        }
    }, [limit, pagination.totalPages, busqueda]); // Añadir 'busqueda' como dependencia para el chequeo de arriba

    // Carga inicial
    useEffect(() => {
        cargarTodosLosAlumnos();
        cargarPaginaAlumnos(1);
    }, [cargarTodosLosAlumnos, cargarPaginaAlumnos]);


    // Búsqueda local (sin cambios)
    const buscarLocalmente = (texto) => {
        const t = texto.toLowerCase();

        const filtrados = allAlumnos.filter(a =>
            a.nombre?.toLowerCase().includes(t) ||
            a.apellido?.toLowerCase().includes(t) ||
            a.dni?.toString().includes(t)
        );

        setAlumnosFiltradosPagina(filtrados.slice(0, limit));
    };


    // Filtro general (sin cambios)
    const filtrar = async (texto) => {
        setBusqueda(texto);
        const t = texto.trim();

        if (!t) {
            setAlumnosFiltradosPagina(alumnosPagina);
            return;
        }

        // Búsqueda por ID de Mongo
        if (isMongoId(t)) {
            setLoading(true);
            try {
                const response = await getAlumnoById(t);
                const alumno = response.data;
                alumno
                    ? setAlumnosFiltradosPagina([alumno])
                    : buscarLocalmente(t);
            } catch {
                buscarLocalmente(t);
            } finally {
                setLoading(false);
                return;
            }
        }

        // Búsqueda por DNI exacto
        if (!isNaN(t)) {
            try {
                const response = await getAlumnoByDni(t);
                if (response.data) {
                    setAlumnosFiltradosPagina([response.data]);
                    return;
                }
            } catch {
                // Si no existe, cae a búsqueda local
            }
        }

        // Búsqueda por nombre/apellido/DNI parcial
        buscarLocalmente(t);
    };

    // Recargar luego de crear (sin cambios)
    const handleSuccessCrearAlumno = () => {
        setOpenModal(false);
        cargarTodosLosAlumnos();
        cargarPaginaAlumnos(currentPage);
    };
    
    /* ====================================================
        🆕 NUEVAS FUNCIONES DE ACCIÓN PARA EL ADMINISTRADOR
       ==================================================== */

    // 1. Manejar la actualización completa del alumno (Admin)
    const handleActualizarAlumnoCompleto = async ({ alumnoId, datosAlumno, materias }) => {
        setOperationMessage({ type: 'info', message: 'Guardando cambios del alumno...' });
        try {
            // El backend espera el objeto { nombre, dni, materias: [...] }
            const payload = { ...datosAlumno, materias: materias };
            
            await updateAlumno(alumnoId, payload);
            
            setOperationMessage({ type: 'success', message: '✅ Alumno actualizado correctamente (Datos personales, notas y asistencias).' });
            
            // Recargar datos para reflejar los cambios en el acordeón y en la lista principal
            cargarTodosLosAlumnos();
            cargarPaginaAlumnos(currentPage);

        } catch (err) {
            console.error("Error al actualizar alumno:", err);
            setOperationMessage({ type: 'error', message: '❌ Error al actualizar el alumno. Inténtelo de nuevo.' });
        }
    };
    
    // 2. Manejar la actualización solo de notas/asistencias (Compartido)
    // Aunque el Admin llama a 'handleActualizarAlumnoCompleto', AlumnoAcordeon.jsx
    // también tiene un flujo de guardado que podría caer aquí si no está en modo Admin.
    // En este contexto (AlumnosPanel para Admin), este handler es redundante pero necesario
    // para cumplir con la interfaz del AlumnoAcordeon si es usado internamente.
    // Usaremos la misma lógica que el completo, pero asumiendo que solo se enviaron las materias.
    const handleGuardarCambios = async (materiaConCambios) => {
        
        // Buscamos el alumno completo de la página actual para obtener el ID y el DNI
        const alumnoAActualizar = alumnosFiltradosPagina.find(a => a._id === openedAlumno);
        if (!alumnoAActualizar) return;

        setOperationMessage({ type: 'info', message: 'Guardando notas/asistencias...' });
        try {
            const payload = { 
                nombre: alumnoAActualizar.nombre, // Mantener datos
                dni: alumnoAActualizar.dni,     // Mantener datos
                materias: [materiaConCambios]
            };
            
            await updateAlumno(alumnoAActualizar._id, payload);
            
            setOperationMessage({ type: 'success', message: '✅ Notas y asistencias actualizadas correctamente.' });
            
            // Recargar datos para reflejar los cambios en el acordeón y en la lista principal
            cargarTodosLosAlumnos();
            cargarPaginaAlumnos(currentPage);

        } catch (err) {
            console.error("Error al guardar notas/asistencias:", err);
            setOperationMessage({ type: 'error', message: '❌ Error al guardar las notas/asistencias. Inténtelo de nuevo.' });
        }
    };


    // 3. Manejar la eliminación del alumno (Admin)
    const handleEliminarAlumno = async (alumnoId) => {
        setOperationMessage({ type: 'info', message: 'Eliminando alumno...' });
        try {
            await deleteAlumno(alumnoId);
            
            setOperationMessage({ type: 'success', message: `🗑️ Alumno ${alumnoId} eliminado correctamente.` });
            setOpenedAlumno(null); // Cerrar el acordeón del alumno eliminado
            
            // Recargar la página y la lista completa
            cargarTodosLosAlumnos();
            cargarPaginaAlumnos(currentPage);

        } catch (err) {
            console.error("Error al eliminar alumno:", err);
            setOperationMessage({ type: 'error', message: '❌ Error al eliminar el alumno. Inténtelo de nuevo.' });
        }
    };


    // Helper para determinar la clase CSS de la notificación
    const getNotificationClass = (type) => {
        switch (type) {
            case 'error': return 'notification-error';
            case 'success': return 'notification-success';
            case 'info': return 'notification-info';
            default: return '';
        }
    };
    

    if (loading) return <h2 className="loading">Cargando alumnos...</h2>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="admin-view">
            <div className="admin-card">

                <header className="admin-header">
                    <h1 className="seccion-titulo">Gestión Alumnos</h1>

                    <button
                        className="btn-crear-usuario"
                        onClick={() => setOpenModal(true)}
                    >
                        Crear alumno +
                    </button>
                </header>

                <CrearAlumno
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={handleSuccessCrearAlumno}
                />

                {/* 🆕 Mensaje de Operación (Actualizar/Eliminar) */}
                {operationMessage.message && (
                    <div className={`notification-box ${getNotificationClass(operationMessage.type)}`}>
                        {operationMessage.message}
                    </div>
                )}
                
                <input
                    type="text"
                    placeholder="Buscar alumno (Nombre, Apellido, DNI o ID)"
                    value={busqueda}
                    onChange={(e) => filtrar(e.target.value)}
                    className="buscar-usuario"
                />

                <div className="lista-acordeones">
                    {alumnosFiltradosPagina.map((alumno) => (
                        <AlumnoAcordeon
                            key={alumno._id}
                            alumno={alumno}
                            // Asume que la estructura de materiasDelAlumno está dentro del objeto 'alumno' o se obtiene de otra forma.
                            // Si el servicio getAlumnoById/getAlumnoByDni no incluye materias, se deberá hacer un fetch adicional.
                            // Para simplificar, asumiremos que alumno.materias contiene la estructura esperada:
                            materiasDelAlumno={alumno.materias} 
                            isOpen={openedAlumno === alumno._id}
                            onToggle={() =>
                                setOpenedAlumno(prev =>
                                    prev === alumno._id ? null : alumno._id
                                )
                            }
                            // 🆕 Props específicos del Administrador
                            userRole={userRole} 
                            onActualizarAlumnoCompleto={handleActualizarAlumnoCompleto}
                            onEliminarAlumno={handleEliminarAlumno}
                            
                            // 🆕 Prop de notas/asistencias (necesario para el componente)
                            onGuardarCambios={handleGuardarCambios}
                        />
                    ))}

                    {busqueda.trim() && alumnosFiltradosPagina.length === 0 && (
                        <p className="no-resultados">
                            No se encontraron alumnos para la búsqueda "{busqueda}".
                        </p>
                    )}
                </div>

                {busqueda.length === 0 && (pagination.prevPage !== null || pagination.nextPage !== null) && (
                    <div className="admin-paginacion">
                        <button
                            onClick={() => cargarPaginaAlumnos(pagination.prevPage)}
                            disabled={pagination.prevPage === null}
                            className="btn-paginacion"
                        >
                            anterior
                        </button>

                        <button
                            onClick={() => cargarPaginaAlumnos(pagination.nextPage)}
                            disabled={pagination.nextPage === null}
                            className="btn-paginacion"
                        >
                            siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}