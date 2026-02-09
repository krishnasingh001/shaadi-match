import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Avatar component that loads GLTF models from the GitHub repository
function GitHubAvatar({ 
  modelUrl, 
  position, 
  isLeft = true, 
  animationPhase,
  startX = 0,
  scale = 1.5
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, group);
  const startXRef = useRef(startX);
  
  // Clone the scene to avoid conflicts when using multiple instances
  const clonedScene = React.useMemo(() => {
    if (scene) {
      return scene.clone();
    }
    return null;
  }, [scene]);
  
  useFrame((state, delta) => {
    if (!group.current || !clonedScene) return;
    
    const time = state.clock.elapsedTime;
    
    // Update animation mixer
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
      
      // Play walking animation if available
      const walkAction = actions['Walking'] || actions['walk'] || actions['Walk'] || actions['Walking'] || actions['mixamo.com'];
      if (walkAction && !walkAction.isRunning()) {
        walkAction.reset().fadeIn(0.5).play();
      }
    } else if (animationPhase === 'hugging' || animationPhase === 'heart-popping' || animationPhase === 'heart-floating') {
      // Final hugging position
      const targetX = isLeft ? -0.8 : 0.8;
      group.current.position.x = targetX;
      
      // Gentle sway
      group.current.position.y = Math.sin(time * 0.6) * 0.02;
      
      // Rotate towards each other
      group.current.rotation.y = isLeft ? Math.PI * 0.15 : -Math.PI * 0.15;
      
      // Play hugging animation if available
      const hugAction = actions['Hugging'] || actions['hug'] || actions['Hug'] || actions['Hugging'];
      if (hugAction && !hugAction.isRunning()) {
        // Stop walking
        const walkAction = actions['Walking'] || actions['walk'] || actions['Walk'];
        if (walkAction) walkAction.fadeOut(0.3);
        
        // Start hugging
        hugAction.reset().fadeIn(0.5).play();
      } else {
        // If no hugging animation, play idle
        const idleAction = actions['Idle'] || actions['idle'] || actions['TPose'];
        if (idleAction && !idleAction.isRunning()) {
          idleAction.reset().fadeIn(0.5).play();
        }
      }
    }
  });

  // Cleanup animations
  useEffect(() => {
    return () => {
      if (actions) {
        Object.values(actions).forEach((action) => {
          if (action) action.stop();
        });
      }
    };
  }, [actions]);

  if (!clonedScene) {
    return null;
  }

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={clonedScene} castShadow receiveShadow />
    </group>
  );
}

// Preload function for models
export function preloadAvatar(modelUrl) {
  useGLTF.preload(modelUrl);
}

export default GitHubAvatar;
