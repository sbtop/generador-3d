import { useState, useEffect } from 'react';
import { useProject } from '../../store/projectStore';
import { ARScannerModal } from './ARScannerModal';
import { GlassType, GlassThickness, ShowerConfig } from '../../backend/pricing-engine/glassCalculator';
import { SafetyAlert } from '../../backend/pricing-engine/safetyValidator';

function ShowerTypeIcon({ id }: { id: GlassType }) {
    const stroke = 'currentColor';
    if (id === 'batiente') {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.3" />
                <path d="M3 3v18h12V3H3z" fill="rgba(59, 130, 246, 0.1)" />
                <circle cx="12" cy="12" r="1" fill={stroke} />
                <path d="M15 3l6 2v14l-6 2" />
            </svg>
        );
    }
    if (id === 'corrediza') {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.3" />
                <path d="M4 4h8v16H4V4z" fill="rgba(59, 130, 246, 0.1)" />
                <path d="M12 4h8v16h-8V4z" fill="rgba(59, 130, 246, 0.05)" />
                <path d="M7 10l-2 2 2 2M17 10l2 2-2 2" />
            </svg>
        );
    }
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.3" />
            <rect x="5" y="5" width="14" height="14" rx="1" fill="rgba(59, 130, 246, 0.1)" />
            <path d="M5 12h14M12 5v14" strokeOpacity="0.2" />
        </svg>
    );
}

function ShowerTemplateIcon({ id }: { id: ShowerConfig }) {
    const stroke = 'currentColor';
    const fill = 'rgba(59, 130, 246, 0.15)';
    const handle = 'currentColor';

    if (id === 'single') {
        return (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={stroke} strokeWidth="1.2">
                <rect x="14" y="8" width="20" height="32" fill={fill} />
                <circle cx="30" cy="24" r="1.5" fill={handle} stroke="none" />
                <line x1="14" y1="12" x2="14" y2="16" strokeWidth="2.5" />
                <line x1="14" y1="32" x2="14" y2="36" strokeWidth="2.5" />
            </svg>
        );
    }
    if (id === 'door-panel') {
        return (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={stroke} strokeWidth="1.2">
                <rect x="8" y="8" width="16" height="32" fill={fill} />
                <rect x="24" y="8" width="16" height="32" fill="none" strokeOpacity="0.5" />
                <circle cx="21" cy="24" r="1.5" fill={handle} stroke="none" />
                <line x1="8" y1="12" x2="8" y2="16" strokeWidth="2.5" />
                <line x1="8" y1="32" x2="8" y2="36" strokeWidth="2.5" />
            </svg>
        );
    }
    if (id === 'panel-door') {
        return (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={stroke} strokeWidth="1.2">
                <rect x="8" y="8" width="16" height="32" fill="none" strokeOpacity="0.5" />
                <rect x="24" y="8" width="16" height="32" fill={fill} />
                <circle cx="27" cy="24" r="1.5" fill={handle} stroke="none" />
                <line x1="40" y1="12" x2="40" y2="16" strokeWidth="2.5" />
                <line x1="40" y1="32" x2="40" y2="36" strokeWidth="2.5" />
            </svg>
        );
    }
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={stroke} strokeWidth="1.2">
            <rect x="6" y="8" width="10" height="32" fill="none" strokeOpacity="0.5" />
            <rect x="16" y="8" width="16" height="32" fill={fill} />
            <rect x="32" y="8" width="10" height="32" fill="none" strokeOpacity="0.5" />
            <circle cx="29" cy="24" r="1.5" fill={handle} stroke="none" />
            <line x1="16" y1="12" x2="16" y2="16" strokeWidth="2.5" />
            <line x1="16" y1="32" x2="16" y2="36" strokeWidth="2.5" />
        </svg>
    );
}

const GLASS_TYPES: { id: GlassType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'batiente', label: 'Puerta Batiente', icon: <ShowerTypeIcon id="batiente" />, desc: 'Gira en bisagras — Duchas y baños' },
    { id: 'corrediza', label: 'Puerta Corrediza', icon: <ShowerTypeIcon id="corrediza" />, desc: 'Desliza en riel superior' },
    { id: 'ventana', label: 'Ventana / Fijo', icon: <ShowerTypeIcon id="ventana" />, desc: 'Panel fijo con sellado perimetral' },
];

