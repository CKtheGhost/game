import React, { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, useAudioAnalyzer } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useGameState } from '../../context/GameStateContext';
import { performanceSettings } from '../../utils/performance';

/**
 * Visual and audio feedback system for player actions and events
 */
const FeedbackSystem = () => {
  const { scene, camera } = useThree();
  const { playerStats, settings } = useGameState();
  const [feedbackEvents, setFeedbackEvents] = useState([]);
  const particleSystemRef = useRef();
  const audioSourceRef = useRef();
  
  // Track last energy value for change detection
  const lastEnergyRef = useRef(playerStats.quantumEnergy);
  
  // Create animated springs for global feedback effects
  const { globalPulse, chromaShift } = useSpring({
    globalPulse: 0,
    chromaShift: 0,
    config: { mass: 1, tension: 280, friction: 40 }
  });

  // Set up event tracking system
  useEffect(() => {
    // Register event listeners
    const eventHandlers = {
      'ability-activate': handleAbilityActivation,
      'ability-deactivate': handleAbilityDeactivation,
      'collectible-pickup': handleCollectiblePickup,
      'challenge-complete': handleChallengeCompletion,
      'level-transition': handleLevelTransition,
      'damage-taken': handleDamageTaken,
      'energy-depleted': handleEnergyDepleted,
      'energy-restored': handleEnergyRestored
    };
    
    // Add global event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      window.addEventListener(`quantum-${event}`, handler);
    });
    
    // Clean up listeners on unmount
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        window.removeEventListener(`quantum-${event}`, handler);
      });
    };
  }, []);
  
  // Monitor player stats for changes to trigger feedback
  useEffect(() => {
    // Check for energy changes
    if (playerStats.quantumEnergy < lastEnergyRef.current) {
      // Energy decreased
      const decrease = lastEnergyRef.current - playerStats.quantumEnergy;
      
      if (decrease > 20) {
        triggerEvent('energy-depleted', { amount: decrease });
      }
    } else if (playerStats.quantumEnergy > lastEnergyRef.current) {
      // Energy increased
      const increase = playerStats.quantumEnergy - lastEnergyRef.current;
      
      if (increase > 10) {
        triggerEvent('energy-restored', { amount: increase });
      }
    }
    
    // Update last energy value
    lastEnergyRef.current = playerStats.quantumEnergy;
  }, [playerStats.quantumEnergy]);

  // Event handlers
  const handleAbilityActivation = (event) => {
    const { ability } = event.detail;
    addFeedbackEvent({
      type: 'ability-activate',
      message: `${formatAbilityName(ability)} Activated`,
      color: '#00aaff',
      duration: 2000,
      particleEffect: 'ability-activate',
      soundEffect: 'ability-activate'
    });
    
    // Trigger global pulse effect
    triggerGlobalPulse(0.6, '#00aaff');
  };
  
  const handleAbilityDeactivation = (event) => {
    const { ability } = event.detail;
    addFeedbackEvent({
      type: 'ability-deactivate',
      message: `${formatAbilityName(ability)} Deactivated`,
      color: '#aaaaff',
      duration: 1500,
      particleEffect: 'ability-deactivate',
      soundEffect: 'ability-deactivate'
    });
  };
  
  const handleCollectiblePickup = (event) => {
    const { type, amount } = event.detail;
    
    // Format collectible type name
    const typeName = type === 'quantumParticles' ? 'Quantum Particles' : 
                     type === 'knowledgeFragments' ? 'Knowledge Fragment' :
                     type === 'dimensionalKeys' ? 'Dimensional Key' : type;
    
    addFeedbackEvent({
      type: 'collectible-pickup',
      message: `+${amount} ${typeName}`,
      color: type === 'quantumParticles' ? '#00aaff' : 
             type === 'knowledgeFragments' ? '#ffaa00' : 
             type === 'dimensionalKeys' ? '#ff00ff' : '#ffffff',
      duration: 1500,
      particleEffect: 'collectible-pickup',
      soundEffect: 'collectible-pickup'
    });
  };
  
  const handleChallengeCompletion = (event) => {
    const { challengeId, rewardType, rewardAmount } = event.detail;
    
    addFeedbackEvent({
      type: 'challenge-complete',
      message: `Challenge Complete!`,
      color: '#00ff88',
      duration: 3000,
      particleEffect: 'challenge-complete',
      soundEffect: 'challenge-complete'
    });
    
    // Show reward notification after a delay
    setTimeout(() => {
      addFeedbackEvent({
        type: 'reward',
        message: `+${rewardAmount} ${formatRewardType(rewardType)}`,
        color: '#ffdd00',
        duration: 2000,
        particleEffect: 'reward',
        soundEffect: 'reward'
      });
    }, 1000);
    
    // Trigger global pulse effect
    triggerGlobalPulse(1.0, '#00ff88');
  };
  
  const handleLevelTransition = (event) => {
    const { fromLevel, toLevel, levelName } = event.detail;
    
    addFeedbackEvent({
      type: 'level-transition',
      message: `Entering ${levelName}`,
      color: '#ffffff',
      duration: 4000,
      particleEffect: 'level-transition',
      soundEffect: 'level-transition'
    });
    
    // Trigger chromatic shift effect
    triggerChromaticShift(1.0);
  };
  
  const handleDamageTaken = (event) => {
    const { amount, source } = event.detail;
    
    addFeedbackEvent({
      type: 'damage-taken',
      message: `${source}: -${amount} Health`,
      color: '#ff3300',
      duration: 2000,
      particleEffect: 'damage',
      soundEffect: 'damage'
    });
    
    // Trigger global pulse with red tint
    triggerGlobalPulse(0.8, '#ff0000');
  };
  
  const handleEnergyDepleted = (event) => {
    const { amount } = event.detail;
    
    addFeedbackEvent({
      type: 'energy-depleted',
      message: `Energy Low!`,
      color: '#ff9900',
      duration: 2000,
      particleEffect: 'energy-warning',
      soundEffect: 'energy-warning'
    });
  };
  
  const handleEnergyRestored = (event) => {
    const { amount } = event.detail;
    
    addFeedbackEvent({
      type: 'energy-restored',
      message: `+${amount} Energy`,
      color: '#00ffaa',
      duration: 1500,
      particleEffect: 'energy-restore',
      soundEffect: 'energy-restore'
    });
  };

  // Helper method to add a new feedback event
  const addFeedbackEvent = (event) => {
    // Generate a unique ID for this event
    const id = `${event.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add event to the list with ID and expiration time
    const newEvent = {
      ...event,
      id,
      startTime: Date.now(),
      endTime: Date.now() + event.duration
    };
    
    setFeedbackEvents(prevEvents => [...prevEvents, newEvent]);
    
    // Trigger particle effect if enabled
    if (event.particleEffect && settings.particleEffects !== 'off') {
      createParticleEffect(event.particleEffect, event.color);
    }
    
    // Play sound effect if enabled
    if (event.soundEffect && settings.soundEnabled) {
      playSound(event.soundEffect);
    }
    
    // Remove expired events
    cleanExpiredEvents();
  };
  
  // Clean up expired feedback events
  const cleanExpiredEvents = () => {
    const now = Date.now();
    setFeedbackEvents(prevEvents => 
      prevEvents.filter(event => event.endTime > now)
    );
  };
  
  // Helper method to format ability names
  const formatAbilityName = (abilityId) => {
    // Convert camelCase to Title Case with spaces
    return abilityId
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };
  
  // Helper method to format reward type names
  const formatRewardType = (rewardType) => {
    switch (rewardType) {
      case 'quantumEnergy':
        return 'Energy';
      case 'scientificKnowledge':
        return 'Knowledge';
      case 'health':
        return 'Health';
      default:
        return rewardType
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
    }
  };
  
  // Create particle effect
  const createParticleEffect = (effectType, color) => {
    if (!particleSystemRef.current) return;
    
    // Get appropriate particle count based on performance settings
    const detailLevel = performanceSettings.getDetailLevel();
    let particleCount = 100;
    
    switch (detailLevel) {
      case 'high':
        particleCount = 200;
        break;
      case 'medium':
        particleCount = 100;
        break;
      case 'low':
        particleCount = 50;
        break;
      case 'minimal':
        particleCount = 20;
        break;
      default:
        particleCount = 100;
    }
    
    // Create particles based on effect type
    switch (effectType) {
      case 'ability-activate':
        // Outward expanding particles
        for (let i = 0; i < particleCount; i++) {
          createParticle({
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3
            ),
            color: color || '#00aaff',
            size: 0.05 + Math.random() * 0.1,
            lifetime: 1 + Math.random() * 1
          });
        }
        break;
        
      case 'collectible-pickup':
        // Rising particles
        for (let i = 0; i < particleCount / 2; i++) {
          createParticle({
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              0,
              (Math.random() - 0.5) * 0.2
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.1,
              0.1 + Math.random() * 0.2,
              (Math.random() - 0.5) * 0.1
            ),
            color: color || '#ffffff',
            size: 0.03 + Math.random() * 0.05,
            lifetime: 0.5 + Math.random() * 0.5
          });
        }
        break;
        
      case 'challenge-complete':
        // Firework-like burst
        for (let i = 0; i < particleCount * 1.5; i++) {
          // Distribute particles in a sphere
          const phi = Math.acos(-1 + 2 * Math.random());
          const theta = 2 * Math.PI * Math.random();
          const speed = 0.2 + Math.random() * 0.3;
          
          createParticle({
            position: new THREE.Vector3(0, 1, 0),
            velocity: new THREE.Vector3(
              speed * Math.sin(phi) * Math.cos(theta),
              speed * Math.sin(phi) * Math.sin(theta),
              speed * Math.cos(phi)
            ),
            color: color || '#00ff88',
            size: 0.04 + Math.random() * 0.08,
            lifetime: 1 + Math.random() * 2
          });
        }
        break;
        
      default:
        // Generic particles
        for (let i = 0; i < particleCount; i++) {
          createParticle({
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2
            ),
            color: color || '#ffffff',
            size: 0.03 + Math.random() * 0.07,
            lifetime: 0.5 + Math.random() * 1.5
          });
        }
    }
  };
  
  // Helper to create an individual particle
  const createParticle = (options) => {
    // In a real implementation, this would create Three.js particles
    // For this demo, we're just logging the creation
    console.log('Creating particle', options);
  };
  
  // Play sound effect
  const playSound = (soundType) => {
    // In a real implementation, this would play the appropriate sound
    // For this demo, we're just logging the sound
    console.log('Playing sound', soundType);
  };
  
  // Trigger global screen pulse effect
  const triggerGlobalPulse = (intensity = 0.5, color = '#ffffff') => {
    // Set the pulse value
    globalPulse.start({ globalPulse: intensity }).then(() => {
      // Reset after the animation
      globalPulse.start({ globalPulse: 0 });
    });
  };
  
  // Trigger chromatic shift effect
  const triggerChromaticShift = (intensity = 0.5) => {
    // Set the chromatic shift value
    chromaShift.start({ chromaShift: intensity }).then(() => {
      // Reset after the animation
      chromaShift.start({ chromaShift: 0 });
    });
  };
  
  // Helper function to dispatch feedback events
  const triggerEvent = (eventType, detail = {}) => {
    const event = new CustomEvent(`quantum-${eventType}`, { detail });
    window.dispatchEvent(event);
  };

  // Animation frame updates
  useFrame((state, delta) => {
    // Update particle positions
    if (particleSystemRef.current) {
      // Update particle simulation (would be more complex in real implementation)
    }
    
    // Clean expired events periodically
    if (Math.random() < 0.05) { // Approximately every 20 frames
      cleanExpiredEvents();
    }
  });

  return (
    <group>
      {/* Particle system for feedback effects */}
      <points ref={particleSystemRef}>
        {/* In a real implementation, this would render particles */}
      </points>
      
      {/* Text notifications */}
      <group position={[0, 1.5, -2]}>
        {feedbackEvents.map((event, index) => (
          <Text
            key={event.id}
            position={[0, 0.25 * index, 0]}
            fontSize={0.15}
            color={event.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={(event.endTime - Date.now()) / event.duration}
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {event.message}
          </Text>
        ))}
      </group>
      
      {/* Global full-screen effects */}
      <animated.mesh>
        {/* In a real implementation, this would apply post-processing effects */}
      </animated.mesh>
      
      {/* Audio source for sound effects */}
      <audio ref={audioSourceRef} />
    </group>
  );
};

/**
 * Component providing an API for triggering feedback
 */
export const FeedbackProvider = ({ children }) => {
  // Simplified for this demo
  useEffect(() => {
    // Expose global API for triggering feedback events
    window.QuantumFeedback = {
      triggerAbilityActivation: (ability) => {
        const event = new CustomEvent('quantum-ability-activate', { 
          detail: { ability } 
        });
        window.dispatchEvent(event);
      },
      
      triggerAbilityDeactivation: (ability) => {
        const event = new CustomEvent('quantum-ability-deactivate', { 
          detail: { ability } 
        });
        window.dispatchEvent(event);
      },
      
      triggerCollectiblePickup: (type, amount) => {
        const event = new CustomEvent('quantum-collectible-pickup', { 
          detail: { type, amount } 
        });
        window.dispatchEvent(event);
      },
      
      triggerChallengeCompletion: (challengeId, rewardType, rewardAmount) => {
        const event = new CustomEvent('quantum-challenge-complete', { 
          detail: { challengeId, rewardType, rewardAmount } 
        });
        window.dispatchEvent(event);
      },
      
      triggerLevelTransition: (fromLevel, toLevel, levelName) => {
        const event = new CustomEvent('quantum-level-transition', { 
          detail: { fromLevel, toLevel, levelName } 
        });
        window.dispatchEvent(event);
      },
      
      triggerDamageTaken: (amount, source) => {
        const event = new CustomEvent('quantum-damage-taken', { 
          detail: { amount, source } 
        });
        window.dispatchEvent(event);
      }
    };
    
    // Clean up on unmount
    return () => {
      delete window.QuantumFeedback;
    };
  }, []);
  
  return (
    <>
      <FeedbackSystem />
      {children}
    </>
  );
};

export default FeedbackSystem;