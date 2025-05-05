import { useGameState } from '../context/GameStateContext';
import stateSynchronizer from './StateSynchronizer';

/**
 * Initialize the state synchronization system
 * Call this when the application starts
 */
export const initializeStateSync = () => {
  // Get the game state accessor function
  const gameState = useGameState();
  
  // Initialize state synchronizer with the game state getter
  stateSynchronizer.init(() => {
    // Return the current state
    return {
      currentLevel: gameState.currentLevel,
      playerStats: gameState.playerStats,
      collectibles: gameState.collectibles,
      levelProgress: gameState.levelProgress,
      narrative: gameState.narrative,
      settings: gameState.settings
    };
  });
  
  console.log('State synchronization system initialized');
  
  // Return cleanup function
  return () => {
    stateSynchronizer.cleanup();
    console.log('State synchronization system cleaned up');
  };
};

/**
 * Example of using synchronizer in a component
 */
export const exampleUsage = () => {
  // In your component:
  const componentId = 'quantum-visualization';
  
  // Register component for updates
  const unregister = stateSynchronizer.registerComponent(componentId, (data) => {
    // Update component based on data
    console.log('Updating component with data:', data);
  });
  
  // Subscribe to specific state changes
  const unsubscribe = stateSynchronizer.subscribeMultiple({
    'currentLevel': (newLevel, oldLevel) => {
      console.log(`Level changed from ${oldLevel} to ${newLevel}`);
      // Update level-specific visuals
    },
    'playerStats.quantumEnergy': (newEnergy, oldEnergy) => {
      console.log(`Quantum energy changed from ${oldEnergy} to ${newEnergy}`);
      // Update energy visualizations
    },
    'playerStats.position': (newPosition, oldPosition) => {
      // Update player position in the visualization
    }
  });
  
  // Clean up when component unmounts
  return () => {
    unregister();
    unsubscribe();
  };
};

/**
 * Data bindings for different visualization components
 */
export const visualizationBindings = {
  coreLayer: {
    componentId: 'core-visualization',
    subscriptions: {
      'currentLevel': (newLevel) => {
        // Update core visualization for new level
      },
      'settings.particleEffects': (newSetting) => {
        // Adjust particle system based on settings
      }
    }
  },
  
  interactionLayer: {
    componentId: 'interaction-layer',
    subscriptions: {
      'levelProgress': (newProgress) => {
        // Update challenge completion status
      },
      'collectibles': (newCollectibles) => {
        // Update collectible visualizations
      }
    }
  },
  
  effectsLayer: {
    componentId: 'effects-layer',
    subscriptions: {
      'playerStats.activeAbilities': (newAbilities) => {
        // Update active quantum effects
      },
      'playerStats.quantumEnergy': (newEnergy) => {
        // Adjust effect intensity based on energy
      }
    }
  },
  
  ui: {
    componentId: 'quantum-ui',
    subscriptions: {
      'playerStats': (newStats) => {
        // Update UI displays for player stats
      },
      'narrative.currentObjective': (newObjective) => {
        // Update objective display
      }
    }
  }
};

export default {
  initializeStateSync,
  exampleUsage,
  visualizationBindings
};