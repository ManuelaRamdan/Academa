export default function MateriaAcordeon({ materia, isOpen, onToggle }) {

    const formatId = (id) => id ? `${id.substring(0, 5)}...${id.substring(id.length - 5)}` : 'N/A';

    return (
        <div className="usuario-item-card">
            
            <div className="usuario-header-card" onClick={onToggle}>
                <span>
                    {materia.nombre}
                </span>

                <span className="toggle-icon">
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {isOpen && (
                <div className="usuario-body-details">

                    <p><strong>ID:</strong> {materia._id}</p>

                    <p><strong>Carga horaria:</strong> {materia.cargaHoraria || 'No especificada'}</p>

                    <p><strong>Contenido:</strong> {materia.contenido || 'No especificado'}</p>

                    <p><strong>Nivel:</strong> {materia.nivel || 'N/A'}</p>

                    <p><strong>Curso:</strong> 
                        {materia.curso 
                            ? `${materia.curso.anio}° - División ${materia.curso.division}` 
                            : 'Sin curso asignado'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}
