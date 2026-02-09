import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import ThreeDBackground from './ThreeDBackground';
import FloatingHeart from './FloatingHeart';
import ThreeDCharacters from './ThreeDCharacters';

// Error boundary component for 3D scenes
function ErrorFallback({ error }) {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 0,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.1
    }}>
      {/* Silent fail - don't show error to user */}
    </div>
  );
}

export function ThreeDBackgroundScene({ style = {} }) {
  // Reduce particle count on mobile for better performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 100 : 200;
  const heartCount = isMobile ? 4 : 6;
  
  try {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', ...style }}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={isMobile ? 1 : 2}
          performance={{ min: 0.5 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ThreeDBackground particleCount={particleCount} heartCount={heartCount} />
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('ThreeDBackgroundScene error:', error);
    return <ErrorFallback error={error} />;
  }
}

export function FloatingHeartScene({ style = {} }) {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <FloatingHeart />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function CharactersScene({ style = {} }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  try {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', ...style }}>
        <Canvas 
          camera={{ position: [0, 2, 8], fov: 60 }}
          dpr={isMobile ? 1 : 2}
          performance={{ min: 0.5 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ThreeDCharacters />
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('CharactersScene error:', error);
    return <ErrorFallback error={error} />;
  }
}
