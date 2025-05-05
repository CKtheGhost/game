import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantumGame } from '../state/QuantumGameStateManager';
import { useGameState } from '../contexts/GameStateContext';
import { useQuantumTransition } from '../transitions/QuantumTransitionManager';

// Lazy loaded components for better performance
const QuantumHUD = lazy(() => import('./QuantumHUD'));
const QuantumMap3D = lazy(() => import('./QuantumMap3D'));
const QuantumRadar = lazy(() => import('./QuantumRadar'));
const InteractiveMap3D = lazy(() => import('./InteractiveMap3D'));
const MissionObjectiveSystem = lazy(() => import('./MissionObjectiveSystem'));

/**
 * Container for the entire UI experience
 */
const ExperienceContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
  user-select: none;
`;

/**
 * Glassmorphism panel component with customizable position and size
 */
const GlassmorphicPanel = styled(motion.div)`
  position: absolute;
  background: ${({ theme }) => 
    `rgba(${theme === 'dark' ? '10, 12, 25' : '245, 250, 255'}, 0.15)`};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => 
    `rgba(${theme === 'dark' ? '130, 160, 255' : '255, 255, 255'}, 0.2)`};
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  border-radius: 12px;
  padding: 16px;
  color: ${({ theme }) => theme === 'dark' ? '#e0f2ff' : '#0a0f2d'};
  overflow: hidden;
  z-index: 100;
  pointer-events: all;
  
  /* Apply glassmorphism conditionally based on enabled prop */
  ${({ enabled }) => !enabled && `
    background: rgba(10, 12, 25, 0.85);
    backdrop-filter: none;
  `}
  
  /* Dynamic color based on variant */
  ${({ variant }) => variant === 'quantum' && `
    border-color: rgba(0, 255, 255, 0.3);
    box-shadow: 0 8px 32px 0 rgba(0, 210, 255, 0.2);
  `}
  
  ${({ variant }) => variant === 'warning' && `
    border-color: rgba(255, 220, 0, 0.3);
    box-shadow: 0 8px 32px 0 rgba(255, 150, 0, 0.2);
  `}
  
  ${({ variant }) => variant === 'danger' && `
    border-color: rgba(255, 0, 80, 0.3);
    box-shadow: 0 8px 32px 0 rgba(255, 0, 50, 0.2);
  `}
`;

/**
 * Panel header with title
 */
const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: ${({ theme }) => theme === 'dark' ? '#ffffff' : '#0a0f2d'};
    text-shadow: 0 0 8px rgba(0, 200, 255, 0.3);
  }
`;

/**
 * Container for notification items
 */
const NotificationContainer = styled(motion.div)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1500;
  pointer-events: none;
`;

/**
 * Individual notification item
 */
const NotificationItem = styled(motion.div)`
  background: rgba(10, 12, 25, 0.85);
  backdrop-filter: blur(10px);
  border-left: 4px solid ${({ type }) => {
    switch (type) {
      case 'success': return '#00ff88';
      case 'error': return '#ff0055';
      case 'warning': return '#ffaa00';
      case 'info': return '#00ddff';
      case 'achievement': return '#ffdd00';
      default: return '#00ddff';
    }
  }};
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  pointer-events: all;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  
  h4 {
    margin: 0 0 6px 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
  
  /* Progress indicator for auto-dismiss */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: ${({ type }) => {
      switch (type) {
        case 'success': return '#00ff88';
        case 'error': return '#ff0055';
        case 'warning': return '#ffaa00';
        case 'info': return '#00ddff';
        case 'achievement': return '#ffdd00';
        default: return '#00ddff';
      }
    }};
    width: 100%;
    transform-origin: left;
    animation: progressShrink ${({ duration }) => duration || 5}s linear forwards;
  }
  
  @keyframes progressShrink {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }
`;

/**
 * Mission briefing overlay container
 */
const MissionBriefingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  pointer-events: all;
`;

/**
 * Mission briefing content panel
 */
const MissionBriefingPanel = styled(motion.div)`
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  background: rgba(10, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 10px 50px rgba(0, 150, 255, 0.5);
  overflow-y: auto;
  
  h2 {
    margin: 0 0 16px 0;
    font-size: 28px;
    font-weight: 600;
    background: linear-gradient(120deg, #00ffff, #0088ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
  }
  
  h3 {
    margin: 24px 0 8px 0;
    font-size: 20px;
    font-weight: 500;
    color: #00ddff;
  }
  
  p {
    margin: 12px 0;
    font-size: 16px;
    line-height: 1.6;
  }
`;

/**
 * Circle indicator for Dante's Inferno levels
 */
const CircleIndicator = styled(motion.div)`
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  pointer-events: none;
`;

/**
 * Individual circle item (Dante's level)
 */
