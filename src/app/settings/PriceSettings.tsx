import { useState, useEffect } from 'react';
import { useProject } from '../../store/projectStore';

export function PriceSettings() {
    const { dispatch } = useProject();

    // Estado local para los inputs del formulario
    const [prices, setPrices] = useState({
        glassClear: 0,
        glassExtra: 0,
        glassColor: 0,
        hwBisagra: 0,
        hwJalon: 0,
        hwRiel: 0,
        hwClip: 0,
        hwSellador: 0,
        installationBase: 0,
        profitMargin: 0,
    });

    const [saved, setSaved] = useState(false);

    // Al montar (y cuando el store cambie, aunque aquí no está conectado al store global aún), inicializamos.
    // Como el usuario pidió que sean editables en tiempo real, los cargaremos de localStorage por ahora,
    // o del estado global si lo unimos al projectStore.
    useEffect(() => {
        const stored = localStorage.getItem('glasspro_pricing');
        if (stored) {
            setPrices(JSON.parse(stored));
        } else {
            // Valores por defecto
            setPrices({
                glassClear: 450,
                glassExtra: 750,
                glassColor: 550,
                hwBisagra: 250,
                hwJalon: 180,
                hwRiel: 650,
                hwClip: 80,
                hwSellador: 85,
                installationBase: 1500,
                profitMargin: 35, // Porcentaje
            });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPrices(prev => ({ ...prev, [name]: Number(value) }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('glasspro_pricing', JSON.stringify(prices));
        setSaved(true);
        // Despachamos al store para re-cotizar el proyecto en curso
        dispatch({ type: 'UPDATE_PRICING_CONFIG', payload: prices });
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="module module-settings">
            <div className="module__header">
                <h2 className="module__title">⚙️ Configuración de Precios</h2>
                <p className="module__subtitle">Ajusta los costos base para calcular cotizaciones precisas.</p>
            </div>

            <div className="module__body" style={{ display: 'grid', gap: '2rem' }}>
                <section className="section form-section">
                    <h3 className="section__title">💎 Vidrio Templado (Costo m²)</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Cristal Claro (10mm base)</label>
                            <input type="number" name="glassClear" className="input-field-text" value={prices.glassClear} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Cristal Extra-Claro</label>
                            <input type="number" name="glassExtra" className="input-field-text" value={prices.glassExtra} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Cristal de Color (Gris/Bronce)</label>
                            <input type="number" name="glassColor" className="input-field-text" value={prices.glassColor} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="section form-section">
                    <h3 className="section__title">🔩 Herrajes (Costo Unitario Base)</h3>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="input-group">
                            <label className="input-label">Bisagra de Vidrio</label>
                            <input type="number" name="hwBisagra" className="input-field-text" value={prices.hwBisagra} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Jalón / Tirador</label>
                            <input type="number" name="hwJalon" className="input-field-text" value={prices.hwJalon} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Riel Corredizo</label>
                            <input type="number" name="hwRiel" className="input-field-text" value={prices.hwRiel} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Clip Fijo</label>
                            <input type="number" name="hwClip" className="input-field-text" value={prices.hwClip} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Tubo Sellador</label>
                            <input type="number" name="hwSellador" className="input-field-text" value={prices.hwSellador} onChange={handleChange} />
                        </div>
                    </div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        * Estos son precios base. Los acabados Premium (Negro, Oro) añadirán automáticamente un recargo sobre este precio en la cotización.
                    </p>
                </section>

                <section className="section form-section">
                    <h3 className="section__title">👷‍♂️ Variables Operativas</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Instalación Base (Flete + Mano de Obra)</label>
                            <input type="number" name="installationBase" className="input-field-text" value={prices.installationBase} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Margen de Ganancia (%)</label>
                            <input type="number" name="profitMargin" className="input-field-text" value={prices.profitMargin} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <div className="form-actions" style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
                    <button className="btn-primary" onClick={handleSave}>Guardar Configuración</button>
                    {saved && <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>✅ Guardado con éxito</span>}
                </div>
            </div>
        </div>
    );
}
