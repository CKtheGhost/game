import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useGameState } from '../contexts/GameStateContext';

// Styled components for holographic mission briefing UI
const BriefingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 10, 30, 0.8);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HologramContainer = styled.div`
  position: relative;
  width: 80%;
  max-width: 1200px;
  height: 80%;
  display: flex;
  flex-direction: column;
`;

const HologramCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const HologramHeader = styled(motion.div)`
  background: rgba(0, 100, 255, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 10px 10px 0 0;
  padding: 1.5rem;
  color: #00ffff;
  position: relative;
  overflow: hidden;

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #00ffff;
      border-radius: 50%;
      margin-right: 10px;
      box-shadow: 0 0 10px 5px rgba(0, 255, 255, 0.5);
      animation: pulse 2s infinite;
    }
  }

  h2 {
    margin: 10px 0 0;
    font-size: 1.2rem;
    font-weight: 300;
    opacity: 0.8;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.2),
      transparent
    );
    animation: hologramScan 3s linear infinite;
  }

  @keyframes hologramScan {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0%);
    }
  }
`;

const BriefingContent = styled(motion.div)`
  background: rgba(0, 40, 100, 0.2);
  backdrop-filter: blur(8px);
  border-left: 1px solid rgba(0, 200, 255, 0.3);
  border-right: 1px solid rgba(0, 200, 255, 0.3);
  padding: 2rem;
  color: white;
  flex: 1;
  overflow-y: auto;
  display: flex;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 200, 255, 0.5);
    border-radius: 3px;
  }
`;

const ObjectivesList = styled.div`
  flex: 1;
  margin-right: 2rem;
  
  h3 {
    color: #00ffff;
    font-size: 1.5rem;
    margin-top: 0;
    border-bottom: 1px solid rgba(0, 200, 255, 0.3);
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
`;

const Objective = styled.li`
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  
  .objective-marker {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 15px;
    position: relative;
    flex-shrink: 0;
    
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: ${props => props.completed ? 'rgba(0, 255, 100, 0.3)' : 'rgba(0, 150, 255, 0.3)'};
      border: 2px solid ${props => props.completed ? '#00ff64' : '#00a2ff'};
      box-sizing: border-box;
    }
    
    &::after {
      content: ${props => props.completed ? "'✓'" : "''"};
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00ff64;
      font-weight: bold;
    }
  }
  
  .objective-content {
    h4 {
      margin: 0 0 5px;
      color: ${props => props.completed ? '#00ff64' : 'white'};
      text-decoration: ${props => props.completed ? 'line-through' : 'none'};
      font-size: 1.1rem;
      display: flex;
      align-items: center;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
      max-width: 500px;
    }
  }
`;

const MissionDetails = styled.div`
  flex: 1;
  
  h3 {
    color: #00ffff;
    font-size: 1.5rem;
    margin-top: 0;
    border-bottom: 1px solid rgba(0, 200, 255, 0.3);
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  
  .detail-block {
    margin-bottom: 2rem;
    
    h4 {
      color: #88ccff;
      margin: 0 0 10px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      
      svg {
        margin-right: 8px;
      }
    }
    
    p {
      margin: 0 0 10px;
      line-height: 1.6;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
      }
    }
  }
  
  .mission-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    margin-top: 20px;
    margin-bottom: 10px;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0, 200, 255, 0.3);
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(0, 40, 100, 0) 0%,
        rgba(0, 100, 255, 0.3) 100%
      );
    }
  }
`;

const BriefingFooter = styled(motion.div)`
  background: rgba(0, 100, 255, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 0 0 10px 10px;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HologramButton = styled.button`
  background: rgba(0, 100, 200, 0.3);
  color: #00ffff;
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(0, 150, 255, 0.4);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      transparent,
      rgba(0, 255, 255, 0.2),
      transparent
    );
    transform: rotate(30deg);
    transition: all 0.3s ease;
    opacity: 0;
  }
  
  &:hover::after {
    opacity: 1;
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) rotate(30deg);
    }
    100% {
      transform: translateX(100%) rotate(30deg);
    }
  }
