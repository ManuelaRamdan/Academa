// src/components/admin/profesores/ProfesorAcordeon.jsx (ACTUALIZADO)

import React, { useState } from 'react';
import MateriaProfesorDetalle from './MateriaProfesorDetalle'; // Importamos el nuevo componente

export default function ProfesorAcordeon({ profesor, isOpen, onToggle }) {
    
    const estadoVisible = profesor.activo ? 'Activo' : 'Inactivo';

    // Estado para manejar el ID del curso abierto (si se permite abrir más de uno a la vez)
    const [openMateriaId, setOpenMateriaId] = useState(null); 
    
    return (
        <div className="usuario-item-card"> 
            
            <div 
                className="usuario-header-card" 
                onClick={onToggle}
            >
                <span>
                    {profesor.nombre}
                </span>
                
                <span className="toggle-icon">
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {isOpen && (
                <div className="usuario-body-details"> 
                    <p><strong>ID:</strong> {profesor._id}</p>
                    
                    <h3>Materias Dictadas ({profesor.materiasDictadas?.length || 0})</h3>
                    
                    {profesor.materiasDictadas?.map((materiaCurso) => (
                        <div key={materiaCurso.idCurso || materiaCurso._id} className="materia-curso-profesor">
                            
                            {/* Renderiza el componente de edición para cada materia/curso */}
                            <MateriaProfesorDetalle
                                materiaCurso={materiaCurso}
                                profesorId={profesor._id}
                            />
                        </div>
                    ))}
                    
                </div>
            )}
        </div>
    );
}