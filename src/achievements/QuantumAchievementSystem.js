import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantumGame } from '../state/QuantumGameStateManager';
import { useGameState } from '../contexts/GameStateContext';

/**
 * QuantumAchievementSystem
 * 
 * Comprehensive achievement tracking system for Quantum Salvation, with categories,
 * progress tracking, notifications, and rewards, using a quantum-themed design.
 */

// Achievement data structure
const ACHIEVEMENT_CATEGORIES = {
  DISCOVERY: 'discovery',
  MASTERY: 'mastery',
  EXPLORATION: 'exploration',
  CHALLENGE: 'challenge',
  COLLECTION: 'collection',
  SECRET: 'secret',
};

// Styled components
const AchievementContainer = styled(motion.div)`
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

const AchievementPanel = styled(motion.div)`
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

const AchievementHeader = styled.div`
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

const AchievementStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .value {
      font-size: 28px;
      font-weight: bold;
      color: #00ddff;
      margin-bottom: 5px;
    }
    
    .label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

const AchievementTabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 200, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 200, 255, 0.5);
  }
`;

const AchievementTab = styled.button`
  background: ${props => props.active ? 'rgba(0, 200, 255, 0.2)' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#00ddff' : 'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  padding: 12px 20px;
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  .count {
    display: inline-block;
    background: ${props => props.active ? 'rgba(0, 200, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
    border-radius: 20px;
    padding: 2px 8px;
    font-size: 12px;
    margin-left: 8px;
  }
  
  &:hover {
    background: rgba(0, 200, 255, 0.1);
    color: white;
  }
`;

const SearchInput = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 20px;
  color: white;
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: rgba(0, 200, 255, 0.6);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  overflow-y: auto;
  max-height: 60vh;
  padding-right: 10px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 200, 255, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 200, 255, 0.5);
  }
