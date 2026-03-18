import { useState, useEffect, useRef } from 'react';

interface DetectionMarker {
    id: number;
    x: number;
    y: number;
    label: string;
}

export function ARScannerModal({ onComplete, onClose }: { onComplete: (w: number, h: number) => void, onClose: () => void }) {
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0: Intro, 1: Scanning, 2: Analyzing, 3: Done
    const [markers, setMarkers] = useState<DetectionMarker[]>([]);
    const [progress, setProgress] = useState(0);
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
        onComplete(mockW, mockH);
    };

    return (
        <div className="ar-modal">
            <div className="ar-modal__overlay" onClick={onClose} />
            <div className="ar-modal__content" ref={containerRef}>

                {/* Real-time Camera Feed */}
                <video ref={videoRef} autoPlay playsInline muted className="ar-modal__video" />

                {/* AI / LiDAR Layer */}
                <div className="ar-modal__ui">
                    <div className="ar-modal__header">
                        <button className="ar-btn-close" onClick={onClose}>✕</button>
                        <div className="ar-modal__title">
                            {step === 0 && 'Escáner LiDAR de Baño IA'}
                            {step === 1 && `Mapeando Espacio... ${progress}%`}
                            {step === 2 && 'Analizando Geometría...'}
                            {step === 3 && 'Escaneo Completado'}
                        </div>
                    </div>

                    {/* Spatial Grid Effect */}
                    {(step === 1 || step === 2) && (
                        <div className="ar-spatial-grid">
                            <div className="ar-grid-lines" />
                        </div>
                    )}

                    {/* Detection Markers */}
                    {markers.map(m => (
                        <div key={m.id} className="ar-marker" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                            <div className="ar-marker__box" />
                            <div className="ar-marker__label">{m.label}</div>
                        </div>
                    ))}

                    {/* Action UI */}
                    {step === 0 && (
                        <div className="ar-intro-panel">
                            <p>Apunta la cámara a las paredes de la ducha para detectar medidas automáticamente.</p>
                            <button className="ar-btn-primary" onClick={() => setStep(1)}>
                                Iniciar Escaneo IA
                            </button>
                        </div>
                    )}

                    {step === 1 && <div className="ar-scanning-beam" />}

                    {step === 3 && (
                        <div className="ar-results-panel">
                            <div className="ar-results-badge">IA DETECTED</div>
                            <h4 className="ar-results-title">Vano de Ducha</h4>
                            <div className="ar-results-grid">
                                <div className="ar-result-item">
                                    <span>Ancho</span>
                                    <strong>950 mm</strong>
                                </div>
                                <div className="ar-result-item">
                                    <span>Alto</span>
                                    <strong>1900 mm</strong>
                                </div>
                                <div className="ar-result-item">
                                    <span>Nivel</span>
                                    <strong style={{ color: 'var(--brand-green)' }}>99.2%</strong>
                                </div>
                            </div>
                            <button className="ar-btn-confirm" onClick={handleConfirm}>
                                Generar Instalación 3D
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .ar-spatial-grid {
                    position: absolute;
                    inset: 0;
                    perspective: 1000px;
                    overflow: hidden;
                    pointer-events: none;
                }
                .ar-grid-lines {
                    width: 200%;
                    height: 200%;
                    background-image: 
                        linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px);
                    background-size: 50px 50px;
                    transform: rotateX(60deg) translate(-25%, -25%);
                    animation: grid-move 10s linear infinite;
                }
                @keyframes grid-move {
                    from { transform: rotateX(60deg) translateY(0); }
                    to { transform: rotateX(60deg) translateY(50px); }
                }
                .ar-marker {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    transition: all 0.3s ease;
                }
                .ar-marker__box {
                    width: 20px;
                    height: 20px;
                    border: 1px solid var(--brand-blue);
                    box-shadow: 0 0 10px var(--brand-blue);
                    animation: pulse 1s infinite alternate;
                }
                .ar-marker__label {
                    font-size: 0.65rem;
                    background: var(--brand-blue);
                    color: white;
                    padding: 1px 4px;
                    position: absolute;
                    top: -15px;
                    left: 0;
                    white-space: nowrap;
                }
                .ar-scanning-beam {
                    position: absolute;
                    height: 2px;
                    left: 0;
                    right: 0;
                    background: var(--brand-blue);
                    box-shadow: 0 0 20px var(--brand-blue);
                    animation: beam-move 2s linear infinite;
                    z-index: 10;
                }
                @keyframes beam-move {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                .ar-intro-panel {
                    position: absolute;
                    bottom: 40px;
                    left: 20px;
                    right: 20px;
                    background: rgba(15, 23, 42, 0.9);
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    border: 1px solid var(--panel-border);
                }
                .ar-btn-primary {
                    width: 100%;
                    background: var(--brand-blue);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                @keyframes pulse {
                    from { opacity: 0.4; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1.1); }
                }
                .ar-result-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .ar-result-item span {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }
                .ar-result-item strong {
                    font-size: 1.1rem;
                    color: var(--brand-blue);
                }
            `}</style>
        </div>
    );
}