const CircleItem = styled(motion.div)`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ active, visited }) => 
    active ? 'rgba(0, 255, 255, 1)' : 
    visited ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  box-shadow: ${({ active }) => 
    active ? '0 0 15px 5px rgba(0, 255, 255, 0.5)' : 'none'};
  transition: all 0.3s ease;
  
  &::after {
    content: '${({ label }) => label}';
    position: absolute;
    left: 24px;
    top: 0;
    white-space: nowrap;
    color: ${({ active }) => 
      active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.6)'};
    font-size: 14px;
    opacity: ${({ active }) => active ? 1 : 0};
    transform: translateX(${({ active }) => active ? '0' : '-10px'});
    transition: all 0.3s ease;
    pointer-events: none;
  }
  
  &:hover {
    transform: scale(1.2);
    
    &::after {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

/**
 * Loading overlay for transitions
 */
const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  
  h2 {
    margin: 24px 0 0 0;
    font-size: 24px;
    color: white;
    text-align: center;
  }
`;

/**
 * Quantum spinner animation
 */
const QuantumSpinner = styled(motion.div)`
  width: 80px;
  height: 80px;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid transparent;
    border-top-color: #00ffff;
    border-bottom-color: #ff00ff;
    animation: quantumSpin 1.5s linear infinite;
  }
  
  &::after {
    border-top-color: #ff00ff;
    border-bottom-color: #00ffff;
    animation-duration: 2.5s;
  }
  
  @keyframes quantumSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * Main QuantumExperienceUI component
 */
const QuantumExperienceUI = () => {
  // Get state from various contexts
  const gameState = useGameState();
  const quantumGame = useQuantumGame();
  const transitionManager = useQuantumTransition();
  
  // UI state
  const [notifications, setNotifications] = useState([]);
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isObjectivesVisible, setIsObjectivesVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const [missionBriefingVisible, setMissionBriefingVisible] = useState(false);
  
  // Track the currently visible notification message
  const notificationIdRef = useRef(0);
  
  // Get theme and glassmorphism settings
  const uiSettings = quantumGame.settings.ui;
  const theme = uiSettings.colorScheme === 'light' ? 'light' : 'dark';
  const glassmorphismEnabled = uiSettings.isGlassmorphismEnabled;
  
  // Initialize UI on first load
  useEffect(() => {
    // Check if it's the player's first visit
    if (quantumGame.isFirstVisit) {
      // Show welcome message after a short delay
      setTimeout(() => {
        showNotification({
          title: 'Welcome to Quantum Salvation',
          message: 'Begin your journey through quantum reality and save humanity.',
          type: 'info',
          duration: 8,
        });
      }, 2000);
      
      // Update first visit status
      quantumGame.updateLastActivity();
    }
    
    // Set up key bindings
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'm':
          // Toggle map
          setIsMapVisible(prev => !prev);
          break;
        case 'Tab':
          // Toggle objectives
          e.preventDefault();
          setIsObjectivesVisible(prev => !prev);
          break;
        case 'h':
          // Toggle HUD
          setIsHUDVisible(prev => !prev);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [quantumGame]);
  
  // Monitor for mission changes
  useEffect(() => {
    if (gameState.currentMission && gameState.currentMission !== activeMission) {
      setActiveMission(gameState.currentMission);
      showMissionBriefing(gameState.currentMission);
    } else if (!gameState.currentMission && activeMission) {
      setActiveMission(null);
    }
  }, [gameState.currentMission, activeMission]);
  
  /**
   * Show a notification
   * @param {Object} notification - Notification data
   */
  const showNotification = (notification) => {
    const id = notificationIdRef.current++;
    
    // Add notification
    setNotifications(prev => [...prev, { 
      id, 
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      duration: notification.duration || 5,
      timestamp: Date.now()
    }]);
    
    // Remove notification after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(item => item.id !== id));
    }, (notification.duration || 5) * 1000);
  };
  
  /**
   * Show mission briefing
   * @param {string} missionId - Mission identifier
   */
  const showMissionBriefing = (missionId) => {
    const missionData = gameState.missions.missionProgress[missionId];
    
    if (missionData) {
      setMissionBriefingVisible(true);
    }
  };
  
  /**
   * Close mission briefing
   */
  const closeMissionBriefing = () => {
    setMissionBriefingVisible(false);
  };
  
  /**
   * Navigate to a specific circle
   * @param {number} circle - Circle number
   */
  const navigateToCircle = async (circle) => {
    if (circle === gameState.progression.currentCircle) return;
    
    // Show loading indicator
    setIsLoading(true);
    
    // Perform transition
    await transitionManager.transitionToLevel(
      gameState.progression.currentCircle,
      circle
    );
    
    // Update current circle
    quantumGame.setDanteCircle(circle);
    
    // Hide loading indicator after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  /**
   * Render Dante's circles navigation
   */
  const renderCircleNavigation = () => {
    const circles = [
      { id: 0, label: 'Surface' },
      { id: 1, label: 'Limbo' },
      { id: 2, label: 'Lust' },
      { id: 3, label: 'Gluttony' },
      { id: 4, label: 'Greed' },
      { id: 5, label: 'Anger' },
      { id: 6, label: 'Heresy' },
      { id: 7, label: 'Violence' },
      { id: 8, label: 'Fraud' },
      { id: 9, label: 'Treachery' },
    ];
    
    const currentCircle = gameState.progression.currentCircle;
    const completedLevels = gameState.progression.completedLevels;
    
    return (
      <CircleIndicator>
        {circles.map(circle => (
          <CircleItem
            key={circle.id}
            active={circle.id === currentCircle}
            visited={completedLevels[circle.id]}
            label={circle.label}
            onClick={() => navigateToCircle(circle.id)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            layout
          />
        ))}
      </CircleIndicator>
    );
  };
  
  /**
   * Render notification stack
   */
  const renderNotifications = () => {
    return (
      <NotificationContainer>
        <AnimatePresence>
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              type={notification.type}
              duration={notification.duration}
              onClick={() => setNotifications(prev => 
                prev.filter(item => item.id !== notification.id)
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </NotificationItem>
          ))}
        </AnimatePresence>
      </NotificationContainer>
    );
  };
  
  /**
   * Render mission briefing overlay
   */
  const renderMissionBriefing = () => {
    if (!missionBriefingVisible || !activeMission) return null;
    
    const missionData = gameState.missions.missionProgress[activeMission];
    
    return (
      <MissionBriefingOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeMissionBriefing}
      >
        <MissionBriefingPanel
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>{missionData?.title || 'Mission Briefing'}</h2>
          
          <p>{missionData?.description || 'No mission description available.'}</p>
          
          <h3>Objectives:</h3>
          <ul>
            {missionData?.objectives?.map((objective, index) => (
              <li key={index}>{objective.description}</li>
            )) || <li>No objectives specified</li>}
          </ul>
          
          <h3>Rewards:</h3>
          <ul>
            {missionData?.rewards?.map((reward, index) => (
              <li key={index}>{reward.description}</li>
            )) || <li>No rewards specified</li>}
          </ul>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'block',
              margin: '24px auto 0',
              padding: '12px 24px',
              background: 'linear-gradient(120deg, #00ddff, #0088ff)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 150, 255, 0.5)',
            }}
            onClick={closeMissionBriefing}
          >
            Accept Mission
          </motion.button>
        </MissionBriefingPanel>
      </MissionBriefingOverlay>
    );
  };
  
  /**
   * Render loading overlay
   */
  const renderLoadingOverlay = () => {
    if (!isLoading) return null;
    
    return (
      <LoadingOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <QuantumSpinner />
        <h2>Traversing Quantum Realms...</h2>
      </LoadingOverlay>
    );
  };
  
  return (
    <ExperienceContainer>
      {/* HUD Components */}
      <AnimatePresence>
        {isHUDVisible && (
          <Suspense fallback={null}>
            <QuantumHUD 
              showNotification={showNotification}
              theme={theme}
              glassmorphismEnabled={glassmorphismEnabled}
            />
          </Suspense>
        )}
      </AnimatePresence>
      
      {/* Map */}
      <AnimatePresence>
        {isMapVisible && (
          <GlassmorphicPanel
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80vw',
              height: '80vh',
            }}
            theme={theme}
            enabled={glassmorphismEnabled}
            variant="quantum"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <PanelHeader theme={theme}>
              <h3>Quantum Realms Map</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme === 'dark' ? 'white' : '#0a0f2d',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
                onClick={() => setIsMapVisible(false)}
              >
                ×
              </motion.button>
            </PanelHeader>
            
            <Suspense fallback={<div>Loading map...</div>}>
              <QuantumMap3D currentCircle={gameState.progression.currentCircle} />
            </Suspense>
          </GlassmorphicPanel>
        )}
      </AnimatePresence>
      
      {/* Mission Objectives */}
      <AnimatePresence>
        {isObjectivesVisible && (
          <GlassmorphicPanel
            style={{
              top: '20px',
              right: '20px',
              width: '350px',
              maxHeight: '60vh',
            }}
            theme={theme}
            enabled={glassmorphismEnabled}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PanelHeader theme={theme}>
              <h3>Objectives</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme === 'dark' ? 'white' : '#0a0f2d',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
                onClick={() => setIsObjectivesVisible(false)}
              >
                ×
              </motion.button>
            </PanelHeader>
            
            <Suspense fallback={<div>Loading objectives...</div>}>
              <MissionObjectiveSystem 
                currentMission={gameState.currentMission}
                missionProgress={gameState.missions.missionProgress}
                objectivesCompleted={gameState.missions.objectivesCompleted}
              />
            </Suspense>
          </GlassmorphicPanel>
        )}
      </AnimatePresence>
      
      {/* Circle Navigation */}
      {renderCircleNavigation()}
      
      {/* Notifications */}
      {renderNotifications()}
      
      {/* Mission Briefing */}
      <AnimatePresence>
        {missionBriefingVisible && renderMissionBriefing()}
      </AnimatePresence>
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && renderLoadingOverlay()}
      </AnimatePresence>
    </ExperienceContainer>
  );
};

export default QuantumExperienceUI;