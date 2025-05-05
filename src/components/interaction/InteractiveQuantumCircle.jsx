import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useGameState } from '../../context/GameStateContext';
import QuantumCollectible from './QuantumCollectible';
import ChallengePortal from './ChallengePortal';

/**
 * Interactive Quantum Circle component 
 * Represents one of the nine circles from Dante's Inferno reimagined as quantum realms
 */
const InteractiveQuantumCircle = ({ level, position, radius, color, name, description, challengeCount = 3 }) => {
  const circleRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [collectiblesVisible, setCollectiblesVisible] = useState(false);
  const [portalPositions, setPortalPositions] = useState([]);
  const [collectiblePositions, setCollectiblePositions] = useState([]);
  
  const { 
    currentLevel, 
    playerStats, 
    levelProgress, 
    changeLevel, 
    collectItem,
    completeChallenge,
    updateObjective
  } = useGameState();

  // Set up springs for hover and activation animations
  const { scale, emissive } = useSpring({
    scale: hovered ? 1.1 : 1,
    emissive: hovered ? 0.5 : 0.1,
    config: { mass: 2, tension: 300, friction: 30 }
  });

  const { opacity, infoScale } = useSpring({
    opacity: hovered ? 1 : 0,
    infoScale: hovered ? 1 : 0.5,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Calculate positions for portals and collectibles
  useEffect(() => {
    // Generate positions for challenge portals around the circle
    const newPortalPositions = [];
    for (let i = 0; i < challengeCount; i++) {
      const angle = (i / challengeCount) * Math.PI * 2;
      const x = (radius * 1.2) * Math.cos(angle);
      const z = (radius * 1.2) * Math.sin(angle);
      newPortalPositions.push({ x, y: 0, z });
    }
    setPortalPositions(newPortalPositions);
    
    // Generate positions for collectibles within the circle
    const newCollectiblePositions = [];
    const collectibleCount = 5 + level * 2; // More collectibles at deeper levels
    
    for (let i = 0; i < collectibleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 0.8; // Distribute inside the circle
      const x = distance * Math.cos(angle);
      const z = distance * Math.sin(angle);
      const y = (Math.random() - 0.5) * 2; // Some variation in height
      
      newCollectiblePositions.push({ 
        x, 
        y, 
        z, 
        type: Math.random() > 0.3 ? 'quantumParticles' : 'knowledgeFragments' 
      });
    }
    setCollectiblePositions(newCollectiblePositions);
  }, [level, radius, challengeCount]);

  // Interaction handlers
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = () => {
    // Handle level transition
    if (currentLevel !== level) {
      changeLevel(level);
      updateObjective(`Explore ${name} and discover its quantum anomalies`);
    }
    
    // Toggle active state
    setActive(!active);
    
    // Show collectibles when activated
    setCollectiblesVisible(!collectiblesVisible);
  };
  
  // Handle collectible collection
  const handleCollectItem = (type, amount, position) => {
    collectItem(type, amount);
    
    // Remove this collectible from the positions array
    setCollectiblePositions(
      collectiblePositions.filter(pos => 
        !(pos.x === position.x && pos.y === position.y && pos.z === position.z)
      )
    );
  };
  
  // Handle challenge completion
  const handleChallengeComplete = (challengeId) => {
    completeChallenge(challengeId);
  };
  
  // Animation loop
  useFrame((state, delta) => {
    if (circleRef.current) {
      // Gentle hovering animation
      circleRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Rotation based on active state
      circleRef.current.rotation.y += active ? delta * 0.2 : delta * 0.05;
    }
  });
  
  // Calculate unlocked status based on previous level completion
  const isUnlocked = level === 1 || 
    (level > 1 && levelProgress[level - 1] && levelProgress[level - 1].completed);
  
  // Is this the current active level?
  const isCurrentLevel = currentLevel === level;
  
  return (
    <group position={position}>
      {/* Main circle mesh */}
      <animated.group 
        ref={circleRef} 
        scale={scale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <mesh>
          <torusGeometry args={[radius, radius * 0.1, 16, 50]} />
          <animated.meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={emissive} 
            transparent={true}
            opacity={isUnlocked ? 1 : 0.4}
          />
        </mesh>
        
        {/* Circle identifier */}
        <Text
          position={[0, radius * 0.3, 0]}
          fontSize={radius * 0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {level}
        </Text>
      </animated.group>
      
      {/* Info panel that appears on hover */}
      <animated.group 
        position={[0, radius * 1.5, 0]} 
        scale={infoScale} 
        visible={opacity.to(o => o > 0.1)}
      >
        <Html
          transform
          occlude
          style={{
            width: `${radius * 300}px`,
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <h3>{name}</h3>
          <p>{description}</p>
          <p>{isUnlocked ? 'Accessible' : 'Locked - Complete previous level'}</p>
        </Html>
      </animated.group>
      
      {/* Challenge portals */}
      {isCurrentLevel && portalPositions.map((portalPos, index) => (
        <ChallengePortal
          key={`portal-${level}-${index}`}
          position={[position.x + portalPos.x, position.y + portalPos.y, position.z + portalPos.z]}
          levelId={level}
          challengeId={`challenge-${level}-${index}`}
          challengeName={`${name} Challenge ${index + 1}`}
          onComplete={handleChallengeComplete}
          isCompleted={levelProgress[level]?.challenges?.includes(`challenge-${level}-${index}`)}
        />
      ))}
      
      {/* Collectibles */}
      {collectiblesVisible && collectiblePositions.map((collectiblePos, index) => (
        <QuantumCollectible
          key={`collectible-${level}-${index}`}
          position={[
            position.x + collectiblePos.x, 
            position.y + collectiblePos.y, 
            position.z + collectiblePos.z
          ]}
          type={collectiblePos.type}
          onCollect={(type, amount) => handleCollectItem(type, amount, collectiblePos)}
        />
      ))}
    </group>
  );
};

export default InteractiveQuantumCircle;