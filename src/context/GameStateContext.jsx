import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial game state
const initialState = {
  currentLevel: 1,
  playerStats: {
    health: 100,
    quantumEnergy: 50,
    scientificKnowledge: 0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    activeAbilities: [],
    unlockedAbilities: ['phaseShift'],
  },
  collectibles: {
    quantumParticles: 0,
    knowledgeFragments: 0,
    dimensionalKeys: 0,
  },
  levelProgress: {
    1: { visited: true, completed: false, challenges: [] },
    2: { visited: false, completed: false, challenges: [] },
    3: { visited: false, completed: false, challenges: [] },
    4: { visited: false, completed: false, challenges: [] },
    5: { visited: false, completed: false, challenges: [] },
    6: { visited: false, completed: false, challenges: [] },
    7: { visited: false, completed: false, challenges: [] },
    8: { visited: false, completed: false, challenges: [] },
    9: { visited: false, completed: false, challenges: [] },
  },
  narrative: {
    discoveredLore: [],
    completedMissions: [],
    currentObjective: 'Explore Limbo and locate the Quantum Anomaly',
  },
  settings: {
    soundEnabled: true,
    particleEffects: 'high',
    controlMode: 'firstPerson',
  }
};

// Action types
const ACTION_TYPES = {
  CHANGE_LEVEL: 'CHANGE_LEVEL',
  UPDATE_PLAYER_POSITION: 'UPDATE_PLAYER_POSITION',
  UPDATE_PLAYER_STATS: 'UPDATE_PLAYER_STATS',
  COLLECT_ITEM: 'COLLECT_ITEM',
  UNLOCK_ABILITY: 'UNLOCK_ABILITY',
  ACTIVATE_ABILITY: 'ACTIVATE_ABILITY',
  DEACTIVATE_ABILITY: 'DEACTIVATE_ABILITY',
  COMPLETE_CHALLENGE: 'COMPLETE_CHALLENGE',
  UPDATE_OBJECTIVE: 'UPDATE_OBJECTIVE',
  DISCOVER_LORE: 'DISCOVER_LORE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_GAME: 'RESET_GAME'
};

// Game state reducer
const gameStateReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.CHANGE_LEVEL:
      return {
        ...state,
        currentLevel: action.payload,
        levelProgress: {
          ...state.levelProgress,
          [action.payload]: {
            ...state.levelProgress[action.payload],
            visited: true
          }
        }
      };
      
    case ACTION_TYPES.UPDATE_PLAYER_POSITION:
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          position: action.payload.position,
          rotation: action.payload.rotation
        }
      };
      
    case ACTION_TYPES.UPDATE_PLAYER_STATS:
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.COLLECT_ITEM:
      return {
        ...state,
        collectibles: {
          ...state.collectibles,
          [action.payload.type]: state.collectibles[action.payload.type] + action.payload.amount
        }
      };
      
    case ACTION_TYPES.UNLOCK_ABILITY:
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          unlockedAbilities: [...state.playerStats.unlockedAbilities, action.payload]
        }
      };
      
    case ACTION_TYPES.ACTIVATE_ABILITY:
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          activeAbilities: [...state.playerStats.activeAbilities, action.payload],
          quantumEnergy: state.playerStats.quantumEnergy - 10 // Each ability costs energy
        }
      };
      
    case ACTION_TYPES.DEACTIVATE_ABILITY:
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          activeAbilities: state.playerStats.activeAbilities.filter(ability => ability !== action.payload)
        }
      };
      
    case ACTION_TYPES.COMPLETE_CHALLENGE:
      return {
        ...state,
        levelProgress: {
          ...state.levelProgress,
          [state.currentLevel]: {
            ...state.levelProgress[state.currentLevel],
            challenges: [...state.levelProgress[state.currentLevel].challenges, action.payload]
          }
        }
      };
      
    case ACTION_TYPES.UPDATE_OBJECTIVE:
      return {
        ...state,
        narrative: {
          ...state.narrative,
          currentObjective: action.payload
        }
      };
      
    case ACTION_TYPES.DISCOVER_LORE:
      return {
        ...state,
        narrative: {
          ...state.narrative,
          discoveredLore: [...state.narrative.discoveredLore, action.payload]
        }
      };
      
    case ACTION_TYPES.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.RESET_GAME:
      return initialState;
      
    default:
      return state;
  }
};

// Create context
const GameStateContext = createContext();

// Game state provider component
export const GameStateProvider = ({ children }) => {
  // Load saved state from localStorage if available
  const loadSavedState = () => {
    try {
      const savedState = localStorage.getItem('quantumSalvationGameState');
      return savedState ? JSON.parse(savedState) : initialState;
    } catch (error) {
      console.error('Failed to load saved game state:', error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(gameStateReducer, loadSavedState());
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('quantumSalvationGameState', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [state]);
  
  // Provide game state and actions to children
  return (
    <GameStateContext.Provider value={{ state, dispatch, actions: ACTION_TYPES }}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook for using the game state
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  
  const { state, dispatch, actions } = context;
  
  // Helper functions for common operations
  const changeLevel = (level) => dispatch({ type: actions.CHANGE_LEVEL, payload: level });
  
  const updatePlayerPosition = (position, rotation) => {
    dispatch({ 
      type: actions.UPDATE_PLAYER_POSITION, 
      payload: { position, rotation } 
    });
  };
  
  const updatePlayerStats = (stats) => {
    dispatch({ type: actions.UPDATE_PLAYER_STATS, payload: stats });
  };
  
  const collectItem = (type, amount) => {
    dispatch({ type: actions.COLLECT_ITEM, payload: { type, amount } });
  };
  
  const unlockAbility = (ability) => {
    dispatch({ type: actions.UNLOCK_ABILITY, payload: ability });
  };
  
  const activateAbility = (ability) => {
    if (state.playerStats.unlockedAbilities.includes(ability) && 
        !state.playerStats.activeAbilities.includes(ability) &&
        state.playerStats.quantumEnergy >= 10) {
      dispatch({ type: actions.ACTIVATE_ABILITY, payload: ability });
      return true;
    }
    return false;
  };
  
  const deactivateAbility = (ability) => {
    dispatch({ type: actions.DEACTIVATE_ABILITY, payload: ability });
  };
  
  const completeChallenge = (challenge) => {
    dispatch({ type: actions.COMPLETE_CHALLENGE, payload: challenge });
  };
  
  const updateObjective = (objective) => {
    dispatch({ type: actions.UPDATE_OBJECTIVE, payload: objective });
  };
  
  const discoverLore = (lore) => {
    dispatch({ type: actions.DISCOVER_LORE, payload: lore });
  };
  
  const updateSettings = (settings) => {
    dispatch({ type: actions.UPDATE_SETTINGS, payload: settings });
  };
  
  const resetGame = () => {
    dispatch({ type: actions.RESET_GAME });
  };
  
  return {
    // State
    currentLevel: state.currentLevel,
    playerStats: state.playerStats,
    collectibles: state.collectibles,
    levelProgress: state.levelProgress,
    narrative: state.narrative,
    settings: state.settings,
    
    // Actions
    changeLevel,
    updatePlayerPosition,
    updatePlayerStats,
    collectItem,
    unlockAbility,
    activateAbility,
    deactivateAbility,
    completeChallenge,
    updateObjective,
    discoverLore,
    updateSettings,
    resetGame
  };
};

export default GameStateContext;