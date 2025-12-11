// src/components/admin/profesores/ProfesoresPanel.jsx

import { useEffect, useState, useCallback } from 'react';
// Importamos desde el nuevo servicio
import { getAllProfesores, getProfesorById } from '../../../services/profesorService'; 
import ProfesorAcordeon from "./ProfesorAcordeon"; 
import "../../../styles/PanelUsuario.css"; // Se reutiliza el CSS

// Función auxiliar para verificar si el texto podría ser un ID de MongoDB
const isMongoId = (text) => {
    return text.length === 24 && /^[0-9a-fA-F]+$/.test(text);
};


export default function ProfesoresPanel() {
    const [allProfesores, setAllProfesores] = useState([]); 
    const [profesoresPagina, setProfesoresPagina] = useState([]); 
    const [profesoresFiltradosPagina, setProfesoresFiltradosPagina] = useState([]); 

    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [openedProfesor, setOpenedProfesor] = useState(null); 
    const limit = 2;
    const [openModal, setOpenModal] = useState(false);

    
    // Función para cargar TODOS los profesores
    const cargarTodosLosProfesores = useCallback(async () => {
        try {
            const response = await getAllProfesores(1, 9999); 
            // ASUMIMOS que el campo de datos se llama 'profesores' en el backend
            const listaCompleta = response.data.profesores ?? []; 
            setAllProfesores(listaCompleta);
        } catch (err) {
            console.error("Error al cargar todos los profesores para la búsqueda:", err);
        }
    }, []);


    // Función para cargar la PÁGINA actual (paginación)
    const cargarPaginaProfesores = useCallback(async (page) => {
        if (page < 1) return;
        if (pagination.totalPages && page > pagination.totalPages) return;

        setCurrentPage(page);
        setLoading(true);
        setError(null);

        try {
            const response = await getAllProfesores(page, limit);
            const lista = response.data.profesores ?? [];
            
            setProfesoresPagina(lista);
            setProfesoresFiltradosPagina(lista); 
            setPagination(response.data.pagination ?? {});
        } catch (err) {
            setError("Error al cargar la lista de profesores.");
        } finally {
            setLoading(false);
        }
    }, [limit, pagination.totalPages]);


    // Carga inicial
    useEffect(() => {
        cargarTodosLosProfesores();
        cargarPaginaProfesores(1);
    }, [cargarTodosLosProfesores, cargarPaginaProfesores]);


    const buscarLocalmente = (texto) => {
        const t = texto.toLowerCase();
        
        // 1. Filtra sobre *TODOS* los profesores (allProfesores)
        const filtradosCompletos = allProfesores.filter(p => 
            // Filtro por Nombre o Email (similar a Usuarios) o ID
            p.nombre?.toLowerCase().includes(t) ||
            p.email?.toLowerCase().includes(t) ||
            p._id?.includes(t) 
        );

        // 2. Muestra los primeros 'limit' (10) resultados
        setProfesoresFiltradosPagina(filtradosCompletos.slice(0, limit)); 
    }

    // Función de filtrado: Acepta texto o ID
    const filtrar = async (texto) => {
        setBusqueda(texto);
        const t = texto.trim();
        
        if (!t) {
            setProfesoresFiltradosPagina(profesoresPagina);
            return;
        }

        // 1. Intentar búsqueda por ID (de Profesor)
        if (isMongoId(t)) {
            setLoading(true);
            try {
                const response = await getProfesorById(t); 
                const profesor = response.data;
                
                if (profesor) {
                    setProfesoresFiltradosPagina([profesor]);
                } else {
                    buscarLocalmente(t);
                }
                setError(null);
            } catch (err) {
                buscarLocalmente(t);
            } finally {
                setLoading(false);
                return;
            }
        }
        
        // 2. Búsqueda local (por campos varios)
        buscarLocalmente(t);
    };



    if (loading) return <h2 className="loading">Cargando profesores...</h2>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="admin-view">
            <div className="admin-card">
                <header className="admin-header">
                    <h1 className="seccion-titulo">Gestión Profesores</h1>
                    
                </header>

                <input
                    type="text"
                    placeholder="Buscar profesor (Nombre, Email o ID)"
                    value={busqueda}
                    onChange={(e) => filtrar(e.target.value)} 
                    className="buscar-usuario"
                />

                <div className="lista-acordeones">
                    {profesoresFiltradosPagina.map((profesor) => (
                        <ProfesorAcordeon
                            key={profesor._id}
                            profesor={profesor}
                            isOpen={openedProfesor === profesor._id}
                            onToggle={() =>
                                setOpenedProfesor(prev => (prev === profesor._id ? null : profesor._id))
                            }
                        />
                    ))}
                    
                    {busqueda.trim() && profesoresFiltradosPagina.length === 0 && (
                        <p className="no-resultados">No se encontraron profesores para la búsqueda "{busqueda}".</p>
                    )}
                </div>

                {busqueda.length === 0 && (pagination.prevPage !== null || pagination.nextPage !== null) && (
                    <div className="admin-paginacion">
                        <button
                            onClick={() => cargarPaginaProfesores(pagination.prevPage)}
                            disabled={pagination.prevPage === null}
                            className="btn-paginacion"
                        >
                            anterior
                        </button>

                        <button
                            onClick={() => cargarPaginaProfesores(pagination.nextPage)}
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