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
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Rol:</strong> {user.rol}</p>
                </div>
            )}
        </div>
    );
}
