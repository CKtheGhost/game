import { EventEmitter } from 'events';
import MissionData from './MissionData';

/**
 * MissionBriefingSystem - Manages mission briefings, objectives, and player progress
 */
class MissionBriefingSystem extends EventEmitter {
  constructor(storyEngine) {
    super();
    
    // Core components
    this.storyEngine = storyEngine;
    
    // Mission state
    this.activeMission = null;
    this.completedMissions = [];
    this.missionProgress = {}; // Tracks progress for each mission
    this.objectiveStatus = {}; // Tracks objective completion status
    this.missionNotes = {}; // Player notes for each mission
    this.discoveredClues = {}; // Tracks clues found during missions
    
    // Timer for time-limited missions
    this.missionTimers = {};
    
    // Mission listeners and callbacks
    this.eventListeners = {};
    
    // Initialize the system
    this._initialize();
  }
  
  /**
   * Initialize the mission briefing system
   * @private
   */
  _initialize() {
    // Load saved mission progress if available
    this._loadProgress();
    
    // Set up event listeners for story events
    this._setupEventListeners();
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Listen for story events that might affect missions
    if (this.storyEngine) {
      // Mission trigger events
      this.storyEngine.on('flagChanged', (flag, value) => {
        this._checkMissionTriggers(flag, value);
      });
      
      // Research discovery events
      this.storyEngine.on('researchDiscovered', (researchId) => {
        this._updateMissionFromResearch(researchId);
      });
      
      // Location events
      this.storyEngine.on('locationChanged', (locationId) => {
        this._checkLocationObjectives(locationId);
      });
      
      // Item collection events
      this.storyEngine.on('itemCollected', (itemId) => {
        this._checkItemObjectives(itemId);
      });
    }
  }
  
  /**
   * Check if any missions should be triggered based on flag changes
   * @param {string} flag The flag that changed
   * @param {any} value The new value of the flag
   * @private
   */
  _checkMissionTriggers(flag, value) {
    // Check all missions for triggers
    Object.values(MissionData).forEach(mission => {
      // Check if mission should be triggered
      if (
        mission.triggerFlags && 
        mission.triggerFlags[flag] === value &&
        !this.isActiveMission(mission.id) &&
        !this.isMissionCompleted(mission.id)
      ) {
        this.startMission(mission.id);
      }
      
      // Check for objective updates based on flags
      if (this.isActiveMission(mission.id)) {
        mission.objectives.forEach(objective => {
          if (
            objective.completeOnFlag && 
            objective.completeOnFlag.flag === flag &&
            objective.completeOnFlag.value === value
          ) {
            this.completeObjective(mission.id, objective.id);
          }
        });
      }
    });
  }
  
  /**
   * Update mission progress based on research discoveries
   * @param {string} researchId The ID of the discovered research
   * @private
   */
  _updateMissionFromResearch(researchId) {
    // Check all active missions for research-based objectives
    if (this.activeMission) {
      const mission = MissionData[this.activeMission];
      
      if (mission) {
        mission.objectives.forEach(objective => {
          if (
            objective.completeOnResearch && 
            objective.completeOnResearch === researchId
          ) {
            this.completeObjective(mission.id, objective.id);
          }
        });
      }
    }
  }
  
  /**
   * Check if any location-based objectives are completed
   * @param {string} locationId The location the player entered
   * @private
   */
  _checkLocationObjectives(locationId) {
    // Check all active missions for location-based objectives
    if (this.activeMission) {
      const mission = MissionData[this.activeMission];
      
      if (mission) {
        mission.objectives.forEach(objective => {
          if (
            objective.completeOnLocation && 
            objective.completeOnLocation === locationId
          ) {
            this.completeObjective(mission.id, objective.id);
          }
        });
      }
    }
  }
  
  /**
   * Check if any item-based objectives are completed
   * @param {string} itemId The item that was collected
   * @private
   */
  _checkItemObjectives(itemId) {
    // Check all active missions for item-based objectives
    if (this.activeMission) {
      const mission = MissionData[this.activeMission];
      
      if (mission) {
        mission.objectives.forEach(objective => {
          if (
            objective.completeOnItem && 
            objective.completeOnItem === itemId
          ) {
            this.completeObjective(mission.id, objective.id);
          }
        });
      }
    }
  }
  
