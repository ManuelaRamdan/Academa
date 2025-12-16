// src/components/Admin/MateriasPanel.jsx

import { useEffect, useState, useCallback } from "react";
import {
  getAllMaterias,
  getMateriaById,
} from "../../../services/materiaService";
import MateriaAcordeon from "./MateriaAcordeon"; // Componente Acordeón para Materias
import Loading from "../../Loading";

// Función auxiliar para verificar si el texto podría ser un ID de MongoDB
// Los IDs de MongoDB tienen 24 caracteres hexadecimales.
const isMongoId = (text) => {
  return text.length === 24 && /^[0-9a-fA-F]+$/.test(text);
};

export default function MateriasPanel() {
  // Renombrar estados de usuarios a materias
  const [allMaterias, setAllMaterias] = useState([]);
  const [materiasPagina, setMateriasPagina] = useState([]);
  const [materiasFiltradasPagina, setMateriasFiltradasPagina] = useState([]);

  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  // Usamos 'openedMateria' en lugar de 'openedUser'
  const [openedMateria, setOpenedMateria] = useState(null);
  const limit = 2;
  const [openModal, setOpenModal] = useState(false);

  // Función para cargar TODAS las materias (sin paginación) para el filtrado global
  const cargarTodasLasMaterias = useCallback(async () => {
    try {
      // Usamos la ruta proporcionada: router.get("/", ...)
      const response = await getAllMaterias(1, 9999);
      // Asumiendo que el campo de datos se llama 'materias' en el backend
      const listaCompleta = response.data.materias ?? [];
      setAllMaterias(listaCompleta);
    } catch (err) {
      console.error(
        "Error al cargar todas las materias para la búsqueda:",
        err
      );
    }
  }, []);

  // Función para cargar la PÁGINA actual (paginación)
  const cargarPaginaMaterias = useCallback(
    async (page) => {
      if (page < 1) return;
      if (pagination.totalPages && page > pagination.totalPages) return;

      setCurrentPage(page);
      setLoading(true);
      setError(null);

      try {
        const response = await getAllMaterias(page, limit);
        const lista = response.data.materias ?? [];

        setMateriasPagina(lista);
        setMateriasFiltradasPagina(lista);
        setPagination(response.data.pagination ?? {});
      } catch (err) {
        setError("Error al cargar la lista de materias.");
      } finally {
        setLoading(false);
      }
    },
    [limit, pagination.totalPages]
  );

  // Carga inicial
  useEffect(() => {
    cargarTodasLasMaterias();
    cargarPaginaMaterias(1);
  }, [cargarTodasLasMaterias, cargarPaginaMaterias]);

  const buscarLocalmente = (texto) => {
    const t = texto.toLowerCase();

    // 1. Filtra sobre *TODAS* las materias (allMaterias)
    const filtradosCompletos = allMaterias.filter(
      (m) =>
        // Asume que el campo de la materia a buscar es 'nombre'
        m.nombre?.toLowerCase().includes(t) ||
        // Permite buscar por parte del ID localmente
        m._id?.includes(t)
    );

    // 2. Muestra los primeros 'limit' (4) resultados
    setMateriasFiltradasPagina(filtradosCompletos.slice(0, limit));
  };

  // Función de filtrado: Acepta nombre/ID
  const filtrar = async (texto) => {
    setBusqueda(texto);
    const t = texto.trim();

    if (!t) {
      // Si el texto está vacío, muestra la página actual
      setMateriasFiltradasPagina(materiasPagina);
      return;
    }

    // 1. Intentar búsqueda por ID (usando la ruta del backend)
    if (isMongoId(t)) {
      setLoading(true);
      try {
        // Llama al endpoint específico /:id usando la ruta proporcionada
        const response = await getMateriaById(t);

        // Asumiendo que el objeto materia se encuentra directamente en response.data
        const materia = response.data;

        if (materia) {
          setMateriasFiltradasPagina([materia]);
        } else {
          buscarLocalmente(t);
        }
        setError(null);
      } catch (err) {
        // Si la llamada falla (ej. 404 No encontrado), busca localmente
        buscarLocalmente(t);
      } finally {
        setLoading(false);
        return;
      }
    }

    // 2. Búsqueda local (por nombre/parte del ID) en la lista completa
    buscarLocalmente(t);
  };

  // Manejador para recargar las listas después de crear una materia
  const handleSuccessCrearMateria = () => {
    setOpenModal(false);
    cargarTodasLasMaterias();
    cargarPaginaMaterias(currentPage);
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-view">
      <div className="admin-card">
        <header className="admin-header">
          {/* Título cambiado a Gestión Materias */}
          <h1 className="seccion-titulo">Gestión Materias</h1>
        </header>

        {/* Campo de búsqueda actualizado */}
        <input
          type="text"
          placeholder="Buscar materia (Nombre o ID)"
          value={busqueda}
          onChange={(e) => filtrar(e.target.value)}
          className="buscar-usuario" // Se reutiliza el estilo del input
        />

        <div className="lista-acordeones">
          {loading ? (
            <Loading />
          ) : (
            <>
              {materiasFiltradasPagina.map((materia) => (
                <MateriaAcordeon
                  key={materia._id}
                  materia={materia}
                  isOpen={openedMateria === materia._id}
                  onToggle={() =>
                    setOpenedMateria((prev) =>
                      prev === materia._id ? null : materia._id
                    )
                  }
                />
              ))}

              {busqueda.trim() && materiasFiltradasPagina.length === 0 && (
                <p className="no-resultados">
                  No se encontraron materias para la búsqueda "{busqueda}".
                </p>
              )}
            </>
          )}
        </div>

        {/* Paginación */}
        {busqueda.length === 0 &&
          (pagination.prevPage !== null || pagination.nextPage !== null) && (
            <div className="admin-paginacion">
              <button
                onClick={() => cargarPaginaMaterias(pagination.prevPage)}
                disabled={pagination.prevPage === null}
                className="btn-paginacion"
              >
                anterior
              </button>

              <button
                onClick={() => cargarPaginaMaterias(pagination.nextPage)}
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