`;

const AchievementCard = styled(motion.div)`
  background: ${props => props.unlocked ? 'rgba(0, 50, 100, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${props => props.unlocked ? 'rgba(0, 200, 255, 0.5)' : 'rgba(100, 100, 100, 0.2)'};
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  ${props => !props.unlocked && !props.secret && `
    filter: grayscale(1);
    &:hover {
      filter: grayscale(0.7);
    }
  `}
  
  ${props => props.secret && !props.unlocked && `
    .icon, .title, .description {
      filter: blur(5px);
    }
    &:hover {
      .icon, .title, .description {
        filter: blur(3px);
      }
    }
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 150, 255, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: ${props => props.progressPercent ?? 0}%;
    background: linear-gradient(180deg, rgba(0, 200, 255, 0.1), transparent);
    pointer-events: none;
  }
`;

const AchievementIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 15px;
  background: ${props => props.unlocked ? props.backgroundColor || 'rgba(0, 200, 255, 0.2)' : 'rgba(50, 50, 50, 0.3)'};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: ${props => props.unlocked ? props.color || '#00ddff' : '#555'};
  border: 2px solid ${props => props.unlocked ? props.borderColor || 'rgba(0, 200, 255, 0.5)' : 'rgba(100, 100, 100, 0.2)'};
  position: relative;
  
  img, svg {
    width: 35px;
    height: 35px;
    object-fit: contain;
  }
  
  ${props => props.rarity === 'rare' && `
    &::after {
      content: '';
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffd700'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E");
      background-size: contain;
    }
  `}
  
  ${props => props.rarity === 'epic' && `
    &::after {
      content: '';
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23aa00ff'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E");
      background-size: contain;
    }
  `}
  
  ${props => props.rarity === 'legendary' && `
    &::after {
      content: '';
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff6600'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E");
      background-size: contain;
    }
  `}
`;

const AchievementTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  text-align: center;
  color: ${props => props.unlocked ? '#ffffff' : '#777777'};
`;

const AchievementDescription = styled.p`
  margin: 0 0 15px 0;
  font-size: 14px;
  text-align: center;
  color: ${props => props.unlocked ? 'rgba(255, 255, 255, 0.7)' : 'rgba(150, 150, 150, 0.7)'};
`;

const AchievementProgress = styled.div`
  margin-top: auto;
  
  .label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }
  
  .bar {
    height: 6px;
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    overflow: hidden;
    
    .fill {
      height: 100%;
      width: ${props => props.percent ?? 0}%;
      background: linear-gradient(90deg, #0088ff, #00ddff);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
  }
`;

const AchievementReward = styled.div`
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: ${props => props.unlocked ? '#ffcc00' : '#666'};
  text-align: center;
  
  strong {
    color: ${props => props.unlocked ? '#ffdd44' : '#777'};
  }
`;

const AchievementBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: ${props => {
    switch (props.category) {
      case 'discovery': return 'rgba(0, 200, 255, 0.9)';
      case 'mastery': return 'rgba(255, 0, 200, 0.9)';
      case 'exploration': return 'rgba(100, 200, 0, 0.9)';
      case 'challenge': return 'rgba(255, 100, 0, 0.9)';
      case 'collection': return 'rgba(180, 100, 255, 0.9)';
      case 'secret': return 'rgba(255, 200, 0, 0.9)';
      default: return 'rgba(150, 150, 150, 0.9)';
    }
  }};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const AchievementDate = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 10px;
`;

const AchievementDetails = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 15, 35, 0.98);
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 16px;
  padding: 24px;
  width: 500px;
  max-width: 90vw;
  color: white;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 3000;
  
  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
    text-align: center;
    background: linear-gradient(120deg, #00ffff, #0088ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }
`;

const AchievementToast = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: rgba(10, 15, 35, 0.95);
  border-left: 4px solid #00ddff;
  border-radius: 8px;
  padding: 15px;
  width: 300px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 15px;
  
  .icon {
    width: 40px;
    height: 40px;
    background: rgba(0, 200, 255, 0.2);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: #00ddff;
    border: 2px solid rgba(0, 200, 255, 0.5);
  }
  
  .content {
    flex: 1;
    
    h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
  }
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: white;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    max-width: 400px;
  }
`;

// Icons for achievement categories
const CategoryIcons = {
  [ACHIEVEMENT_CATEGORIES.DISCOVERY]: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
    </svg>
  ),
  [ACHIEVEMENT_CATEGORIES.MASTERY]: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
    </svg>
  ),
  [ACHIEVEMENT_CATEGORIES.EXPLORATION]: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,10.9L9.39,8.29L10.81,6.87L12,8.09L15.19,4.88L16.61,6.3L12,10.9Z" />
    </svg>
  ),
  [ACHIEVEMENT_CATEGORIES.CHALLENGE]: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.68,6.44C12.56,5.83 12.07,5.34 11.46,5.21L7.82,4.39C7.21,4.26 6.58,4.53 6.25,5.05L4.12,8.12C3.79,8.64 3.82,9.3 4.21,9.79L6.97,12.5L6.82,12.94C6.77,13.1 6.72,13.26 6.67,13.42L5.59,12.34C5.18,11.94 4.53,11.94 4.12,12.34L1.44,15.03C1.03,15.43 1.03,16.08 1.44,16.5C1.84,16.9 2.5,16.9 2.91,16.5L5.59,13.81L6.94,15.16C6.77,16.75 6.96,18.69 8.21,19.94C9.19,20.91 10.67,21.25 12.08,20.95L14.77,20.24C14.92,20.21 15,20.06 15,19.92V19.62C15,19.5 14.9,19.42 14.79,19.42C14.03,19.42 13.42,18.81 13.42,18.05C13.42,17.29 14.03,16.68 14.79,16.68C15.54,16.68 16.16,17.29 16.16,18.05V19.3C16.16,19.45 16.25,19.58 16.4,19.61L19.61,20.16C19.76,20.19 19.9,20.07 19.93,19.92C20.2,18.71 20.03,17.34 19.22,16.54C18.25,15.56 16.62,15.5 15.57,16.4C15.37,16.57 15.08,16.57 14.88,16.4C14.68,16.23 14.68,15.95 14.88,15.75C16.31,14.54 18.53,14.55 19.95,15.97C21.22,17.24 21.61,19.16 20.83,20.76C20.75,20.93 20.58,21.05 20.38,21.03L16.41,20.4C16.2,20.37 16,20.55 16,20.76C16,20.97 15.83,21.15 15.62,21.15C15.38,21.15 15.19,20.97 15.17,20.73L12.5,21.54C10.8,21.88 9.12,21.47 8,20.35C6.72,19.07 6.72,17.05 7.13,15.5C7.13,15.5 7.15,15.43 7.16,15.4C7.19,15.27 7.24,15.14 7.29,15.01L7.65,13.92L7.26,13.16C7.1,12.87 7.1,12.5 7.26,12.21L7.54,11.65L4.12,8.29C3.32,7.5 3.26,6.3 3.97,5.43L6.11,2.36C6.79,1.53 7.97,1.12 9.07,1.36L12.71,2.18C14.06,2.47 15.04,3.59 15.16,4.98L15.5,10.26C13.5,7.5 10.5,9 10.5,9L11.19,11.17C11.19,11.17 13,10 13,11.5C13,13 13.6,15.44 14.94,16.28C15.97,16.84 17.35,16.69 18.25,15.79C18.65,15.38 18.65,14.73 18.25,14.33C17.85,13.92 17.2,13.92 16.79,14.33C16.5,14.61 16.08,14.74 15.67,14.66C15.46,14.63 15.29,14.46 15.27,14.25C15.25,14.05 15.4,13.87 15.6,13.84C16.35,13.72 17.11,13.45 17.66,12.91C18.47,12.1 18.47,10.8 17.66,10C16.86,9.2 15.56,9.2 14.75,10L14.28,10.47C14.1,10.65 13.83,10.65 13.65,10.47C13.46,10.28 13.46,9.99 13.67,9.8C14.67,8.88 16.28,8.88 17.26,9.8C18.62,11.16 18.62,13.34 17.26,14.7C16.27,15.69 14.8,16.06 13.5,15.63C12.45,15.28 11.66,14.23 11.3,13.37C11.12,12.93 11.04,12.62 11,12.41L10.58,11.13C10.58,11.13 10,11.5 9,11.5C8,11.5 7.64,10.87 7.14,10.87C7.1,10.87 9.44,13 11.44,11L11.27,9.8C10.64,10.3 9.4,10.5 8.35,9.7C7.32,8.93 6.9,7.5 7.03,6.21L7.5,2C7.53,1.8 7.4,1.61 7.21,1.57C7.02,1.5 6.81,1.66 6.77,1.86L6.37,5.7C6.29,6.5 6.57,7.33 7.17,7.93L9.71,10.5L8,13L9.5,15.5L8.75,16.71L9.88,16.94C9.89,16.94 13.64,17.92 13.92,13.5C13.04,12.65 12.7,10.97 13.34,10.5C13.97,10.03 16,10.68 16,8.68C16,6.68 15.59,5.82 16.25,5.82C16.92,5.82 17.54,6.74 17.12,9.57L17.54,2.82C17.63,1.83 17.05,0.93 16.12,0.53C15.2,0.14 14.15,0.33 13.45,1.03L12.72,1.76C12.59,1.89 12.4,1.91 12.25,1.79C12.09,1.67 12.05,1.47 12.14,1.29C12.19,1.21 12.24,1.13 12.31,1.07L13.04,0.34C14.07,-0.7 15.67,-0.2 17.05,0.38C18.45,0.97 19.33,2.33 19.21,3.86L18.76,10.75L18.96,11.44L19.49,12.36C19.73,12.71 19.84,13.13 19.82,13.55L19.29,12.63C19.21,12.5 19.05,12.44 18.9,12.5L18.6,12.64C18.41,12.74 18.35,12.97 18.45,13.16L19.25,14.5C19.35,14.68 19.57,14.73 19.76,14.63L20.78,14.15C21.07,14 21.5,14.2 21.5,14.54V15.5C21.5,16.5 20.92,18.29 20.92,18.29C20.86,18.47 20.64,18.54 20.46,18.47C20.28,18.4 20.2,18.2 20.23,18L20.5,17.6C20.5,17.6 21,16.12 21,15.5V14.94L20.23,15.32L19.22,13.8L19.89,13.5C19.95,13.47 20.03,13.44 20.11,13.45C20.88,13.5 21.5,14.18 21.5,15V16.41C21.5,16.97 21.31,17.5 20.97,17.9C20.01,19.17 18.5,19.5 18.5,19.5L16.94,19.13C17.11,18.77 17.21,18.38 17.21,17.97C17.21,16.83 16.36,15.87 15.27,15.69C14.37,15.54 13.5,15.82 12.92,16.47C12.32,17.11 12.21,18 12.53,18.72C12.71,19.16 13.05,19.55 13.46,19.78L10.77,20.41C9.59,20.67 8.33,20.36 7.53,19.54C6.5,18.5 6.5,17 6.58,15.78L5.5,14.7L4.58,15.62C4.18,16.03 3.53,16.03 3.12,15.62C2.71,15.22 2.71,14.56 3.12,14.16L5.8,11.5L6.88,12.58C6.94,12.42 6.99,12.28 7.05,12.13L10.33,14.23C10.5,14.32 10.68,14.29 10.83,14.17C10.97,14.05 11.03,13.85 10.97,13.66C10.92,13.47 10.71,13.18 10.71,13.18L8.07,11.36L8.38,10.86L10.19,12.34C10.36,12.44 10.58,12.41 10.73,12.28C10.88,12.15 10.91,11.93 10.82,11.76L8.29,7.47C7.43,6.12 8.5,4.5 8.5,4.5L8.32,7.23C11.81,8.87 11.5,11.88 11.5,11.88C11.5,11.88 11.04,12.43 12.7,13.09C13.25,12.95 13.73,12.65 14.1,12.28L14.58,11.8C15.15,11.23 16.1,11.23 16.68,11.8C17.26,12.38 17.26,13.33 16.68,13.9C16.1,14.5 15.15,14.5 14.58,13.9C14.28,13.61 14.21,13.25 14.25,12.89L13.66,13.47C13.35,13.78 12.96,14 12.54,14.1C12.3,14.16 12.07,14.06 11.9,13.88C11.75,13.72 11.68,13.5 11.7,13.26C11.8,12.04 12.8,10.5 13.9,9.77L13.96,9.31L12.97,5.44C12.92,5.29 12.83,5.16 12.72,5.05L12.37,5.04L12.68,6.44Z" />
    </svg>
  ),
  [ACHIEVEMENT_CATEGORIES.COLLECTION]: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20,4V6H4V4H20M21,3H3V7H21V3M3,9H21V10H3V9M3,11H21V12H3V11M13,14H21V15H13V14M13,16H21V17H13V16M3,14H11V18H3V14Z" />
    </svg>
  ),
  [ACHIEVEMENT_CATEGORIES.SECRET]: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
    </svg>
  ),
};

// Trophy icon for achievements panel
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 2H17V4H7V2Z" fill="currentColor" />
    <path d="M9 4H15V6C15 7.10457 14.1046 8 13 8H11C9.89543 8 9 7.10457 9 6V4Z" fill="currentColor" />
    <path d="M11 8H13V14H11V8Z" fill="currentColor" />
    <path d="M9 14H15V16C15 17.1046 14.1046 18 13 18H11C9.89543 18 9 17.1046 9 16V14Z" fill="currentColor" />
    <path d="M7 18H17V20H7V18Z" fill="currentColor" />
    <path d="M7 20H17V22H7V20Z" fill="currentColor" />
    <path d="M9 12V14H6C4.34315 14 3 12.6569 3 11V4H7V6C7 7.65685 8.34315 9 10 9H11V12H9Z" fill="currentColor" />
    <path d="M15 12V14H18C19.6569 14 21 12.6569 21 11V4H17V6C17 7.65685 15.6569 9 14 9H13V12H15Z" fill="currentColor" />
  </svg>
);

/**
 * Generate mock achievement data for development
 */
const generateMockAchievements = () => {
  return {
    // Discovery achievements
    'quantum-observer': {
      id: 'quantum-observer',
      title: 'Quantum Observer',
      description: 'Observe your first quantum phenomenon',
      category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
      rarity: 'common',
      points: 10,
      reward: 'Unlock basic quantum abilities',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 1,
      progressMax: 1,
    },
    'particle-enthusiast': {
      id: 'particle-enthusiast',
      title: 'Particle Enthusiast',
      description: 'Discover 10 unique quantum particles',
      category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
      rarity: 'common',
      points: 25,
      reward: '+5 Scientific Knowledge',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 10,
      progressMax: 10,
    },
    'entanglement-theorist': {
      id: 'entanglement-theorist',
      title: 'Entanglement Theorist',
      description: 'Observe quantum entanglement between particles',
      category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
      rarity: 'rare',
      points: 50,
      reward: 'Unlock entanglement abilities',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 1,
      progressMax: 1,
    },
    'subatomic-cartographer': {
      id: 'subatomic-cartographer',
      title: 'Subatomic Cartographer',
      description: 'Map the structure of 20 subatomic particles',
      category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
      rarity: 'rare',
      points: 75,
      reward: '+10 Scientific Knowledge',
      unlocked: false,
      progress: 15,
      progressMax: 20,
    },
    'string-theory-pioneer': {
      id: 'string-theory-pioneer',
      title: 'String Theory Pioneer',
      description: 'Discover evidence supporting string theory',
      category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
      rarity: 'epic',
      points: 100,
      reward: 'Unlock dimensional manipulation',
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    'multiverse-documenter': {
      id: 'multiverse-documenter',
      title: 'Multiverse Documenter',
      description: 'Document 5 parallel universes',
      category: ACHIEVEMENT_CATEGORIES.DISCOVERY,
      rarity: 'legendary',
      points: 200,
      reward: 'Unlock multiverse travel',
      unlocked: false,
      progress: 0,
      progressMax: 5,
    },
    
    // Mastery achievements
    'quantum-novice': {
      id: 'quantum-novice',
      title: 'Quantum Novice',
      description: 'Reach level 5 in quantum mastery',
      category: ACHIEVEMENT_CATEGORIES.MASTERY,
      rarity: 'common',
      points: 10,
      reward: '+5 Max Quantum Energy',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 5,
      progressMax: 5,
    },
    'energy-manipulator': {
      id: 'energy-manipulator',
      title: 'Energy Manipulator',
      description: 'Successfully manipulate quantum energy 50 times',
      category: ACHIEVEMENT_CATEGORIES.MASTERY,
      rarity: 'common',
      points: 25,
      reward: '+10% Quantum Energy efficiency',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 50,
      progressMax: 50,
    },
    'phase-shifter': {
      id: 'phase-shifter',
      title: 'Phase Shifter',
      description: 'Use phase shift ability 20 times',
      category: ACHIEVEMENT_CATEGORIES.MASTERY,
      rarity: 'rare',
      points: 30,
      reward: 'Reduced phase shift cooldown',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 20,
      progressMax: 20,
    },
    'time-bender': {
      id: 'time-bender',
      title: 'Time Bender',
      description: 'Manipulate time dilation for a total of 5 minutes',
      category: ACHIEVEMENT_CATEGORIES.MASTERY,
      rarity: 'epic',
      points: 100,
      reward: 'Increased time dilation duration',
      unlocked: false,
      progress: 180,
      progressMax: 300,
    },
    'quantum-grandmaster': {
      id: 'quantum-grandmaster',
      title: 'Quantum Grandmaster',
      description: 'Reach level 30 in quantum mastery',
      category: ACHIEVEMENT_CATEGORIES.MASTERY,
      rarity: 'legendary',
      points: 250,
      reward: 'Unlock ultimate quantum ability',
      unlocked: false,
      progress: 12,
      progressMax: 30,
    },
    
    // Exploration achievements
    'surface-explorer': {
      id: 'surface-explorer',
      title: 'Surface Explorer',
      description: 'Explore the entire surface level',
      category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
      rarity: 'common',
      points: 15,
      reward: '+5 Max Health',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 1,
      progressMax: 1,
    },
    'limbo-visitor': {
      id: 'limbo-visitor',
      title: 'Limbo Visitor',
      description: 'Enter the first circle of Dante\'s Inferno',
      category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
      rarity: 'common',
      points: 20,
      reward: 'Unlock Limbo abilities',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 1,
      progressMax: 1,
    },
    'descent-pioneer': {
      id: 'descent-pioneer',
      title: 'Descent Pioneer',
      description: 'Reach the fifth circle of Dante\'s Inferno',
      category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
      rarity: 'rare',
      points: 50,
      reward: 'Unlock advanced navigation',
      unlocked: false,
      progress: 3,
      progressMax: 5,
    },
    'quantum-archaeologist': {
      id: 'quantum-archaeologist',
      title: 'Quantum Archaeologist',
      description: 'Discover 10 hidden quantum relics',
      category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
      rarity: 'epic',
      points: 100,
      reward: 'Unlock ancient quantum knowledge',
      unlocked: false,
      progress: 4,
      progressMax: 10,
    },
    'dimensional-nomad': {
      id: 'dimensional-nomad',
      title: 'Dimensional Nomad',
      description: 'Visit all 9 circles of Dante\'s Inferno',
      category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
      rarity: 'legendary',
      points: 200,
      reward: 'Unlock dimensional travel abilities',
      unlocked: false,
      progress: 3,
      progressMax: 9,
    },
    
    // Challenge achievements
    'first-challenge': {
      id: 'first-challenge',
      title: 'First Challenge',
      description: 'Complete your first quantum challenge',
      category: ACHIEVEMENT_CATEGORIES.CHALLENGE,
      rarity: 'common',
      points: 15,
      reward: '+10 Quantum Energy',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 1,
      progressMax: 1,
    },
    'paradox-solver': {
      id: 'paradox-solver',
      title: 'Paradox Solver',
      description: 'Solve 5 quantum paradoxes',
      category: ACHIEVEMENT_CATEGORIES.CHALLENGE,
      rarity: 'rare',
      points: 50,
      reward: '+15 Scientific Knowledge',
      unlocked: false,
      progress: 3,
      progressMax: 5,
    },
    'speed-of-thought': {
      id: 'speed-of-thought',
      title: 'Speed of Thought',
      description: 'Complete a level in under 60 seconds',
      category: ACHIEVEMENT_CATEGORIES.CHALLENGE,
      rarity: 'epic',
      points: 75,
      reward: 'Unlock enhanced movement speed',
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    'quantum-perfection': {
      id: 'quantum-perfection',
      title: 'Quantum Perfection',
      description: 'Achieve 100% accuracy in quantum manipulation',
      category: ACHIEVEMENT_CATEGORIES.CHALLENGE,
      rarity: 'legendary',
      points: 150,
      reward: 'Perfect quantum manipulation',
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    
    // Collection achievements
    'particle-collector': {
      id: 'particle-collector',
      title: 'Particle Collector',
      description: 'Collect 10 different quantum particles',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      rarity: 'common',
      points: 20,
      reward: '+5 Scientific Knowledge',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 10,
      progressMax: 10,
    },
    'tool-enthusiast': {
      id: 'tool-enthusiast',
      title: 'Tool Enthusiast',
      description: 'Collect 5 different quantum tools',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      rarity: 'rare',
      points: 40,
      reward: 'Unlock tool crafting',
      unlocked: false,
      progress: 3,
      progressMax: 5,
    },
    'knowledge-archive': {
      id: 'knowledge-archive',
      title: 'Knowledge Archive',
      description: 'Collect 20 quantum knowledge fragments',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      rarity: 'epic',
      points: 80,
      reward: '+25 Scientific Knowledge',
      unlocked: false,
      progress: 7,
      progressMax: 20,
    },
    'complete-collection': {
      id: 'complete-collection',
      title: 'Complete Collection',
      description: 'Collect all quantum items in the game',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      rarity: 'legendary',
      points: 250,
      reward: 'Ultimate collector\'s item',
      unlocked: false,
      progress: 25,
      progressMax: 100,
    },
    
    // Secret achievements
    'hidden-passage': {
      id: 'hidden-passage',
      title: 'Hidden Passage',
      description: 'Discover a secret quantum passage',
      category: ACHIEVEMENT_CATEGORIES.SECRET,
      rarity: 'rare',
      points: 30,
      reward: 'Access to secret area',
      unlocked: false,
      progress: 0,
      progressMax: 1,
      secret: true,
    },
    'quantum-anomaly': {
      id: 'quantum-anomaly',
      title: 'Quantum Anomaly',
      description: 'Experience a rare quantum anomaly',
      category: ACHIEVEMENT_CATEGORIES.SECRET,
      rarity: 'epic',
      points: 50,
      reward: 'Unique quantum ability',
      unlocked: false,
      progress: 0,
      progressMax: 1,
      secret: true,
    },
    'easter-egg': {
      id: 'easter-egg',
      title: 'Quantum Easter Egg',
      description: 'Find the developer\'s hidden message',
      category: ACHIEVEMENT_CATEGORIES.SECRET,
      rarity: 'legendary',
      points: 100,
      reward: 'Special cosmetic effect',
      unlocked: false,
      progress: 0,
      progressMax: 1,
      secret: true,
    },
  };
};

/**
 * Format a date string to relative time
 */
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Format a progress percentage
 */
const formatProgress = (current, max) => {
  return `${current}/${max}`;
};

/**
 * Calculate percentage of progress
 */
const calculatePercentage = (current, max) => {
  return Math.min(100, Math.round((current / max) * 100));
};

/**
 * The main QuantumAchievementSystem component
 */
const QuantumAchievementSystem = ({ isOpen, onClose }) => {
  const quantumGame = useQuantumGame();
  const gameState = useGameState();
  
  // State
  const [achievements, setAchievements] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Stats for achievements
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    points: 0,
    totalPoints: 0,
  });
  
  // Load achievements
  useEffect(() => {
    if (isOpen) {
      // In a real implementation, we'd get this from the game state
      // For now, we'll use mock data
      const mockAchievements = generateMockAchievements();
      setAchievements(mockAchievements);
      
      // Calculate stats
      const total = Object.keys(mockAchievements).length;
      const unlocked = Object.values(mockAchievements).filter(a => a.unlocked).length;
      const points = Object.values(mockAchievements)
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0);
      const totalPoints = Object.values(mockAchievements)
        .reduce((sum, a) => sum + a.points, 0);
      
      setStats({
        total,
        unlocked,
        points,
        totalPoints,
      });
    }
  }, [isOpen]);
  
  // Update filtered achievements when category or search query changes
  useEffect(() => {
    if (!achievements || Object.keys(achievements).length === 0) return;
    
    // First filter by category
    const categoryFilter = activeCategory === 'all' 
      ? Object.values(achievements)
      : Object.values(achievements).filter(a => a.category === activeCategory);
    
    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchResults = categoryFilter.filter(achievement => 
        achievement.title.toLowerCase().includes(query) || 
        achievement.description.toLowerCase().includes(query)
      );
      setFilteredAchievements(searchResults);
    } else {
      setFilteredAchievements(categoryFilter);
    }
  }, [achievements, activeCategory, searchQuery]);
  
  /**
   * Handle clicking on an achievement
   */
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowDetails(true);
  };
  
  /**
   * Close achievement details
   */
  const closeDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedAchievement(null);
    }, 300);
  };
  
  /**
   * Get achievement category counts
   */
  const getCategoryCounts = () => {
    if (!achievements || Object.keys(achievements).length === 0) return {};
    
    const counts = {
      all: Object.values(achievements).length,
    };
    
    // Count achievements in each category
    Object.values(ACHIEVEMENT_CATEGORIES).forEach(category => {
      counts[category] = Object.values(achievements).filter(a => a.category === category).length;
    });
    
    return counts;
  };
  
  /**
   * Render achievement category tabs
   */
  const renderCategoryTabs = () => {
    const counts = getCategoryCounts();
    
    return (
      <AchievementTabs>
        <AchievementTab 
          active={activeCategory === 'all'} 
          onClick={() => setActiveCategory('all')}
        >
          All
          <span className="count">{counts.all || 0}</span>
        </AchievementTab>
        
        <AchievementTab 
          active={activeCategory === ACHIEVEMENT_CATEGORIES.DISCOVERY} 
          onClick={() => setActiveCategory(ACHIEVEMENT_CATEGORIES.DISCOVERY)}
        >
          Discovery
          <span className="count">{counts[ACHIEVEMENT_CATEGORIES.DISCOVERY] || 0}</span>
        </AchievementTab>
        
        <AchievementTab 
          active={activeCategory === ACHIEVEMENT_CATEGORIES.MASTERY} 
          onClick={() => setActiveCategory(ACHIEVEMENT_CATEGORIES.MASTERY)}
        >
          Mastery
          <span className="count">{counts[ACHIEVEMENT_CATEGORIES.MASTERY] || 0}</span>
        </AchievementTab>
        
        <AchievementTab 
          active={activeCategory === ACHIEVEMENT_CATEGORIES.EXPLORATION} 
          onClick={() => setActiveCategory(ACHIEVEMENT_CATEGORIES.EXPLORATION)}
        >
          Exploration
          <span className="count">{counts[ACHIEVEMENT_CATEGORIES.EXPLORATION] || 0}</span>
        </AchievementTab>
        
        <AchievementTab 
          active={activeCategory === ACHIEVEMENT_CATEGORIES.CHALLENGE} 
          onClick={() => setActiveCategory(ACHIEVEMENT_CATEGORIES.CHALLENGE)}
        >
          Challenges
          <span className="count">{counts[ACHIEVEMENT_CATEGORIES.CHALLENGE] || 0}</span>
        </AchievementTab>
        
        <AchievementTab 
          active={activeCategory === ACHIEVEMENT_CATEGORIES.COLLECTION} 
          onClick={() => setActiveCategory(ACHIEVEMENT_CATEGORIES.COLLECTION)}
        >
          Collection
          <span className="count">{counts[ACHIEVEMENT_CATEGORIES.COLLECTION] || 0}</span>
        </AchievementTab>
        
        <AchievementTab 
          active={activeCategory === ACHIEVEMENT_CATEGORIES.SECRET} 
          onClick={() => setActiveCategory(ACHIEVEMENT_CATEGORIES.SECRET)}
        >
          Secret
          <span className="count">{counts[ACHIEVEMENT_CATEGORIES.SECRET] || 0}</span>
        </AchievementTab>
      </AchievementTabs>
    );
  };
  
  /**
   * Render achievement grid
   */
  const renderAchievements = () => {
    if (!filteredAchievements.length) {
      return (
        <EmptyState>
          <TrophyIcon />
          <h3>No achievements found</h3>
          <p>
            {searchQuery ? 
              'No achievements match your search criteria. Try a different search term.' : 
              'There are no achievements in this category yet.'}
          </p>
        </EmptyState>
      );
    }
    
    return (
      <AchievementGrid>
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            unlocked={achievement.unlocked}
            secret={achievement.secret}
            progressPercent={calculatePercentage(achievement.progress, achievement.progressMax)}
            onClick={() => handleAchievementClick(achievement)}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <AchievementBadge category={achievement.category}>
              {achievement.category.charAt(0).toUpperCase()}
            </AchievementBadge>
            
            <AchievementIcon 
              unlocked={achievement.unlocked}
              rarity={achievement.rarity}
              className="icon"
            >
              {CategoryIcons[achievement.category]?.()}
            </AchievementIcon>
            
            <AchievementTitle 
              unlocked={achievement.unlocked}
              className="title"
            >
              {achievement.title}
            </AchievementTitle>
            
            <AchievementDescription 
              unlocked={achievement.unlocked}
              className="description"
            >
              {achievement.description}
            </AchievementDescription>
            
            <AchievementProgress percent={calculatePercentage(achievement.progress, achievement.progressMax)}>
              <div className="label">
                <span>Progress</span>
                <span>{formatProgress(achievement.progress, achievement.progressMax)}</span>
              </div>
              <div className="bar">
                <div className="fill" />
              </div>
            </AchievementProgress>
            
            <AchievementReward unlocked={achievement.unlocked}>
              <strong>Reward:</strong> {achievement.reward}
            </AchievementReward>
            
            {achievement.unlocked && (
              <AchievementDate>
                Unlocked {formatRelativeTime(achievement.unlockedAt)}
              </AchievementDate>
            )}
          </AchievementCard>
        ))}
      </AchievementGrid>
    );
  };
  
  /**
   * Render achievement details
   */
  const renderAchievementDetails = () => {
    if (!selectedAchievement) return null;
    
    return (
      <AchievementDetails
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="close" onClick={closeDetails}>×</button>
        
        <h2>{selectedAchievement.title}</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <AchievementIcon 
            unlocked={selectedAchievement.unlocked}
            rarity={selectedAchievement.rarity}
            style={{ width: '80px', height: '80px', fontSize: '32px' }}
          >
            {CategoryIcons[selectedAchievement.category]?.()}
          </AchievementIcon>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', margin: '0 0 15px 0' }}>
            {selectedAchievement.description}
          </p>
          
          <div style={{ 
            display: 'inline-block', 
            padding: '5px 10px', 
            borderRadius: '15px',
            backgroundColor: 'rgba(0, 200, 255, 0.2)',
            color: '#00ddff',
            fontSize: '14px',
            marginBottom: '10px'
          }}>
            {selectedAchievement.category.charAt(0).toUpperCase() + selectedAchievement.category.slice(1)}
          </div>
          
          <div style={{ 
            display: 'inline-block', 
            padding: '5px 10px', 
            borderRadius: '15px',
            backgroundColor: 'rgba(255, 200, 0, 0.2)',
            color: '#ffcc00',
            fontSize: '14px',
            marginLeft: '10px'
          }}>
            {selectedAchievement.points} Points
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <AchievementProgress percent={calculatePercentage(selectedAchievement.progress, selectedAchievement.progressMax)}>
            <div className="label">
              <span>Progress</span>
              <span>{formatProgress(selectedAchievement.progress, selectedAchievement.progressMax)}</span>
            </div>
            <div className="bar">
              <div className="fill" />
            </div>
          </AchievementProgress>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#ffcc00' }}>Reward</h3>
          <p style={{ margin: '0', fontSize: '16px' }}>{selectedAchievement.reward}</p>
        </div>
        
        {selectedAchievement.unlocked ? (
          <div style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Unlocked {formatRelativeTime(selectedAchievement.unlockedAt)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
            {selectedAchievement.secret ? 'This achievement is hidden.' : 'This achievement is locked.'}
          </div>
        )}
      </AchievementDetails>
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <AchievementContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AchievementPanel
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <AchievementHeader>
            <h2>Quantum Achievements</h2>
            <button onClick={onClose}>×</button>
          </AchievementHeader>
          
          <AchievementStats>
            <div className="stat">
              <div className="value">{stats.unlocked}/{stats.total}</div>
              <div className="label">Completed</div>
            </div>
            
            <div className="stat">
              <div className="value">{Math.round((stats.unlocked / stats.total) * 100)}%</div>
              <div className="label">Completion</div>
            </div>
            
            <div className="stat">
              <div className="value">{stats.points}</div>
              <div className="label">Points Earned</div>
            </div>
            
            <div className="stat">
              <div className="value">{stats.totalPoints}</div>
              <div className="label">Total Points</div>
            </div>
          </AchievementStats>
          
          {renderCategoryTabs()}
          
          <SearchInput
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {renderAchievements()}
        </AchievementPanel>
        
        <AnimatePresence>
          {showDetails && renderAchievementDetails()}
        </AnimatePresence>
      </AchievementContainer>
    </AnimatePresence>
  );
};

/**
 * Achievement notification toast component
 */
export const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  if (!achievement) return null;
  
  return (
    <AchievementToast
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="icon">
        {CategoryIcons[achievement.category]?.()}
      </div>
      
      <div className="content">
        <h4>Achievement Unlocked!</h4>
        <p>{achievement.title}</p>
      </div>
    </AchievementToast>
  );
};

/**
 * Hook to use the achievement system
 */
export const useAchievements = () => {
  const quantumGame = useQuantumGame();
  const gameState = useGameState();
  
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState([]);
  
  const openAchievements = () => setIsAchievementsOpen(true);
  const closeAchievements = () => setIsAchievementsOpen(false);
  
  const AchievementsComponent = () => (
    <QuantumAchievementSystem 
      isOpen={isAchievementsOpen} 
      onClose={closeAchievements} 
    />
  );
  
  // Show achievement notification
  const showAchievementNotification = (achievement) => {
    setRecentAchievements(prev => [achievement, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setRecentAchievements(prev => prev.filter(a => a.id !== achievement.id));
    }, 5000);
  };
  
  /**
   * Check if an achievement with the given ID is unlocked
   * @param {string} achievementId - The achievement ID to check
   * @returns {boolean} True if unlocked, false otherwise
   */
  const isAchievementUnlocked = (achievementId) => {
    return Boolean(gameState?.achievements?.unlockedAchievements?.[achievementId]);
  };
  
  /**
   * Get progress for a specific achievement
   * @param {string} achievementId - The achievement ID
   * @returns {Object|null} Progress object or null if not found
   */
  const getAchievementProgress = (achievementId) => {
    // In a real implementation, we'd get this from the game state
    // For now, we'll use mock data
    const mockAchievements = generateMockAchievements();
    return mockAchievements[achievementId] || null;
  };
  
  /**
   * Update progress for an achievement
   * @param {string} achievementId - The achievement ID
   * @param {number} progress - The new progress value
   * @returns {Object} Result with success flag and unlocked status
   */
  const updateAchievementProgress = (achievementId, progress) => {
    // In a real implementation, we'd update the game state
    // For now, we'll just return a mock result
    const achievement = getAchievementProgress(achievementId);
    
    if (!achievement) {
      return { success: false, reason: 'achievement_not_found' };
    }
    
    const wasUnlocked = achievement.unlocked;
    const newProgress = Math.min(achievement.progressMax, progress);
    const isNowUnlocked = newProgress >= achievement.progressMax;
    
    // If newly unlocked, show notification
    if (!wasUnlocked && isNowUnlocked) {
      // This would be a side effect in a real implementation
      showAchievementNotification({
        ...achievement,
        unlocked: true,
      });
      
      return { 
        success: true, 
        unlocked: true, 
        progress: newProgress,
        progressMax: achievement.progressMax,
      };
    }
    
    return { 
      success: true, 
      unlocked: wasUnlocked, 
      progress: newProgress,
      progressMax: achievement.progressMax,
    };
  };
  
  /**
   * Unlock an achievement directly
   * @param {string} achievementId - The achievement ID to unlock
   * @returns {Object} Result with success flag
   */
  const unlockAchievement = (achievementId) => {
    // In a real implementation, we'd update the game state
    // For now, we'll just return a mock result
    const achievement = getAchievementProgress(achievementId);
    
    if (!achievement) {
      return { success: false, reason: 'achievement_not_found' };
    }
    
    if (achievement.unlocked) {
      return { success: false, reason: 'already_unlocked' };
    }
    
    // Show notification
    showAchievementNotification({
      ...achievement,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    });
    
    return { success: true };
  };
  
  return {
    openAchievements,
    closeAchievements,
    AchievementsComponent,
    recentAchievements,
    isAchievementUnlocked,
    getAchievementProgress,
    updateAchievementProgress,
    unlockAchievement,
    
    // Render an achievement notification
    renderAchievementNotification: (achievement, onClose) => (
      <AchievementNotification 
        achievement={achievement} 
        onClose={onClose} 
      />
    ),
  };
};

export default QuantumAchievementSystem;