  /**
   * Load saved mission progress
   * @private
   */
  _loadProgress() {
    // In a real game, this would load from localStorage or a save file
    // For now, we'll just initialize with default values
    this.activeMission = null;
    this.completedMissions = [];
    this.missionProgress = {};
    this.objectiveStatus = {};
    this.missionNotes = {};
    this.discoveredClues = {};
  }
  
  /**
   * Save current mission progress
   * @private
   */
  _saveProgress() {
    // In a real game, this would save to localStorage or a save file
    // For now, we'll just log the state
    console.log('Mission state saved', {
      activeMission: this.activeMission,
      completedMissions: this.completedMissions,
      missionProgress: this.missionProgress,
      objectiveStatus: this.objectiveStatus
    });
  }
  
  /**
   * Start a new mission by ID
   * @param {string} missionId The ID of the mission to start
   * @returns {boolean} Success status
   */
  startMission(missionId) {
    // Check if mission exists
    if (!MissionData[missionId]) {
      console.error(`Mission with ID "${missionId}" not found.`);
      return false;
    }
    
    // Check if mission is already active
    if (this.activeMission === missionId) {
      console.warn(`Mission "${missionId}" is already active.`);
      return false;
    }
    
    // Check if mission is already completed
    if (this.completedMissions.includes(missionId)) {
      console.warn(`Mission "${missionId}" has already been completed.`);
      return false;
    }
    
    // Set active mission
    this.activeMission = missionId;
    
    // Initialize mission progress
    this.missionProgress[missionId] = 0;
    
    // Initialize objective status
    if (!this.objectiveStatus[missionId]) {
      this.objectiveStatus[missionId] = {};
      
      // Set all objectives to incomplete
      MissionData[missionId].objectives.forEach(objective => {
        this.objectiveStatus[missionId][objective.id] = false;
      });
    }
    
    // Initialize mission notes
    if (!this.missionNotes[missionId]) {
      this.missionNotes[missionId] = [];
    }
    
    // Initialize discovered clues
    if (!this.discoveredClues[missionId]) {
      this.discoveredClues[missionId] = [];
    }
    
    // Start mission timer if time-limited
    if (MissionData[missionId].timeLimit) {
      this._startMissionTimer(missionId);
    }
    
    // Emit event
    this.emit('missionStarted', {
      missionId,
      mission: MissionData[missionId]
    });
    
    // Notify story engine
    if (this.storyEngine) {
      this.storyEngine.triggerEvent(`mission_started_${missionId}`);
    }
    
    // Save progress
    this._saveProgress();
    
    return true;
  }
  
  /**
   * Complete the current active mission
   * @param {boolean} success Whether the mission was completed successfully
   * @returns {boolean} Operation success status
   */
  completeMission(success = true) {
    // Check if there is an active mission
    if (!this.activeMission) {
      console.warn('No active mission to complete.');
      return false;
    }
    
    const missionId = this.activeMission;
    const mission = MissionData[missionId];
    
    if (!mission) {
      console.error(`Mission with ID "${missionId}" not found.`);
      return false;
    }
    
    // Stop mission timer if any
    this._stopMissionTimer(missionId);
    
    // Add to completed missions
    if (success) {
      this.completedMissions.push(missionId);
      
      // Set mission progress to 100%
      this.missionProgress[missionId] = 100;
      
      // Complete all objectives
      mission.objectives.forEach(objective => {
        this.objectiveStatus[missionId][objective.id] = true;
      });
      
      // Emit event
      this.emit('missionCompleted', {
        missionId,
        mission: mission,
        success: true
      });
      
      // Notify story engine
      if (this.storyEngine) {
        this.storyEngine.triggerEvent(`mission_completed_${missionId}`);
        
        // Add mission rewards if successful
        if (mission.rewards) {
          Object.entries(mission.rewards).forEach(([key, value]) => {
            this.storyEngine.setFlag(key, value);
          });
        }
      }
    } else {
      // Emit event for failed mission
      this.emit('missionFailed', {
        missionId,
        mission: mission
      });
      
      // Notify story engine
      if (this.storyEngine) {
        this.storyEngine.triggerEvent(`mission_failed_${missionId}`);
      }
    }
    
    // Clear active mission
    this.activeMission = null;
    
    // Save progress
    this._saveProgress();
    
    return true;
  }
  
