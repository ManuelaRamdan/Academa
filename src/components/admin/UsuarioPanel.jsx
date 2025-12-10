// src/components/Admin/UsuariosPanel.jsx

import { useEffect, useState, useCallback } from 'react';
// IMPORTANTE: Asegúrate de importar getUsuarioById desde tu servicio
import { getAllUsuarios, getUsuarioById } from '../../services/userService'; 
import "../../styles/PanelUsuario.css";
import UsuarioAcordeon from "./UsuarioAcordeon";
import CrearUsuario from "./CrearUsuario";

// Función auxiliar para verificar si el texto podría ser un ID de MongoDB
// Los IDs de MongoDB tienen 24 caracteres hexadecimales.
const isMongoId = (text) => {
    return text.length === 24 && /^[0-9a-fA-F]+$/.test(text);
};


export default function UsuariosPanel() {
    // Estado para la lista completa de usuarios (para la búsqueda global)
    const [allUsuarios, setAllUsuarios] = useState([]); 
    // Estado para la lista de usuarios de la página actual (limit=4)
    const [usuariosPagina, setUsuariosPagina] = useState([]); 
    // Estado para la lista que se renderiza (páginada o filtrada)
    const [usuariosFiltradosPagina, setUsuariosFiltradosPagina] = useState([]); 

    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [openedUser, setOpenedUser] = useState(null);
    const limit = 4;
    const [openModal, setOpenModal] = useState(false);

    
    // Función para cargar TODOS los usuarios (sin paginación) para el filtrado global
    const cargarTodosLosUsuarios = useCallback(async () => {
        try {
            // Asume que esta llamada con un límite alto trae todos los usuarios.
            const response = await getAllUsuarios(1, 9999); 
            const listaCompleta = response.data.usuarios ?? [];
            setAllUsuarios(listaCompleta);
        } catch (err) {
            console.error("Error al cargar todos los usuarios para la búsqueda:", err);
            // No se establece error fatal, solo un log.
        }
    }, []);


    // Función para cargar la PÁGINA actual (paginación)
    const cargarPaginaUsuarios = useCallback(async (page) => {
        if (page < 1) return;
        if (pagination.totalPages && page > pagination.totalPages) return;

        setCurrentPage(page);
        setLoading(true);
        setError(null);

        try {
            const response = await getAllUsuarios(page, limit);
            const lista = response.data.usuarios ?? [];
            
            setUsuariosPagina(lista);
            setUsuariosFiltradosPagina(lista); 
            setPagination(response.data.pagination ?? {});
        } catch (err) {
            setError("Error al cargar la lista de usuarios.");
        } finally {
            setLoading(false);
        }
    }, [limit, pagination.totalPages]);


    // Carga inicial: carga la página 1 y todos los usuarios para el buscador
    useEffect(() => {
        cargarTodosLosUsuarios();
        cargarPaginaUsuarios(1);
    }, [cargarTodosLosUsuarios, cargarPaginaUsuarios]);


    const buscarLocalmente = (texto) => {
        const t = texto.toLowerCase();
        
        // 1. Filtra sobre *TODOS* los usuarios (allUsuarios)
        const filtradosCompletos = allUsuarios.filter(u => 
            u.nombre?.toLowerCase().includes(t) ||
            u.email?.toLowerCase().includes(t) ||
            u.hijos?.some(h => h.dni?.includes(t))
        );

        // 2. Muestra los primeros 'limit' (4) resultados
        setUsuariosFiltradosPagina(filtradosCompletos.slice(0, limit)); 
    }

    // Función de filtrado: Acepta nombre/email/ID
    const filtrar = async (texto) => {
        setBusqueda(texto);
        const t = texto.trim();
        
        if (!t) {
            // Si el texto está vacío, muestra la página actual
            setUsuariosFiltradosPagina(usuariosPagina);
            return;
        }

        // 1. Intentar búsqueda por ID (usando la ruta del backend)
        if (isMongoId(t)) {
            setLoading(true);
            try {
                // Llama al endpoint específico /:id
                const response = await getUsuarioById(t); 
                
                // CORRECCIÓN CLAVE: El objeto usuario se encuentra en response.data
                const usuario = response.data;
                
                // Si la llamada es exitosa y devuelve el objeto usuario
                if (usuario) {
                    setUsuariosFiltradosPagina([usuario]);
                } else {
                    // Si el backend devuelve 200 pero data es null/undefined, busca localmente
                    buscarLocalmente(t);
                }
                setError(null);
            } catch (err) {
                // Si la llamada falla (ej. 404 No encontrado, 500 error de servidor), busca localmente
                // Nota: Axios lanza un error si el estado HTTP es 4xx o 5xx.
                buscarLocalmente(t);
            } finally {
                setLoading(false);
                return;
            }
        }
        
        // 2. Búsqueda local (por nombre/email/parte del ID) en la lista completa
        buscarLocalmente(t);
    };


    // Manejador para recargar las listas después de crear un usuario
    const handleSuccessCrearUsuario = () => {
        setOpenModal(false);
        cargarTodosLosUsuarios(); 
        cargarPaginaUsuarios(currentPage); 
    };


    if (loading) return <h2 className="loading">Cargando usuarios...</h2>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="admin-view">
            <div className="admin-card">
                <header className="admin-header">
                    <h1 className="seccion-titulo">Gestión Usuarios</h1>

                    {/* Botón que abre el modal */}
                    <button
                        className="btn-crear-usuario"
                        onClick={() => setOpenModal(true)}
                    >
                        Crear usuario +
                    </button>
                </header>

                {/* Modal fuera del header para evitar render dentro del header */}
                <CrearUsuario
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={handleSuccessCrearUsuario}
                />

                {/* Campo de búsqueda */}
                <input
                    type="text"
                    placeholder="Buscar usuario (Nombre, Email o ID)"
                    value={busqueda}
                    onChange={(e) => filtrar(e.target.value)} 
                    className="buscar-usuario"
                />

                <div className="lista-acordeones">
                    {/* Renderiza la lista filtrada o la página actual */}
                    {usuariosFiltradosPagina.map((user) => (
                        <UsuarioAcordeon
                            key={user._id}
                            user={user}
                            isOpen={openedUser === user._id}
                            onToggle={() =>
                                setOpenedUser(prev => (prev === user._id ? null : user._id))
                            }
                        />
                    ))}
                    
                    {/* Mensaje si no hay resultados */}
                    {busqueda.trim() && usuariosFiltradosPagina.length === 0 && (
                        <p className="no-resultados">No se encontraron usuarios para la búsqueda "{busqueda}".</p>
                    )}
                </div>

                {/* Muestra la paginación SOLO si no hay una búsqueda activa */}
                {busqueda.length === 0 && (pagination.prevPage !== null || pagination.nextPage !== null) && (
                    <div className="admin-paginacion">
                        <button
                            onClick={() => cargarPaginaUsuarios(pagination.prevPage)}
                            disabled={pagination.prevPage === null}
                            className="btn-paginacion"
                        >
                            anterior
                        </button>

                        <button
                            onClick={() => cargarPaginaUsuarios(pagination.nextPage)}
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