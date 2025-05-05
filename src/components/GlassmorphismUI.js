import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameState } from '../contexts/GameStateContext';
import { motion, AnimatePresence } from 'framer-motion';

// Glassmorphism styled components
const GlassPanel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  padding: 1.5rem;
  color: white;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -50%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(30deg);
    animation: shimmer 6s infinite;
    pointer-events: none;
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

const FloatingUI = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    bottom: 1rem;
    left: 1rem;
  }
`;

const ControlButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  
  &:hover {
    transform: scale(1.1);
    background: rgba(0, 0, 0, 0.7);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const PlayerStatsPanel = styled(GlassPanel)`
  position: fixed;
  top: 2rem;
  right: 2rem;
  width: 300px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    width: 250px;
    top: 1rem;
    right: 1rem;
  }
`;

const StatBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.value}%;
    background: ${props => props.color || 'linear-gradient(to right, #00ffff, #ff00ff)'};
    border-radius: 3px;
    transition: width 0.5s ease;
  }
`;

const StatLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span:first-child {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  span:last-child {
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const InventoryPanel = styled(GlassPanel)`
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  width: 80%;
  max-width: 900px;
  z-index: 990;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  overflow-y: auto;
  
  h3 {
    margin-top: 0;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  @media (max-width: 768px) {
    width: 90%;
    bottom: 1rem;
  }
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
`;

const InventoryItem = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    opacity: 0.5;
    background: ${props => props.color || 'linear-gradient(45deg, #00ffff33, #ff00ff33)'};
  }
`;

const TooltipContent = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.8rem;
  max-width: 200px;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1100;
  
  ${InventoryItem}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-5px);
  }
`;

const AchievementToast = styled(motion.div)`
  position: fixed;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid #00ffff;
  border-radius: 8px;
  padding: 1rem;
  color: white;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: #00ffff;
  }
`;

// Example inventory items for demonstration
const demoInventoryItems = [
  { id: 1, name: 'Quantum Crystal', description: 'A crystal that exists in multiple states simultaneously', color: 'linear-gradient(45deg, #00ffff33, #0000ff33)' },
  { id: 2, name: 'Consciousness Amplifier', description: 'Enhances your ability to perceive quantum states', color: 'linear-gradient(45deg, #ff00ff33, #ff000033)' },
  { id: 3, name: 'Entanglement Key', description: 'Allows you to create entangled particle pairs', color: 'linear-gradient(45deg, #ffff0033, #00ff0033)' },
];

// UI Icons as SVG components
const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AchievementIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// Main GlassmorphismUI component
const GlassmorphismUI = () => {
  const { 
    playerStats, 
    isGlassmorphismEnabled,
    toggleGlassmorphism,
    inventory = demoInventoryItems // Use demo items if inventory is empty
  } = useGameState();
  
  const [showStats, setShowStats] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  
  // Exit early if glassmorphism UI is disabled
  if (!isGlassmorphismEnabled) {
    return null;
  }
  
  // Demo function to show achievement toast
  const triggerAchievementToast = () => {
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3000);
  };
  
  return (
    <>
      {/* Floating controls */}
      <FloatingUI>
        <ControlButton onClick={() => setShowStats(!showStats)}>
          <StatsIcon />
        </ControlButton>
        
        <ControlButton onClick={() => setShowInventory(!showInventory)}>
          <InventoryIcon />
        </ControlButton>
        
        <ControlButton onClick={triggerAchievementToast}>
          <AchievementIcon />
        </ControlButton>
        
        <ControlButton onClick={toggleGlassmorphism}>
          <SettingsIcon />
        </ControlButton>
      </FloatingUI>
      
      {/* Player stats panel */}
      <AnimatePresence>
        {showStats && (
          <PlayerStatsPanel
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <h3>Quantum Stats</h3>
            
            <StatLabel>
              <span>Energy</span>
              <span>{playerStats.energy}%</span>
            </StatLabel>
            <StatBar value={playerStats.energy} color="linear-gradient(to right, #00ffff, #0088ff)" />
            
            <StatLabel>
              <span>Knowledge</span>
              <span>{playerStats.knowledge}%</span>
            </StatLabel>
            <StatBar value={playerStats.knowledge} color="linear-gradient(to right, #ff00ff, #ff0088)" />
            
            <StatLabel>
              <span>Consciousness</span>
              <span>{playerStats.consciousness}%</span>
            </StatLabel>
            <StatBar value={playerStats.consciousness} color="linear-gradient(to right, #ffff00, #88ff00)" />
          </PlayerStatsPanel>
        )}
      </AnimatePresence>
      
      {/* Inventory panel */}
      <AnimatePresence>
        {showInventory && (
          <InventoryPanel
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <h3>Quantum Inventory</h3>
            
            <InventoryGrid>
              {inventory.map(item => (
                <InventoryItem key={item.id} color={item.color}>
                  {item.name.substring(0, 1)}
                  <TooltipContent>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                  </TooltipContent>
                </InventoryItem>
              ))}
            </InventoryGrid>
          </InventoryPanel>
        )}
      </AnimatePresence>
      
      {/* Achievement toast notification */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementToast
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <AchievementIcon />
            <div>
              <strong>Achievement Unlocked!</strong>
              <p>Quantum Observer: Witnessed the wave function collapse</p>
            </div>
          </AchievementToast>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlassmorphismUI;