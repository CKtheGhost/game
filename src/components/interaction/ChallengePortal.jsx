import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Text, Html } from '@react-three/drei';
import { useGameState } from '../../context/GameStateContext';

/**
 * Interactive challenge portal that presents quantum physics challenges to the player
 */
const ChallengePortal = ({ 
  position, 
  levelId, 
  challengeId, 
  challengeName, 
  isCompleted = false,
  onComplete 
}) => {
  const portalRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [challengeData, setChallengeData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const { playerStats, updatePlayerStats } = useGameState();
  
  // Load challenge data
  useEffect(() => {
    // In a real implementation, this would load from an API or data file
    // For this example, we'll create some sample challenges
    const sampleChallenges = {
      'challenge-1-0': {
        question: 'What quantum property allows particles to exist in multiple states simultaneously?',
        options: [
          'Quantum Entanglement',
          'Superposition',
          'Wave-Particle Duality',
          'Quantum Tunneling'
        ],
        correctAnswer: 'Superposition',
        explanation: 'Superposition allows quantum particles to exist in multiple states simultaneously until measured.'
      },
      'challenge-1-1': {
        question: 'Which experiment demonstrated the wave-particle duality of light?',
        options: [
          'Michelson-Morley Experiment',
          'Millikan Oil Drop Experiment',
          'Double-Slit Experiment',
          'Stern-Gerlach Experiment'
        ],
        correctAnswer: 'Double-Slit Experiment',
        explanation: 'The Double-Slit Experiment showed that light can behave as both a wave and a particle.'
      },
      'challenge-1-2': {
        question: 'What is quantum entanglement?',
        options: [
          'The ability of particles to tunnel through barriers',
          'The phenomenon where particles can be in multiple states',
          'The correlation between quantum particles regardless of distance',
          'The exchange of energy between quantum states'
        ],
        correctAnswer: 'The correlation between quantum particles regardless of distance',
        explanation: 'Quantum entanglement is a phenomenon where entangled particles remain connected so that actions performed on one affect the other, regardless of distance.'
      },
      'challenge-2-0': {
        question: 'What is Heisenberg\'s Uncertainty Principle?',
        options: [
          'Energy can neither be created nor destroyed',
          'The position and momentum of a particle cannot be simultaneously measured with high precision',
          'Light travels at a constant speed in vacuum',
          'Matter can be converted to energy'
        ],
        correctAnswer: 'The position and momentum of a particle cannot be simultaneously measured with high precision',
        explanation: 'Heisenberg\'s Uncertainty Principle states that the more precisely the position of a particle is determined, the less precisely its momentum can be predicted, and vice versa.'
      }
    };
    
    // Get challenge data for this challenge
    if (sampleChallenges[challengeId]) {
      setChallengeData(sampleChallenges[challengeId]);
    } else {
      // Generate a default challenge if not found
      setChallengeData({
        question: `Challenge ${challengeId}: Solve the quantum puzzle`,
        options: [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ],
        correctAnswer: 'Option A',
        explanation: 'This is a sample explanation.'
      });
    }
  }, [challengeId]);
  
  // Set up animations
  const { scale, emissive, portalOpacity } = useSpring({
    scale: hovered ? 1.2 : completed ? 0.8 : 1,
    emissive: hovered ? 0.7 : completed ? 0.3 : 0.5,
    portalOpacity: active ? 0.9 : hovered ? 0.7 : 0.5,
    config: { mass: 2, tension: 300, friction: 30 }
  });
  
  const { panelOpacity, panelScale } = useSpring({
    panelOpacity: active ? 1 : 0,
    panelScale: active ? 1 : 0.5,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Animation frame updates
  useFrame((state, delta) => {
    if (portalRef.current) {
      // Portal rotation
      portalRef.current.rotation.y += delta * 0.3;
      
      // Pulsing animation for incomplete portals
      if (!completed) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
        portalRef.current.scale.set(pulse, pulse, pulse);
      }
      
      // Completed portals have a different animation
      if (completed) {
        portalRef.current.rotation.z += delta * 0.2;
      }
    }
  });
  
  // Event handlers
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = () => {
    // Toggle challenge panel
    setActive(!active);
    
    // Reset selected answer when closing
    if (active) {
      setSelectedAnswer(null);
    }
  };
  
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    
    // Check if answer is correct
    if (challengeData && answer === challengeData.correctAnswer) {
      // Mark challenge as completed
      setCompleted(true);
      
      // Close the challenge panel after a delay
      setTimeout(() => {
        setActive(false);
        
        // Call the onComplete callback
        if (onComplete) {
          onComplete(challengeId);
        }
        
        // Award the player with knowledge and energy
        updatePlayerStats({
          scientificKnowledge: playerStats.scientificKnowledge + 10,
          quantumEnergy: playerStats.quantumEnergy + 5
        });
      }, 2000);
    }
  };
  
  return (
    <group position={position}>
      {/* Portal mesh */}
      <animated.group 
        ref={portalRef} 
        scale={scale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <mesh>
          <torusGeometry args={[0.5, 0.1, 16, 40]} />
          <animated.meshStandardMaterial 
            color={completed ? '#00ff88' : '#8800ff'} 
            emissive={completed ? '#00cc66' : '#6600cc'}
            emissiveIntensity={emissive}
          />
        </mesh>
        
        {/* Inner portal effect */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.45, 32]} />
          <animated.meshBasicMaterial 
            color={completed ? '#00ff88' : '#aa66ff'} 
            transparent={true}
            opacity={portalOpacity}
            side={2} // Double sided
          />
        </mesh>
        
        {/* Completion indicator */}
        {completed && (
          <mesh position={[0, 0, 0.05]}>
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshBasicMaterial color="#ffffff" transparent={true} opacity={0.8} />
          </mesh>
        )}
      </animated.group>
      
      {/* Challenge name label */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {completed ? `${challengeName} ✓` : challengeName}
      </Text>
      
      {/* Challenge panel */}
      <animated.group 
        visible={panelOpacity.to(o => o > 0.01)}
        scale={panelScale}
        position={[0, 0, 1]}
      >
        <Html
          transform
          occlude
          style={{
            width: '400px',
            padding: '20px',
            backgroundColor: 'rgba(20, 20, 40, 0.9)',
            backdropFilter: 'blur(5px)',
            color: 'white',
            borderRadius: '15px',
            boxShadow: '0 0 20px rgba(100, 50, 255, 0.5)',
          }}
        >
          <div style={{ fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#bb99ff', textAlign: 'center' }}>
              Quantum Challenge
            </h2>
            
            {challengeData && (
              <>
                <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>
                  {challengeData.question}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {challengeData.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: selectedAnswer === option ? 
                          (option === challengeData.correctAnswer ? '#00cc66' : '#cc3300') : 
                          '#553399',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                      }}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {selectedAnswer && (
                  <div 
                    style={{ 
                      marginTop: '20px', 
                      padding: '10px',
                      backgroundColor: selectedAnswer === challengeData.correctAnswer ? 
                        'rgba(0, 200, 100, 0.2)' : 
                        'rgba(200, 50, 0, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    <p>
                      {selectedAnswer === challengeData.correctAnswer ? 
                        '✓ Correct!' : 
                        'ⓧ Incorrect. Try again.'}
                    </p>
                    {selectedAnswer === challengeData.correctAnswer && (
                      <p>{challengeData.explanation}</p>
                    )}
                  </div>
                )}
              </>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleClick}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#332266',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Html>
      </animated.group>
    </group>
  );
};

export default ChallengePortal;