import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, ContactShadows, Environment, Grid } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { GlassPanel } from '../../backend/pricing-engine/glassCalculator';
import { GlassType } from '../../backend/pricing-engine/glassCalculator';

interface GlassSceneProps {
    panels: GlassPanel[];
    glassColor: string;
    glassOpacity: number;
    hardwareColor: string;
    hardwareMetalness: number;
    interactive?: boolean;
    isOpen?: boolean;
    glassType?: GlassType;
    showContext?: boolean;
    showMeasurements?: boolean;
}

interface PanelMeshProps {
    panel: GlassPanel;
    offsetX: number;
    glassColor: string;
    glassOpacity: number;
    hardwareColor: string;
    hardwareMetalness: number;
    isMovable: boolean;
    isOpen: boolean;
    glassType: GlassType;
    showMeasurements: boolean;
}

function BathroomEnvironment({ width }: { width: number }) {
    return (
        <group position-y={0}>
            {/* Piso con textura suave */}
            <mesh rotation-x={-Math.PI / 2} receiveShadow position-y={-0.001}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.9} metalness={0.1} />
            </mesh>

            {/* Pared Trasera (Hueco) */}
            <mesh position={[0, 1.5, -0.05]} receiveShadow>
                <boxGeometry args={[width + 4, 3, 0.1]} />
                <meshStandardMaterial color="#f1f5f9" roughness={1} />
            </mesh>

            {/* Mocheta Izquierda */}
            <mesh position={[-width / 2 - 0.55, 1.5, 0.5]} receiveShadow>
                <boxGeometry args={[1, 3, 1.2]} />
                <meshStandardMaterial color="#e2e8f0" />
            </mesh>

            {/* Mocheta Derecha */}
            <mesh position={[width / 2 + 0.55, 1.5, 0.5]} receiveShadow>
                <boxGeometry args={[1, 3, 1.2]} />
                <meshStandardMaterial color="#e2e8f0" />
            </mesh>

            {/* Techo */}
            <mesh position={[0, 3, 0.5]} receiveShadow>
                <boxGeometry args={[width + 4, 0.1, 1.2]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
        </group>
    );
}

function PanelMesh({ panel, offsetX, glassColor, glassOpacity, hardwareColor, hardwareMetalness, isMovable, isOpen, glassType, showMeasurements }: PanelMeshProps) {
    const w = panel.glassWidth / 1000;
    const h = panel.glassHeight / 1000;
    const t = 0.01;

    // Lógica de animación reactiva al prop "isOpen"
    const { rotationY, positionX } = useSpring({
        rotationY: isMovable && glassType === 'batiente' && isOpen ? Math.PI / 2.2 : 0,
        positionX: isMovable && glassType === 'corrediza' && isOpen ? offsetX - w * 0.95 : offsetX,
        config: { mass: 2, tension: 170, friction: 26 }
    });

    return (
        <animated.group
            position-x={glassType === 'batiente' && isMovable ? offsetX + w / 2 : positionX}
            position-y={h / 2}
            position-z={glassType === 'corrediza' && isMovable ? 0.05 : 0} // panel móvil ligeramente adelante en corrediza
            rotation-y={rotationY}
        >
            <group position-x={glassType === 'batiente' && isMovable ? -w / 2 : 0}>

                {/* Cuerpo del vidrio */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[w, h, t]} />
                    <meshPhysicalMaterial
                        color={glassColor}
                        transparent
                        opacity={glassOpacity}
                        roughness={0.05}
                        metalness={0.15}
                        transmission={0.92}
                        thickness={1.5}
                        envMapIntensity={1.5}
                        ior={1.52}
                    />
                </mesh>

                <mesh>
                    <boxGeometry args={[w + 0.002, h + 0.002, t + 0.001]} />
                    <meshBasicMaterial color="#38bdf8" wireframe opacity={0.1} transparent />
                </mesh>

                {showMeasurements && (
                    <>
                        <Text
                            position={[0, h / 2 + 0.09, 0]}
                            fontSize={0.07}
                            color="#38bdf8"
                            anchorX="center"
                            anchorY="bottom"
                            fontWeight={700}
                        >
                            {panel.glassWidth}mm
                        </Text>

                        <Text
                            position={[w / 2 + 0.09, 0, 0]}
                            fontSize={0.07}
                            color="#38bdf8"
                            rotation={[0, 0, -Math.PI / 2]}
                            anchorX="center"
                            anchorY="middle"
                            fontWeight={700}
                        >
                            {panel.glassHeight}mm
                        </Text>
                    </>
                )}

                {/* Herrajes */}
                {panel.barrenos
                    .filter((b: any) => b.description.toLowerCase().includes('bisagra'))
                    .map((b: any, i: number) => (
                        <mesh key={i} position={[-w / 2 - 0.015, b.y / 1000 - h / 2, 0.025]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.06, 12]} />
                            <meshStandardMaterial color={hardwareColor} metalness={hardwareMetalness} roughness={0.1} />
                        </mesh>
                    ))
                }

                {panel.barrenos
                    .filter((b: any) => b.description.toLowerCase().includes('jalón') || b.description.toLowerCase().includes('tirador'))
                    .map((b: any, i: number) => (
                        <mesh key={i} position={[b.x / 1000 - w / 2, b.y / 1000 - h / 2, t / 2 + 0.015]}>
                            <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
                            <meshStandardMaterial color={hardwareColor} metalness={hardwareMetalness} roughness={0.05} />
                        </mesh>
                    ))
                }

                {panel.barrenos
                    .filter((b: any) => b.description.toLowerCase().includes('clip'))
                    .map((b: any, i: number) => (
                        <mesh key={i} position={[b.x / 1000 - w / 2, b.y / 1000 - h / 2, 0]}>
                            <boxGeometry args={[0.04, 0.02, 0.04]} />
                            <meshStandardMaterial color={hardwareColor} metalness={hardwareMetalness} roughness={0.2} />
                        </mesh>
                    ))
                }

            </group>
        </animated.group>
    );
}

