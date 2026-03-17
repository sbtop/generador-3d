import { useProject } from '../../store/projectStore';

export function Header() {
    const { state, dispatch } = useProject();
    const errorAlerts = state.alerts.filter(a => a.severity === 'error').length;

    // Si no estamos en el flujo de proyecto, mostramos un header más simple
    if (state.activeModule === 'home' || state.activeModule === 'clients' || state.activeModule === 'settings') {
        return (
            <header className="header" style={{ justifyContent: 'flex-end' }}>
                <div className="header__right">
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-green)' }}></div>
                        Sistema en línea
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="header">
            <div className="header__left">
                <div className="header__module-label">
                    {state.activeModule === 'optimizer' && '📐 Optimizador de Vano'}
                    {state.activeModule === 'configurator' && '✨ Configurador de Estilo'}
                    {state.activeModule === 'order' && '📋 Generador de Orden'}
                </div>
                <div className="header__breadcrumb">
                    <input
                        className="header__project-input"
                        value={state.projectName}
                        onChange={e => dispatch({ type: 'SET_PROJECT', payload: { projectName: e.target.value } })}
                        placeholder="Nombre del proyecto"
                    />
                    <span className="header__sep">/</span>
                    <select
                        className="header__client-input"
                        value={state.clientId || ''}
                        onChange={e => dispatch({ type: 'SET_PROJECT', payload: { clientId: e.target.value || null } })}
                        style={{ appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">👤 Asignar Cliente...</option>
                        {state.clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="header__right">
                <button
                    onClick={() => dispatch({ type: 'SAVE_CURRENT_PROJECT' })}
                    style={{ background: 'var(--brand-green)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)' }}
                >
                    💾 Guardar Proyecto
                </button>

                {errorAlerts > 0 && (
                    <div className="header__error-badge">
                        🚫 {errorAlerts} error{errorAlerts > 1 ? 'es' : ''} de seguridad
                    </div>
                )}
                <div className="header__glass-badge">
                    {state.thickness}mm · {state.material} · {state.glassType}
                </div>
                <div className="header__weight">
                    ⚖️ {state.metrics.totalWeight} kg
                </div>
            </div>
        </header>
    );
}
