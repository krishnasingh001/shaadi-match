import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Fallback: Create a smooth human-like avatar using advanced geometries
function SmoothHumanAvatar({ position, isLeft = true, animationPhase, isFemale = false }) {
  const group = useRef();
  const startXRef = useRef(isLeft ? -8 : 8);
  
  // Colors
  const skinColor = isFemale ? '#fdbcb4' : '#d4a574';
  const hairColor = isFemale ? '#8b4513' : '#2c1810';
  const clothingColor = isFemale ? '#ec4899' : '#6366f1';
  
  useFrame((state) => {
    if (!group.current) return;
    
    const time = state.clock.elapsedTime;
    
    if (animationPhase === 'approaching') {
      const progress = Math.min(time * 0.35, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const targetX = isLeft ? -1.2 : 1.2;
      group.current.position.x = startXRef.current + (targetX - startXRef.current) * easedProgress;
      group.current.position.y = Math.sin(time * 5) * 0.05;
    } else if (animationPhase === 'hugging' || animationPhase === 'heart-popping' || animationPhase === 'heart-floating') {
      const targetX = isLeft ? -0.8 : 0.8;
      group.current.position.x = targetX;
      group.current.position.y = Math.sin(time * 0.6) * 0.02;
      group.current.rotation.y = isLeft ? Math.PI * 0.15 : -Math.PI * 0.15;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Head - Smooth sphere */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Hair */}
      {isFemale ? (
        <mesh position={[0, 1.75, -0.1]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial 
            color={hairColor} 
            roughness={0.8}
          />
        </mesh>
      ) : (
        <mesh position={[0, 1.7, 0]}>
          <boxGeometry args={[0.5, 0.25, 0.3]} />
          <meshStandardMaterial 
            color={hairColor} 
            roughness={0.8}
          />
        </mesh>
      )}
      
      {/* Eyes */}
      <mesh position={[-0.12, 1.65, 0.32]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.12, 1.65, 0.32]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.12, 1.65, 0.34]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.12, 1.65, 0.34]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Body - Smooth cylinder shape */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.7, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Arms - Smooth cylinders */}
      <mesh position={[-0.5, 0.95, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.5, 0.95, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
        />
      </mesh>
      
      {/* Feet */}
      <mesh position={[-0.15, -0.5, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.15]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, -0.5, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.15]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Main component that tries to load GLTF, falls back to smooth geometry
export default function HumanAvatar({ 
  modelUrl, 
  position, 
  isLeft = true, 
  animationPhase,
  isFemale = false,
  startX = 0
}) {
  const [useModel, setUseModel] = useState(false);
  const [modelError, setModelError] = useState(false);
  
  // Try to load GLTF model if URL provided
  let gltfData = null;
  if (modelUrl && !modelError) {
    try {
      // This will be handled by useGLTF hook
      gltfData = useGLTF(modelUrl, true); // true = error handling
    } catch (error) {
      setModelError(true);
    }
  }
  
  // If we have a valid model, use it
  if (gltfData && gltfData.scene && !modelError) {
    return (
      <RealisticAvatar
        modelUrl={modelUrl}
        position={position}
        isLeft={isLeft}
        animationPhase={animationPhase}
        startX={startX}
      />
    );
  }
  
  // Fallback to smooth geometry avatar
  return (
    <SmoothHumanAvatar
      position={position}
      isLeft={isLeft}
      animationPhase={animationPhase}
      isFemale={isFemale}
    />
  );
}
