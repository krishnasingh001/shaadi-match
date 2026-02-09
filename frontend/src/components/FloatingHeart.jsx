import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

function HeartShape() {
  const heartRef = useRef();
  
  useFrame((state) => {
    if (heartRef.current) {
      heartRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
      heartRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
      heartRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
      heartRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  // Create heart using torus and spheres
  return (
    <group ref={heartRef}>
      {/* Main heart body */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.6, 0.25, 8, 20]} />
        <MeshDistortMaterial
          color="#ec4899"
          distort={0.2}
          speed={1.5}
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>
      {/* Left sphere */}
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <MeshDistortMaterial
          color="#ec4899"
          distort={0.2}
          speed={1.5}
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>
      {/* Right sphere */}
      <mesh position={[0.4, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <MeshDistortMaterial
          color="#ec4899"
          distort={0.2}
          speed={1.5}
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>
      <pointLight position={[0, 0, 2]} intensity={1.2} color="#ec4899" />
      <pointLight position={[0, 0, -2]} intensity={0.5} color="#f43f5e" />
    </group>
  );
}

export default function FloatingHeart() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <HeartShape />
    </>
  );
}