`;

const MissionProgressBar = styled.div`
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #00ffff, #0088ff);
    border-radius: 4px;
    transition: width 0.5s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 5px;
  text-align: center;
`;

const HologramEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 3px 3px;
    opacity: 0.1;
    pointer-events: none;
  }
  
  &::before {
    background-image: repeating-linear-gradient(
      0deg,
      rgba(0, 255, 255, 1),
      rgba(0, 255, 255, 1) 1px,
      transparent 1px,
      transparent 30px
    );
    animation: scanlines 8s linear infinite;
  }
  
  &::after {
    background-image: radial-gradient(
      rgba(0, 255, 255, 0.3) 2px,
      transparent 2px
    );
    background-size: 30px 30px;
    animation: noise 5s linear infinite;
  }
  
  @keyframes scanlines {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }
  
  @keyframes noise {
    0%, 100% {
      transform: translateX(0);
    }
    10% {
      transform: translateX(-1%);
    }
    20% {
      transform: translateX(1%);
    }
    30% {
      transform: translateX(-2%);
    }
    40% {
      transform: translateX(3%);
    }
    50% {
      transform: translateX(-3%);
    }
    60% {
      transform: translateX(2%);
    }
    70% {
      transform: translateX(-1%);
    }
    80% {
      transform: translateX(1%);
    }
    90% {
      transform: translateX(-1%);
    }
  }
`;

// Icons as SVG components
const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#00FFFF"/>
  </svg>
);

const TimeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#00FFFF"/>
  </svg>
);

const RiskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="#00FFFF"/>
  </svg>
);

