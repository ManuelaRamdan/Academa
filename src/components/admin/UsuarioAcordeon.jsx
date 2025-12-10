// src/components/Admin/UsuarioAcordeon.jsx

export default function UsuarioAcordeon({ user, isOpen, onToggle }) {
    return (
        <div className="usuario-item-card">

            <div
                className={`usuario-header-card ${isOpen ? "open" : ""}`}
                onClick={onToggle}
            >
                <strong className="header-nombre">{user.nombre}</strong>
                <span className="toggle-icon">{isOpen ? "▼" : "▲"}</span>
            </div>

            {isOpen && (
                <div className="usuario-body-details">
                    {/* Detalles básicos */}
                    <p><strong>ID Usuario:</strong> {user._id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Rol:</strong> {user.rol}</p>
                    
                    {/* ID del Profesor (solo si existe) */}
                    {user.profesorId && (
                        <p><strong>ID Profesor:</strong> {user.profesorId}</p>
                    )}

                    {/* DNI de los Hijos */}
                    <div className="detalle-hijos">
                        <strong>DNI de Hijos Asociados:</strong>
                        {user.hijos && user.hijos.length > 0 ? (
                            <ul>
                                {user.hijos.map((hijo, index) => (
                                    <li key={index}>
                                        {hijo.dni} 
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-hijos">Ningún DNI de hijo asociado.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}