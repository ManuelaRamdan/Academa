export default function AlumnoHeader({ nombre, isOpen, onToggle }) {
    return (
        <div className="acordeon-header" onClick={onToggle}>
            <span className="acordeon-nombre-usuario">
                {nombre || "Alumno sin nombre"}
            </span>
            <span className="toggle-icon">{isOpen ? "▼" : "▲"}</span>
        </div>
    );
}