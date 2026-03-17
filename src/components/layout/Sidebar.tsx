import { useProject, AppModule } from '../../store/projectStore';

const mainModules: { id: AppModule; label: string; icon: string; desc: string }[] = [
    { id: 'home', label: 'Dashboard', icon: '🏠', desc: 'Tus proyectos' },
    { id: 'clients', label: 'Clientes', icon: '👥', desc: 'Directorio' },
    { id: 'settings', label: 'Configuración', icon: '⚙️', desc: 'Precios base' },
];

const projectModules: { id: AppModule; label: string; icon: string; desc: string }[] = [
    { id: 'optimizer', label: 'Vano (1)', icon: '📐', desc: 'Medición' },
    { id: 'configurator', label: 'Diseño (2)', icon: '✨', desc: 'Material/Herrajes' },
    { id: 'order', label: 'Orden (3)', icon: '📋', desc: 'PDF / Cotización' },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const { state, dispatch } = useProject();
    const alertCount = state.alerts.filter(a => a.severity === 'error' || a.severity === 'warning').length;

    // Solo mostramos herramientas de proyecto si no estamos en home/clients
    const isProjectActive = state.activeModule !== 'home' && state.activeModule !== 'clients';

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar__logo" onClick={onToggle} title="Contraer menú">
                <span className="sidebar__logo-icon">🔷</span>
                {!collapsed && (
                    <div>
                        <div className="sidebar__logo-title">GlassPro 3D</div>
                        <div className="sidebar__logo-sub">Instalaciones de Vidrio</div>
                    </div>
                )}
                <button className="sidebar__toggle">{collapsed ? '›' : '‹'}</button>
            </div>

            {/* Nav modules */}
            <nav className="sidebar__nav">

                {/* Main Views */}
                <div style={{ marginBottom: '16px' }}>
                    {!collapsed && <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '12px' }}>General</div>}
                    {mainModules.map(m => (
                        <button
                            key={m.id}
                            className={`sidebar__item ${state.activeModule === m.id ? 'sidebar__item--active' : ''}`}
                            onClick={() => dispatch({ type: 'SET_MODULE', payload: m.id })}
                            title={m.label}
                        >
                            <span className="sidebar__item-icon">{m.icon}</span>
                            {!collapsed && (
                                <div className="sidebar__item-text">
                                    <span className="sidebar__item-label">{m.label}</span>
                                    <span className="sidebar__item-desc">{m.desc}</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Project Tools */}
                {(isProjectActive || state.projectId) && (
                    <div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />
                        {!collapsed && <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '12px' }}>Proyecto Actual</div>}

                        {projectModules.map(m => (
                            <button
                                key={m.id}
                                className={`sidebar__item ${state.activeModule === m.id ? 'sidebar__item--active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_MODULE', payload: m.id })}
                                title={m.label}
                            >
                                <span className="sidebar__item-icon">{m.icon}</span>
                                {!collapsed && (
                                    <div className="sidebar__item-text">
                                        <span className="sidebar__item-label">{m.label}</span>
                                        <span className="sidebar__item-desc">{m.desc}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Alerts badge */}
            {isProjectActive && alertCount > 0 && (
                <div className={`sidebar__alerts ${collapsed ? 'sidebar__alerts--collapsed' : ''}`}>
                    <span className="sidebar__alerts-icon">⚠️</span>
                    {!collapsed && <span>{alertCount} alerta{alertCount > 1 ? 's' : ''} activa{alertCount > 1 ? 's' : ''}</span>}
                </div>
            )}

            {/* Footer */}
            {!collapsed && (
                <div className="sidebar__footer">
                    <span>v1.0.0 MVP</span>
                </div>
            )}
        </aside>
    );
}
