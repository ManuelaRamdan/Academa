import { useEffect, useState } from "react";
import { createUsuario } from "../../../services/userService";
import { getAllProfesores } from "../../../services/profesorService";
import { getAllUsuarios } from "../../../services/userService";     
import { getAllAlumnos } from "../../../services/alumnoService";       

export default function CrearUsuario({ open, onClose, onSuccess }) {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rol, setRol] = useState("");

    const [hijos, setHijos] = useState([""]);
    const [alumnos, setAlumnos] = useState([]);

    const [profesores, setProfesores] = useState([]);
    const [profesorId, setProfesorId] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🟢 NUEVO: mensaje de éxito
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        getAllAlumnos()
            .then((res) => setAlumnos(res.data?.alumnos ?? []))
            .catch(() => setAlumnos([]));
    }, []);

    useEffect(() => {
        async function cargarProfes() {
            try {
                const [profesRes, usuariosRes] = await Promise.all([
                    getAllProfesores(1, 50),
                    getAllUsuarios()
                ]);

                const profes = profesRes.data?.profesores ?? [];
                const usuarios = usuariosRes.data?.usuarios ?? [];

                const usados = new Set(
                    usuarios
                        .filter(u => u.rol === "profesor" && u.profesorId)
                        .map(u => u.profesorId)
                );

                const libres = profes.filter(p => !usados.has(p._id));

                setProfesores(libres);

            } catch {
                setProfesores([]);
            }
        }

        cargarProfes();
    }, []);

    const agregarHijo = () => setHijos([...hijos, ""]);

    const cambiarHijo = (i, value) => {
        const copia = [...hijos];
        copia[i] = value;
        setHijos(copia);
    };

    const eliminarHijo = (i) => {
        const copia = hijos.filter((_, idx) => idx !== i);
        setHijos(copia);
    };

    const reset = () => {
        setNombre("");
        setEmail("");
        setPassword("");
        setRol("");
        setHijos([""]);
        setProfesorId("");
        setError(null);
        setSuccess(null);   // 🟢 limpiar éxito
    };

    const cerrar = () => {
        reset();
        onClose();
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null); // limpiar éxito previo

        const data = {
            nombre,
            email,
            password,
            rol,
            hijos: rol === "padre" ? hijos : [],
            profesorId: rol === "profesor" ? profesorId : null,
        };

        try {
            await createUsuario(data);

            // 🟢 Mostrar mensaje de éxito donde aparece el error
            setSuccess("Usuario creado correctamente");

            onSuccess();   // notificar al padre
            // ❗ NO cierro el modal todavía para que se vea el mensaje
            // Si querés cerrarlo después: setTimeout(cerrar, 1200);

        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Error al crear usuario";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card">

                <h2>Crear usuario</h2>

                {/* 🟢 Mostrar ÉXITO arriba del formulario */}
                {success && <p className="success">{success}</p>}

                {/* 🔴 Mostrar ERROR arriba del formulario */}
                {error && <p className="error">{error}</p>}

                <form onSubmit={submit} className="modal-form">
                    <label>Nombre</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} required />

                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                    <label>Contraseña</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                    <label>Rol</label>
                    <select value={rol} onChange={e => setRol(e.target.value)} required>
                        <option value="">Seleccione...</option>
                        <option value="padre">Padre</option>
                        <option value="profesor">Profesor</option>
                        <option value="administrador">Admin</option>
                    </select>

                    {rol === "padre" && (
                        <>
                            <label>Hijos</label>

                            {hijos.map((dni, i) => (
                                <div key={i} className="fila-hijo">
                                    <select
                                        value={dni}
                                        onChange={(e) => cambiarHijo(i, e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione alumno...</option>
                                        {alumnos.map(a => (
                                            <option key={a.dni} value={a.dni}>
                                                {a.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => eliminarHijo(i)}
                                        className="btn-eliminar"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}

                            <button type="button" className="btn-secundario" onClick={agregarHijo}>
                                + Añadir hijo
                            </button>
                        </>
                    )}

                    {rol === "profesor" && (
                        <>
                            <label>Profesor asignado</label>
                            <select
                                value={profesorId}
                                onChange={(e) => setProfesorId(e.target.value)}
                                required
                            >
                                <option value="">Seleccione profesor...</option>
                                {profesores.map((p) => (
                                    <option key={p._id} value={p._id}>{p.nombre}</option>
                                ))}
                            </select>
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cerrar" onClick={cerrar}>
                            Cancelar
                        </button>

                        <button type="submit" disabled={loading} className="btn-crear">
                            {loading ? "Creando..." : "Crear usuario"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
