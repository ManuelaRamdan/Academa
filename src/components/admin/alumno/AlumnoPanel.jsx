import { useEffect, useState, useCallback } from "react";
import {
  getAllAlumnos,
  getAlumnoById,
  getAlumnoByDni,
  updateAlumno,
  deleteAlumno,
} from "../../../services/alumnoService";

//import "../../../styles/PanelUsuario.css";
import AlumnoAcordeon from "../../AlumnoAcordeon";
import CrearAlumno from "./CrearAlumno";
import Loading from "../../Loading";

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

  const [operationMessage, setOperationMessage] = useState({
    type: "",
    message: "",
  });

  const limit = 4;
  const userRole = "ADMIN";

  const [openModal, setOpenModal] = useState(false);

  // Cargar TODOS los alumnos para filtrar globalmente
  const cargarTodosLosAlumnos = useCallback(async () => {
    try {
      const response = await getAllAlumnos(1, 9999);
      const listaCompleta = response.data.alumnos ?? [];
      setAllAlumnos(listaCompleta);
    } catch (err) {
      console.error("Error al cargar todos los alumnos:", err);
    }
  }, []);

  // Cargar alumnos con paginación (AJUSTE: Dependencias de useCallback)
  const cargarPaginaAlumnos = useCallback(
    async (page) => {
      if (page < 1) return;
      // La condición de guardia usa la 'busqueda' de la clausura, pero el hook no se dispara
      // por cambios en 'busqueda' no relacionados a la paginación.
      if (
        !busqueda.trim() &&
        pagination.totalPages &&
        page > pagination.totalPages
      )
        return;

      setCurrentPage(page);
      setLoading(true);
      setError(null);

      try {
        const response = await getAllAlumnos(page, limit);
        const lista = response.data.alumnos ?? [];

        setAlumnosPagina(lista);
        setAlumnosFiltradosPagina(lista);
        setPagination(response.data.pagination ?? {});
      } catch (err) {
        setError("Error al cargar la lista de alumnos.");
      } finally {
        setLoading(false);
      }
    },
    [limit, pagination.totalPages]
  );

  // Carga inicial
  useEffect(() => {
    cargarTodosLosAlumnos();
    cargarPaginaAlumnos(1);
  }, [cargarTodosLosAlumnos, cargarPaginaAlumnos]);

  // Búsqueda local (sobre allAlumnos)
  const buscarLocalmente = (texto) => {
    const t = texto.toLowerCase();

    const filtrados = allAlumnos.filter(
      (a) =>
        a.nombre?.toLowerCase().includes(t) ||
        a.apellido?.toLowerCase().includes(t) ||
        a.dni?.toString().includes(t)
    );

    // Muestra los primeros 'limit' (4) resultados
    setAlumnosFiltradosPagina(filtrados.slice(0, limit));
  };

  // Filtro general (CASCADA ID -> DNI -> LOCAL)
  const filtrar = async (texto) => {
    setBusqueda(texto);
    const t = texto.trim();
    setOperationMessage({ type: "", message: "" });

    if (!t) {
      setAlumnosFiltradosPagina(alumnosPagina);
      return;
    }

    setLoading(true);

    try {
      let alumnoResultado = null;

      // ===================================
      // 1. Intentar búsqueda por ID de Alumno (Endpoint: /:id)
      // ===================================
      if (isMongoId(t)) {
        try {
          const response = await getAlumnoById(t);
          alumnoResultado = response.data;

          if (alumnoResultado) {
            setAlumnosFiltradosPagina([alumnoResultado]);
            return; // Éxito por ID, terminamos aquí
          }
        } catch (err) {
          // Falla el ID, continuamos la ejecución
        }
      }

      // ===================================
      // 2. Intentar búsqueda por DNI (Endpoint: /dni/:dni)
      // Se ejecuta si no se encontró por ID, y el texto es numérico
      // ===================================
      if (!alumnoResultado && !isNaN(t) && t.length >= 7) {
        try {
          const response = await getAlumnoByDni(t);
          alumnoResultado = response.data;

          if (alumnoResultado) {
            setAlumnosFiltradosPagina([alumnoResultado]);
            return; // Éxito por DNI, terminamos aquí
          }
        } catch (err) {
          // Falla DNI, procedemos a búsqueda local
        }
      }

      // ===================================
      // 3. Búsqueda local (si falló ID y DNI, o si la entrada es texto parcial)
      // ===================================
      buscarLocalmente(t);
    } catch (globalError) {
      // Error de conexión grave
      setError("Ocurrió un error inesperado durante la búsqueda.");
      buscarLocalmente(t);
    } finally {
      setLoading(false);
    }
  };

  // Recargar luego de crear
  const handleSuccessCrearAlumno = () => {
    setOpenModal(false);
    cargarTodosLosAlumnos();
    cargarPaginaAlumnos(currentPage);
  };

  /* ====================================================
        FUNCIONES DE ACCIÓN PARA EL ADMINISTRADOR
        ==================================================== */

  // 1. Manejar la actualización completa del alumno (Admin)
  const handleActualizarAlumnoCompleto = async ({
    alumnoId,
    datosAlumno,
    materias,
  }) => {
    setOperationMessage({
      type: "info",
      message: "Guardando cambios del alumno...",
    });
    try {
      const payload = { ...datosAlumno, materias: materias };

      await updateAlumno(alumnoId, payload);

      setOperationMessage({
        type: "success",
        message:
          "✅ Alumno actualizado correctamente (Datos personales, notas y asistencias).",
      });

      cargarTodosLosAlumnos();
      cargarPaginaAlumnos(currentPage);
    } catch (err) {
      console.error("Error al actualizar alumno:", err);
      setOperationMessage({
        type: "error",
        message: "❌ Error al actualizar el alumno. Inténtelo de nuevo.",
      });
    }
  };

  // 2. Manejar la actualización solo de notas/asistencias
  const handleGuardarCambios = async (materiaConCambios) => {
    const alumnoAActualizar = alumnosFiltradosPagina.find(
      (a) => a._id === openedAlumno
    );
    if (!alumnoAActualizar) return;

    setOperationMessage({
      type: "info",
      message: "Guardando notas/asistencias...",
    });
    try {
      const payload = {
        nombre: alumnoAActualizar.nombre,
        dni: alumnoAActualizar.dni,
        materias: [materiaConCambios],
      };

      await updateAlumno(alumnoAActualizar._id, payload);

      setOperationMessage({
        type: "success",
        message: "✅ Notas y asistencias actualizadas correctamente.",
      });

      cargarTodosLosAlumnos();
      cargarPaginaAlumnos(currentPage);
    } catch (err) {
      console.error("Error al guardar notas/asistencias:", err);
      setOperationMessage({
        type: "error",
        message:
          "❌ Error al guardar las notas/asistencias. Inténtelo de nuevo.",
      });
    }
  };

  // 3. Manejar la eliminación del alumno (Admin)
  const handleEliminarAlumno = async (alumnoId) => {
    setOperationMessage({ type: "info", message: "Eliminando alumno..." });
    try {
      await deleteAlumno(alumnoId);

      setOperationMessage({
        type: "success",
        message: `🗑️ Alumno ${alumnoId} eliminado correctamente.`,
      });
      setOpenedAlumno(null);

      cargarTodosLosAlumnos();
      cargarPaginaAlumnos(currentPage);
    } catch (err) {
      console.error("Error al eliminar alumno:", err);
      setOperationMessage({
        type: "error",
        message: "❌ Error al eliminar el alumno. Inténtelo de nuevo.",
      });
    }
  };

  // Helper para determinar la clase CSS de la notificación
  const getNotificationClass = (type) => {
    switch (type) {
      case "error":
        return "notification-error";
      case "success":
        return "notification-success";
      case "info":
        return "notification-info";
      default:
        return "";
    }
  };

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

        {/* Mensaje de Operación (Actualizar/Eliminar) */}
        {operationMessage.message && (
          <div
            className={`notification-box ${getNotificationClass(
              operationMessage.type
            )}`}
          >
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
          {loading ? (
            <Loading />
          ) : (
            <>
              {alumnosFiltradosPagina.map((alumno) => (
                <AlumnoAcordeon
                  key={alumno._id}
                  alumno={alumno}
                  materiasDelAlumno={alumno.materias}
                  isOpen={openedAlumno === alumno._id}
                  onToggle={() =>
                    setOpenedAlumno((prev) =>
                      prev === alumno._id ? null : alumno._id
                    )
                  }
                  userRole={userRole}
                  onActualizarAlumnoCompleto={handleActualizarAlumnoCompleto}
                  onEliminarAlumno={handleEliminarAlumno}
                  onGuardarCambios={handleGuardarCambios}
                />
              ))}

              {busqueda.trim() && alumnosFiltradosPagina.length === 0 && (
                <p className="no-resultados">
                  No se encontraron alumnos para la búsqueda "{busqueda}".
                </p>
              )}
            </>
          )}
        </div>

        {busqueda.length === 0 &&
          (pagination.prevPage !== null || pagination.nextPage !== null) && (
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