  /**
   * Fail the current active mission
   * @returns {boolean} Operation success status
   */
  failMission() {
    return this.completeMission(false);
  }
  
  /**
   * Complete an objective within a mission
   * @param {string} missionId The mission ID
   * @param {string} objectiveId The objective ID
   * @returns {boolean} Success status
   */
  completeObjective(missionId, objectiveId) {
    // Check if mission exists
    if (!MissionData[missionId]) {
      console.error(`Mission with ID "${missionId}" not found.`);
      return false;
    }
    
    // Check if objective exists
    const mission = MissionData[missionId];
    const objective = mission.objectives.find(obj => obj.id === objectiveId);
    
    if (!objective) {
      console.error(`Objective with ID "${objectiveId}" not found in mission "${missionId}".`);
      return false;
    }
    
    // Check if objective is already completed
    if (this.objectiveStatus[missionId] && this.objectiveStatus[missionId][objectiveId]) {
      console.warn(`Objective "${objectiveId}" in mission "${missionId}" is already completed.`);
      return false;
    }
    
    // Mark objective as completed
    if (!this.objectiveStatus[missionId]) {
      this.objectiveStatus[missionId] = {};
    }
    
    this.objectiveStatus[missionId][objectiveId] = true;
    
    // Update mission progress
    this._updateMissionProgress(missionId);
    
    // Emit event
    this.emit('objectiveCompleted', {
      missionId,
      objectiveId,
      objective: objective
    });
    
    // Notify story engine
    if (this.storyEngine) {
      this.storyEngine.triggerEvent(`objective_completed_${missionId}_${objectiveId}`);
    }
    
    // Check if all objectives are completed
    if (this._areAllObjectivesCompleted(missionId)) {
      // Auto-complete mission if configured to do so
      if (mission.autoCompleteOnAllObjectives) {
        this.completeMission(true);
      } else {
        // Otherwise just emit an event
        this.emit('allObjectivesCompleted', {
          missionId,
          mission: mission
        });
        
        // Notify story engine
        if (this.storyEngine) {
          this.storyEngine.triggerEvent(`all_objectives_completed_${missionId}`);
        }
      }
    }
    
    // Save progress
    this._saveProgress();
    
    return true;
  }
  
  /**
   * Add a note to the current mission
   * @param {string} note The note to add
   * @returns {boolean} Success status
   */
  addMissionNote(note) {
    // Check if there is an active mission
    if (!this.activeMission) {
      console.warn('No active mission to add note to.');
      return false;
    }
    
    // Add note
    if (!this.missionNotes[this.activeMission]) {
      this.missionNotes[this.activeMission] = [];
    }
    
    this.missionNotes[this.activeMission].push({
      text: note,
      timestamp: new Date().toISOString()
    });
    
    // Emit event
    this.emit('missionNoteAdded', {
      missionId: this.activeMission,
      note: note
    });
    
    // Save progress
    this._saveProgress();
    
    return true;
  }
  
