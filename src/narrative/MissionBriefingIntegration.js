import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import MissionBriefingUI from './MissionBriefingUI';
import MissionBriefingSystem from './MissionBriefingSystem';
import { useGameState } from '../contexts/GameStateContext';

/**
 * MissionBriefingIntegration - Integrates the mission briefing system with the game's
 * narrative components (StoryEngine and CinematicSystem)
 */
class MissionBriefingIntegration {
  constructor(storyEngine, cinematicSystem) {
    // Core components
    this.storyEngine = storyEngine;
    this.cinematicSystem = cinematicSystem;
    
    // Create mission briefing system
    this.missionBriefingSystem = new MissionBriefingSystem(storyEngine);
    
    // DOM element for briefing UI portal
    this.briefingContainer = null;
    
    // Keep track of active briefings
    this.activeBriefing = null;
    
    // Initialize the integration
    this._initialize();
  }
  
  /**
   * Initialize the mission briefing integration
   * @private
   */
  _initialize() {
    // Create container for mission briefing UI
    this._createBriefingContainer();
    
    // Set up event listeners for various systems
    this._setupEventListeners();
  }
  
  /**
   * Create a DOM container for mission briefing UI
   * @private
   */
  _createBriefingContainer() {
    // Create container if it doesn't exist
    if (!this.briefingContainer) {
      this.briefingContainer = document.createElement('div');
      this.briefingContainer.id = 'mission-briefing-container';
      document.body.appendChild(this.briefingContainer);
    }
  }
  
  /**
   * Set up event listeners for various systems
   * @private
   */
  _setupEventListeners() {
    // Story engine events
    if (this.storyEngine) {
      // Listen for mission triggers from story events
      this.storyEngine.on('triggerMission', (missionId) => {
        this.missionBriefingSystem.startMission(missionId);
      });
      
      // Listen for mission briefing requests
      this.storyEngine.on('showMissionBriefing', (missionId) => {
        this.showMissionBriefing(missionId);
      });
    }
    
    // Cinematic system events
    if (this.cinematicSystem) {
      // When a cinematic completes, check if we should show a mission briefing
      this.cinematicSystem.on('cinematicCompleted', (data) => {
        // Check if this cinematic should trigger a mission briefing
        if (data.id && data.id.startsWith('mission_intro_')) {
          // Extract mission ID from cinematic ID (e.g., "mission_intro_m001" -> "m001")
          const missionId = data.id.replace('mission_intro_', '');
          
          // Show mission briefing
          this.showMissionBriefing(missionId);
        }
      });
    }
    
    // Mission briefing system events
    this.missionBriefingSystem.on('missionStarted', (data) => {
      // When a mission starts, we may want to show a cinematic first
      const missionId = data.missionId;
      
      // Play mission intro cinematic if it exists
      const cinematicId = `mission_intro_${missionId}`;
      if (this.cinematicSystem) {
        // Check if the cinematic exists (this would be a better check in a real app)
        const hasCinematic = true; // Simplified for this example
        
        if (hasCinematic) {
          this.cinematicSystem.playCinematic(cinematicId).then(() => {
            // After cinematic completes, show mission briefing
            this.showMissionBriefing(missionId);
          });
        } else {
          // No cinematic, just show briefing
          this.showMissionBriefing(missionId);
        }
      } else {
        // No cinematic system, just show briefing
        this.showMissionBriefing(missionId);
      }
    });
    
    this.missionBriefingSystem.on('missionCompleted', (data) => {
      // When a mission completes, we may want to show a completion cinematic
      const missionId = data.missionId;
      
      // Play mission completion cinematic if it exists
      const cinematicId = `mission_complete_${missionId}`;
      if (this.cinematicSystem) {
        // Check if the cinematic exists (this would be a better check in a real app)
        const hasCinematic = true; // Simplified for this example
        
        if (hasCinematic) {
          this.cinematicSystem.playCinematic(cinematicId);
        }
      }
    });
    
    this.missionBriefingSystem.on('objectiveCompleted', (data) => {
      // Update game state or other systems when objectives are completed
      if (this.storyEngine) {
        this.storyEngine.triggerEvent(`objective_complete_${data.missionId}_${data.objectiveId}`);
      }
    });
  }
  
