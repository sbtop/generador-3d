import { useState } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import { useProject } from '../../store/projectStore';

export function RoomDesigner2D() {
    const { state } = useProject();
    const { vanoWidth } = state;

    // Viewport and room scale
    const PADDING = 40;
    const STAGE_W = 500;
    const STAGE_H = 400;

    // Default room 60x36 inches
    const roomW_in = 60;
    const roomD_in = 36;

    // Scale factor (pixels per inch)
    const scale = (STAGE_W - PADDING * 2) / roomW_in;

    // Glass position in the "Vano" (opening)
    const [glassX, setGlassX] = useState(roomW_in / 2); // default center

    const mmToIn = (mm: number) => mm / 25.4;
    const inToPixels = (inch: number) => inch * scale;

    const currentVanoW_in = mmToIn(vanoWidth);

    const handleDragGlass = (e: any) => {
        const x = e.target.x() / scale;
        // Constrain within the room walls
        const constrainedX = Math.max(0, Math.min(roomW_in - currentVanoW_in, x));
        setGlassX(constrainedX);
    };

    return (
        <div className="section" style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="section__title" style={{ color: 'white' }}>🛠️ Diseñador 2D (Concepto de Planta)</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px' }}>
                Vista superior del baño. Arrastra el bloque azul para posicionar la cancelería en el muro.
            </p>

            <div style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden', cursor: 'crosshair', display: 'flex', justifyContent: 'center' }}>
                <Stage width={STAGE_W} height={STAGE_H}>
                    <Layer>
                        {/* Paredes de la habitación (Líneas) */}
                        <Group x={PADDING} y={PADDING}>
                            {/* Trasera */}
                            <Line
                                points={[0, 0, inToPixels(roomW_in), 0]}
                                stroke="#475569" strokeWidth={4}
                            />
                            {/* Izquierda */}
                            <Line
                                points={[0, 0, 0, inToPixels(roomD_in)]}
                                stroke="#475569" strokeWidth={4}
                            />
                            {/* Derecha */}
                            <Line
                                points={[inToPixels(roomW_in), 0, inToPixels(roomW_in), inToPixels(roomD_in)]}
                                stroke="#475569" strokeWidth={4}
                            />
                            {/* Frontal (Entrada) */}
                            <Line
                                points={[0, inToPixels(roomD_in), inToPixels(roomW_in), inToPixels(roomD_in)]}
                                stroke="#1e3a8a" strokeWidth={2} dash={[10, 5]}
                            />

                            {/* El Cristal (Vano) */}
                            <Group
                                x={inToPixels(glassX)}
                                y={inToPixels(roomD_in) - 5}
                                draggable
                                onDragMove={handleDragGlass}
                            >
                                <Rect
                                    width={inToPixels(currentVanoW_in)}
                                    height={10}
                                    fill="rgba(59, 130, 246, 0.6)"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    cornerRadius={2}
                                />
                                <Text
                                    text={`Cancelería (${vanoWidth}mm)`}
                                    y={-20}
                                    width={inToPixels(currentVanoW_in)}
                                    align="center"
                                    fill="white"
                                    fontSize={12}
                                    fontStyle="bold"
                                />
                            </Group>

                            {/* Etiquetas de pared */}
                            <Text text={`${roomW_in}"`} x={inToPixels(roomW_in) / 2} y={-25} fill="#64748b" />
                            <Text text={`${roomD_in}"`} x={-35} y={inToPixels(roomD_in) / 2} fill="#64748b" rotation={-90} />
                        </Group>
                    </Layer>
                </Stage>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px', flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', display: 'block' }}>Estructura JSON (Exportable)</span>
                    <pre style={{ fontSize: '0.7rem', margin: '5px 0', color: '#cbd5e1' }}>
                        {JSON.stringify({
                            room: { width: roomW_in, depth: roomD_in, height: 84 },
                            glass: [{ type: state.showerConfig, width: vanoWidth, x: Math.round(glassX) }]
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