  /**
   * Discover a clue for the current mission
   * @param {string} clueId The ID of the clue
   * @returns {boolean} Success status
   */
  discoverClue(clueId) {
    // Check if there is an active mission
    if (!this.activeMission) {
      console.warn('No active mission to add clue to.');
      return false;
    }
    
    // Get mission data
    const mission = MissionData[this.activeMission];
    
    // Check if clue exists
    const clue = mission.clues?.find(c => c.id === clueId);
    
    if (!clue) {
      console.error(`Clue with ID "${clueId}" not found in mission "${this.activeMission}".`);
      return false;
    }
    
    // Check if clue is already discovered
    if (this.discoveredClues[this.activeMission] && this.discoveredClues[this.activeMission].includes(clueId)) {
      console.warn(`Clue "${clueId}" in mission "${this.activeMission}" is already discovered.`);
      return false;
    }
    
    // Add clue
    if (!this.discoveredClues[this.activeMission]) {
      this.discoveredClues[this.activeMission] = [];
    }
    
    this.discoveredClues[this.activeMission].push(clueId);
    
    // Emit event
    this.emit('clueDiscovered', {
      missionId: this.activeMission,
      clueId: clueId,
      clue: clue
    });
    
    // Notify story engine
    if (this.storyEngine) {
      this.storyEngine.triggerEvent(`clue_discovered_${this.activeMission}_${clueId}`);
    }
    
    // Check if clue completes any objectives
    if (mission.objectives) {
      mission.objectives.forEach(objective => {
        if (
          objective.completeOnClue && 
          objective.completeOnClue === clueId
        ) {
          this.completeObjective(this.activeMission, objective.id);
        }
      });
    }
    
    // Save progress
    this._saveProgress();
    
    return true;
  }
  
  /**
   * Get mission data by ID
   * @param {string} missionId The mission ID
   * @returns {Object|null} The mission data or null if not found
   */
  getMission(missionId) {
    return MissionData[missionId] || null;
  }
  
  /**
   * Get the active mission
   * @returns {Object|null} The active mission or null if none
   */
  getActiveMission() {
    if (!this.activeMission) return null;
    
    return {
      ...MissionData[this.activeMission],
      progress: this.missionProgress[this.activeMission] || 0,
      objectiveStatus: this.objectiveStatus[this.activeMission] || {},
      notes: this.missionNotes[this.activeMission] || [],
      discoveredClues: this.discoveredClues[this.activeMission] || []
    };
  }
  
  /**
   * Get all available missions
   * @returns {Array} Array of mission objects
   */
  getAllMissions() {
    return Object.values(MissionData);
  }
  
  /**
   * Get all completed missions
   * @returns {Array} Array of completed mission objects
   */
  getCompletedMissions() {
    return this.completedMissions.map(id => MissionData[id]);
  }
  
  /**
   * Check if a mission is active
   * @param {string} missionId The mission ID to check
   * @returns {boolean} True if mission is active
   */
  isActiveMission(missionId) {
    return this.activeMission === missionId;
  }
  
  /**
   * Check if a mission is completed
   * @param {string} missionId The mission ID to check
   * @returns {boolean} True if mission is completed
   */
  isMissionCompleted(missionId) {
    return this.completedMissions.includes(missionId);
  }
  
  /**
   * Check if an objective is completed
   * @param {string} missionId The mission ID
   * @param {string} objectiveId The objective ID
   * @returns {boolean} True if objective is completed
   */
  isObjectiveCompleted(missionId, objectiveId) {
    return !!(
      this.objectiveStatus[missionId] && 
      this.objectiveStatus[missionId][objectiveId]
    );
  }
  
  /**
   * Update mission progress based on completed objectives
   * @param {string} missionId The mission ID
   * @private
   */
  _updateMissionProgress(missionId) {
    // Check if mission exists
    if (!MissionData[missionId]) {
      console.error(`Mission with ID "${missionId}" not found.`);
      return;
    }
    
    // Get mission data
    const mission = MissionData[missionId];
    
    // Count completed objectives
    let completedCount = 0;
    const totalObjectives = mission.objectives.length;
    
    mission.objectives.forEach(objective => {
      if (
        this.objectiveStatus[missionId] && 
        this.objectiveStatus[missionId][objective.id]
      ) {
        completedCount++;
      }
    });
    
    // Calculate progress percentage
    const progress = totalObjectives > 0 
      ? Math.round((completedCount / totalObjectives) * 100)
      : 0;
    
    // Update progress
    this.missionProgress[missionId] = progress;
    
    // Emit event
    this.emit('missionProgressUpdated', {
      missionId,
      progress,
      completedCount,
      totalObjectives
    });
  }
  
