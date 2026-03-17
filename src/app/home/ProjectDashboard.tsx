import { useProject, SavedProject } from '../../store/projectStore';

export function ProjectDashboard() {
    const { state, dispatch } = useProject();

    const handleNewProject = () => {
        dispatch({ type: 'NEW_PROJECT' });
        dispatch({ type: 'SET_MODULE', payload: 'optimizer' });
    };

    const handleLoadProject = (project: SavedProject) => {
        dispatch({ type: 'LOAD_PROJECT', payload: project });
    };

    const handleDeleteProject = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('¿Seguro que deseas eliminar este proyecto de la lista?')) {
            dispatch({ type: 'DELETE_PROJECT', payload: id });
        }
    };

    const getClientName = (clientId: string | null) => {
        if (!clientId) return 'Sin cliente asignado';
        const client = state.clients.find(c => c.id === clientId);
        return client ? client.name : 'Cliente Anónimo';
    };

    return (
        <div className="module module-dashboard">
            <div className="dashboard-hero">
                <div>
                    <h2 className="module__title">👋 Bienvenido a GlassPro 3D</h2>
                    <p className="module__subtitle">Crea cotizaciones precisas y sin errores para cristal templado.</p>
                </div>
                <button className="btn-hero" onClick={handleNewProject} style={{ margin: '0 auto' }}>
                    <span className="btn-hero__icon">✨</span>
                    <span>NUEVO PROYECTO</span>
                    <span className="btn-hero__sub">Iniciar cotización y diseño 3D</span>
                </button>
            </div>

            <section className="section">
                <h3 className="section__title">📂 Proyectos Recientes</h3>
                <div className="projects-grid">
                    {state.savedProjects.length === 0 ? (
                        <div className="empty-state">No has guardado ningún proyecto todavía. Haz clic en "Nuevo Proyecto" para empezar.</div>
                    ) : (
                        state.savedProjects.map(proj => (
                            <div key={proj.id} className="project-card" onClick={() => handleLoadProject(proj)}>
                                <div className="project-card__header">
                                    <h4 className="project-card__title">{proj.projectName}</h4>
                                    <span className="project-card__date">{new Date(proj.date).toLocaleDateString()}</span>
                                </div>
                                <div className="project-card__client">
                                    👤 {getClientName(proj.clientId)}
                                </div>
                                <div className="project-card__specs">
                                    <span className={`badge-type badge--${proj.glassType}`}>{proj.glassType}</span>
                                    <span>{proj.thickness}mm {proj.material}</span>
                                </div>
                                <div className="project-card__footer">
                                    <div className="project-card__price">
                                        ${proj.quoteTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-icon btn-icon--danger"
                                            style={{ padding: '6px 12px' }}
                                            onClick={(e) => handleDeleteProject(e, proj.id)}
                                            title="Eliminar Proyecto"
                                        >
                                            🗑️
                                        </button>
                                        <button className="btn-secondary btn-secondary--small">Abrir ➔</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
