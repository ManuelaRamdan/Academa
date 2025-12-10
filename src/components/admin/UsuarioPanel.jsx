// src/components/Admin/UsuariosPanel.jsx

import { useEffect, useState, useCallback } from 'react';
import { getAllUsuarios } from '../../services/userService';
import "../../styles/PanelUsuario.css";
import UsuarioAcordeon from "./UsuarioAcordeon";
import CrearUsuario from "./CrearUsuario";


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
        // Solo verificamos el límite superior si ya tenemos la paginación cargada
        if (pagination.totalPages && page > pagination.totalPages) return;

        setCurrentPage(page);
        setLoading(true);
        setError(null);

        try {
            const response = await getAllUsuarios(page, limit);
            const lista = response.data.usuarios ?? [];
            
            setUsuariosPagina(lista);
            // Inicialmente, la lista visible es la página actual
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


    // Función de filtrado: busca en la lista completa (allUsuarios)
    const filtrar = (texto) => {
        setBusqueda(texto);

        if (!texto.trim()) {
            // Si el texto está vacío, muestra la página actual
            setUsuariosFiltradosPagina(usuariosPagina);
            return;
        }

        const t = texto.toLowerCase();
        
        // 1. Filtra sobre *TODOS* los usuarios
        const filtradosCompletos = allUsuarios.filter(u => 
            u.nombre?.toLowerCase().includes(t) ||
            u.email?.toLowerCase().includes(t)
        );

        // 2. Muestra los primeros 'limit' (4) resultados de la búsqueda global
        setUsuariosFiltradosPagina(filtradosCompletos.slice(0, limit)); 
    };

    // Manejador para recargar las listas después de crear un usuario
    const handleSuccessCrearUsuario = () => {
        setOpenModal(false);
        cargarTodosLosUsuarios(); // Recargar la lista completa para actualizar la búsqueda
        cargarPaginaUsuarios(currentPage); // Recargar la página actual
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
                    placeholder="Buscar usuario ..."
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