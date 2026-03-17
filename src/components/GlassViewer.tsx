import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface GlassViewerProps {
    width: number;  // mm
    height: number; // mm
    thickness: number; // mm
}

const GlassSheet = ({ width, height, thickness }: GlassViewerProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Convert mm to meters for 3D scale (1000mm = 1 unit)
    const scaleW = width / 1000;
    const scaleH = height / 1000;
    const scaleT = thickness / 1000;

    return (
        <group>
            {/* Main Glass Mesh */}
            <mesh ref={meshRef} position={[0, scaleH / 2, 0]}>
                <boxGeometry args={[scaleW, scaleH, scaleT]} />
                <meshPhysicalMaterial
                    transparent
                    opacity={0.4}
                    roughness={0}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={0.5}
                    color="#a5f3fc" // Cyan-50 glass color
                    envMapIntensity={1}
                />
            </mesh>

            {/* Edges highlighting */}
            <mesh position={[0, scaleH / 2, 0]}>
                <boxGeometry args={[scaleW + 0.005, scaleH + 0.005, scaleT + 0.002]} />
                <meshBasicMaterial color="#22d3ee" wireframe opacity={0.2} transparent />
            </mesh>

            {/* Dimension Labels */}
            <Text
                position={[0, scaleH + 0.1, 0]}
                fontSize={0.1}
                color="#22d3ee"
                anchorX="center"
                anchorY="bottom"
            >
                {width}mm
            </Text>

            <Text
                position={[scaleW / 2 + 0.1, scaleH / 2, 0]}
                fontSize={0.1}
                color="#22d3ee"
                rotation={[0, 0, -Math.PI / 2]}
                anchorX="center"
                anchorY="middle"
            >
                {height}mm
            </Text>

            {/* Herraje Mockups (simplified as small dark cubes) */}
            <mesh position={[-scaleW / 2, scaleH * 0.2, 0]}>
                <boxGeometry args={[0.05, 0.1, 0.06]} />
                <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-scaleW / 2, scaleH * 0.8, 0]}>
                <boxGeometry args={[0.05, 0.1, 0.06]} />
                <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
};

export const GlassViewer: React.FC<GlassViewerProps> = (props) => {
    return (
        <div style={{ width: '100%', height: '500px', background: '#0f172a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[2, 2, 4]} fov={50} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} />

                <GlassSheet {...props} />

                <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.4} far={1} color="#000000" />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
