import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

function ProfileCard3D({ imageUrl, name, age, city, onHover, onClick }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = hovered 
        ? Math.sin(state.clock.elapsedTime) * 0.1 
        : Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      mesh.current.position.y = hovered 
        ? Math.sin(state.clock.elapsedTime * 2) * 0.1 
        : Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onHover) onHover(true);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    if (onHover) onHover(false);
  };

  return (
    <group
      ref={mesh}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={onClick}
      scale={hovered ? 1.1 : 1}
    >
      {/* Card base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 4, 0.1]} />
        <MeshDistortMaterial
          color="#ffffff"
          distort={hovered ? 0.1 : 0}
          speed={hovered ? 2 : 0}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      
      {/* Profile image placeholder */}
      <mesh position={[0, 0.8, 0.06]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      
      {/* Name text */}
      <Text
        position={[0, -0.8, 0.06]}
        fontSize={0.3}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      
      {/* Age and city */}
      <Text
        position={[0, -1.2, 0.06]}
        fontSize={0.2}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
      >
        {age} • {city}
      </Text>
      
      {/* Glow effect when hovered */}
      {hovered && (
        <pointLight position={[0, 0, 1]} intensity={1} color="#ec4899" />
      )}
    </group>
  );
}

export default ProfileCard3D;