  /**
   * Check if all objectives in a mission are completed
   * @param {string} missionId The mission ID
   * @returns {boolean} True if all objectives are completed
   * @private
   */
  _areAllObjectivesCompleted(missionId) {
    // Check if mission exists
    if (!MissionData[missionId]) {
      console.error(`Mission with ID "${missionId}" not found.`);
      return false;
    }
    
    // Get mission data
    const mission = MissionData[missionId];
    
    // Check if all objectives are completed
    return mission.objectives.every(objective => 
      this.objectiveStatus[missionId] && 
      this.objectiveStatus[missionId][objective.id]
    );
  }
  
  /**
   * Start a timer for a time-limited mission
   * @param {string} missionId The mission ID
   * @private
   */
  _startMissionTimer(missionId) {
    // Check if mission exists
    if (!MissionData[missionId]) {
      console.error(`Mission with ID "${missionId}" not found.`);
      return;
    }
    
    // Get mission data
    const mission = MissionData[missionId];
    
    // Check if mission has a time limit
    if (!mission.timeLimit) {
      return;
    }
    
    // Clear any existing timer
    this._stopMissionTimer(missionId);
    
    // Convert minutes to milliseconds
    const duration = mission.timeLimit * 60 * 1000;
    
    // Set end time
    const endTime = Date.now() + duration;
    
    // Start timer
    this.missionTimers[missionId] = {
      endTime,
      interval: setInterval(() => {
        const timeLeft = endTime - Date.now();
        
        if (timeLeft <= 0) {
          // Time's up, fail the mission
          this._stopMissionTimer(missionId);
          
          // Only fail if it's still the active mission
          if (this.activeMission === missionId) {
            this.failMission();
          }
        } else {
          // Emit timer update event
          this.emit('missionTimerUpdated', {
            missionId,
            timeLeft,
            formattedTime: this._formatTime(timeLeft)
          });
        }
      }, 1000) // Update every second
    };
    
    // Emit timer started event
    this.emit('missionTimerStarted', {
      missionId,
      duration,
      formattedTime: this._formatTime(duration)
    });
  }
  
  /**
   * Stop a mission timer
   * @param {string} missionId The mission ID
   * @private
   */
  _stopMissionTimer(missionId) {
    if (this.missionTimers[missionId]) {
      clearInterval(this.missionTimers[missionId].interval);
      delete this.missionTimers[missionId];
      
      // Emit timer stopped event
      this.emit('missionTimerStopped', {
        missionId
      });
    }
  }
  
  /**
   * Format time in milliseconds to MM:SS format
   * @param {number} ms Time in milliseconds
   * @returns {string} Formatted time
   * @private
   */
  _formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Show the mission briefing UI for a mission
   * @param {string} missionId The mission ID to show briefing for
   * @returns {Promise} Resolves when briefing is closed
   */
  showMissionBriefing(missionId) {
    // In a real implementation, this would show the UI
    // and return a promise that resolves when the UI is closed
    
    // Emit event
    this.emit('missionBriefingShown', {
      missionId,
      mission: MissionData[missionId]
    });
    
    return new Promise(resolve => {
      // Simulate a delay before resolving
      setTimeout(() => {
        this.emit('missionBriefingClosed', {
          missionId,
          mission: MissionData[missionId]
        });
        
        resolve();
      }, 500);
    });
  }
  
  /**
   * Clean up resources and dispose the system
   */
  dispose() {
    // Stop all mission timers
    Object.keys(this.missionTimers).forEach(missionId => {
      this._stopMissionTimer(missionId);
    });
    
    // Save progress before disposal
    this._saveProgress();
    
    // Remove all event listeners
    this.removeAllListeners();
    
    // Clear references
    this.storyEngine = null;
    this.activeMission = null;
    this.completedMissions = [];
    this.missionProgress = {};
    this.objectiveStatus = {};
    this.missionNotes = {};
    this.discoveredClues = {};
    this.missionTimers = {};
    this.eventListeners = {};
  }
}

export default MissionBriefingSystem;