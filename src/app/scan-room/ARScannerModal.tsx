import { useState, useEffect, useRef } from 'react';
import { GlassScene } from '../../3d-engine/render-glass/GlassScene';
import { calculateGlass, ShowerConfig } from '../../backend/pricing-engine/glassCalculator';

interface DetectionMarker {
    id: number;
    x: number;
    y: number;
    label: string;
}

const TEMPLATES: { id: ShowerConfig; label: string }[] = [
    { id: 'single', label: 'Puerta Sola' },
    { id: 'door-panel', label: 'Puerta + Fijo' },
    { id: 'panel-door', label: 'Fijo + Puerta' },
    { id: 'panel-door-panel', label: 'Fijo + Puerta + Fijo' },
];

export function ARScannerModal({ onComplete, onClose }: { onComplete: (w: number, h: number, config?: ShowerConfig) => void, onClose: () => void }) {
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0); // 0: Intro, 1: Scanning, 2: Analyzing, 3: Done, 4: Explore
    const [markers, setMarkers] = useState<DetectionMarker[]>([]);
    const [progress, setProgress] = useState(0);
    const [activeConfig, setActiveConfig] = useState<ShowerConfig>('single');
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial camera setup
    useEffect(() => {
        let stream: MediaStream | null = null;
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.warn('Cámara no disponible', e);
            }
        }
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Scanning Sequence Logic
    useEffect(() => {
        if (step === 1) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep(2);
                        return 100;
                    }
                    return prev + 1;
                });

                // Spawning simulated detection points
                if (Math.random() > 0.7 && markers.length < 12) {
                    const newMarker = {
                        id: Date.now(),
                        x: 20 + Math.random() * 60,
                        y: 20 + Math.random() * 60,
                        label: ['Pared', 'Piso', 'Esquina', 'Hueco'][Math.floor(Math.random() * 4)]
                    };
                    setMarkers(prev => [...prev, newMarker]);
                }
            }, 50);
            return () => clearInterval(interval);
        }

        if (step === 2) {
            const timer = setTimeout(() => setStep(3), 2000);
            return () => clearTimeout(timer);
        }
    }, [step, markers.length]);

    const handleConfirm = () => {
        // Automatic high-precision mock values
        const mockW = 950;
        const mockH = 1900;
        onComplete(mockW, mockH, activeConfig);
    };

    const metrics = calculateGlass('batiente', 950, 1900, 8, activeConfig);

    return (
        <div className="ar-modal">
            <div className="ar-modal__overlay" onClick={onClose} />
            <div className="ar-modal__content" ref={containerRef}>

                {/* Visual context based on step */}
                {step < 4 ? (
                    <video ref={videoRef} autoPlay playsInline muted className="ar-modal__video" />
                ) : (
                    <div className="ar-sketchup-preview">
                        <GlassScene
                            panels={metrics.panels}
                            glassColor="rgba(200,230,255,0.4)"
                            glassOpacity={0.4}
                            hardwareColor="#334155"
                            hardwareMetalness={0.9}
                            interactive={true}
                            isOpen={false}
                            glassType={activeConfig === 'single' || activeConfig === 'door-panel' || activeConfig === 'panel-door' ? 'batiente' : 'batiente'}
                            showContext={true}
                            showMeasurements={true}
                        />
                        <div className="ar-sketchup-badge">Vista Previa Realista</div>
                    </div>
                )}

                {/* AI / LiDAR Layer (only in scanning phases) */}
                {step < 3 && (
                    <div className="ar-modal__ui">
                        <div className="ar-modal__header">
                            <button className="ar-btn-close" onClick={onClose}>✕</button>
                            <div className="ar-modal__title">
                                {step === 0 && 'Escáner LiDAR de Baño IA'}
                                {step === 1 && `Mapeando Espacio... ${progress}%`}
                                {step === 2 && 'Analizando Geometría...'}
                            </div>
                        </div>

                        {(step === 1 || step === 2) && (
                            <div className="ar-spatial-grid">
                                <div className="ar-grid-lines" />
                            </div>
                        )}

                        {markers.map(m => (
                            <div key={m.id} className="ar-marker" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                                <div className="ar-marker__box" />
                                <div className="ar-marker__label">{m.label}</div>
                            </div>
                        ))}

                        {step === 0 && (
                            <div className="ar-intro-panel">
                                <p>Apunta la cámara a las paredes de la ducha para detectar medidas automáticamente.</p>
                                <button className="ar-btn-primary" onClick={() => setStep(1)}>
                                    Iniciar Escaneo IA
                                </button>
                            </div>
                        )}

                        {step === 1 && <div className="ar-scanning-beam" />}
                    </div>
                )}

                {/* Success and Explorer UI */}
                {(step === 3 || step === 4) && (
                    <div className="ar-modal__ui ar-modal__ui--overlay">
                        <div className="ar-modal__header" style={{ background: step === 4 ? 'rgba(15, 23, 42, 0.8)' : 'transparent', padding: '15px' }}>
                            <button className="ar-btn-close" onClick={onClose} style={{ color: step === 4 ? 'white' : 'var(--text-primary)' }}>✕</button>
                            <div className="ar-modal__title" style={{ color: step === 4 ? 'white' : 'var(--text-primary)', textShadow: step === 4 ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                                {step === 3 ? 'Escaneo Exitoso' : '📏 Explorar Modelos 3D'}
                            </div>
                        </div>

                        {step === 3 && (
                            <div className="ar-results-panel">
                                <div className="ar-results-badge">IA DETECTED</div>
                                <h4 className="ar-results-title">Vano Detectado</h4>
                                <div className="ar-results-grid">
                                    <div className="ar-result-item"><span>Ancho</span><strong>950 mm</strong></div>
                                    <div className="ar-result-item"><span>Alto</span><strong>1900 mm</strong></div>
                                    <div className="ar-result-item"><span>Precisión</span><strong style={{ color: '#10b981' }}>99%</strong></div>
                                </div>
                                <button className="ar-btn-confirm" onClick={() => setStep(4)}>
                                    Ver en Modo SketchUp
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="ar-explorer-panel">
                                <p className="ar-explorer-hint">Toca un modelo para visualizarlo en el espacio:</p>
                                <div className="ar-template-gallery">
                                    {TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            className={`ar-template-card ${activeConfig === t.id ? 'active' : ''}`}
                                            onClick={() => setActiveConfig(t.id)}
                                        >
                                            <div className="ar-template-thumb">
                                                <div className="ar-template-icon-sim">
                                                    <div className="glass-line" />
                                                    {t.id.includes('door') && <div className="door-knob" />}
                                                </div>
                                            </div>
                                            <span>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="ar-explorer-actions">
                                    <button className="ar-btn-confirm" onClick={handleConfirm} style={{ marginTop: 0, background: 'var(--brand-blue)', fontSize: '0.9rem' }}>
                                        Aplicar Modelado al Proyecto
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .ar-sketchup-badge {
                    position: absolute;
                    top: 80px;
                    left: 20px;
                    background: rgba(15, 23, 42, 0.7);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.1);
                    z-index: 10;
                }
                .ar-explorer-hint {
                    color: #64748b;
                    font-size: 0.75rem;
                    margin-bottom: 12px;
                    text-align: center;
                }
                .ar-explorer-panel {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 24px;
                    border-radius: 24px 24px 0 0;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                }
                .ar-template-gallery {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding-bottom: 15px;
                    margin-bottom: 10px;
                    scrollbar-width: none;
                }
                .ar-template-card {
                    flex: 0 0 110px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .ar-template-card.active {
                    background: #f0f9ff;
                    border-color: var(--brand-blue);
                    border-width: 2px;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
                }
                .ar-template-card span {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #1e293b;
                    text-align: center;
                }
                .ar-template-card.active span {
                    color: var(--brand-blue);
                }
                .ar-template-icon-sim {
                    width: 44px;
                    height: 44px;
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ar-template-card.active .ar-template-icon-sim {
                    border-color: var(--brand-blue);
                    background: #e0f2fe;
                }
                .glass-line { width: 80%; height: 2px; background: #94a3b8; border-radius: 1px; }
                .ar-template-card.active .glass-line { background: var(--brand-blue); }
                .door-knob { position: absolute; right: 8px; width: 4px; height: 4px; background: #64748b; border-radius: 50%; }

                /* AI / HUD Styles */
                .ar-spatial-grid { position: absolute; inset: 0; perspective: 1000px; overflow: hidden; pointer-events: none; }
                .ar-grid-lines { width: 200%; height: 200%; background-image: linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px); background-size: 50px 50px; transform: rotateX(60deg) translate(-25%, -25%); animation: grid-move 10s linear infinite; }
                @keyframes grid-move { from { transform: rotateX(60deg) translateY(0); } to { transform: rotateX(60deg) translateY(50px); } }
                .ar-marker { position: absolute; transform: translate(-50%, -50%); transition: all 0.3s ease; }
                .ar-marker__box { width: 20px; height: 20px; border: 1px solid var(--brand-blue); box-shadow: 0 0 10px var(--brand-blue); animation: pulse 1s infinite alternate; }
                .ar-marker__label { font-size: 0.65rem; background: var(--brand-blue); color: white; padding: 1px 4px; position: absolute; top: -15px; left: 0; white-space: nowrap; }
                @keyframes pulse { from { opacity: 0.5; transform: scale(0.9); } to { opacity: 1; transform: scale(1.1); } }
                .ar-scanning-beam { position: absolute; height: 2px; left: 0; right: 0; background: var(--brand-blue); box-shadow: 0 0 20px var(--brand-blue); animation: beam-move 2s linear infinite; z-index: 10; }
                @keyframes beam-move { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } }
                .ar-intro-panel { position: absolute; bottom: 40px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.9); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid var(--panel-border); color: white; }
                .ar-btn-primary { width: 100%; background: var(--brand-blue); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; margin-top: 10px; cursor: pointer; }
                .ar-results-panel { position: absolute; bottom: 40px; left: 20px; right: 20px; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
                .ar-results-badge { display: inline-block; background: #ecfdf5; color: #059669; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px; }
                .ar-btn-confirm { width: 100%; background: var(--brand-orange); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 16px; }
                .ar-results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
                .ar-result-item { display: flex; flex-direction: column; gap: 4px; }
                .ar-result-item span { font-size: 0.6rem; text-transform: uppercase; color: #64748b; font-weight: 700; }
                .ar-result-item strong { font-size: 1rem; color: #0f172a; }
            `}</style>
        </div>
    );
}
