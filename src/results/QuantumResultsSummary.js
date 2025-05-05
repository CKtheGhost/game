import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantumGame } from '../state/QuantumGameStateManager';
import { useLeaderboard } from '../leaderboard/QuantumLeaderboardSystem';
import { useQuantumTransition } from '../transitions/QuantumTransitionManager';
import * as THREE from 'three';

/**
 * QuantumResultsSummary
 * 
 * Generates shareable experiment summaries with visualizations, statistics,
 * and insights from the user's quantum journey.
 */

// Styled components
const ResultsContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
  backdrop-filter: blur(5px);
`;

const ResultsPanel = styled(motion.div)`
  background: rgba(10, 15, 35, 0.95);
  width: 900px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 150, 255, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  
  h2 {
    margin: 0;
    font-size: 28px;
    background: linear-gradient(120deg, #00ffff, #0088ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  background: ${props => props.active ? 'rgba(0, 200, 255, 0.2)' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#00ddff' : 'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  padding: 12px 20px;
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 200, 255, 0.1);
    color: white;
  }
`;

const VisualizationContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  
  .value {
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.color || '#00ddff'};
    margin-bottom: 5px;
  }
  
  .label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const InsightsList = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #00ddff;
  }
  
  ul {
    margin: 0;
    padding: 0 0 0 20px;
    list-style-type: none;
    
    li {
      position: relative;
      padding: 5px 0;
      padding-left: 15px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 14px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #00ddff;
      }
    }
  }
`;

const ProgressList = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #00ddff;
  }
