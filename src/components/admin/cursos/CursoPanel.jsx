// src/components/admin/cursos/CursosPanel.jsx

import { useEffect, useState, useCallback } from "react";
// IMPORTANTE: Asegúrate de importar desde el nuevo servicio
import {
  getAllCursos,
  getCursoById,
  getCursoByIdProfe,
} from "../../../services/cursoService";
import CursoAcordeon from "./CursoAcordeon";
import Loading from "../../Loading";

// Función auxiliar para verificar si el texto podría ser un ID de MongoDB
const isMongoId = (text) => {
  return text.length === 24 && /^[0-9a-fA-F]+$/.test(text);
};

export default function CursoPanel() {
  const [allCursos, setAllCursos] = useState([]);
  const [cursosPagina, setCursosPagina] = useState([]);
  const [cursosFiltradosPagina, setCursosFiltradosPagina] = useState([]);

  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [openedCurso, setOpenedCurso] = useState(null);
  const limit = 10;
  const [openModal, setOpenModal] = useState(false);

  // Función para cargar TODOS los cursos
  const cargarTodosLosCursos = useCallback(async () => {
    try {
      const response = await getAllCursos(1, 9999);
      // ASUMIMOS que el campo de datos se llama 'cursos' en el backend (según tu JSON)
      const listaCompleta = response.data.cursos ?? [];
      setAllCursos(listaCompleta);
    } catch (err) {
      console.error("Error al cargar todos los cursos para la búsqueda:", err);
    }
  }, []);

  // Función para cargar la PÁGINA actual (paginación)
  const cargarPaginaCursos = useCallback(
    async (page) => {
      if (page < 1) return;
      if (pagination.totalPages && page > pagination.totalPages) return;

      setCurrentPage(page);
      setLoading(true);
      setError(null);

      try {
        const response = await getAllCursos(page, limit);
        const lista = response.data.cursos ?? [];

        setCursosPagina(lista);
        setCursosFiltradosPagina(lista);
        setPagination(response.data.pagination ?? {});
      } catch (err) {
        setError("Error al cargar la lista de cursos.");
      } finally {
        setLoading(false);
      }
    },
    [limit, pagination.totalPages]
  );

  // Carga inicial
  useEffect(() => {
    cargarTodosLosCursos();
    cargarPaginaCursos(1);
  }, [cargarTodosLosCursos, cargarPaginaCursos]);

  const buscarLocalmente = (texto) => {
    const t = texto.toLowerCase();

    // 1. Filtra sobre *TODOS* los cursos (allCursos)
    const filtradosCompletos = allCursos.filter(
      (c) =>
        // Filtro por Materia o División o Profesor o ID
        c.nombreMateria?.toLowerCase().includes(t) ||
        c.division?.toLowerCase().includes(t) ||
        c.profesor?.nombre?.toLowerCase().includes(t) ||
        c.alumnos?.some((a) => a.dni?.includes(t))
    );

    // 2. Muestra los primeros 'limit' (4) resultados
    setCursosFiltradosPagina(filtradosCompletos.slice(0, limit));
  };

  const filtrar = async (texto) => {
    setBusqueda(texto);
    const t = texto.trim();

    if (!t) {
      setCursosFiltradosPagina(cursosPagina);
      return;
    }

    // 1. Intentar búsqueda por ID (de Curso o de Profesor)
    if (isMongoId(t)) {
      setLoading(true);
      try {
        let resultados = null;

        // --- 1A: Intentar buscar por ID de Curso ---
        try {
          const response = await getCursoById(t);
          if (response.data) {
            // Si encuentra un curso, lo usamos
            resultados = [response.data];
          }
        } catch (err) {
          // Si el error es un 404 (no encontrado), procedemos a buscar por profesor
        }

        // --- 1B: Si no encontramos por ID de Curso, intentar buscar por ID de Profesor ---
        if (!resultados || resultados.length === 0) {
          try {
            const responseProfe = await getCursoByIdProfe(t);
            console.log(responseProfe);
            // Asumimos que esta ruta devuelve una lista de cursos en response.data.cursos o response.data

            // Si la respuesta tiene una propiedad 'cursos' (lista) o es directamente la lista
            const cursosDelProfe =
              responseProfe.data.cursos || responseProfe.data;

            if (
              cursosDelProfe &&
              Array.isArray(cursosDelProfe) &&
              cursosDelProfe.length > 0
            ) {
              resultados = cursosDelProfe;
            } else if (cursosDelProfe && !Array.isArray(cursosDelProfe)) {
              // En caso de que devuelva un solo objeto (aunque la ruta sugiere una lista)
              resultados = [cursosDelProfe];
            }
          } catch (err) {
            // El ID de profesor no devolvió resultados
          }
        }

        // --- 1C: Mostrar resultados encontrados o buscar localmente ---
        if (resultados && resultados.length > 0) {
          setCursosFiltradosPagina(resultados);
          setError(null);
        } else {
          buscarLocalmente(t);
        }
      } catch (err) {
        // Si hay un error de conexión grave en alguna de las dos búsquedas, caemos a local
        buscarLocalmente(t);
      } finally {
        setLoading(false);
        return;
      }
    }

    // 2. Búsqueda local (por campos varios si no es un ID o las búsquedas remotas fallaron)
    buscarLocalmente(t);
  };

  // Placeholder para manejar el éxito de la creación
  const handleSuccessCrearCurso = () => {
    setOpenModal(false);
    cargarTodosLosCursos();
    cargarPaginaCursos(currentPage);
  };

  // PLACHOLDER PARA EL MODAL
  // Crea este archivo en ./CrearCurso.jsx
  const CrearCurso = ({ open, onClose }) => {
    if (!open) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h2>Crear Nuevo Curso (Pendiente)</h2>
          <button onClick={onClose} className="btn-cerrar">
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-view">
      <div className="admin-card">
        <header className="admin-header">
          <h1 className="seccion-titulo">Gestión Cursos</h1>
        </header>

        <input
          type="text"
          placeholder="Buscar curso (Materia, Profesor, ID de Curso o ID de Profesor)"
          value={busqueda}
          onChange={(e) => filtrar(e.target.value)}
          className="buscar-usuario"
        />

        <div className="lista-acordeones">
          {loading ? (
            <Loading />
          ) : (
            <>
              {cursosFiltradosPagina.map((curso) => (
                <CursoAcordeon
                  key={curso._id}
                  curso={curso}
                  isOpen={openedCurso === curso._id}
                  onToggle={() =>
                    setOpenedCurso((prev) =>
                      prev === curso._id ? null : curso._id
                    )
                  }
                />
              ))}

              {busqueda.trim() && cursosFiltradosPagina.length === 0 && (
                <p className="no-resultados">
                  No se encontraron cursos para la búsqueda "{busqueda}".
                </p>
              )}
            </>
          )}
        </div>

        {busqueda.length === 0 &&
          (pagination.prevPage !== null || pagination.nextPage !== null) && (
            <div className="admin-paginacion">
              <button
                onClick={() => cargarPaginaCursos(pagination.prevPage)}
                disabled={pagination.prevPage === null}
                className="btn-paginacion"
              >
                anterior
              </button>

              <button
                onClick={() => cargarPaginaCursos(pagination.nextPage)}
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
