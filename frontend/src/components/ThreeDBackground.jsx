import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles({ count = 200 }) {
  const mesh = useRef();
  const particlesData = useRef([]);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    particlesData.current = [];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      
      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;
      
      particlesData.current.push({
        time: Math.random() * 100,
        factor: 20 + Math.random() * 100,
        speed: 0.01 + Math.random() * 0.02,
        x,
        y,
        z,
      });
    }
    
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current && mesh.current.geometry) {
      const positions = mesh.current.geometry.attributes.position.array;
      particlesData.current.forEach((particle, i) => {
        const i3 = i * 3;
        const t = particle.time += particle.speed;
        const factor = particle.factor;
        
        positions[i3] = particle.x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10;
        positions[i3 + 1] = particle.y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10;
        positions[i3 + 2] = particle.z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10;
      });
      
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={mesh} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ec4899"
        size={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function FloatingHeart({ position, scale = 1 }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      mesh.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
    }
  });

  // Simple heart using torus and spheres
  return (
    <group ref={mesh} position={position} scale={scale}>
      <mesh>
        <torusGeometry args={[0.5, 0.2, 8, 20]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.35, -0.1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.35, -0.1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export default function ThreeDBackground({ particleCount = 200, heartCount = 6 }) {
  const heartPositions = useMemo(() => {
    return Array.from({ length: heartCount }, () => [
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
    ]);
  }, [heartCount]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ec4899" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f43f5e" />
      <FloatingParticles count={particleCount} />
      {heartPositions.map((pos, i) => (
        <FloatingHeart key={i} position={pos} scale={0.5 + Math.random() * 0.5} />
      ))}
    </>
  );
}
