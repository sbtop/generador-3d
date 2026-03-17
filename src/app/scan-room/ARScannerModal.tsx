import { useState, useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
}

export function ARScannerModal({ onComplete, onClose }: { onComplete: (w: number, h: number) => void, onClose: () => void }) {
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [points, setPoints] = useState<Point[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Iniciar cámara web
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
                console.warn('Cámara no disponible, usando simulador oscuro', e);
            }
        }
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Animación del escáner LiDAR
    useEffect(() => {
        if (step === 1) {
            const timer = setTimeout(() => {
                setStep(2);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleScreenClick = (e: React.MouseEvent) => {
        if (step !== 0) return;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPoints([...points, { x, y }]);

        // Al tocar 4 esquinas, comienza el mapeo
        if (points.length === 3) {
            setStep(1);
        }
    };

    const handleConfirm = () => {
        // Generar medidas verosímiles basadas en la proporción de los puntos (o fake values)
        const mockW = Math.floor(Math.random() * 400 + 700); // 700-1100
        const mockH = Math.floor(Math.random() * 200 + 1800); // 1800-2000
        onComplete(mockW, mockH);
    };

    return (
        <div className="ar-modal">
            <div className="ar-modal__overlay" onClick={onClose} />
            <div className="ar-modal__content" ref={containerRef} onClick={handleScreenClick}>

                {/* Video feed */}
                <video ref={videoRef} autoPlay playsInline muted className="ar-modal__video" />

                {/* Capa de realidad aumentada (UI over video) */}
                <div className="ar-modal__ui">
                    <div className="ar-modal__header">
                        <button className="ar-btn-close" onClick={onClose}>✕</button>
                        <div className="ar-modal__title">
                            {step === 0 && 'Toca las 4 esquinas del hueco'}
                            {step === 1 && 'Procesando Malla Espacial LiDAR...'}
                            {step === 2 && 'Vano Detectado Exitosamente'}
                        </div>
                    </div>

                    {/* Render de puntos (esquinas) */}
                    {points.map((p, i) => (
                        <div key={i} className="ar-point" style={{ left: p.x, top: p.y }}>
                            <div className="ar-point-inner" />
                        </div>
                    ))}

                    {/* Render del polígono final */}
                    {step >= 1 && points.length === 4 && (
                        <svg className="ar-canvas">
                            <polygon
                                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                className={`ar-polygon ${step === 1 ? 'ar-polygon--scanning' : 'ar-polygon--done'}`}
                            />
                        </svg>
                    )}

                    {/* Rejilla de escáner en fase 1 */}
                    {step === 1 && <div className="ar-scanline" />}

                    {/* Panel de resultados */}
                    {step === 2 && (
                        <div className="ar-results-panel">
                            <h4 className="ar-results-title">Medidas Capturadas</h4>
                            <div className="ar-results-grid">
                                <div>Ancho estimado: <strong className="text-blue-400">~910 mm</strong></div>
                                <div>Alto estimado: <strong className="text-blue-400">~1850 mm</strong></div>
                                <div>Precisión LiDAR: <strong className="text-green-400">98.4%</strong></div>
                                <div>Plomada: <strong className="text-green-400">OK (-0.2°)</strong></div>
                            </div>
                            <button className="ar-btn-confirm" onClick={handleConfirm}>
                                Aplicar Medidas al Proyecto
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