const SHOWER_TEMPLATES: { id: ShowerConfig; label: string; icon: React.ReactNode }[] = [
    { id: 'single', label: 'Puerta Sola', icon: <ShowerTemplateIcon id="single" /> },
    { id: 'door-panel', label: 'Puerta + Fijo Der', icon: <ShowerTemplateIcon id="door-panel" /> },
    { id: 'panel-door', label: 'Fijo Izq + Puerta', icon: <ShowerTemplateIcon id="panel-door" /> },
    { id: 'panel-door-panel', label: 'Fijo + Puerta + Fijo', icon: <ShowerTemplateIcon id="panel-door-panel" /> },
];

const THICKNESSES: { val: GlassThickness; label: string; rec: string }[] = [
    { val: 6, label: '6 mm', rec: 'Ventanas fijas y mamparas livianas' },
    { val: 8, label: '8 mm', rec: 'Puertas de baño estándar' },
    { val: 10, label: '10 mm', rec: 'Puertas anchas o pesadas' },
    { val: 12, label: '12 mm', rec: 'Instalaciones de alta demanda' },
];

function AlertCard({ alert }: { alert: SafetyAlert }) {
    const colorMap = { error: 'alert--error', warning: 'alert--warning', info: 'alert--info' };
    return (
        <div className={`alert-card ${colorMap[alert.severity as keyof typeof colorMap]}`}>
            <div className="alert-card__title">{alert.title}</div>
            <div className="alert-card__msg">{alert.message}</div>
            <div className="alert-card__rule">📌 {alert.rule}</div>
        </div>
    );
}

