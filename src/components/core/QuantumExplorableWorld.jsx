import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky, Stars, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
// GameStateProvider is now provided at the App level
import { FeedbackProvider } from '../effects/FeedbackSystem';
import QuantumVisualization from './QuantumVisualization';
import { performanceSettings } from '../../utils/performance';
import { useProgressiveEnhancement } from '../../utils/progressiveEnhancement';
import InteractiveQuantumCircle from '../interaction/InteractiveQuantumCircle';

/**
 * Main component that combines all the layers of the Quantum Salvation experience
 */
const QuantumExplorableWorld = () => {
  // Use progressive enhancement to select appropriate Sky component
  const EnhancedSky = useProgressiveEnhancement({
    high: () => <Sky sunPosition={[0, 1, 0]} turbidity={10} rayleigh={0.5} />,
    medium: () => <Sky sunPosition={[0, 1, 0]} turbidity={10} rayleigh={0.5} />,
    low: () => <div className="low-quality-sky" />
  });
  
  // Define configuration for the quantum circles (based on Dante's Inferno)
  const circleConfigurations = [
    {
      level: 1,
      name: "Limbo",
      description: "The realm of untapped quantum potential, where particles exist in superposition.",
      position: [0, 0, 0],
      radius: 5,
      color: "#8866ff"
    },
    {
      level: 2,
      name: "Lust",
      description: "Swirling quantum forces create attraction and repulsion between particles.",
      position: [12, -3, 0],
      radius: 4.5,
      color: "#ff66aa"
    },
    {
      level: 3,
      name: "Gluttony",
      description: "Energy-hungry quantum fields consume and transform matter.",
      position: [20, -6, 8],
      radius: 4.2,
      color: "#ffaa66"
    },
    {
      level: 4,
      name: "Greed",
      description: "Dark energy accumulates, warping spacetime around it.",
      position: [24, -10, 18],
      radius: 4,
      color: "#ffdd44"
    },
    {
      level: 5,
      name: "Anger",
      description: "Quantum fluctuations become violent and unpredictable.",
      position: [22, -15, 30],
      radius: 3.8,
      color: "#ff4422"
    },
    {
      level: 6,
      name: "Heresy",
      description: "Paradoxical quantum states challenge the fundamental laws of physics.",
      position: [15, -21, 35],
      radius: 3.5,
      color: "#22ff88"
    },
    {
      level: 7,
      name: "Violence",
      description: "Destructive quantum decay and high-energy collisions dominate.",
      position: [5, -28, 32],
      radius: 3.2,
      color: "#ff2200"
    },
    {
      level: 8,
      name: "Fraud",
      description: "Deceptive quantum tunneling and false vacuum states mislead observation.",
      position: [-8, -36, 25],
      radius: 3,
      color: "#2299ff"
    },
    {
      level: 9,
      name: "Treachery",
      description: "The frozen core of entangled paradoxes, where quantum information is lost.",
      position: [-18, -45, 10],
      radius: 2.8,
      color: "#0022ff"
    }
  ];

  return (
      <Canvas
        shadows
        gl={{ antialias: performanceSettings.getDetailLevel() !== 'minimal' }}
        style={{ background: '#000000' }}
      >
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 15, 40]} fov={60} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[10, 20, 15]} 
          intensity={1} 
          castShadow={performanceSettings.getDetailLevel() !== 'minimal'} 
        />
        
        {/* Sky and stars background */}
        {EnhancedSky}
        <Stars radius={100} depth={50} count={performanceSettings.getMaxParticleCount() / 2} factor={4} />
        
        {/* Physics system for interactions */}
        <Physics>
          {/* Feedback system for user experience */}
          <FeedbackProvider>
            {/* Suspense for async loading */}
            <Suspense fallback={null}>
              {/* Core visualization layer */}
              <QuantumVisualization />
              
              {/* Interaction layer - Quantum circles */}
              {circleConfigurations.map(circle => (
                <InteractiveQuantumCircle
                  key={`circle-${circle.level}`}
                  level={circle.level}
                  name={circle.name}
                  description={circle.description}
                  position={new THREE.Vector3(...circle.position)}
                  radius={circle.radius}
                  color={circle.color}
                  challengeCount={circle.level + 1}
                />
              ))}
            </Suspense>
          </FeedbackProvider>
        </Physics>
      </Canvas>
  );
};

export default QuantumExplorableWorld;