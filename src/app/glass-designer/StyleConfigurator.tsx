import { useState } from 'react';
import { useProject } from '../../store/projectStore';
import { HardwareFinish } from '../../backend/pricing-engine/glassCalculator';
import { GlassScene } from '../../3d-engine/render-glass/GlassScene';

const FINISHES: { id: HardwareFinish; label: string; color: string }[] = [
    { id: 'cromo', label: 'Cromo', color: '#c0c0c0' },
    { id: 'negro', label: 'Negro Mate', color: '#1a1a1a' },
    { id: 'satin', label: 'Satín', color: '#8a8a7a' },
    { id: 'oro', label: 'Oro', color: '#c8a84b' },
];

const MATERIAL_COLORS: Record<string, string> = {
    claro: '#c8eeff',
    extraclaro: '#e0f5ff',
    satinado: '#d5dde6',
    gris: '#7a8fa0',
    bronce: '#a07840',
};

const MATERIAL_OPACITY: Record<string, number> = {
    claro: 0.28,
    extraclaro: 0.22,
    satinado: 0.62,
    gris: 0.42,
    bronce: 0.38,
};

const FINISH_METALNESS: Record<HardwareFinish, number> = {
    cromo: 0.9,
    negro: 0.4,
    satin: 0.6,
    oro: 0.85,
};

export function StyleConfigurator() {
    const { state, dispatch } = useProject();
    const [isOpen, setIsOpen] = useState(false);

    const glassColor = MATERIAL_COLORS[state.material];
    const glassOpacity = MATERIAL_OPACITY[state.material];
    const metalness = FINISH_METALNESS[state.finish];

    return (
        <div className="module">
            <div className="module__header">
                <h2 className="module__title">✨ Configurador de Estilo</h2>
                <p className="module__subtitle">Personaliza el material del vidrio y el acabado de los herrajes. El visualizador 3D se actualiza al instante.</p>
            </div>

            <div className="configurator-layout">
                {/* Panel izquierdo: controles */}
                <div className="configurator-controls">

                    {/* Acabado de herrajes */}
                    <section className="section">
                        <h3 className="section__title">🔩 Acabado de Herrajes</h3>
                        <div className="finish-grid">
                            {FINISHES.map(f => (
                                <button
                                    key={f.id}
                                    className={`finish-card ${state.finish === f.id ? 'finish-card--active' : ''}`}
                                    onClick={() => dispatch({ type: 'SET_FINISH', payload: f.id })}
                                >
                                    <div className="finish-card__swatch" style={{ background: f.color }} />
                                    <span className="finish-card__label">{f.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Lista de herrajes */}
                    <section className="section">
                        <h3 className="section__title">📦 Lista de Herrajes (BOM)</h3>
                        <div className="hardware-list">
                            {state.hardware.map(hw => (
                                <div key={hw.id} className="hardware-item">
                                    <div className="hardware-item__info">
                                        <span className="hardware-item__name">{hw.name}</span>
                                        <span className="hardware-item__qty">× {hw.quantity}</span>
                                    </div>
                                    <span className="hardware-item__price">
                                        ${(hw.unitPrice * hw.quantity).toLocaleString('es-MX')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Resumen de costos */}
                    <section className="section">
                        <h3 className="section__title">💰 Desglose de Costos</h3>
                        <div className="cost-breakdown">
                            <div className="cost-row">
                                <span>Vidrio ({state.metrics.totalArea} m² × ${state.quote.pricePerM2}/m²)</span>
                                <span>${state.quote.glassCost.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="cost-row">
                                <span>Herrajes</span>
                                <span>${state.quote.hardwareCost.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="cost-row">
                                <span>Mano de Obra ({state.quote.breakdown.laborHours}h)</span>
                                <span>${state.quote.laborCost.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="cost-row cost-row--sub">
                                <span>Subtotal</span>
                                <span>${state.quote.subtotal.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="cost-row">
                                <span>IVA (16%)</span>
                                <span>${state.quote.tax.toLocaleString('es-MX')}</span>
                            </div>
                            <div className="cost-row cost-row--total">
                                <span>TOTAL</span>
                                <span>${state.quote.total.toLocaleString('es-MX')}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Panel derecho: 3D */}
                <div className="configurator-3d">
                    <div className="viewer-label">
                        Vista 3D Interactiva
                        <button
                            className="btn-interactive-3d"
                            onClick={() => setIsOpen(!isOpen)}
                            style={{ marginLeft: '12px', background: 'var(--brand-blue)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                            🚀 {isOpen ? 'CERRAR PUERTA' : 'ABRIR PUERTA'}
                        </button>
                    </div>
                    <GlassScene
                        panels={state.metrics.panels}
                        glassType={state.glassType}
                        glassColor={glassColor}
                        glassOpacity={glassOpacity}
                        hardwareColor={state.finish === 'oro' ? '#c8a84b' : state.finish === 'negro' ? '#222' : state.finish === 'satin' ? '#8a8a80' : '#c0c0c0'}
                        hardwareMetalness={metalness}
                        interactive={true}
                        isOpen={isOpen}
                    />
                    <div className="viewer-hint">🖱️ Arrastra para rotar · Rueda para zoom</div>
                </div>
            </div>
        </div>
    );
}
