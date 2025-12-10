// src/components/Admin/UsuariosPanel.jsx

import { useEffect, useState } from 'react';
import { getAllUsuarios } from '../../services/userService';
import "../../styles/PanelUsuario.css";
import UsuarioAcordeon from "./UsuarioAcordeon";
import CrearUsuario from "./CrearUsuario";


export default function UsuariosPanel() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [openedUser, setOpenedUser] = useState(null);
    const limit = 4;
    const [openModal, setOpenModal] = useState(false);


    const cargarUsuarios = async (page) => {
        if (page < 1) return;
        if (pagination.totalPages && page > pagination.totalPages) return;

        setCurrentPage(page);
        setLoading(true);
        setError(null);

        try {
            const response = await getAllUsuarios(page, limit);
            const lista = response.data.usuarios ?? [];
            setUsuarios(lista);
            setUsuariosFiltrados(lista);
            setPagination(response.data.pagination ?? {});
        } catch (err) {
            setError("Error al cargar la lista de usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios(1);
    }, []);

    const filtrar = (texto) => {
        setBusqueda(texto);

        if (!texto.trim()) {
            setUsuariosFiltrados(usuarios);
            return;
        }

        const t = texto.toLowerCase();
        const filtrados = usuarios.filter(u =>
            u.nombre?.toLowerCase().includes(t) ||
            u.email?.toLowerCase().includes(t)
        );

        setUsuariosFiltrados(filtrados);
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
                    onSuccess={() => {
                        setOpenModal(false);
                        cargarUsuarios(currentPage);
                    }}
                />

                <input
                    type="text"
                    placeholder="Buscar usuario ..."
                    value={busqueda}
                    onChange={(e) => filtrar(e.target.value)}
                    className="buscar-usuario"
                />

                <div className="lista-acordeones">
                    {usuariosFiltrados.map((user) => (
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

                {(pagination.prevPage !== null || pagination.nextPage !== null) && (
                    <div className="admin-paginacion">
                        <button
                            onClick={() => cargarUsuarios(pagination.prevPage)}
                            disabled={pagination.prevPage === null}
                            className="btn-paginacion"
                        >
                            anterior
                        </button>

                        <button
                            onClick={() => cargarUsuarios(pagination.nextPage)}
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
