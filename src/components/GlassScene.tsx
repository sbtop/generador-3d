import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

interface GlassPaneProps {
    width: number;
    height: number;
    thickness: number;
}

const GlassPane = ({ width, height, thickness }: GlassPaneProps) => {
    // Convert mm to meters for Three.js units
    const w = width / 1000;
    const h = height / 1000;
    const t = thickness / 1000;

    return (
        <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, t]} />
            <meshPhysicalMaterial
                transmission={0.9}
                thickness={0.5}
                roughness={0.1}
                color="#a5f3fc"
                transparent
                opacity={0.3}
            />
        </mesh>
    );
};

export const Scene = ({ dimensions }: { dimensions: any }) => (
    <div style={{ height: '400px', background: '#0f172a', borderRadius: '12px', overflow: 'hidden', margin: '1rem 0' }}>
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 1, 3]} />
            <OrbitControls />
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <GlassPane
                width={dimensions.glassWidth}
                height={dimensions.glassHeight}
                thickness={10}
            />
            <gridHelper args={[10, 10, '#1e293b', '#0f172a']} />
        </Canvas>
    </div>
);
