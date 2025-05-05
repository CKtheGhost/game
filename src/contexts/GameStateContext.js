import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import StoryEngine from '../narrative/StoryEngine';
import CinematicSystem from '../narrative/CinematicSystem';
import MissionBriefingIntegration from '../narrative/MissionBriefingIntegration';

const GameStateContext = createContext();

export const GAME_LEVELS = {
  INTRO: 0,
  DISCOVERY: 1,
  CHALLENGE: 2,
  CONFLICT: 3,
  REVELATION: 4,
  TRANSFORMATION: 5,
  ASCENSION: 6,
  ENLIGHTENMENT: 7,
  TRANSCENDENCE: 8,
};

export const GameStateProvider = ({ children }) => {
  // Player state
  const [playerStats, setPlayerStats] = useState({
    energy: 100,
    knowledge: 0,
    consciousness: 0,
  });
  
  // Progress tracking
  const [currentLevel, setCurrentLevel] = useState(GAME_LEVELS.INTRO);
  const [completedLevels, setCompletedLevels] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState({});
  
  // Narrative systems references
  const storyEngineRef = useRef(null);
  const cinematicSystemRef = useRef(null);
  const missionBriefingRef = useRef(null);
  
  // Mission state
  const [currentMission, setCurrentMission] = useState(null);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [missionProgress, setMissionProgress] = useState({});
  
  // Inventory system
  const [inventory, setInventory] = useState([]);
  
  // UI and experience state
  const [isGlassmorphismEnabled, setIsGlassmorphismEnabled] = useState(true);
  const [particleDensity, setParticleDensity] = useState('high');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  // Performance optimization
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  
  // Initialize narrative systems
  useEffect(() => {
    // Create container for cinematic system
    const cinematicContainer = document.createElement('div');
    cinematicContainer.id = 'cinematic-container';
    document.body.appendChild(cinematicContainer);
    
    // Initialize story engine
    storyEngineRef.current = new StoryEngine();
    
    // Initialize cinematic system with container and story engine
    cinematicSystemRef.current = new CinematicSystem(
      cinematicContainer,
      storyEngineRef.current
    );
    
    // Initialize mission briefing integration with both systems
    missionBriefingRef.current = new MissionBriefingIntegration(
      storyEngineRef.current,
      cinematicSystemRef.current
    );
    
    // Set up event listeners for mission updates
    if (missionBriefingRef.current) {
      const missionSystem = missionBriefingRef.current.missionBriefingSystem;
      
      missionSystem.on('missionStarted', (data) => {
        setCurrentMission(data.missionId);
      });
      
      missionSystem.on('missionCompleted', (data) => {
        setCurrentMission(null);
        setCompletedMissions(prev => [...prev, data.missionId]);
      });
      
      missionSystem.on('missionProgressUpdated', (data) => {
        setMissionProgress(prev => ({
          ...prev,
          [data.missionId]: data.progress
        }));
      });
    }
    
    // Clean up on unmount
    return () => {
      if (cinematicSystemRef.current) {
        cinematicSystemRef.current.dispose();
      }
      
      if (missionBriefingRef.current) {
        missionBriefingRef.current.dispose();
      }
      
      if (cinematicContainer && cinematicContainer.parentNode) {
        cinematicContainer.parentNode.removeChild(cinematicContainer);
      }
    };
  }, []);
  
  // Auto-save game state to localStorage
  useEffect(() => {
    try {
      const savedState = JSON.stringify({
        playerStats,
        currentLevel,
        completedLevels,
        unlockedAchievements,
        inventory,
        missions: {
          currentMission,
          completedMissions,
          missionProgress
        },
        settings: {
          isGlassmorphismEnabled,
          particleDensity,
          isAudioEnabled,
          isLowPerformanceMode,
        },
      });
      
      localStorage.setItem('quantumSalvationGameState', savedState);
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [
    playerStats,
    currentLevel,
    completedLevels,
    unlockedAchievements,
    inventory,
    currentMission,
    completedMissions,
    missionProgress,
    isGlassmorphismEnabled,
    particleDensity,
    isAudioEnabled,
    isLowPerformanceMode,
  ]);
  
  // Load saved game state from localStorage on initial load
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('quantumSalvationGameState');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        setPlayerStats(parsedState.playerStats);
        setCurrentLevel(parsedState.currentLevel);
        setCompletedLevels(parsedState.completedLevels);
        setUnlockedAchievements(parsedState.unlockedAchievements);
        setInventory(parsedState.inventory);
        
        // Load mission state if available
        if (parsedState.missions) {
          setCurrentMission(parsedState.missions.currentMission);
          setCompletedMissions(parsedState.missions.completedMissions);
          setMissionProgress(parsedState.missions.missionProgress);
        }
        
        const { settings } = parsedState;
        setIsGlassmorphismEnabled(settings.isGlassmorphismEnabled);
        setParticleDensity(settings.particleDensity);
        setIsAudioEnabled(settings.isAudioEnabled);
        setIsLowPerformanceMode(settings.isLowPerformanceMode);
      }
    } catch (error) {
      console.error('Failed to load saved game state:', error);
    }
  }, []);
  
  // Game mechanics
  const advanceToLevel = (level) => {
    if (level > currentLevel) {
      setCurrentLevel(level);
      setCompletedLevels((prev) => ({
        ...prev,
        [currentLevel]: true,
      }));
    }
  };
  
  const addToInventory = (item) => {
    setInventory((prev) => [...prev, { ...item, id: Date.now() }]);
  };
  
  const removeFromInventory = (itemId) => {
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };
  
  const updatePlayerStats = (stats) => {
    setPlayerStats((prev) => ({
      ...prev,
      ...stats,
    }));
  };
  
  const unlockAchievement = (achievementId, achievementData) => {
    setUnlockedAchievements((prev) => ({
      ...prev,
      [achievementId]: { ...achievementData, unlockedAt: Date.now() },
    }));
  };
  
  // Performance settings
  const togglePerformanceMode = () => {
    setIsLowPerformanceMode((prev) => !prev);
  };
  
  const toggleGlassmorphism = () => {
    setIsGlassmorphismEnabled((prev) => !prev);
  };
  
  const setPerformanceSettings = (settings) => {
    setParticleDensity(settings.particleDensity || particleDensity);
    setIsLowPerformanceMode(settings.isLowPerformanceMode || isLowPerformanceMode);
  };
  
  // Mission functions
  const startMission = (missionId) => {
    if (missionBriefingRef.current) {
      return missionBriefingRef.current.startMissionWithBriefing(missionId);
    }
    return Promise.resolve(false);
  };
  
  const showMissionBriefing = (missionId) => {
    if (missionBriefingRef.current) {
      return missionBriefingRef.current.showMissionBriefing(missionId);
    }
    return Promise.resolve(false);
  };
  
  const completeMission = (missionId, success = true) => {
    if (missionBriefingRef.current) {
      return missionBriefingRef.current.completeMission(missionId, success);
    }
    return false;
  };
  
  const completeObjective = (missionId, objectiveId) => {
    if (missionBriefingRef.current) {
      return missionBriefingRef.current.updateObjective(missionId, objectiveId, true);
    }
    return false;
  };
  
  // Cinematic functions
  const playCinematic = (cinematicId, options = {}) => {
    if (cinematicSystemRef.current) {
      return cinematicSystemRef.current.playCinematic(cinematicId, options);
    }
    return Promise.resolve(false);
  };
  
  // Story engine functions
  const triggerStoryEvent = (eventName, data = {}) => {
    if (storyEngineRef.current) {
      storyEngineRef.current.triggerEvent(eventName, data);
      return true;
    }
    return false;
  };
  
  const setStoryFlag = (flag, value) => {
    if (storyEngineRef.current) {
      storyEngineRef.current.setFlag(flag, value);
      return true;
    }
    return false;
  };
  
  // Reset game progress
  const resetGame = () => {
    setPlayerStats({
      energy: 100,
      knowledge: 0,
      consciousness: 0,
    });
    
    setCurrentLevel(GAME_LEVELS.INTRO);
    setCompletedLevels({});
    setUnlockedAchievements({});
    setInventory([]);
    
    setCurrentMission(null);
    setCompletedMissions([]);
    setMissionProgress({});
    
    // Reset story engine flags
    if (storyEngineRef.current) {
      storyEngineRef.current.resetFlags();
    }
  };
  
  return (
    <GameStateContext.Provider
      value={{
        // State
        playerStats,
        currentLevel,
        completedLevels,
        unlockedAchievements,
        inventory,
        isGlassmorphismEnabled,
        particleDensity,
        isAudioEnabled,
        isLowPerformanceMode,
        
        // Mission state
        currentMission,
        completedMissions,
        missionProgress,
        
        // System references
        storyEngine: storyEngineRef.current,
        cinematicSystem: cinematicSystemRef.current,
        missionBriefing: missionBriefingRef.current,
        
        // Game actions
        advanceToLevel,
        addToInventory,
        removeFromInventory,
        updatePlayerStats,
        unlockAchievement,
        togglePerformanceMode,
        toggleGlassmorphism,
        setPerformanceSettings,
        resetGame,
        
        // Mission actions
        startMission,
        showMissionBriefing,
        completeMission,
        completeObjective,
        
        // Cinematic actions
        playCinematic,
        
        // Story actions
        triggerStoryEvent,
        setStoryFlag,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  
  return context;
};