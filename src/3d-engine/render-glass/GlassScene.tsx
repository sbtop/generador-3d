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
}

function PanelMesh({ panel, offsetX, glassColor, glassOpacity, hardwareColor, hardwareMetalness, isMovable, isOpen, glassType }: PanelMeshProps) {
    const w = panel.glassWidth / 1000;
    const h = panel.glassHeight / 1000;
    const t = 0.01;

    // Lógica de animación reactiva al prop "isOpen"
    const { rotationY, positionX } = useSpring({
        rotationY: isMovable && glassType === 'batiente' && isOpen ? -Math.PI / 2.2 : 0,
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
                        metalness={0.05}
                        transmission={0.88}
                        thickness={1.2}
                        envMapIntensity={1.2}
                        ior={1.5}
                    />
                </mesh>

                <mesh>
                    <boxGeometry args={[w + 0.004, h + 0.004, t + 0.002]} />
                    <meshBasicMaterial color="#22d3ee" wireframe opacity={0.12} transparent />
                </mesh>

                <Text
                    position={[0, h / 2 + 0.09, 0]}
                    fontSize={0.07}
                    color="#22d3ee"
                    anchorX="center"
                    anchorY="bottom"
                    fontWeight={700}
                >
                    {panel.glassWidth}mm
                </Text>

                <Text
                    position={[w / 2 + 0.09, 0, 0]}
                    fontSize={0.07}
                    color="#22d3ee"
                    rotation={[0, 0, -Math.PI / 2]}
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                >
                    {panel.glassHeight}mm
                </Text>

                {/* Herrajes */}
                {panel.barrenos
                    .filter((b: any) => b.description.toLowerCase().includes('bisagra'))
                    .map((b: any, i: number) => (
                        <mesh key={i} position={[-w / 2 - 0.025, b.y / 1000 - h / 2, 0]}>
                            <cylinderGeometry args={[0.012, 0.012, 0.08, 12]} />
                            <meshStandardMaterial color={hardwareColor} metalness={hardwareMetalness} roughness={0.15} />
                        </mesh>
                    ))
                }

                {panel.barrenos
                    .filter((b: any) => b.description.toLowerCase().includes('jalón') || b.description.toLowerCase().includes('tirador'))
                    .map((b: any, i: number) => (
                        <mesh key={i} position={[b.x / 1000 - w / 2, b.y / 1000 - h / 2, t / 2 + 0.015]}>
                            <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
                            <meshStandardMaterial color={hardwareColor} metalness={hardwareMetalness} roughness={0.12} />
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

export function GlassScene({ panels, glassColor, glassOpacity, hardwareColor, hardwareMetalness, interactive = false, isOpen = false, glassType = 'batiente' }: GlassSceneProps) {
    const spacing = panels.length > 1
        ? (panels[0].glassWidth / 1000) * (glassType === 'corrediza' ? 0 : 0.52)
        : 0;
    const totalW = panels.length * (panels[0].glassWidth / 1000) + (panels.length - 1) * 0.01;
    const startX = -totalW / 2 + panels[0].glassWidth / 1000 / 2;

    // En corredizas, el primer panel es fijo, el segundo (si hay) móvil.
    // En batientes de una hoja, la única es móvil (índice 0).
    const isMovableIndex = (mode: GlassType, index: number) => {
        if (mode === 'corrediza') return index === 1; // La segunda hoja es la que desliza
        if (mode === 'batiente') return index === 0; // Puerta batiente
        return false; // ventana 
    };

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '420px', background: 'transparent', borderRadius: '12px', overflow: 'hidden' }}>
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[0, 1.2, 4.0]} fov={35} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} minDistance={1.8} maxDistance={6} enablePan={false} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
                <pointLight position={[-4, 4, 4]} intensity={0.8} color="#60a5fa" />
                <pointLight position={[4, 2, -4]} intensity={0.5} color="#a78bfa" />
                <spotLight position={[0, 8, 0]} angle={0.4} penumbra={0.5} intensity={0.8} castShadow color="#ffffff" />

                {panels.map((panel, i) => (
                    <PanelMesh
                        key={panel.label}
                        panel={panel}
                        offsetX={startX + i * spacing}
                        glassColor={glassColor}
                        glassOpacity={glassOpacity}
                        hardwareColor={hardwareColor}
                        hardwareMetalness={hardwareMetalness}
                        isMovable={interactive && isMovableIndex(glassType, i)}
                        isOpen={isOpen}
                        glassType={glassType}
                    />
                ))}

                <ContactShadows resolution={1024} scale={6} blur={2.5} opacity={0.5} far={2} color="#000000" />
                <Grid args={[12, 12]} position={[0, 0, 0]} cellColor="#1e3a5f" sectionColor="#162535" fadeDistance={10} fadeStrength={1} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
