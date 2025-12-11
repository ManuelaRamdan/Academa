export default function UsuarioAcordeon({ user, isOpen, onToggle }) {
    return (
        <div className="usuario-item-card">

            <div
                className={`usuario-header-card ${isOpen ? "open" : ""}`}
                onClick={onToggle}
            >
                <strong>{user.nombre}</strong>
                <span className="toggle-icon">{isOpen ? "▼" : "▲"}</span>
            </div>

            {isOpen && (
                <div className="usuario-body-details">
                    <p><strong>ID Usuario:</strong> {user._id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Rol:</strong> {user.rol}</p>

                    {user.profesorId && (
                        <p><strong>ID Profesor:</strong> {user.profesorId}</p>
                    )}

                    <div className="detalle-hijos">
                        <strong>DNI de Hijos Asociados:</strong>
                        {user.hijos?.length > 0 ? (
                            <ul>
                                {user.hijos.map((h, i) => (
                                    <li key={i}>{h.dni}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-hijos">Ningún DNI asociado.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
