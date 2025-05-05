import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuantumGame } from '../state/QuantumGameStateManager';
import { gsap } from 'gsap';

/**
 * QuantumCursorEffects
 * 
 * Provides advanced cursor effects for the quantum experience, including
 * quantum-themed trails, interactivity highlights, and ability feedback.
 */

// Styled container for cursor effects
const CursorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9000;
  overflow: hidden;
`;

// Main cursor element
const Cursor = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 221, 255, 0.5);
  transform: translate(-50%, -50%);
  mix-blend-mode: screen;
  pointer-events: none;
  transition: width 0.2s, height 0.2s, background 0.3s;
  box-shadow: 0 0 15px rgba(0, 221, 255, 0.5);
  z-index: 9999;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;

// Secondary cursor that follows with slight delay
const CursorFollower = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid rgba(0, 221, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  z-index: 9998;
  mix-blend-mode: screen;
`;

// Particle effect
const CursorParticle = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9997;
  opacity: 0.8;
  background: ${props => props.color || 'rgba(0, 221, 255, 0.8)'};
  box-shadow: 0 0 6px ${props => props.color || 'rgba(0, 221, 255, 0.5)'};
  transform: translate(-50%, -50%);
`;

// Interactive element highlight
const ElementHighlight = styled.div`
  position: absolute;
  border-radius: 4px;
  border: 2px solid rgba(0, 221, 255, 0.7);
  box-shadow: 0 0 10px rgba(0, 221, 255, 0.4);
  pointer-events: none;
  z-index: 9995;
  transition: all 0.2s ease;
  background: rgba(0, 221, 255, 0.1);
`;

// Quantum ability cursor effect
const AbilityEffect = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.background || 'radial-gradient(circle, rgba(0, 221, 255, 0.3) 0%, rgba(0, 170, 255, 0) 70%)'};
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9996;
  mix-blend-mode: screen;
`;

/**
 * The main QuantumCursorEffects component
 */