  /**
   * Show mission briefing UI
   * @param {string} missionId The mission ID to show briefing for
   * @returns {Promise} Resolves when briefing is closed
   */
  showMissionBriefing(missionId) {
    return new Promise((resolve) => {
      // Check if mission exists
      const mission = this.missionBriefingSystem.getMission(missionId);
      
      if (!mission) {
        console.error(`Mission with ID "${missionId}" not found.`);
        resolve(false);
        return;
      }
      
      // Mark as active
      this.activeBriefing = missionId;
      
      // Render the briefing UI
      this._renderBriefingUI(missionId, () => {
        // This callback is called when the UI is closed
        this.activeBriefing = null;
        resolve(true);
      });
    });
  }
  
  /**
   * Render the mission briefing UI
   * @param {string} missionId The mission ID
   * @param {Function} onClose Callback when UI is closed
   * @private
   */
  _renderBriefingUI(missionId, onClose) {
    // Create a wrapper component that can access GameStateContext
    const BriefingWrapper = () => {
      const [visible, setVisible] = useState(true);
      const gameState = useGameState();
      
      // Handle close event
      const handleClose = () => {
        setVisible(false);
        
        // Small delay to allow exit animations to complete
        setTimeout(() => {
          ReactDOM.unmountComponentAtNode(this.briefingContainer);
          
          // Call the onClose callback
          if (onClose) {
            onClose();
          }
        }, 500);
      };
      
      return (
        visible ? (
          <MissionBriefingUI 
            missionId={missionId} 
            onClose={handleClose} 
          />
        ) : null
      );
    };
    
    // Render the component in the container
    ReactDOM.render(<BriefingWrapper />, this.briefingContainer);
  }
  
  /**
   * Start a mission and show its briefing
   * @param {string} missionId The mission ID
   * @returns {Promise} Resolves when briefing is closed
   */
  startMissionWithBriefing(missionId) {
    // Start the mission
    const success = this.missionBriefingSystem.startMission(missionId);
    
    if (!success) {
      return Promise.resolve(false);
    }
    
    // Show the briefing (the event listener will handle this, but we return the promise)
    return this.showMissionBriefing(missionId);
  }
  
  /**
   * Update mission objective status
   * @param {string} missionId The mission ID
   * @param {string} objectiveId The objective ID
   * @param {boolean} completed Whether the objective is completed
   * @returns {boolean} Success status
   */
  updateObjective(missionId, objectiveId, completed) {
    if (completed) {
      return this.missionBriefingSystem.completeObjective(missionId, objectiveId);
    }
    
    // In a real implementation, you would also have a method to un-complete objectives if needed
    return false;
  }
  
  /**
   * Complete a mission
   * @param {string} missionId The mission ID
   * @param {boolean} success Whether the mission was completed successfully
   * @returns {boolean} Operation success status
   */
  completeMission(missionId, success = true) {
    // Check if this is the active mission
    if (this.missionBriefingSystem.isActiveMission(missionId)) {
      return this.missionBriefingSystem.completeMission(success);
    }
    
    return false;
  }
  
  /**
   * Get the active mission data
   * @returns {Object|null} The active mission data or null if none
   */
  getActiveMission() {
    return this.missionBriefingSystem.getActiveMission();
  }
  
  /**
   * Check if a mission is active
   * @param {string} missionId The mission ID
   * @returns {boolean} True if mission is active
   */
  isActiveMission(missionId) {
    return this.missionBriefingSystem.isActiveMission(missionId);
  }
  
  /**
   * Clean up and dispose the integration
   */
  dispose() {
    // Clean up mission briefing system
    if (this.missionBriefingSystem) {
      this.missionBriefingSystem.dispose();
    }
    
    // Remove event listeners
    if (this.storyEngine) {
      this.storyEngine.removeAllListeners('triggerMission');
      this.storyEngine.removeAllListeners('showMissionBriefing');
    }
    
    if (this.cinematicSystem) {
      this.cinematicSystem.removeAllListeners('cinematicCompleted');
    }
    
    // Remove DOM elements
    if (this.briefingContainer && this.briefingContainer.parentNode) {
      ReactDOM.unmountComponentAtNode(this.briefingContainer);
      this.briefingContainer.parentNode.removeChild(this.briefingContainer);
    }
    
    // Clear references
    this.storyEngine = null;
    this.cinematicSystem = null;
    this.missionBriefingSystem = null;
    this.briefingContainer = null;
    this.activeBriefing = null;
  }
}

export default MissionBriefingIntegration;