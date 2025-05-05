import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useGameState } from '../../context/GameStateContext';
import { performanceSettings } from '../../utils/performance';

/**
 * Interactive collectible item for quantum particles and knowledge fragments
 */
const QuantumCollectible = ({ position, type = 'quantumParticles', onCollect }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);
  const { playerStats } = useGameState();
  
  // Configure appearance based on collectible type
  const collectibleConfig = {
    quantumParticles: {
      color: '#00aaff',
      emissive: '#0088ff',
      size: 0.3,
      value: 1,
      label: 'Quantum Particle'
    },
    knowledgeFragments: {
      color: '#ffaa00',
      emissive: '#ff8800',
      size: 0.4,
      value: 1,
      label: 'Knowledge Fragment'
    },
    dimensionalKeys: {
      color: '#ff00ff',
      emissive: '#cc00cc',
      size: 0.5,
      value: 1,
      label: 'Dimensional Key'
    }
  };
  
  // Get configuration for this collectible type
  const config = collectibleConfig[type] || collectibleConfig.quantumParticles;
  
  // Animation springs
  const { scale, opacity, emissiveIntensity } = useSpring({
    scale: hovered ? 1.3 : collected ? 0.1 : 1,
    opacity: collected ? 0 : 1,
    emissiveIntensity: hovered ? 2 : 1,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Animation frame updates
  useFrame((state, delta) => {
    if (meshRef.current && !collected) {
      // Rotation animation
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.8;
      
      // Hovering animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Check for proximity to player for collection
      const playerPosition = new THREE.Vector3(
        playerStats.position.x,
        playerStats.position.y,
        playerStats.position.z
      );
      
      const collectiblePosition = new THREE.Vector3(
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      );
      
      const distance = playerPosition.distanceTo(collectiblePosition);
      
      // Auto-collect when player is very close
      if (distance < 1.5 && !collected) {
        handleCollect();
      }
    }
  });
  
  // Pointer event handlers
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = () => {
    if (!collected) {
      handleCollect();
    }
  };
  
  const handleCollect = () => {
    setCollected(true);
    
    // Call the onCollect callback with the collectible type and value
    if (onCollect) {
      onCollect(type, config.value);
    }
    
    // Create particle effect on collection
    createCollectionEffect();
    
    // Remove from scene after animation completes
    setTimeout(() => {
      // This component will be unmounted by parent based on position
    }, 1000);
  };
  
  // Create particle effect when collected
  const createCollectionEffect = () => {
    // This would be more complex with actual particle systems
    // For now we'll just log it for a placeholder
    console.log(`Collection effect for ${type}`);
    
    // In a full implementation, this would create a particle burst
    // using the object pooling system from performanceSettings
  };
  
  // Choose geometry based on type
  const renderGeometry = () => {
    switch (type) {
      case 'quantumParticles':
        return <dodecahedronGeometry args={[config.size, 0]} />;
      case 'knowledgeFragments':
        return <octahedronGeometry args={[config.size, 0]} />;
      case 'dimensionalKeys':
        return <torusKnotGeometry args={[config.size * 0.7, config.size * 0.3, 64, 8]} />;
      default:
        return <sphereGeometry args={[config.size, 16, 16]} />;
    }
  };
  
  // Only show label if hover and if high quality allowed by performance settings
  const showLabel = hovered && 
    (performanceSettings.getDetailLevel() !== 'minimal' && 
     performanceSettings.getDetailLevel() !== 'low');
  
  return (
    <animated.group 
      position={position} 
      scale={scale}
      opacity={opacity}
    >
      <animated.mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {renderGeometry()}
        <animated.meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={emissiveIntensity}
          transparent={true}
          opacity={opacity}
        />
      </animated.mesh>
      
      {showLabel && (
        <Text
          position={[0, config.size * 1.5, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          fillOpacity={opacity}
        >
          {config.label}
        </Text>
      )}
    </animated.group>
  );
};

export default QuantumCollectible;