const QuantumCursorEffects = () => {
  const quantumGame = useQuantumGame();
  
  // Refs
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const particlesRef = useRef([]);
  const highlightRef = useRef(null);
  const abilityEffectRef = useRef(null);
  
  // State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [activeAbility, setActiveAbility] = useState(null);
  const [interactionType, setInteractionType] = useState('default');
  
  // Initialize effects
  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Initialize cursor position
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check for interactive elements
      checkInteractiveElements(e);
    };
    
    // Track clicks
    const handleMouseDown = () => {
      setIsClicking(true);
    };
    
    const handleMouseUp = () => {
      setIsClicking(false);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add custom event listener for ability activation
    const handleAbilityActivation = (e) => {
      const { ability } = e.detail;
      showAbilityEffect(ability);
    };
    
    document.addEventListener('quantumAbilityActivated', handleAbilityActivation);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('quantumAbilityActivated', handleAbilityActivation);
      
      // Restore default cursor
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  // Update cursor and follower positions
  useEffect(() => {
    if (!cursorRef.current || !followerRef.current) return;
    
    // Main cursor - instant follow
    cursorRef.current.style.left = `${mousePosition.x}px`;
    cursorRef.current.style.top = `${mousePosition.y}px`;
    
    // Apply click effect
    if (isClicking) {
      cursorRef.current.style.transform = 'translate(-50%, -50%) scale(0.8)';
      cursorRef.current.style.backgroundColor = 'rgba(255, 0, 221, 0.5)';
      
      // Add click particles
      createClickParticles();
    } else {
      cursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorRef.current.style.backgroundColor = isOverInteractive ? 
        'rgba(0, 255, 170, 0.5)' : 'rgba(0, 221, 255, 0.5)';
    }
    
    // Follower - smooth follow with GSAP
    gsap.to(followerRef.current, {
      duration: 0.3,
      left: mousePosition.x,
      top: mousePosition.y,
      ease: "power2.out"
    });
    
    // Animate follower size based on interaction
    if (isOverInteractive) {
      gsap.to(followerRef.current, {
        duration: 0.2,
        width: 60,
        height: 60,
        borderColor: 'rgba(0, 255, 170, 0.5)',
        ease: "power2.out"
      });
    } else {
      gsap.to(followerRef.current, {
        duration: 0.2,
        width: 40,
        height: 40,
        borderColor: 'rgba(0, 221, 255, 0.5)',
        ease: "power2.out"
      });
    }
  }, [mousePosition, isClicking, isOverInteractive]);
  
  // Animate highlight element when available
  useEffect(() => {
    if (!highlightRef.current || !highlightedElement) return;
    
    const rect = highlightedElement.getBoundingClientRect();
    
    gsap.to(highlightRef.current, {
      duration: 0.3,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      opacity: 1,
      ease: "power2.out"
    });
  }, [highlightedElement]);
  
  /**
   * Check if mouse is over an interactive element
   */
  const checkInteractiveElements = (e) => {
    // List of interactive selectors
    const interactiveSelectors = [
      'button', 'a', '.interactive', '[data-interactive]',
      'input', 'select', 'textarea', 'label'
    ];
    
    // Check elements under cursor
    const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    
    // Find interactive elements
    const interactive = elementsUnderCursor.find(element => {
      // Check tag or class
      return interactiveSelectors.some(selector => {
        if (selector.startsWith('.')) {
          return element.classList.contains(selector.substring(1));
        } else if (selector.startsWith('[')) {
          const attr = selector.substring(1, selector.length - 1);
          return element.hasAttribute(attr);
        } else {
          return element.tagName.toLowerCase() === selector;
        }
      });
    });
    
    // Determine interaction type if interactive
    if (interactive) {
      setIsOverInteractive(true);
      setHighlightedElement(interactive);
      
      // Determine interaction type
      if (interactive.hasAttribute('data-interaction-type')) {
        setInteractionType(interactive.getAttribute('data-interaction-type'));
      } else if (interactive.tagName.toLowerCase() === 'a') {
        setInteractionType('link');
      } else if (interactive.tagName.toLowerCase() === 'button') {
        setInteractionType('button');
      } else {
        setInteractionType('default');
      }
    } else {
      setIsOverInteractive(false);
      setHighlightedElement(null);
      setInteractionType('default');
    }
  };
  
  /**
   * Create particles on click
   */
  const createClickParticles = () => {
    if (!containerRef.current) return;
    
    const colors = ['#00ddff', '#ff00dd', '#00ffaa', '#ffaa00'];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      // Create particle
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.position = 'absolute';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.boxShadow = `0 0 6px ${particle.style.backgroundColor}`;
      particle.style.top = `${mousePosition.y}px`;
      particle.style.left = `${mousePosition.x}px`;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.zIndex = '9990';
      particle.style.pointerEvents = 'none';
      
      containerRef.current.appendChild(particle);
      
      // Animate with random direction and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      const duration = 0.6 + Math.random() * 0.8;
      
      gsap.to(particle, {
        duration: duration,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        ease: "power1.out",
        onComplete: () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }
      });
    }
  };
  
  /**
   * Create cursor trail particles
   */
  const createTrailParticle = () => {
    if (!containerRef.current) return;
    
    // Only create trail when cursor is moving significantly
    const lastPos = particlesRef.current.lastPosition || { x: 0, y: 0 };
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - lastPos.x, 2) + 
      Math.pow(mousePosition.y - lastPos.y, 2)
    );
    
    // Store last position
    particlesRef.current.lastPosition = { ...mousePosition };
    
    // Skip if not moving enough
    if (distance < 5) return;
    
    // Determine color based on interaction
    let color;
    switch (interactionType) {
      case 'button':
        color = 'rgba(0, 255, 170, 0.8)';
        break;
      case 'link':
        color = 'rgba(255, 170, 0, 0.8)';
        break;
      case 'quantum':
        color = 'rgba(255, 0, 221, 0.8)';
        break;
      default:
        color = 'rgba(0, 221, 255, 0.8)';
    }
    
    // Create particle
    const particle = document.createElement('div');
    particle.className = 'cursor-trail';
    particle.style.position = 'absolute';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 6px ${color}`;
    particle.style.top = `${mousePosition.y}px`;
    particle.style.left = `${mousePosition.x}px`;
    particle.style.transform = 'translate(-50%, -50%)';
    particle.style.zIndex = '9990';
    particle.style.pointerEvents = 'none';
    
    containerRef.current.appendChild(particle);
    
    // Animate fade out
    gsap.to(particle, {
      duration: 0.8,
      opacity: 0,
      scale: 0,
      ease: "power1.out",
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }
    });
  };
  
  /**
   * Show ability effect
   * @param {string} ability - The ability name
   */
  const showAbilityEffect = (ability) => {
    if (!containerRef.current || !abilityEffectRef.current) return;
    
    setActiveAbility(ability);
    
    // Configuration for different abilities
    const abilityConfig = {
      phaseShift: {
        color: '#00ddff',
        size: 120,
        duration: 1,
        background: 'radial-gradient(circle, rgba(0, 221, 255, 0.3) 0%, rgba(0, 170, 255, 0) 70%)'
      },
      timeDilation: {
        color: '#ff00dd',
        size: 150,
        duration: 1.5,
        background: 'radial-gradient(circle, rgba(255, 0, 221, 0.3) 0%, rgba(170, 0, 255, 0) 70%)'
      },
      molecularReconstruction: {
        color: '#00ffaa',
        size: 100,
        duration: 1.2,
        background: 'radial-gradient(circle, rgba(0, 255, 170, 0.3) 0%, rgba(0, 170, 155, 0) 70%)'
      },
      quantumTeleportation: {
        color: '#ffaa00',
        size: 200,
        duration: 0.8,
        background: 'radial-gradient(circle, rgba(255, 170, 0, 0.3) 0%, rgba(255, 100, 0, 0) 70%)'
      }
    };
    
    // Get config for this ability
    const config = abilityConfig[ability] || abilityConfig.phaseShift;
    
    // Apply to ability effect
    abilityEffectRef.current.style.background = config.background;
    
    // Animate ability effect
    gsap.to(abilityEffectRef.current, {
      duration: 0.3,
      width: config.size,
      height: config.size,
      opacity: 1,
      ease: "power2.out",
      onComplete: () => {
        // Create ability particles
        createAbilityParticles(config);
        
        // Fade out
        gsap.to(abilityEffectRef.current, {
          duration: 0.5,
          delay: config.duration - 0.5,
          opacity: 0,
          ease: "power2.in",
          onComplete: () => {
            setActiveAbility(null);
          }
        });
      }
    });
  };
  
  /**
   * Create particles for ability effect
   */
  const createAbilityParticles = (config) => {
    if (!containerRef.current) return;
    
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      // Create particle
      const particle = document.createElement('div');
      particle.className = 'ability-particle';
      particle.style.position = 'absolute';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = config.color;
      particle.style.boxShadow = `0 0 10px ${config.color}`;
      particle.style.top = `${mousePosition.y}px`;
      particle.style.left = `${mousePosition.x}px`;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.zIndex = '9991';
      particle.style.pointerEvents = 'none';
      
      containerRef.current.appendChild(particle);
      
      // Animate with random direction and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = config.size * 0.6 * Math.random();
      const duration = config.duration * 0.8 + Math.random() * 0.4;
      
      gsap.to(particle, {
        duration: duration * 0.3,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(particle, {
            duration: duration * 0.7,
            opacity: 0,
            scale: 0,
            ease: "power1.in",
            onComplete: () => {
              if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
              }
            }
          });
        }
      });
    }
  };
  
  // Animation frame for continuous effects
  useEffect(() => {
    let animationFrameId;
    
    const animate = () => {
      // Create trail particles
      if (Math.random() < 0.3) {
        createTrailParticle();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition, interactionType]);
  
  return (
    <CursorContainer ref={containerRef}>
      {/* Main cursor dot */}
      <Cursor 
        ref={cursorRef}
        style={{
          left: mousePosition.x,
          top: mousePosition.y
        }}
      />
      
      {/* Cursor follower */}
      <CursorFollower 
        ref={followerRef}
        style={{
          left: mousePosition.x,
          top: mousePosition.y
        }}
      />
      
      {/* Element highlight */}
      {highlightedElement && (
        <ElementHighlight 
          ref={highlightRef}
        />
      )}
      
      {/* Ability effect */}
      <AbilityEffect 
        ref={abilityEffectRef}
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          opacity: activeAbility ? 1 : 0
        }}
      />
    </CursorContainer>
  );
};

/**
 * Hook to use quantum cursor effects
 */
export const useQuantumCursor = () => {
  const [isCursorEnabled, setIsCursorEnabled] = useState(false);
  
  const enableCursor = () => setIsCursorEnabled(true);
  const disableCursor = () => setIsCursorEnabled(false);
  
  /**
   * Trigger ability cursor effect
   * @param {string} ability - Ability name ('phaseShift', 'timeDilation', etc.)
   */
  const triggerAbilityEffect = (ability) => {
    const event = new CustomEvent('quantumAbilityActivated', { 
      detail: { ability } 
    });
    document.dispatchEvent(event);
  };
  
  return {
    isCursorEnabled,
    enableCursor,
    disableCursor,
    triggerAbilityEffect,
    CursorComponent: () => isCursorEnabled ? <QuantumCursorEffects /> : null
  };
};

export default QuantumCursorEffects;