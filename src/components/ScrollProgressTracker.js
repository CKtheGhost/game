import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useGameState, GAME_LEVELS } from '../contexts/GameStateContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Initialize GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ProgressContainer = styled.div`
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    right: 1rem;
    gap: 1rem;
  }
`;

const ProgressBar = styled.div`
  width: 3px;
  height: 30vh;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(to bottom, #00ffff, #ff00ff);
    height: ${props => props.progress}%;
    transition: height 0.3s ease;
  }
`;

const LevelIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => 
    props.active 
      ? 'linear-gradient(to right, #00ffff, #ff00ff)' 
      : props.completed 
        ? '#ffffff' 
        : 'rgba(255, 255, 255, 0.2)'
  };
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  ${props => props.active && `
    transform: scale(1.5);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
  `}
  
  &:hover {
    transform: scale(1.2);
  }
  
  &:hover::before {
    opacity: 1;
    transform: translateX(-100%) scale(1);
  }
  
  &::before {
    content: '${props => props.levelName}';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateX(-80%) translateY(-50%) scale(0.8);
    padding: 0.25rem 0.5rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    white-space: nowrap;
    border-radius: 4px;
    margin-right: 0.5rem;
    opacity: 0;
    transition: all 0.2s ease;
    pointer-events: none;
  }
`;

const LevelName = styled.div`
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  z-index: 100;
  transition: opacity 0.3s ease;
  opacity: ${props => props.visible ? 1 : 0};
  text-transform: uppercase;
  letter-spacing: 2px;
`;

// Map of level names
const LEVEL_NAMES = {
  [GAME_LEVELS.INTRO]: 'Intro',
  [GAME_LEVELS.DISCOVERY]: 'Discovery',
  [GAME_LEVELS.CHALLENGE]: 'Challenge',
  [GAME_LEVELS.CONFLICT]: 'Conflict',
  [GAME_LEVELS.REVELATION]: 'Revelation',
  [GAME_LEVELS.TRANSFORMATION]: 'Transformation',
  [GAME_LEVELS.ASCENSION]: 'Ascension',
  [GAME_LEVELS.ENLIGHTENMENT]: 'Enlightenment',
  [GAME_LEVELS.TRANSCENDENCE]: 'Transcendence',
};

const ScrollProgressTracker = () => {
  const { currentLevel, completedLevels, advanceToLevel } = useGameState();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showLevelName, setShowLevelName] = useState(false);
  
  // Set up scroll event listener to track progress
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);
  
  // Set up GSAP ScrollTrigger for section transitions
  useEffect(() => {
    const sections = document.querySelectorAll('section[data-level]');
    
    sections.forEach(section => {
      const levelId = parseInt(section.dataset.level, 10);
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          advanceToLevel(levelId);
          
          // Show level name briefly
          setShowLevelName(true);
          setTimeout(() => setShowLevelName(false), 2000);
          
          // Animate section entry
          gsap.fromTo(
            section.querySelector('.content-wrapper'),
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
          );
        },
        onEnterBack: () => {
          advanceToLevel(levelId);
        }
      });
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [advanceToLevel]);
  
  const handleLevelClick = (level) => {
    // Only allow clicking on completed levels or the current level + 1
    if (completedLevels[level] || level === currentLevel || level === currentLevel + 1) {
      const targetSection = document.querySelector(`section[data-level="${level}"]`);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop,
          behavior: 'smooth'
        });
      }
    }
  };
  
  return (
    <>
      <LevelName visible={showLevelName}>
        {LEVEL_NAMES[currentLevel]}
      </LevelName>
      
      <ProgressContainer>
        <ProgressBar progress={scrollProgress} />
        
        {Object.values(GAME_LEVELS).map(level => (
          <LevelIndicator
            key={level}
            active={currentLevel === level}
            completed={completedLevels[level]}
            levelName={LEVEL_NAMES[level]}
            onClick={() => handleLevelClick(level)}
          />
        ))}
      </ProgressContainer>
    </>
  );
};

export default ScrollProgressTracker;