export function VanoOptimizer() {
    const { state, dispatch } = useProject();
    const { metrics, alerts, preferences } = state;
    const [showAR, setShowAR] = useState(false);
    const [unit, setUnit] = useState<'mm' | 'm' | 'in'>(preferences.measureUnits);

    // Sync unit with preferences when preferences change (e.g. from Settings)
    useEffect(() => {
        setUnit(preferences.measureUnits);
    }, [preferences.measureUnits]);

    const isM = unit === 'm';
    const isIn = unit === 'in';

    // Convert current mm state to display units
    const getDisplayVal = (mmVal: number) => {
        if (isM) return mmVal / 1000;
        if (isIn) return +(mmVal / 25.4).toFixed(3);
        return mmVal;
    };

    const displayW = getDisplayVal(state.vanoWidth);
    const displayH = getDisplayVal(state.vanoHeight);

    const step = isM ? 0.001 : isIn ? 0.125 : 1;
    const min = isM ? 0.2 : isIn ? 8 : 200;
    const max = isM ? 5.0 : isIn ? 200 : 5000;

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        let mmVal = val;
        if (isM) mmVal = Math.round(val * 1000);
        if (isIn) mmVal = Math.round(val * 25.4);
        dispatch({ type: 'SET_VANO', payload: { vanoWidth: mmVal } });
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        let mmVal = val;
        if (isM) mmVal = Math.round(val * 1000);
        if (isIn) mmVal = Math.round(val * 25.4);
        dispatch({ type: 'SET_VANO', payload: { vanoHeight: mmVal } });
    };

    return (
        <div className="module">
            <div className="module__header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                        <h2 className="module__title">📐 Configuración de Diseño</h2>
                        <p className="module__subtitle">Define el hueco y la plantilla de la ducha para ver el despiece exacto.</p>
                    </div>
                    <button className="btn-ar-trigger" onClick={() => setShowAR(true)} style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                        📸 Scan Bathroom AI
                    </button>
                </div>
            </div>

            <div className="module__body">
                {showAR && (
                    <ARScannerModal
                        onClose={() => setShowAR(false)}
                        onComplete={(w, h, config) => {
                            dispatch({ type: 'SET_VANO', payload: { vanoWidth: w, vanoHeight: h } });

                            if (config) {
                                dispatch({ type: 'SET_SHOWER_CONFIG', payload: config });
                            } else {
                                // Fallback logic if config not provided
                                if (w > 1000) {
                                    dispatch({ type: 'SET_SHOWER_CONFIG', payload: 'door-panel' });
                                } else {
                                    dispatch({ type: 'SET_SHOWER_CONFIG', payload: 'single' });
                                }
                            }
                            setShowAR(false);
                        }}
                    />
                )}
                {/* Tipo de vano */}
                <section className="section">
                    <h3 className="section__title">1. Tipo de Instalación</h3>
                    <div className="type-grid">
                        {GLASS_TYPES.map(t => (
                            <button
                                key={t.id}
                                className={`type-card ${state.glassType === t.id ? 'type-card--active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_GLASS_TYPE', payload: t.id })}
                            >
                                <span className="type-card__icon">{t.icon}</span>
                                <span className="type-card__label">{t.label}</span>
                                <span className="type-card__desc">{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Plantilla de ducha (SOLO SI ES BATIENTE) */}
                {state.glassType === 'batiente' && (
                    <section className="section">
                        <h3 className="section__title">2. Estilo / Plantilla</h3>
                        <div className="type-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            {SHOWER_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    className={`type-card ${state.showerConfig === t.id ? 'type-card--active' : ''}`}
                                    onClick={() => dispatch({ type: 'SET_SHOWER_CONFIG', payload: t.id })}
                                >
                                    <span className="type-card__icon" style={{ fontSize: '1.5rem', opacity: 0.8 }}>{t.icon}</span>
                                    <span className="type-card__label">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Medidas de vano */}
                <section className="section">
                    <div className="section-header-flex">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <h3 className="section__title" style={{ marginBottom: 0 }}>Medidas del Vano ({unit})</h3>
                            <div className="unit-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                {(['mm', 'm', 'in'] as const).map(u => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u)}
                                        style={{ padding: '4px 12px', border: 'none', background: unit === u ? 'var(--brand-blue)' : 'transparent', color: unit === u ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition)' }}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-ar-trigger" onClick={() => setShowAR(true)}>
                            📱 Escaneo LiDAR IA
                        </button>
                    </div>
                    <div className="measure-grid" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <div className="input-group">
                            <label className="input-label">Ancho Hueco</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    className="input-field"
                                    value={displayW || ''}
                                    min={min} max={max} step={step}
                                    onChange={handleWidthChange}
                                />
                                <span className="input-unit">{unit}</span>
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Alto Hueco</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    className="input-field"
                                    value={displayH || ''}
                                    min={min} max={max} step={step}
                                    onChange={handleHeightChange}
                                />
                                <span className="input-unit">{unit}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Espesor */}
                <section className="section">
                    <h3 className="section__title">Espesor del Vidrio</h3>
                    <div className="thickness-grid">
                        {THICKNESSES.map(th => (
                            <button
                                key={th.val}
                                className={`thickness-card ${state.thickness === th.val ? 'thickness-card--active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_THICKNESS', payload: th.val })}
                            >
                                <span className="thickness-card__val">{th.label}</span>
                                <span className="thickness-card__rec">{th.rec}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Resultado de corte */}
                <section className="section">
                    <h3 className="section__title">📦 Medidas de Corte — Orden a Fábrica</h3>
                    <div className="results-grid">
                        {metrics.panels.map((panel: any, idx: number) => (
                            <div key={idx} className="result-card">
                                <div className="result-card__label">{panel.label}</div>
                                <div className="result-card__dims">
                                    <span className="result-card__dim">{panel.glassWidth} mm</span>
                                    <span className="result-card__x">×</span>
                                    <span className="result-card__dim">{panel.glassHeight} mm</span>
                                </div>
                                <div className="result-card__meta">
                                    <span>Área: <strong>{panel.area} m²</strong></span>
                                    <span>Peso: <strong>{panel.weight} kg</strong></span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="totals-bar">
                        <div className="totals-bar__item">
                            <span className="totals-bar__label">Peso Total</span>
                            <span className="totals-bar__val">{metrics.totalWeight} kg</span>
                        </div>
                        <div className="totals-bar__item">
                            <span className="totals-bar__label">Área Total</span>
                            <span className="totals-bar__val">{metrics.totalArea} m²</span>
                        </div>
                        <div className="totals-bar__item">
                            <span className="totals-bar__label">Paneles</span>
                            <span className="totals-bar__val">{metrics.panels.length}</span>
                        </div>
                    </div>
                </section>

                {/* Alertas */}
                {alerts.length > 0 && (
                    <section className="section">
                        <h3 className="section__title">🛡️ Alertas de Seguridad</h3>
                        <div className="alerts-list">
                            {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
                        </div>
                    </section>
                )}
            </div>
        </div >
    );
}
