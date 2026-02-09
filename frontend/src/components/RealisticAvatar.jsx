import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Realistic Avatar Component using GLTF models
function RealisticAvatar({ 
  modelUrl, 
  position, 
  isLeft = true, 
  animationPhase,
  startX = 0 
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, group);
  const startXRef = useRef(startX);
  
  // Clone the scene to avoid conflicts
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  
  useFrame((state, delta) => {
    if (!group.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update mixer for animations
    if (mixer) {
      mixer.update(delta);
    }
    
    if (animationPhase === 'approaching') {
      // Move towards center with easing
      const progress = Math.min(time * 0.35, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const targetX = isLeft ? -1.2 : 1.2;
      group.current.position.x = startXRef.current + (targetX - startXRef.current) * easedProgress;
      
      // Walking bounce
      group.current.position.y = Math.sin(time * 5) * 0.05;
      
      // Play walking animation
      if (actions['Walking'] || actions['walk'] || actions['Walk']) {
        const walkAction = actions['Walking'] || actions['walk'] || actions['Walk'];
        if (!walkAction.isRunning()) {
          walkAction.reset().fadeIn(0.5).play();
        }
      }
    } else if (animationPhase === 'hugging' || animationPhase === 'heart-popping' || animationPhase === 'heart-floating') {
      // Final hugging position
      const targetX = isLeft ? -0.8 : 0.8;
      group.current.position.x = targetX;
      
      // Gentle sway
      group.current.position.y = Math.sin(time * 0.6) * 0.02;
      
      // Rotate towards each other
      group.current.rotation.y = isLeft ? Math.PI * 0.15 : -Math.PI * 0.15;
      
      // Play hugging animation
      if (actions['Hugging'] || actions['hug'] || actions['Hug']) {
        const hugAction = actions['Hugging'] || actions['hug'] || actions['Hug'];
        if (!hugAction.isRunning()) {
          // Stop walking
          const walkAction = actions['Walking'] || actions['walk'] || actions['Walk'];
          if (walkAction) walkAction.fadeOut(0.3);
          
          // Start hugging
          hugAction.reset().fadeIn(0.5).play();
        }
      }
    }
  });

  // Cleanup animations
  useEffect(() => {
    return () => {
      Object.values(actions).forEach((action) => {
        if (action) action.stop();
      });
    };
  }, [actions]);

  return (
    <group ref={group} position={position}>
      <primitive object={clonedScene} scale={1} />
    </group>
  );
}

// Preload models
useGLTF.preload('/models/female-avatar.glb');
useGLTF.preload('/models/male-avatar.glb');

export default RealisticAvatar;