`;

const ProgressItem = styled.div`
  margin-bottom: 15px;
  
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    
    .title {
      font-size: 14px;
      color: white;
    }
    
    .value {
      font-size: 14px;
      color: ${props => props.color || '#00ddff'};
    }
  }
  
  .bar {
    height: 6px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    overflow: hidden;
    
    .fill {
      height: 100%;
      width: ${props => props.percent}%;
      background: ${props => props.color || 'linear-gradient(90deg, #0088ff, #00ddff)'};
      border-radius: 3px;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  background: ${props => props.primary ? 'linear-gradient(90deg, #0088ff, #00ddff)' : 'rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${props => props.primary ? 'rgba(0, 200, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 16px;
  font-weight: ${props => props.primary ? '600' : '400'};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: ${props => props.primary ? 'linear-gradient(90deg, #0088ff, #00ddff)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const TitleInput = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 20px;
  color: white;
  font-size: 18px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: rgba(0, 200, 255, 0.6);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ExportFormatSelect = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 4px;
  padding: 10px;
  color: white;
  font-size: 16px;
  width: 100%;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: rgba(0, 200, 255, 0.6);
  }
  
  option {
    background: rgba(10, 15, 35, 0.95);
    color: white;
  }
`;

// Icons
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
  </svg>
);

const LeaderboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.5,4A5.5,5.5 0 0,0 2,9.5C2,11.11 2.63,12.59 3.71,13.71L11.29,21.29C11.68,21.68 12.31,21.68 12.71,21.29L20.29,13.71C21.37,12.59 22,11.11 22,9.5A5.5,5.5 0 0,0 16.5,4C14.64,4 12.95,4.97 12,6.5C11.05,4.97 9.36,4 7.5,4M7.5,6A3.5,3.5 0 0,1 11,9.5C11,10.06 10.89,10.61 10.69,11.11L12,12.42L13.31,11.11C13.11,10.61 13,10.06 13,9.5A3.5,3.5 0 0,1 16.5,6A3.5,3.5 0 0,1 20,9.5C20,10.29 19.77,11.05 19.32,11.69L12,19L4.68,11.69C4.23,11.05 4,10.29 4,9.5A3.5,3.5 0 0,1 7.5,6Z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
  </svg>
);

/**
 * Generate mock results data for development
 */
const generateMockResultsData = () => {
  return {
    title: 'Quantum Exploration #127',
    stats: {
      level: 8,
      quantumEnergy: 87,
      maxQuantumEnergy: 100,
      scientificKnowledge: 62,
      maxScientificKnowledge: 100,
      achievementPoints: 450,
      totalPlayTime: '08:45:22',
      abilitiesUsed: 127,
      circlesExplored: 5,
      itemsCollected: 42,
      entitiesDiscovered: 18,
      challengesCompleted: 7,
      highestCombo: 12,
    },
    progress: {
      overallProgress: {
        value: 65,
        max: 100,
        color: 'linear-gradient(90deg, #0088ff, #00ddff)',
      },
      danteProgress: {
        value: 5,
        max: 9,
        color: 'linear-gradient(90deg, #ff0088, #ff00ff)',
      },
      scientificProgress: {
        value: 62,
        max: 100,
        color: 'linear-gradient(90deg, #00ff88, #00ffff)',
      },
      achievementProgress: {
        value: 18,
        max: 50,
        color: 'linear-gradient(90deg, #ffaa00, #ffff00)',
      },
      collectionProgress: {
        value: 42,
        max: 100,
        color: 'linear-gradient(90deg, #aa00ff, #ff00ff)',
      },
    },
    insights: [
      'You excel at using Phase Shift, with 30% more efficiency than average',
      'Your exploration pattern focuses on thorough investigation of each area',
      'You've collected 70% of all quantum particles in Limbo',
      'Your scientific understanding has grown by 35% in the last session',
      'You tend to use Time Dilation in combat situations more than most users',
      'Challenges related to particle manipulation are your strongest area',
    ],
    achievements: {
      recent: [
        {
          id: 'phase-shifter',
          title: 'Phase Shifter',
          description: 'Use phase shift ability 20 times',
          points: 30,
          unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'particle-enthusiast',
          title: 'Particle Enthusiast',
          description: 'Discover 10 unique quantum particles',
          points: 25,
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'energy-manipulator',
          title: 'Energy Manipulator',
          description: 'Successfully manipulate quantum energy 50 times',
          points: 25,
          unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      recommended: [
        {
          id: 'subatomic-cartographer',
          title: 'Subatomic Cartographer',
          description: 'Map the structure of 20 subatomic particles',
          points: 75,
          progress: 15,
          progressMax: 20,
        },
        {
          id: 'descent-pioneer',
          title: 'Descent Pioneer',
          description: 'Reach the fifth circle of Dante\'s Inferno',
          points: 50,
          progress: 3,
          progressMax: 5,
        },
        {
          id: 'paradox-solver',
          title: 'Paradox Solver',
          description: 'Solve 5 quantum paradoxes',
          points: 50,
          progress: 3,
          progressMax: 5,
        },
      ],
    },
    leaderboardRank: {
      overall: 127,
      scientific: 82,
      exploration: 215,
      speedrun: 144,
    },
  };
};

/**
 * Three.js visualization component for quantum results
 */
const QuantumVisualization = ({ visualizationType, stats }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize Three.js scene
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Add visualization based on type
    let visualizationObjects = [];
    
    switch (visualizationType) {
      case 'quantum':
        visualizationObjects = createQuantumVisualization(scene, stats);
        break;
      case 'journey':
        visualizationObjects = createJourneyVisualization(scene, stats);
        break;
      case 'abilities':
        visualizationObjects = createAbilitiesVisualization(scene, stats);
        break;
      case 'exploration':
        visualizationObjects = createExplorationVisualization(scene, stats);
        break;
      default:
        visualizationObjects = createQuantumVisualization(scene, stats);
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update visualization objects
      visualizationObjects.forEach(obj => {
        if (obj.update) {
          obj.update();
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Store scene reference
    sceneRef.current = {
      scene,
      camera,
      renderer,
      visualizationObjects,
    };
    
    // Clean up on unmount
    return () => {
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      
      // Dispose geometry and materials
      visualizationObjects.forEach(obj => {
        if (obj.dispose) {
          obj.dispose();
        }
      });
      
      // Note: Three.js doesn't have a direct way to dispose scenes, cameras, etc.
      // But explicit geometry and material disposal is important
    };
  }, [visualizationType, stats]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      
      const { renderer, camera } = sceneRef.current;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
};

/**
 * Create quantum particles visualization
 */
const createQuantumVisualization = (scene, stats) => {
  // Create a particle system
  const particleCount = 200;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  // Customize based on stats
  const energyRatio = stats.quantumEnergy / stats.maxQuantumEnergy;
  const knowledgeRatio = stats.scientificKnowledge / stats.maxScientificKnowledge;
  
  // Create dynamic color range based on stats
  const colorStart = new THREE.Color(0x0088ff);
  const colorEnd = new THREE.Color(0x00ffff);
  const colorMid = new THREE.Color(0xff00ff);
  
  // Particle positions and attributes
  for (let i = 0; i < particleCount; i++) {
    // Position in a sphere
    const radius = 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Color based on position (blend between colors)
    const ratio = Math.random();
    let color;
    
    if (ratio < 0.5) {
      color = colorStart.clone().lerp(colorMid, ratio * 2);
    } else {
      color = colorMid.clone().lerp(colorEnd, (ratio - 0.5) * 2);
    }
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    // Size varied by energy level
    sizes[i] = (Math.random() * 0.5 + 0.5) * energyRatio * 0.2;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create particle material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  
  // Create particle system
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);
  
  // Energy core at center
  const coreGeometry = new THREE.SphereGeometry(energyRatio * 0.5, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(core);
  
  // Knowledge rings
  const ringGeometry = new THREE.RingGeometry(
    knowledgeRatio * 2, 
    knowledgeRatio * 2 + 0.05, 
    32
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);
  
  // Animation functions
  const update = () => {
    // Rotate particle system
    particleSystem.rotation.y += 0.001;
    particleSystem.rotation.x += 0.0005;
    
    // Pulse core
    const time = Date.now() * 0.001;
    core.scale.set(
      1 + Math.sin(time) * 0.1,
      1 + Math.sin(time) * 0.1,
      1 + Math.sin(time) * 0.1
    );
    
    // Rotate ring
    ring.rotation.z += 0.005;
  };
  
  // Dispose function for cleanup
  const dispose = () => {
    particles.dispose();
    particleMaterial.dispose();
    coreGeometry.dispose();
    coreMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
  };
  
  return [
    {
      object: particleSystem,
      update,
      dispose,
    },
  ];
};

/**
 * Create journey visualization
 */
const createJourneyVisualization = (scene, stats) => {
  // Create spiral path representing the journey
  const spiralPoints = [];
  const numberOfPoints = stats.circlesExplored * 10;
  
  for (let i = 0; i < numberOfPoints; i++) {
    const t = i / (numberOfPoints - 1);
    const angle = t * Math.PI * 4;
    const radius = 2 * t;
    const height = (t - 0.5) * 2;
    
    spiralPoints.push(
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle)
    );
  }
  
  const spiralGeometry = new THREE.BufferGeometry();
  spiralGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(spiralPoints, 3)
  );
  
  const spiralMaterial = new THREE.LineBasicMaterial({
    color: 0x00ddff,
    linewidth: 2,
  });
  
  const spiralLine = new THREE.Line(spiralGeometry, spiralMaterial);
  scene.add(spiralLine);
  
  // Add milestone points (circles explored)
  const milestones = [];
  const milestoneGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  
  for (let i = 0; i < stats.circlesExplored; i++) {
    const t = i / (stats.circlesExplored > 1 ? stats.circlesExplored - 1 : 1);
    const pointIdx = Math.floor(t * (numberOfPoints - 1));
    
    const x = spiralPoints[pointIdx * 3];
    const y = spiralPoints[pointIdx * 3 + 1];
    const z = spiralPoints[pointIdx * 3 + 2];
    
    const milestoneMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(t, 1, 0.5),
      transparent: true,
      opacity: 0.8,
    });
    
    const milestone = new THREE.Mesh(milestoneGeometry, milestoneMaterial);
    milestone.position.set(x, y, z);
    milestone.scale.set(2, 2, 2);
    scene.add(milestone);
    
    milestones.push({
      object: milestone,
      t: t,
    });
  }
  
  // Add player avatar at current position
  const avatarGeometry = new THREE.SphereGeometry(0.15, 32, 32);
  const avatarMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  
  const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
  
  // Position at the last point of the journey
  const lastPointIdx = numberOfPoints - 1;
  avatar.position.set(
    spiralPoints[lastPointIdx * 3],
    spiralPoints[lastPointIdx * 3 + 1],
    spiralPoints[lastPointIdx * 3 + 2]
  );
  
  scene.add(avatar);
  
  // Animation functions
  const update = () => {
    // Pulse milestones
    const time = Date.now() * 0.001;
    
    milestones.forEach((milestone, index) => {
      const pulse = Math.sin(time * 2 + index * 0.5) * 0.3 + 1;
      milestone.object.scale.set(pulse, pulse, pulse);
    });
    
    // Pulse avatar
    const avatarPulse = Math.sin(time * 3) * 0.3 + 1.5;
    avatar.scale.set(avatarPulse, avatarPulse, avatarPulse);
    
    // Rotate the whole scene slowly
    scene.rotation.y += 0.003;
  };
  
  // Dispose function for cleanup
  const dispose = () => {
    spiralGeometry.dispose();
    spiralMaterial.dispose();
    milestoneGeometry.dispose();
    milestones.forEach(milestone => {
      milestone.object.material.dispose();
    });
    avatarGeometry.dispose();
    avatarMaterial.dispose();
  };
  
  return [
    {
      update,
      dispose,
    },
  ];
};

/**
 * Create abilities visualization
 */
const createAbilitiesVisualization = (scene, stats) => {
  // Abilities visual representation
  const abilities = [
    { name: 'phaseShift', color: 0x00ffff, size: 0.7, uses: 42 },
    { name: 'timeDilation', color: 0xff00ff, size: 0.6, uses: 35 },
    { name: 'molecularReconstruction', color: 0x00ff88, size: 0.5, uses: 28 },
    { name: 'quantumTeleportation', color: 0xffaa00, size: 0.8, uses: 22 },
  ];
  
  // Total uses to normalize
  const totalUses = abilities.reduce((sum, ability) => sum + ability.uses, 0);
  
  // Create orbital system for abilities
  const orbitals = [];
  const center = new THREE.Vector3(0, 0, 0);
  
  abilities.forEach((ability, index) => {
    // Calculate orbit radius
    const radius = index * 0.5 + 1;
    
    // Create orbital ring
    const ringGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: ability.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    
    // Create ability sphere
    const sphereGeometry = new THREE.SphereGeometry(ability.size * 0.2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: ability.color,
      transparent: true,
      opacity: 0.7,
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    // Initial position on the orbit
    const angle = index * (Math.PI / 2);
    sphere.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
    
    scene.add(sphere);
    
    // Create usage particles
    const particleCount = Math.ceil((ability.uses / totalUses) * 100);
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const particleAngle = Math.random() * Math.PI * 2;
      const deviation = (Math.random() - 0.5) * 0.1;
      
      positions[i * 3] = Math.cos(particleAngle) * (radius + deviation);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = Math.sin(particleAngle) * (radius + deviation);
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: ability.color,
      size: 0.06,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Store for animation
    orbitals.push({
      ring,
      sphere,
      particleSystem,
      radius,
      initialAngle: angle,
      speed: 0.5 - index * 0.1,
      color: ability.color,
    });
  });
  
  // Create central core
  const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(core);
  
  // Animation function
  const update = () => {
    const time = Date.now() * 0.001;
    
    // Animate orbitals
    orbitals.forEach((orbital, index) => {
      // Orbit rotation
      const angle = orbital.initialAngle + time * orbital.speed;
      
      orbital.sphere.position.set(
        Math.cos(angle) * orbital.radius,
        0,
        Math.sin(angle) * orbital.radius
      );
      
      // Pulse rings
      const pulseFactor = Math.sin(time * 2 + index) * 0.1 + 1;
      orbital.ring.scale.set(pulseFactor, pulseFactor, 1);
      
      // Rotate particle systems slowly
      orbital.particleSystem.rotation.y = time * 0.1;
    });
    
    // Pulse core
    const corePulse = Math.sin(time * 3) * 0.2 + 1;
    core.scale.set(corePulse, corePulse, corePulse);
    
    // Shift core color
    const hue = (time * 0.1) % 1;
    core.material.color.setHSL(hue, 1, 0.5);
    
    // Rotate the entire scene slightly
    scene.rotation.y += 0.001;
    scene.rotation.x = Math.sin(time * 0.2) * 0.1;
  };
  
  // Dispose function for cleanup
  const dispose = () => {
    orbitals.forEach(orbital => {
      orbital.ring.geometry.dispose();
      orbital.ring.material.dispose();
      orbital.sphere.geometry.dispose();
      orbital.sphere.material.dispose();
      orbital.particleSystem.geometry.dispose();
      orbital.particleSystem.material.dispose();
    });
    
    coreGeometry.dispose();
    coreMaterial.dispose();
  };
  
  return [
    {
      update,
      dispose,
    },
  ];
};

/**
 * Create exploration visualization
 */
const createExplorationVisualization = (scene, stats) => {
  // Create terrain representing explored areas
  const terrainSize = 10;
  const resolution = 64;
  const terrainGeometry = new THREE.PlaneGeometry(
    terrainSize, 
    terrainSize, 
    resolution - 1, 
    resolution - 1
  );
  
  // Generate height map
  const positions = terrainGeometry.attributes.position.array;
  const circlesExplored = Math.min(stats.circlesExplored, 9);
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    
    // Distance from center
    const distFromCenter = Math.sqrt(x * x + z * z);
    
    // Base height is inversely proportional to distance (higher at center)
    let height = Math.max(0, 0.5 - distFromCenter / terrainSize);
    
    // Concentric circles for explored levels
    for (let circle = 1; circle <= circlesExplored; circle++) {
      const circleRadius = (circle / 9) * (terrainSize / 2);
      const circleFactor = Math.abs(distFromCenter - circleRadius);
      
      if (circleFactor < 0.5) {
        // Ridge at circle boundary
        height += 0.5 * (0.5 - circleFactor);
      }
    }
    
    // Add some noise
    height += (Math.random() - 0.5) * 0.05;
    
    // Set Y (height)
    positions[i + 1] = height;
  }
  
  // Update geometry
  terrainGeometry.attributes.position.needsUpdate = true;
  terrainGeometry.computeVertexNormals();
  
  // Create terrain material with gradient based on height
  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
  });
  
  // Add colors based on height
  const colors = [];
  for (let i = 0; i < positions.length; i += 3) {
    const height = positions[i + 1];
    
    // Base color is distance-based
    const distFromCenter = Math.sqrt(
      positions[i] * positions[i] + positions[i + 2] * positions[i + 2]
    );
    
    // Normalize to [0, 1]
    const normalizedDist = Math.min(1, distFromCenter / (terrainSize / 2));
    
    // Different color bands based on distance (representing levels)
    if (normalizedDist < 0.1) {
      // Center - white/cyan
      colors.push(0.7, 1.0, 1.0);
    } else if (normalizedDist < circlesExplored / 9) {
      // Explored region - interpolate to purple
      const t = normalizedDist / (circlesExplored / 9);
      colors.push(
        0.7 * (1 - t) + 0.5 * t,
        1.0 * (1 - t) + 0.0 * t,
        1.0 * (1 - t) + 0.5 * t
      );
    } else {
      // Unexplored - dark blue/black
      const t = Math.min(1, (normalizedDist - circlesExplored / 9) * 5);
      colors.push(
        0.1 * (1 - t) + 0.0 * t,
        0.2 * (1 - t) + 0.0 * t,
        0.3 * (1 - t) + 0.0 * t
      );
    }
  }
  
  const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
  terrainGeometry.setAttribute('color', colorAttribute);
  
  // Create terrain mesh
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -1;
  scene.add(terrain);
  
  // Add exploration markers at interesting points
  const markers = [];
  const markerCount = Math.min(10, stats.itemsCollected / 4);
  
  for (let i = 0; i < markerCount; i++) {
    // Only place markers in explored regions
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (circlesExplored / 9) * (terrainSize / 2);
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Find height at this position (approximate)
    let height = 0;
    const distFromCenter = Math.sqrt(x * x + z * z);
    height = Math.max(0, 0.5 - distFromCenter / terrainSize);
    
    // Add marker
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / markerCount, 1, 0.5),
      transparent: true,
      opacity: 0.8,
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, height, z);
    terrain.add(marker);
    
    markers.push({
      object: marker,
      baseHeight: height,
    });
  }
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);
  
  // Animation functions
  const update = () => {
    const time = Date.now() * 0.001;
    
    // Rotate terrain slowly
    terrain.rotation.z += 0.002;
    
    // Animate markers
    markers.forEach((marker, index) => {
      marker.object.position.y = marker.baseHeight + Math.sin(time * 2 + index) * 0.1 + 0.2;
    });
  };
  
  // Dispose function for cleanup
  const dispose = () => {
    terrainGeometry.dispose();
    terrainMaterial.dispose();
    markers.forEach(marker => {
      marker.object.geometry.dispose();
      marker.object.material.dispose();
    });
  };
  
  return [
    {
      object: terrain,
      update,
      dispose,
    },
  ];
};

/**
 * The main QuantumResultsSummary component
 */
const QuantumResultsSummary = ({ isOpen, onClose }) => {
  const quantumGame = useQuantumGame();
  const leaderboard = useLeaderboard();
  const transitionManager = useQuantumTransition();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [resultsData, setResultsData] = useState(null);
  const [exportTitle, setExportTitle] = useState('');
  const [exportFormat, setExportFormat] = useState('png');
  const [isExporting, setIsExporting] = useState(false);
  
  // Canvas reference for export
  const exportCanvasRef = useRef(null);
  
  // Load results data
  useEffect(() => {
    if (isOpen) {
      // In a real app, we would generate this from game state
      // For now, we'll use mock data
      const mockData = generateMockResultsData();
      setResultsData(mockData);
      setExportTitle(mockData.title);
    }
  }, [isOpen]);
  
  /**
   * Render stats cards grid
   */
  const renderStatsGrid = () => {
    if (!resultsData) return null;
    
    const stats = [
      { label: 'Level', value: resultsData.stats.level, color: '#00ddff' },
      { label: 'Quantum Energy', value: `${resultsData.stats.quantumEnergy}/${resultsData.stats.maxQuantumEnergy}`, color: '#00ffaa' },
      { label: 'Scientific Knowledge', value: `${resultsData.stats.scientificKnowledge}/${resultsData.stats.maxScientificKnowledge}`, color: '#aa00ff' },
      { label: 'Achievement Points', value: resultsData.stats.achievementPoints, color: '#ffaa00' },
      { label: 'Play Time', value: resultsData.stats.totalPlayTime, color: '#ff00aa' },
      { label: 'Circles Explored', value: resultsData.stats.circlesExplored, color: '#00ccff' },
      { label: 'Items Collected', value: resultsData.stats.itemsCollected, color: '#88ff00' },
      { label: 'Abilities Used', value: resultsData.stats.abilitiesUsed, color: '#ff0088' },
    ];
    
    return (
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} color={stat.color}>
            <div className="value">{stat.value}</div>
            <div className="label">{stat.label}</div>
          </StatCard>
        ))}
      </StatsGrid>
    );
  };
  
  /**
   * Render progress bars
   */
  const renderProgressBars = () => {
    if (!resultsData) return null;
    
    return (
      <ProgressList>
        <h3>Progress</h3>
        
        {Object.entries(resultsData.progress).map(([key, data], index) => (
          <ProgressItem 
            key={index} 
            percent={(data.value / data.max) * 100} 
            color={data.color}
          >
            <div className="header">
              <div className="title">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
              <div className="value">{data.value}/{data.max}</div>
            </div>
            <div className="bar">
              <div className="fill"></div>
            </div>
          </ProgressItem>
        ))}
      </ProgressList>
    );
  };
  
  /**
   * Render insights list
   */
  const renderInsights = () => {
    if (!resultsData) return null;
    
    return (
      <InsightsList>
        <h3>Insights & Observations</h3>
        <ul>
          {resultsData.insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </InsightsList>
    );
  };
  
  /**
   * Share results to social media
   */
  const shareResults = () => {
    if (!resultsData) return;
    
    const shareData = {
      title: exportTitle || resultsData.title,
      summary: `Level ${resultsData.stats.level} quantum scientist with ${resultsData.stats.achievementPoints} achievement points. Explored ${resultsData.stats.circlesExplored} circles of Dante's Quantum Inferno.`,
      findings: resultsData.insights.slice(0, 3),
    };
    
    // Generate image from canvas for sharing
    if (exportCanvasRef.current) {
      // Export settings
      const exportOptions = {
        theme: 'quantum',
        format: 'png',
      };
      
      // Generate shareable canvas
      generateExportCanvas(exportCanvasRef.current, exportTitle, resultsData, exportOptions);
      
      // Convert canvas to blob for sharing
      exportCanvasRef.current.toBlob((blob) => {
        shareData.imageBlob = blob;
        
        // In a real app, you would integrate with the QuantumSocialSharing component
        // to show the share dialog with this data
        console.log('Sharing results:', shareData);
        
        // For now, just alert the user
        alert('Sharing is not implemented in this demo.');
      });
    }
  };
  
  /**
   * Download results
   */
  const downloadResults = () => {
    if (!resultsData || !exportCanvasRef.current) return;
    
    setIsExporting(true);
    
    // Export settings
    const exportOptions = {
      theme: 'quantum',
      format: exportFormat,
    };
    
    // Generate export canvas
    generateExportCanvas(exportCanvasRef.current, exportTitle, resultsData, exportOptions);
    
    // Convert to appropriate format and download
    setTimeout(() => {
      let mimeType = 'image/png';
      let fileExtension = 'png';
      
      switch (exportFormat) {
        case 'jpg':
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
          break;
        case 'json':
          // For JSON, just export the data directly
          const jsonContent = JSON.stringify(resultsData, null, 2);
          const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          
          const jsonLink = document.createElement('a');
          jsonLink.href = jsonUrl;
          jsonLink.download = `${exportTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
          jsonLink.click();
          
          URL.revokeObjectURL(jsonUrl);
          setIsExporting(false);
          return;
      }
      
      // For image formats, use canvas
      exportCanvasRef.current.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${exportTitle.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`;
        downloadLink.click();
        
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }, mimeType);
    }, 500);
  };
  
  /**
   * Submit results to leaderboard
   */
  const submitToLeaderboard = () => {
    if (!resultsData) return;
    
    // This would integrate with the QuantumLeaderboardSystem
    // to submit scores to various leaderboards
    leaderboard.submitScore('overall', resultsData.stats.achievementPoints, {
      level: resultsData.stats.level,
      time: resultsData.stats.totalPlayTime,
      circles: resultsData.stats.circlesExplored,
    });
    
    // Show leaderboard after submission
    leaderboard.openLeaderboard();
  };
  
  /**
   * Generate export canvas
   */
  const generateExportCanvas = (canvas, title, data, options) => {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for sharing (Twitter card size)
    canvas.width = 1200;
    canvas.height = 630;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#050b2e');
    gradient.addColorStop(0.7, '#0c0424');
    gradient.addColorStop(1, '#120338');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw header
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM SALVATION', canvas.width / 2, 80);
    
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(title, canvas.width / 2, 140);
    
    // Draw divider
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 160);
    ctx.lineTo(canvas.width / 2 + 200, 160);
    ctx.stroke();
    
    // Draw stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    
    // Stats grid (3x2)
    const stats = [
      { label: 'Level', value: data.stats.level },
      { label: 'Achievement Points', value: data.stats.achievementPoints },
      { label: 'Quantum Energy', value: `${data.stats.quantumEnergy}/${data.stats.maxQuantumEnergy}` },
      { label: 'Scientific Knowledge', value: `${data.stats.scientificKnowledge}/${data.stats.maxScientificKnowledge}` },
      { label: 'Circles Explored', value: data.stats.circlesExplored },
      { label: 'Items Collected', value: data.stats.itemsCollected },
    ];
    
    const statX = 200;
    const statY = 220;
    const statSpacingX = 400;
    const statSpacingY = 60;
    
    stats.forEach((stat, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const x = statX + col * statSpacingX;
      const y = statY + row * statSpacingY;
      
      ctx.fillStyle = '#00ddff';
      ctx.fillText(stat.label, x, y);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(stat.value, x + 200, y);
    });
    
    // Draw insights
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Key Insights', canvas.width / 2, 380);
    
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    
    data.insights.slice(0, 3).forEach((insight, index) => {
      ctx.fillText(`• ${insight}`, 200, 420 + index * 40);
    });
    
    // Draw current rank
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Overall Leaderboard Rank: #${data.leaderboardRank.overall}`, canvas.width / 2, 560);
    
    // Draw footer
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText('quantumsalvation.com', canvas.width / 2, 600);
  };
  
  if (!isOpen || !resultsData) return null;
  
  return (
    <AnimatePresence>
      <ResultsContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ResultsPanel
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <ResultsHeader>
            <h2>Quantum Results Summary</h2>
            <button onClick={onClose}>×</button>
          </ResultsHeader>
          
          <TabsContainer>
            <Tab 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Tab>
            <Tab 
              active={activeTab === 'quantum'} 
              onClick={() => setActiveTab('quantum')}
            >
              Quantum Analysis
            </Tab>
            <Tab 
              active={activeTab === 'journey'} 
              onClick={() => setActiveTab('journey')}
            >
              Journey Map
            </Tab>
            <Tab 
              active={activeTab === 'abilities'} 
              onClick={() => setActiveTab('abilities')}
            >
              Abilities Usage
            </Tab>
            <Tab 
              active={activeTab === 'export'} 
              onClick={() => setActiveTab('export')}
            >
              Export & Share
            </Tab>
          </TabsContainer>
          
          {activeTab === 'overview' && (
            <>
              <VisualizationContainer>
                <QuantumVisualization 
                  visualizationType="quantum" 
                  stats={resultsData.stats} 
                />
              </VisualizationContainer>
              
              {renderStatsGrid()}
              {renderProgressBars()}
              {renderInsights()}
            </>
          )}
          
          {activeTab === 'quantum' && (
            <>
              <VisualizationContainer>
                <QuantumVisualization 
                  visualizationType="quantum" 
                  stats={resultsData.stats} 
                />
              </VisualizationContainer>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <StatCard color="#00ffaa">
                    <div className="value">{resultsData.stats.scientificKnowledge}/{resultsData.stats.maxScientificKnowledge}</div>
                    <div className="label">Scientific Knowledge</div>
                  </StatCard>
                  
                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ color: '#00ddff', marginBottom: '10px' }}>Knowledge Distribution</h3>
                    <ProgressItem percent={70} color="linear-gradient(90deg, #00ff88, #00ffaa)">
                      <div className="header">
                        <div className="title">Quantum Mechanics</div>
                        <div className="value">70%</div>
                      </div>
                      <div className="bar">
                        <div className="fill"></div>
                      </div>
                    </ProgressItem>
                    
                    <ProgressItem percent={55} color="linear-gradient(90deg, #00ff88, #00ffaa)">
                      <div className="header">
                        <div className="title">Particle Physics</div>
                        <div className="value">55%</div>
                      </div>
                      <div className="bar">
                        <div className="fill"></div>
                      </div>
                    </ProgressItem>
                    
                    <ProgressItem percent={85} color="linear-gradient(90deg, #00ff88, #00ffaa)">
                      <div className="header">
                        <div className="title">Quantum Entanglement</div>
                        <div className="value">85%</div>
                      </div>
                      <div className="bar">
                        <div className="fill"></div>
                      </div>
                    </ProgressItem>
                    
                    <ProgressItem percent={40} color="linear-gradient(90deg, #00ff88, #00ffaa)">
                      <div className="header">
                        <div className="title">Multiverse Theory</div>
                        <div className="value">40%</div>
                      </div>
                      <div className="bar">
                        <div className="fill"></div>
                      </div>
                    </ProgressItem>
                  </div>
                </div>
                
                <div>
                  <StatCard color="#00ddff">
                    <div className="value">{resultsData.stats.quantumEnergy}/{resultsData.stats.maxQuantumEnergy}</div>
                    <div className="label">Quantum Energy</div>
                  </StatCard>
                  
                  <InsightsList style={{ marginTop: '20px', maxHeight: 'none' }}>
                    <h3>Quantum Insights</h3>
                    <ul>
                      <li>Your quantum energy utilization efficiency is 87%, above average by 23%</li>
                      <li>You've observed quantum entanglement 12 times</li>
                      <li>Your understanding of wave-particle duality has increased by 35%</li>
                      <li>Quantum particles respond 15% more efficiently to your interaction</li>
                    </ul>
                  </InsightsList>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'journey' && (
            <>
              <VisualizationContainer>
                <QuantumVisualization 
                  visualizationType="journey" 
                  stats={resultsData.stats} 
                />
              </VisualizationContainer>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <StatCard color="#ff00aa">
                    <div className="value">{resultsData.stats.circlesExplored}/9</div>
                    <div className="label">Dante's Circles Explored</div>
                  </StatCard>
                  
                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ color: '#00ddff', marginBottom: '10px' }}>Circle Completion</h3>
                    
                    {[
                      { name: 'Surface', percent: 100, color: 'linear-gradient(90deg, #00ddff, #0088ff)' },
                      { name: 'Limbo', percent: 100, color: 'linear-gradient(90deg, #ff00aa, #ff0066)' },
                      { name: 'Lust', percent: 100, color: 'linear-gradient(90deg, #ff00aa, #ff0066)' },
                      { name: 'Gluttony', percent: 80, color: 'linear-gradient(90deg, #ff00aa, #ff0066)' },
                      { name: 'Greed', percent: 60, color: 'linear-gradient(90deg, #ff00aa, #ff0066)' },
                      { name: 'Anger', percent: 20, color: 'linear-gradient(90deg, #ff00aa, #ff0066)' },
                      { name: 'Heresy', percent: 0, color: 'linear-gradient(90deg, #555555, #333333)' },
                      { name: 'Violence', percent: 0, color: 'linear-gradient(90deg, #555555, #333333)' },
                      { name: 'Fraud', percent: 0, color: 'linear-gradient(90deg, #555555, #333333)' },
                    ].map((circle, index) => (
                      <ProgressItem 
                        key={index} 
                        percent={circle.percent} 
                        color={circle.color}
                      >
                        <div className="header">
                          <div className="title">{circle.name}</div>
                          <div className="value">{circle.percent}%</div>
                        </div>
                        <div className="bar">
                          <div className="fill"></div>
                        </div>
                      </ProgressItem>
                    ))}
                  </div>
                </div>
                
                <div>
                  <StatCard color="#88ff00">
                    <div className="value">{resultsData.stats.itemsCollected}</div>
                    <div className="label">Items Collected</div>
                  </StatCard>
                  
                  <InsightsList style={{ marginTop: '20px', maxHeight: 'none' }}>
                    <h3>Journey Observations</h3>
                    <ul>
                      <li>You spent the most time in the Circle of Limbo</li>
                      <li>You've found 82% of items in explored circles</li>
                      <li>Your exploration style is thorough, with 93% area coverage</li>
                      <li>You discovered 3 hidden passages that most explorers miss</li>
                      <li>Your path through Greed was 15% faster than average</li>
                    </ul>
                  </InsightsList>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'abilities' && (
            <>
              <VisualizationContainer>
                <QuantumVisualization 
                  visualizationType="abilities" 
                  stats={resultsData.stats} 
                />
              </VisualizationContainer>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <StatCard color="#ff0088">
                    <div className="value">{resultsData.stats.abilitiesUsed}</div>
                    <div className="label">Abilities Used</div>
                  </StatCard>
                  
                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ color: '#00ddff', marginBottom: '10px' }}>Ability Usage</h3>
                    
                    {[
                      { name: 'Phase Shift', percent: 35, color: 'linear-gradient(90deg, #00ffff, #0088ff)' },
                      { name: 'Time Dilation', percent: 28, color: 'linear-gradient(90deg, #ff00ff, #aa00ff)' },
                      { name: 'Molecular Reconstruction', percent: 20, color: 'linear-gradient(90deg, #00ff88, #00aa66)' },
                      { name: 'Quantum Teleportation', percent: 17, color: 'linear-gradient(90deg, #ffaa00, #ff8800)' },
                    ].map((ability, index) => (
                      <ProgressItem 
                        key={index} 
                        percent={ability.percent} 
                        color={ability.color}
                      >
                        <div className="header">
                          <div className="title">{ability.name}</div>
                          <div className="value">{ability.percent}%</div>
                        </div>
                        <div className="bar">
                          <div className="fill"></div>
                        </div>
                      </ProgressItem>
                    ))}
                  </div>
                </div>
                
                <div>
                  <StatCard color="#00ddff">
                    <div className="value">Level 3</div>
                    <div className="label">Ability Mastery</div>
                  </StatCard>
                  
                  <InsightsList style={{ marginTop: '20px', maxHeight: 'none' }}>
                    <h3>Ability Insights</h3>
                    <ul>
                      <li>Your Phase Shift efficiency has increased by 42% since first use</li>
                      <li>You tend to use Time Dilation in combat situations more than exploration</li>
                      <li>Your Molecular Reconstruction accuracy is in the top 15% of all scientists</li>
                      <li>You could improve Quantum Teleportation targeting by 18%</li>
                      <li>Your ability energy consumption is 12% below average (efficient)</li>
                    </ul>
                  </InsightsList>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'export' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#00ddff', marginBottom: '10px' }}>Title Your Results</h3>
                <TitleInput
                  value={exportTitle}
                  onChange={(e) => setExportTitle(e.target.value)}
                  placeholder="Enter a title for your results..."
                />
                
                <h3 style={{ color: '#00ddff', marginBottom: '10px' }}>Export Format</h3>
                <ExportFormatSelect
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <option value="png">PNG Image</option>
                  <option value="jpg">JPG Image</option>
                  <option value="json">JSON Data</option>
                </ExportFormatSelect>
              </div>
              
              <VisualizationContainer style={{ height: '200px' }}>
                <canvas 
                  ref={exportCanvasRef} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </VisualizationContainer>
              
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#00ddff', marginBottom: '10px' }}>Share Options</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <StatCard>
                    <div className="value">#{resultsData.leaderboardRank.overall}</div>
                    <div className="label">Overall Rank</div>
                  </StatCard>
                  
                  <StatCard>
                    <div className="value">#{resultsData.leaderboardRank.scientific}</div>
                    <div className="label">Scientific Rank</div>
                  </StatCard>
                </div>
              </div>
            </>
          )}
          
          <ActionButtons>
            {activeTab === 'export' ? (
              <>
                <ActionButton
                  onClick={shareResults}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShareIcon />
                  Share Results
                </ActionButton>
                
                <ActionButton
                  onClick={downloadResults}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isExporting}
                >
                  <DownloadIcon />
                  {isExporting ? 'Exporting...' : 'Download'}
                </ActionButton>
                
                <ActionButton
                  onClick={submitToLeaderboard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LeaderboardIcon />
                  Submit to Leaderboard
                </ActionButton>
              </>
            ) : (
              <ActionButton 
                primary
                onClick={() => setActiveTab('export')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Export & Share Results
              </ActionButton>
            )}
          </ActionButtons>
        </ResultsPanel>
      </ResultsContainer>
    </AnimatePresence>
  );
};

/**
 * Hook to use the results summary system
 */
export const useResultsSummary = () => {
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  
  const openResults = () => setIsResultsOpen(true);
  const closeResults = () => setIsResultsOpen(false);
  
  const ResultsComponent = () => (
    <QuantumResultsSummary 
      isOpen={isResultsOpen} 
      onClose={closeResults} 
    />
  );
  
  return {
    openResults,
    closeResults,
    ResultsComponent,
  };
};

export default QuantumResultsSummary;