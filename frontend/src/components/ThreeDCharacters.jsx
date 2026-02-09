import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import GitHubAvatar from './GitHubAvatar';

// Smooth Realistic 3D Avatar with high-quality geometries
function Character({ position, color, isLeft = true, animationPhase, isFemale = false }) {
  const group = useRef();
  const leftArmGroup = useRef();
  const rightArmGroup = useRef();
  const leftForearm = useRef();
  const rightForearm = useRef();
  const head = useRef();
  const startXRef = useRef(isLeft ? -8 : 8);
  
  // Realistic skin tone
  const skinColor = isFemale ? '#fdbcb4' : '#d4a574';
  // Hair color
  const hairColor = isFemale ? '#8b4513' : '#2c1810';
  // Clothing color
  const clothingColor = color;
  
  useFrame((state) => {
    if (!group.current) return;
    
    const time = state.clock.elapsedTime;
    
    if (animationPhase === 'approaching') {
      // Move towards center with easing
      const progress = Math.min(time * 0.35, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const targetX = isLeft ? -1.2 : 1.2;
      group.current.position.x = startXRef.current + (targetX - startXRef.current) * easedProgress;
      
      // Walking animation - bounce
      group.current.position.y = Math.sin(time * 5) * 0.08;
      
      // Walking arm swing
      if (leftArmGroup.current && rightArmGroup.current) {
        leftArmGroup.current.rotation.z = Math.sin(time * 5) * 0.4;
        rightArmGroup.current.rotation.z = -Math.sin(time * 5) * 0.4;
        if (leftForearm.current && rightForearm.current) {
          leftForearm.current.rotation.z = Math.sin(time * 5) * 0.3;
          rightForearm.current.rotation.z = -Math.sin(time * 5) * 0.3;
        }
      }
      
      // Head bobbing while walking
      if (head.current) {
        head.current.position.y = Math.sin(time * 5) * 0.05;
      }
    } else if (animationPhase === 'hugging' || animationPhase === 'heart-popping' || animationPhase === 'heart-floating') {
      // Final hugging position
      const targetX = isLeft ? -0.8 : 0.8;
      group.current.position.x = targetX;
      
      // Gentle sway while hugging
      group.current.position.y = Math.sin(time * 0.6) * 0.03;
      
      // Rotate towards each other for hugging
      group.current.rotation.y = isLeft ? Math.PI * 0.15 : -Math.PI * 0.15;
      
      // Arms in hugging position
      if (leftArmGroup.current && rightArmGroup.current) {
        leftArmGroup.current.rotation.z = isLeft ? 1.2 : -1.2;
        rightArmGroup.current.rotation.z = isLeft ? -1.2 : 1.2;
        leftArmGroup.current.position.x = isLeft ? -0.7 : -0.6;
        rightArmGroup.current.position.x = isLeft ? 0.6 : 0.7;
        if (leftForearm.current && rightForearm.current) {
          leftForearm.current.rotation.z = isLeft ? 0.8 : -0.8;
          rightForearm.current.rotation.z = isLeft ? -0.8 : 0.8;
        }
      }
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Head - High quality smooth sphere */}
      <group ref={head} position={[0, 1.6, 0]}>
        {/* Head base - Smooth with high segments */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial 
            color={skinColor} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Hair - Smooth rounded shapes */}
        {isFemale ? (
          // Long flowing hair for female
          <>
            <mesh position={[0, 0.15, -0.1]}>
              <sphereGeometry args={[0.4, 24, 24]} />
              <meshStandardMaterial 
                color={hairColor} 
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[-0.2, -0.15, -0.05]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
              <meshStandardMaterial 
                color={hairColor} 
                roughness={0.8}
              />
            </mesh>
            <mesh position={[0.2, -0.15, -0.05]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
              <meshStandardMaterial 
                color={hairColor} 
                roughness={0.8}
              />
            </mesh>
          </>
        ) : (
          // Short styled hair for male
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.4, 24, 24]} />
            <meshStandardMaterial 
              color={hairColor} 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        )}
        
        {/* Eyes - Smooth spheres */}
        <mesh position={[-0.12, 0.1, 0.3]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.1}
            metalness={0.0}
          />
        </mesh>
        <mesh position={[0.12, 0.1, 0.3]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.1}
            metalness={0.0}
          />
        </mesh>
        <mesh position={[-0.12, 0.1, 0.34]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.12, 0.1, 0.34]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Nose - Smooth rounded */}
        <mesh position={[0, 0, 0.32]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial 
            color={skinColor} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Mouth - Smooth curve */}
        <mesh position={[0, -0.1, 0.3]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.05, 0.01, 8, 16]} />
          <meshStandardMaterial 
            color="#8b4513" 
            roughness={0.5}
          />
        </mesh>
      </group>
      
      {/* Neck - Smooth cylinder */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Torso/Upper Body - Smooth rounded cylinder */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.7, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Shoulders - Smooth spheres */}
      <mesh position={[-0.3, 1.0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0.3, 1.0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Left Arm Group - Smooth cylinders */}
      <group ref={leftArmGroup} position={isLeft ? [-0.5, 0.9, 0] : [-0.4, 0.9, 0]}>
        {/* Left Upper Arm */}
        <mesh rotation={[0, 0, isLeft ? 0.3 : -0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          <meshStandardMaterial 
            color={skinColor} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Left Forearm */}
        <group ref={leftForearm} position={[0, -0.25, 0]}>
          <mesh rotation={[0, 0, isLeft ? 0.2 : -0.1]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
            <meshStandardMaterial 
              color={skinColor} 
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      </group>
      
      {/* Right Arm Group - Smooth cylinders */}
      <group ref={rightArmGroup} position={isLeft ? [0.4, 0.9, 0] : [0.5, 0.9, 0]}>
        {/* Right Upper Arm */}
        <mesh rotation={[0, 0, isLeft ? -0.2 : 0.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          <meshStandardMaterial 
            color={skinColor} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Right Forearm */}
        <group ref={rightForearm} position={[0, -0.25, 0]}>
          <mesh rotation={[0, 0, isLeft ? -0.1 : 0.2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
            <meshStandardMaterial 
              color={skinColor} 
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      </group>
      
      {/* Hips - Smooth rounded box */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.45, 0.2, 0.25]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Left Thigh - Smooth cylinder */}
      <mesh position={[-0.15, 0.05, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Left Lower Leg - Smooth cylinder */}
      <mesh position={[-0.15, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Right Thigh - Smooth cylinder */}
      <mesh position={[0.15, 0.05, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial 
          color={clothingColor} 
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      
      {/* Right Lower Leg - Smooth cylinder */}
      <mesh position={[0.15, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Feet - Smooth rounded using spheres */}
      <mesh position={[-0.15, -0.65, 0.1]}>
        <boxGeometry args={[0.2, 0.08, 0.25]} />
        <meshStandardMaterial 
          color="#2c2c2c" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.15, -0.65, 0.1]}>
        <boxGeometry args={[0.2, 0.08, 0.25]} />
        <meshStandardMaterial 
          color="#2c2c2c" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Heart that pops up
function PoppingHeart({ animationPhase }) {
  const heartRef = useRef();
  const startTimeRef = useRef(null);
  
  useFrame((state) => {
    if (!heartRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    if (animationPhase === 'heart-popping') {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      
      const elapsed = time - startTimeRef.current;
      // Heart rises and scales up with bounce effect
      const progress = Math.min(elapsed * 1.5, 1);
      const bounceProgress = 1 - Math.pow(1 - progress, 2); // Ease out
      heartRef.current.position.y = 2.5 + bounceProgress * 4;
      heartRef.current.scale.setScalar(0.3 + bounceProgress * 1.8);
      heartRef.current.rotation.y = time * 2.5;
      heartRef.current.rotation.z = Math.sin(time * 4) * 0.15;
    } else if (animationPhase === 'heart-floating') {
      // Continuous floating animation
      heartRef.current.position.y = 6.5 + Math.sin(time * 0.7) * 0.4;
      heartRef.current.rotation.y = time * 1.8;
      heartRef.current.rotation.z = Math.sin(time * 2.5) * 0.12;
      heartRef.current.scale.setScalar(2.1 + Math.sin(time * 1.2) * 0.25);
    }
  });

  // Create heart shape using torus and spheres
  return (
    <group ref={heartRef} position={[0, 2, 0]} scale={0.5}>
      {/* Main heart body */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.6, 0.25, 8, 20]} />
        <MeshDistortMaterial
          color="#ec4899"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#ec4899"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Left sphere */}
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <MeshDistortMaterial
          color="#ec4899"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#ec4899"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Right sphere */}
      <mesh position={[0.4, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <MeshDistortMaterial
          color="#ec4899"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#ec4899"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#ec4899" distance={5} />
    </group>
  );
}

// Simple Error Boundary for 3D components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('3D Avatar Error (using fallback):', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default function ThreeDCharacters() {
  const sceneRef = useRef();
  const [animationPhase, setAnimationPhase] = useState('approaching');
  
  useEffect(() => {
    // Animation timeline
    const timer1 = setTimeout(() => {
      setAnimationPhase('hugging');
    }, 2500); // After 2.5 seconds, they meet
    
    const timer2 = setTimeout(() => {
      setAnimationPhase('heart-popping');
    }, 3500); // After 3.5 seconds, heart starts popping
    
    const timer3 = setTimeout(() => {
      setAnimationPhase('heart-floating');
    }, 5500); // After 5.5 seconds, heart floats continuously
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <group ref={sceneRef}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, 5, 5]} intensity={0.6} color="#ec4899" />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#f43f5e" />
      
      {/* Try to use GitHub avatars, fallback to geometric avatars */}
      <Suspense fallback={
        <>
          {/* Show geometric avatars while loading */}
          <Character 
            position={[-8, 0, 0]} 
            color="#ec4899" 
            isLeft={true}
            isFemale={true}
            animationPhase={animationPhase}
          />
          <Character 
            position={[8, 0, 0]} 
            color="#6366f1" 
            isLeft={false}
            isFemale={false}
            animationPhase={animationPhase}
          />
        </>
      }>
        {/* Try GitHub Avatar for Girl */}
        <ErrorBoundary fallback={
          <Character 
            position={[-8, 0, 0]} 
            color="#ec4899" 
            isLeft={true}
            isFemale={true}
            animationPhase={animationPhase}
          />
        }>
          <GitHubAvatar 
            modelUrl="/models/female-avatar.glb"
            position={[-8, 0, 0]} 
            isLeft={true}
            animationPhase={animationPhase}
            startX={-8}
            scale={1.5}
          />
        </ErrorBoundary>
        
        {/* Try GitHub Avatar for Boy */}
        <ErrorBoundary fallback={
          <Character 
            position={[8, 0, 0]} 
            color="#6366f1" 
            isLeft={false}
            isFemale={false}
            animationPhase={animationPhase}
          />
        }>
          <GitHubAvatar 
            modelUrl="/models/male-avatar.glb"
            position={[8, 0, 0]} 
            isLeft={false}
            animationPhase={animationPhase}
            startX={8}
            scale={1.5}
          />
        </ErrorBoundary>
      </Suspense>
      
      {/* Heart that pops up */}
      {(animationPhase === 'heart-popping' || animationPhase === 'heart-floating') && (
        <PoppingHeart animationPhase={animationPhase} />
      )}
    </group>
  );
}