const MissionBriefingUI = ({ missionId, onClose }) => {
  const { 
    playerStats,
    currentMission,
  } = useGameState();
  
  const canvasRef = useRef(null);
  const [renderer, setRenderer] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  
  // Example mission data - in a real app, this would come from the MissionData file
  const missionData = {
    id: "m001",
    title: "Quantum Crisis: Patient Zero",
    subtitle: "Identify the source of the quantum entanglement pandemic",
    location: "Quantum Salvation Labs - Research Sector B",
    timeframe: "Critical - 48 hours until quantum collapse",
    risk: "High - Exposure to unstable quantum particles",
    description: "The pandemic caused by quantum entanglement is spreading rapidly. We've traced the first case, 'Patient Zero', to Research Sector B. Your mission is to investigate the laboratory and collect samples to analyze the origin of the quantum anomaly before it becomes unstoppable.",
    background: "Three days ago, our quantum sensors detected an unusual pattern of entanglement spreading from the research sector. Scientists who were exposed reported experiencing multiple quantum states simultaneously, leading to cognitive disruption and eventually complete quantum dissociation.",
    objectives: [
      {
        id: "obj1",
        title: "Secure the Research Sector B entrance",
        description: "Use your quantum keycard to access the sealed laboratory area",
        completed: true
      },
      {
        id: "obj2",
        title: "Locate Patient Zero's research station",
        description: "Find Dr. Sakata's workstation where the anomaly was first detected",
        completed: false
      },
      {
        id: "obj3",
        title: "Collect quantum samples",
        description: "Obtain at least 3 samples from the contaminated equipment using the containment device",
        completed: false
      },
      {
        id: "obj4",
        title: "Analyze the quantum signature",
        description: "Use the quantum analyzer to identify the unique resonance pattern of the contamination",
        completed: false
      },
      {
        id: "obj5",
        title: "Secure experimental logs",
        description: "Download Dr. Sakata's research logs from the central terminal",
        completed: false
      }
    ],
    progress: 20, // Progress percentage (0-100)
    imageUrl: "sector_b.jpg" // This would be path to the image in assets
  };
  
  // Calculate mission progress
  const completedObjectives = missionData.objectives.filter(obj => obj.completed).length;
  const totalObjectives = missionData.objectives.length;
  const progressPercentage = Math.round((completedObjectives / totalObjectives) * 100);

  // Initialize Three.js scene for holographic particles effect
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize renderer
    const newRenderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Initialize scene
    const newScene = new THREE.Scene();
    
    // Initialize camera
    const newCamera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    newCamera.position.z = 5;
    
    // Create particle system for holographic effect
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Generate random positions for particles
    for (let i = 0; i < particleCount; i++) {
      // Random positions throughout the canvas area
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    newScene.add(particleSystem);
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    newScene.add(ambientLight);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particle system slowly
      if (particleSystem) {
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.0007;
      }
      
      // Render scene
      newRenderer.render(newScene, newCamera);
    };
    
    // Start animation
    animate();
    
    // Store references
    setRenderer(newRenderer);
    setScene(newScene);
    setCamera(newCamera);
    
    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      // Update camera
      newCamera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      newCamera.updateProjectionMatrix();
      
      // Update renderer
      newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Dispose resources
      particleGeometry.dispose();
      particleMaterial.dispose();
      
      // Remove scene objects
      while (newScene.children.length > 0) {
        const obj = newScene.children[0];
        newScene.remove(obj);
      }
      
      if (newRenderer) {
        newRenderer.dispose();
      }
    };
  }, [canvasRef]);

  return (
    <AnimatePresence>
      <BriefingOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HologramContainer>
          {/* Holographic 3D background */}
          <HologramCanvas ref={canvasRef} />
          
          {/* Header with mission title */}
          <HologramHeader
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
          >
            <h1>{missionData.title}</h1>
            <h2>{missionData.subtitle}</h2>
          </HologramHeader>
          
          {/* Mission content */}
          <BriefingContent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Left column: Objectives */}
            <ObjectivesList>
              <h3>Mission Objectives</h3>
              <ul>
                {missionData.objectives.map(objective => (
                  <Objective key={objective.id} completed={objective.completed}>
                    <div className="objective-marker"></div>
                    <div className="objective-content">
                      <h4>{objective.title}</h4>
                      <p>{objective.description}</p>
                    </div>
                  </Objective>
                ))}
              </ul>
            </ObjectivesList>
            
            {/* Right column: Mission details */}
            <MissionDetails>
              <h3>Briefing Details</h3>
              
              <div className="detail-block">
                <h4><LocationIcon /> Location</h4>
                <p>{missionData.location}</p>
              </div>
              
              <div className="detail-block">
                <h4><TimeIcon /> Timeframe</h4>
                <p>{missionData.timeframe}</p>
              </div>
              
              <div className="detail-block">
                <h4><RiskIcon /> Risk Assessment</h4>
                <p>{missionData.risk}</p>
              </div>
              
              <div className="detail-block">
                <h4>Mission Description</h4>
                <p>{missionData.description}</p>
              </div>
              
              <div className="detail-block">
                <h4>Background</h4>
                <p>{missionData.background}</p>
              </div>
              
              <div 
                className="mission-image"
                style={{ backgroundImage: `url(assets/images/missions/${missionData.imageUrl})` }}
              />
            </MissionDetails>
          </BriefingContent>
          
          {/* Footer with controls */}
          <BriefingFooter
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", damping: 15 }}
          >
            <div>
              <MissionProgressBar progress={progressPercentage} />
              <ProgressText>
                Mission Progress: {progressPercentage}% ({completedObjectives}/{totalObjectives} Objectives)
              </ProgressText>
            </div>
            
            <HologramButton onClick={onClose}>
              Close Briefing
            </HologramButton>
          </BriefingFooter>
          
          {/* Hologram visual effects overlay */}
          <HologramEffect />
        </HologramContainer>
      </BriefingOverlay>
    </AnimatePresence>
  );
};

export default MissionBriefingUI;