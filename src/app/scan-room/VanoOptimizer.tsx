import { useState } from 'react';
import { useProject } from '../../store/projectStore';
import { ARScannerModal } from './ARScannerModal';
import { GlassType, GlassMaterial, GlassThickness } from '../../backend/pricing-engine/glassCalculator';
import { SafetyAlert } from '../../backend/pricing-engine/safetyValidator';

const GLASS_TYPES: { id: GlassType; label: string; icon: string; desc: string }[] = [
    { id: 'batiente', label: 'Puerta Batiente', icon: '🚪', desc: 'Gira en bisagras — Duchas y baños' },
    { id: 'corrediza', label: 'Puerta Corrediza', icon: '↔️', desc: 'Desliza en riel superior' },
    { id: 'ventana', label: 'Ventana / Fijo', icon: '🪟', desc: 'Panel fijo con sellado perimetral' },
];

const MATERIALS: { id: GlassMaterial; label: string; color: string; desc: string }[] = [
    { id: 'claro', label: 'Claro', color: 'rgba(200,235,255,0.35)', desc: 'Máxima transparencia' },
    { id: 'extraclaro', label: 'Extraclaro', color: 'rgba(220,245,255,0.45)', desc: 'Sin tinte verdoso' },
    { id: 'satinado', label: 'Satinado', color: 'rgba(210,220,230,0.6)', desc: 'Privacidad translúcida' },
    { id: 'gris', label: 'Gris', color: 'rgba(100,120,140,0.45)', desc: 'Para exteriores' },
    { id: 'bronce', label: 'Bronce', color: 'rgba(165,120,60,0.40)', desc: 'Estilo cálido premium' },
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
    const { metrics, alerts } = state;
    const [showAR, setShowAR] = useState(false);
    const [unit, setUnit] = useState<'mm' | 'm'>('mm');

    const isM = unit === 'm';
    const displayW = isM ? state.vanoWidth / 1000 : state.vanoWidth;
    const displayH = isM ? state.vanoHeight / 1000 : state.vanoHeight;
    const step = isM ? 0.001 : 1;
    const min = isM ? 0.2 : 200;
    const max = isM ? 5.0 : 5000;

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        const mmVal = isM ? Math.round(val * 1000) : val;
        dispatch({ type: 'SET_VANO', payload: { vanoWidth: mmVal } });
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        const mmVal = isM ? Math.round(val * 1000) : val;
        dispatch({ type: 'SET_VANO', payload: { vanoHeight: mmVal } });
    };

    return (
        <div className="module">
            {showAR && (
                <ARScannerModal
                    onClose={() => setShowAR(false)}
                    onComplete={(w, h) => {
                        dispatch({ type: 'SET_VANO', payload: { vanoWidth: w, vanoHeight: h } });
                        setShowAR(false);
                    }}
                />
            )}
            <div className="module__header">
                <h2 className="module__title">📐 Optimizador de Vano</h2>
                <p className="module__subtitle">Introduce las medidas del hueco real y la app calcula las medidas exactas de corte.</p>
            </div>

            <div className="module__body">
                {/* Tipo de vano */}
                <section className="section">
                    <h3 className="section__title">Tipo de Instalación</h3>
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

                {/* Medidas de vano */}
                <section className="section">
                    <div className="section-header-flex">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <h3 className="section__title" style={{ marginBottom: 0 }}>Medidas del Vano ({unit})</h3>
                            <div className="unit-toggle" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setUnit('mm')}
                                    style={{ padding: '4px 12px', border: 'none', background: unit === 'mm' ? 'var(--brand-blue)' : 'transparent', color: unit === 'mm' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition)' }}
                                >
                                    mm
                                </button>
                                <button
                                    onClick={() => setUnit('m')}
                                    style={{ padding: '4px 12px', border: 'none', background: unit === 'm' ? 'var(--brand-blue)' : 'transparent', color: unit === 'm' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition)' }}
                                >
                                    metros
                                </button>
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

                {/* Material */}
                <section className="section">
                    <h3 className="section__title">Material del Vidrio</h3>
                    <div className="material-grid">
                        {MATERIALS.map(m => (
                            <button
                                key={m.id}
                                className={`material-card ${state.material === m.id ? 'material-card--active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_MATERIAL', payload: m.id })}
                            >
                                <div className="material-card__preview" style={{ background: m.color }} />
                                <span className="material-card__label">{m.label}</span>
                                <span className="material-card__desc">{m.desc}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Resultado de corte */}
                <section className="section">
                    <h3 className="section__title">📦 Medidas de Corte — Orden a Fábrica</h3>
                    <div className="results-grid">
                        {metrics.panels.map((panel: any) => (
                            <div key={panel.label} className="result-card">
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
                                <div className="result-card__barrenos">
                                    <span className="result-card__barrenos-title">Barrenos ({panel.barrenos.length}):</span>
                                    {panel.barrenos.map((b: any, i: number) => (
                                        <span key={i} className="result-card__barreno">
                                            {b.description}: X={b.x}mm / Y={b.y}mm / ⌀{b.diameter}mm
                                        </span>
                                    ))}
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
        </div>
    );
}