export function GlassScene({
    panels,
    glassColor,
    glassOpacity,
    hardwareColor,
    hardwareMetalness,
    interactive = false,
    isOpen = false,
    glassType = 'batiente',
    showContext = false,
    showMeasurements = true
}: GlassSceneProps) {
    // En corredizas, el primer panel es fijo, el segundo (si hay) móvil.
    // Para batientes, buscamos el que diga "Puerta" en el label
    const isMovableIndex = (mode: GlassType, index: number, label: string) => {
        if (mode === 'corrediza') return index === 1;
        if (mode === 'batiente') return label.toLowerCase().includes('puerta');
        return false;
    };

    const totalW = panels.reduce((sum, p) => sum + p.glassWidth / 1000, 0) + (panels.length - 1) * 0.005;

    // Función para calcular el desplazamiento acumulado de cada panel
    const getPanelOffset = (index: number) => {
        let offset = -totalW / 2;
        for (let i = 0; i < index; i++) {
            offset += panels[i].glassWidth / 1000 + 0.005;
        }
        return offset + (panels[index].glassWidth / 1000) / 2;
    };

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '420px', background: 'transparent', borderRadius: '12px', overflow: 'hidden', border: showContext ? '1px solid var(--panel-border)' : 'none' }}>
            <Canvas shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
                <PerspectiveCamera makeDefault position={showContext ? [1.5, 1.8, 3.5] : [0, 0.8, 4.2]} fov={showContext ? 45 : 35} />
                <OrbitControls
                    makeDefault
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.8}
                    minDistance={1.2}
                    maxDistance={10}
                    enablePan={showContext}
                    target={[0, showContext ? 1.2 : 0.8, 0]}
                />

                <ambientLight intensity={showContext ? 0.8 : 0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />

                {showContext && <BathroomEnvironment width={totalW} />}

                {panels.map((panel, i) => (
                    <PanelMesh
                        key={i}
                        panel={panel}
                        offsetX={getPanelOffset(i)}
                        glassColor={glassColor}
                        glassOpacity={glassOpacity}
                        hardwareColor={hardwareColor}
                        hardwareMetalness={hardwareMetalness}
                        isMovable={interactive && isMovableIndex(glassType, i, panel.label)}
                        isOpen={isOpen}
                        glassType={glassType}
                        showMeasurements={showMeasurements}
                    />
                ))}

                <ContactShadows resolution={1024} scale={10} blur={2.5} opacity={0.6} far={5} color="#000000" />
                {!showContext && <Grid args={[12, 12]} position={[0, 0, 0]} cellColor="#1e3a5f" sectionColor="#162535" fadeDistance={10} fadeStrength={1} />}
                <Environment preset="apartment" />
            </Canvas>
        </div>
    );
}
