import { EventEmitter } from 'events';

/**
 * StoryEngine - Core narrative engine for managing the game's story progression
 * Handles story state, player choices, and narrative events
 */
class StoryEngine extends EventEmitter {
  constructor() {
    super();
    
    // Story state
    this.state = {
      // Main story progress (0-100%)
      mainProgress: 0,
      
      // Current chapter/act
      currentChapter: 'intro',
      
      // Completed chapters
      completedChapters: {},
      
      // Story flags (decisions, events, discoveries)
      flags: {},
      
      // Character relationships (-100 to 100)
      relationships: {},
      
      // Discovered lore/knowledge
      discoveredLore: {},
      
      // Collected items/evidence
      collectedEvidence: {},
      
      // World state values
      worldState: {
        // Pandemic severity (0-100)
        pandemicSeverity: 15,
        
        // Time remaining (in seconds)
        timeRemaining: 7200, // 2 hours
        
        // Research progress (0-100)
        researchProgress: 0,
        
        // Lab facilities unlocked
        unlockedFacilities: ['alpha_wing'],
        
        // Quantum stabilization (0-100)
        quantumStabilization: 0,
      },
      
      // Player decisions history
      decisions: [],
      
      // Active quest/mission states
      activeQuests: {},
      
      // Player ending path (determined by choices)
      endingPath: 'neutral',
    };
    
    // Track active narration/cinematics
    this.activeNarration = null;
    
    // Triggered events
    this.triggeredEvents = {};
    
    // Registered story listeners
    this.storyListeners = {};
    
    // Initialize clock for timing
    this.lastUpdateTime = Date.now();
  }
  
  /**
   * Initialize the story with optional custom starting state
   * @param {Object} initialState Optional custom initial state
   */
  initialize(initialState = {}) {
    // Merge custom initial state with defaults
    if (Object.keys(initialState).length > 0) {
      this.state = {
        ...this.state,
        ...initialState,
      };
    }
    
    // Initialize story clock
    this.lastUpdateTime = Date.now();
    
    // Emit initialization event
    this.emit('storyInitialized', this.state);
    
    return this;
  }
  
  /**
   * Updates the story state based on elapsed time
   * @param {number} deltaTime Time since last update in seconds
   */
  update(deltaTime) {
    // Update world time
    if (this.state.worldState.timeRemaining > 0) {
      this.state.worldState.timeRemaining = Math.max(0, this.state.worldState.timeRemaining - deltaTime);
      
      // Check for time-based triggers
      this._checkTimeBasedTriggers();
    }
    
    // If time runs out
    if (this.state.worldState.timeRemaining <= 0 && !this.triggeredEvents['timeExpired']) {
      this.triggeredEvents['timeExpired'] = true;
      this.triggerEvent('timeExpired');
    }
    
    // Update pandemic progression based on research progress and time
    this._updatePandemicProgression(deltaTime);
    
    // Check for story condition triggers
    this._checkConditionTriggers();
    
    return this;
  }
  
  /**
   * Progress to a specific chapter
   * @param {string} chapterKey The chapter identifier
   */
  progressToChapter(chapterKey) {
    if (this.state.currentChapter === chapterKey) return;
    
    // Mark previous chapter as completed
    const prevChapter = this.state.currentChapter;
    this.state.completedChapters[prevChapter] = true;
    
    // Update current chapter
    this.state.currentChapter = chapterKey;
    
    // Fire chapter progression events
    this.emit('chapterCompleted', prevChapter);
    this.emit('chapterStarted', chapterKey);
    
    // Log story progression
    console.log(`Story progressed to chapter: ${chapterKey}`);
    
    return this;
  }
  
  /**
   * Set a story flag
   * @param {string} flag Flag identifier
   * @param {any} value Flag value
   */
  setFlag(flag, value) {
    this.state.flags[flag] = value;
    
    // Emit flag changed event
    this.emit('flagChanged', { flag, value, previousValue: this.state.flags[flag] });
    
    return this;
  }
  
  /**
   * Get a story flag value
   * @param {string} flag Flag identifier
   * @param {any} defaultValue Default value if flag is not set
   */
  getFlag(flag, defaultValue = null) {
    return this.state.flags[flag] !== undefined ? this.state.flags[flag] : defaultValue;
  }
  
  /**
   * Modify a relationship with a character
   * @param {string} character Character identifier
   * @param {number} delta Change amount (-100 to 100)
   */
  modifyRelationship(character, delta) {
    // Initialize relationship if it doesn't exist
    if (this.state.relationships[character] === undefined) {
      this.state.relationships[character] = 0;
    }
    
    // Store previous value
    const previousValue = this.state.relationships[character];
    
    // Update relationship score, clamped between -100 and 100
    this.state.relationships[character] = Math.max(-100, Math.min(100, this.state.relationships[character] + delta));
    
    // Emit relationship change event
    this.emit('relationshipChanged', { 
      character, 
      delta, 
      newValue: this.state.relationships[character],
      previousValue
    });
    
    return this;
  }
  
  /**
   * Get relationship value with a character
   * @param {string} character Character identifier
   */
  getRelationship(character) {
    return this.state.relationships[character] || 0;
  }
  
  /**
   * Record a player decision
   * @param {string} decisionKey Decision identifier
   * @param {string} choice Selected choice
   * @param {Object} context Additional context for the decision
   */
  recordDecision(decisionKey, choice, context = {}) {
    // Create decision record
    const decision = {
      id: decisionKey,
      choice,
      context,
      timestamp: Date.now(),
      chapter: this.state.currentChapter,
    };
    
    // Add to decisions history
    this.state.decisions.push(decision);
    
    // Set as a flag for easy condition checking
    this.setFlag(`decision_${decisionKey}`, choice);
    
    // Emit decision event
    this.emit('decisionMade', decision);
    
    // Update ending path based on decision
    this._updateEndingPath();
    
    return this;
  }
  
  /**
   * Discover a piece of lore
   * @param {string} loreKey Lore identifier
   * @param {Object} loreData Lore content and metadata
   */
  discoverLore(loreKey, loreData) {
    // Skip if already discovered
    if (this.state.discoveredLore[loreKey]) return this;
    
    // Add discovery timestamp
    const lore = {
      ...loreData,
      discoveredAt: Date.now(),
    };
    
    // Store the lore
    this.state.discoveredLore[loreKey] = lore;
    
    // Emit lore discovered event
    this.emit('loreDiscovered', { key: loreKey, data: lore });
    
    // Check if this lore affects research progress
    if (lore.researchValue) {
      this.advanceResearch(lore.researchValue);
    }
    
    return this;
  }
  
  /**
   * Collect evidence or important item
   * @param {string} evidenceKey Evidence identifier
   * @param {Object} evidenceData Evidence content and metadata
   */
  collectEvidence(evidenceKey, evidenceData) {
    // Skip if already collected
    if (this.state.collectedEvidence[evidenceKey]) return this;
    
    // Add collection timestamp
    const evidence = {
      ...evidenceData,
      collectedAt: Date.now(),
    };
    
    // Store the evidence
    this.state.collectedEvidence[evidenceKey] = evidence;
    
    // Emit evidence collected event
    this.emit('evidenceCollected', { key: evidenceKey, data: evidence });
    
    // Check if this evidence affects research progress
    if (evidence.researchValue) {
      this.advanceResearch(evidence.researchValue);
    }
    
    return this;
  }
  
  /**
   * Check if a piece of evidence has been collected
   * @param {string} evidenceKey Evidence identifier
   */
  hasEvidence(evidenceKey) {
    return !!this.state.collectedEvidence[evidenceKey];
  }
  
  /**
   * Check if a piece of lore has been discovered
   * @param {string} loreKey Lore identifier
   */
  hasLore(loreKey) {
    return !!this.state.discoveredLore[loreKey];
  }
  
  /**
   * Increase research progress
   * @param {number} amount Amount to increase (0-100)
   */
  advanceResearch(amount) {
    const previousProgress = this.state.worldState.researchProgress;
    
    // Update research progress, clamped between 0-100
    this.state.worldState.researchProgress = Math.min(
      100, 
      this.state.worldState.researchProgress + amount
    );
    
    // Check for research milestones
    this._checkResearchMilestones(previousProgress);
    
    // Emit research progress event
    this.emit('researchProgressed', {
      previousProgress,
      currentProgress: this.state.worldState.researchProgress,
      increase: amount
    });
    
    return this;
  }
  
  /**
   * Trigger a story event
   * @param {string} eventKey Event identifier
   * @param {Object} eventData Event data
   */
  triggerEvent(eventKey, eventData = {}) {
    // Mark event as triggered
    this.triggeredEvents[eventKey] = true;
    
    // Create event object
    const event = {
      id: eventKey,
      data: eventData,
      timestamp: Date.now(),
      chapter: this.state.currentChapter,
    };
    
    // Emit the event
    this.emit('storyEvent', event);
    this.emit(`storyEvent:${eventKey}`, event);
    
    // Check if this event has special handlers
    this._handleSpecialEvents(eventKey, eventData);
    
    return this;
  }
  
  /**
   * Check if an event has been triggered
   * @param {string} eventKey Event identifier
   */
  hasTriggeredEvent(eventKey) {
    return !!this.triggeredEvents[eventKey];
  }
  
  /**
   * Unlock a facility
   * @param {string} facilityKey Facility identifier
   */
  unlockFacility(facilityKey) {
    // Skip if already unlocked
    if (this.state.worldState.unlockedFacilities.includes(facilityKey)) return this;
    
    // Add to unlocked facilities
    this.state.worldState.unlockedFacilities.push(facilityKey);
    
    // Emit facility unlocked event
    this.emit('facilityUnlocked', facilityKey);
    
    return this;
  }
  
  /**
   * Check if a facility is unlocked
   * @param {string} facilityKey Facility identifier
   */
  isFacilityUnlocked(facilityKey) {
    return this.state.worldState.unlockedFacilities.includes(facilityKey);
  }
  
  /**
   * Start a quest or mission
   * @param {string} questKey Quest identifier
   * @param {Object} questData Quest data
   */
  startQuest(questKey, questData) {
    // Skip if already active
    if (this.state.activeQuests[questKey]) return this;
    
    // Create quest object
    const quest = {
      ...questData,
      status: 'active',
      startedAt: Date.now(),
      progress: 0,
      objectives: questData.objectives?.map(obj => ({
        ...obj,
        completed: false,
      })) || [],
    };
    
    // Store the quest
    this.state.activeQuests[questKey] = quest;
    
    // Emit quest started event
    this.emit('questStarted', { key: questKey, data: quest });
    
    return this;
  }
  
  /**
   * Update a quest's progress
   * @param {string} questKey Quest identifier
   * @param {number} progress New progress value (0-100)
   */
  updateQuestProgress(questKey, progress) {
    // Skip if quest doesn't exist
    if (!this.state.activeQuests[questKey]) return this;
    
    // Update progress
    this.state.activeQuests[questKey].progress = Math.min(100, progress);
    
    // Emit quest updated event
    this.emit('questUpdated', { 
      key: questKey, 
      data: this.state.activeQuests[questKey] 
    });
    
    // Check if quest is completed
    if (progress >= 100 && this.state.activeQuests[questKey].status !== 'completed') {
      this.completeQuest(questKey);
    }
    
    return this;
  }
  
  /**
   * Complete a quest objective
   * @param {string} questKey Quest identifier
   * @param {string} objectiveKey Objective identifier
   */
  completeObjective(questKey, objectiveKey) {
    // Skip if quest doesn't exist
    if (!this.state.activeQuests[questKey]) return this;
    
    const quest = this.state.activeQuests[questKey];
    
    // Find the objective
    const objective = quest.objectives.find(obj => obj.id === objectiveKey);
    if (!objective) return this;
    
    // Mark as completed
    objective.completed = true;
    objective.completedAt = Date.now();
    
    // Emit objective completed event
    this.emit('objectiveCompleted', { 
      questKey, 
      objectiveKey,
      objective 
    });
    
    // Check if all objectives are completed
    const allCompleted = quest.objectives.every(obj => obj.completed);
    if (allCompleted && quest.status !== 'completed') {
      this.completeQuest(questKey);
    } else {
      // Update quest progress based on objectives
      const completedCount = quest.objectives.filter(obj => obj.completed).length;
      const totalCount = quest.objectives.length;
      const progress = Math.floor((completedCount / totalCount) * 100);
      
      this.updateQuestProgress(questKey, progress);
    }
    
    return this;
  }
  
  /**
   * Complete a quest
   * @param {string} questKey Quest identifier
   */
  completeQuest(questKey) {
    // Skip if quest doesn't exist or is already completed
    if (!this.state.activeQuests[questKey] || 
        this.state.activeQuests[questKey].status === 'completed') {
      return this;
    }
    
    // Update quest
    this.state.activeQuests[questKey].status = 'completed';
    this.state.activeQuests[questKey].completedAt = Date.now();
    this.state.activeQuests[questKey].progress = 100;
    
    // Emit quest completed event
    this.emit('questCompleted', { 
      key: questKey, 
      data: this.state.activeQuests[questKey] 
    });
    
    return this;
  }
  
  /**
   * Fail a quest
   * @param {string} questKey Quest identifier
   */
  failQuest(questKey) {
    // Skip if quest doesn't exist or is already failed/completed
    if (!this.state.activeQuests[questKey] || 
        this.state.activeQuests[questKey].status !== 'active') {
      return this;
    }
    
    // Update quest
    this.state.activeQuests[questKey].status = 'failed';
    this.state.activeQuests[questKey].failedAt = Date.now();
    
    // Emit quest failed event
    this.emit('questFailed', { 
      key: questKey, 
      data: this.state.activeQuests[questKey] 
    });
    
    return this;
  }
  
  /**
   * Add time to the world clock (e.g., from time-extending events)
   * @param {number} seconds Seconds to add
   */
  addTime(seconds) {
    this.state.worldState.timeRemaining += seconds;
    
    // Emit time added event
    this.emit('timeAdded', { 
      seconds,
      newTimeRemaining: this.state.worldState.timeRemaining
    });
    
    return this;
  }
  
  /**
   * Get formatted time remaining
   * @returns {string} Formatted time string (HH:MM:SS)
   */
  getFormattedTimeRemaining() {
    const totalSeconds = Math.max(0, Math.floor(this.state.worldState.timeRemaining));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Save story state
   * @returns {Object} Serialized story state
   */
  save() {
    return {
      state: this.state,
      triggeredEvents: this.triggeredEvents,
      lastUpdateTime: this.lastUpdateTime,
    };
  }
  
  /**
   * Load story state
   * @param {Object} savedState Previously saved state
   */
  load(savedState) {
    if (!savedState || !savedState.state) {
      console.error('Invalid saved state provided');
      return this;
    }
    
    this.state = savedState.state;
    this.triggeredEvents = savedState.triggeredEvents || {};
    this.lastUpdateTime = savedState.lastUpdateTime || Date.now();
    
    // Emit state loaded event
    this.emit('stateLoaded', this.state);
    
    return this;
  }
  
  /**
   * Register a listener for a story condition
   * @param {Function} condition Function that returns true when condition is met
   * @param {Function} callback Function to call when condition is met
   * @param {Object} options Options like id, once, etc.
   */
  when(condition, callback, options = {}) {
    const id = options.id || `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.storyListeners[id] = {
      condition,
      callback,
      triggered: false,
      once: options.once !== undefined ? options.once : true,
    };
    
    return id;
  }
  
  /**
   * Remove a story condition listener
   * @param {string} id Listener ID
   */
  removeListener(id) {
    if (this.storyListeners[id]) {
      delete this.storyListeners[id];
      return true;
    }
    return false;
  }
  
  /**
   * Get the current ending path based on choices
   * @returns {string} Current ending path
   */
  getCurrentEndingPath() {
    return this.state.endingPath;
  }
  
  /**
   * Get all ending paths with requirements
   * @returns {Object} Map of endings and their requirements
   */
  getPossibleEndings() {
    return {
      // Complete cure with minimal side effects
      'true_cure': {
        requirements: {
          researchProgress: 100,
          quantumStabilization: 80,
          collectedEvidence: ['quantum_formula', 'patient_zero_data', 'stabilizer_compound'],
          flags: {
            saved_all_researchers: true,
            maintained_quantum_integrity: true,
          }
        },
        description: 'Discovered the true cure with minimal quantum disruption',
      },
      
      // Cure but with side effects
      'partial_cure': {
        requirements: {
          researchProgress: 80,
          quantumStabilization: 50,
          collectedEvidence: ['quantum_formula', 'stabilizer_compound'],
        },
        description: 'Found a partial cure with some quantum side effects',
      },
      
      // Emergency solution with major downsides
      'emergency_solution': {
        requirements: {
          researchProgress: 60,
          timeRemaining: 0,
        },
        description: 'Developed an emergency solution with significant drawbacks',
      },
      
      // Failed to develop any viable cure
      'failure': {
        requirements: {
          researchProgress: [0, 50],
          timeRemaining: 0,
        },
        description: 'Failed to develop a viable cure in time',
      },
      
      // Quantum collapse (bad ending)
      'quantum_collapse': {
        requirements: {
          quantumStabilization: [0, 30],
          flags: {
            caused_quantum_breach: true,
          }
        },
        description: 'Caused a catastrophic quantum collapse',
      },
    };
  }
  
  /**
   * Determine which ending the player will get based on current state
   * @returns {string} Ending key
   */
  determineEnding() {
    const endings = this.getPossibleEndings();
    
    // Check each ending's requirements
    for (const [endingKey, data] of Object.entries(endings)) {
      if (this._checkEndingRequirements(data.requirements)) {
        return endingKey;
      }
    }
    
    // Default ending
    return 'emergency_solution';
  }
  
  // **** PRIVATE METHODS **** //
  
  /**
   * Update pandemic progression based on time and research
   * @param {number} deltaTime Time since last update
   * @private
   */
  _updatePandemicProgression(deltaTime) {
    // Calculate progression rate
    // - Higher research slows pandemic spread
    // - Closer to deadline accelerates spread
    const timeRatio = 1 - (this.state.worldState.timeRemaining / 7200);
    const researchFactor = 1 - (this.state.worldState.researchProgress / 100) * 0.9;
    
    // Base rate: 0.05% per second, modified by time and research
    const progressionRate = 0.05 * researchFactor * (1 + timeRatio);
    
    // Update pandemic severity
    this.state.worldState.pandemicSeverity = Math.min(
      100,
      this.state.worldState.pandemicSeverity + progressionRate * deltaTime
    );
    
    // Critical severity threshold events
    const thresholds = [25, 50, 75, 90, 95];
    
    thresholds.forEach(threshold => {
      const eventKey = `pandemic_severity_${threshold}`;
      
      if (this.state.worldState.pandemicSeverity >= threshold && 
          !this.triggeredEvents[eventKey]) {
        this.triggerEvent(eventKey, { severity: this.state.worldState.pandemicSeverity });
      }
    });
  }
  
  /**
   * Check for research milestones
   * @param {number} previousProgress Previous research progress
   * @private
   */
  _checkResearchMilestones(previousProgress) {
    const milestones = [10, 25, 50, 75, 90, 100];
    
    milestones.forEach(milestone => {
      // Check if we've crossed a milestone
      if (previousProgress < milestone && 
          this.state.worldState.researchProgress >= milestone) {
        this.triggerEvent(`research_milestone_${milestone}`, {
          progress: this.state.worldState.researchProgress
        });
        
        // Special handling for specific milestones
        if (milestone === 50) {
          // At 50% research, slow down the pandemic slightly
          this.state.worldState.pandemicSeverity = Math.max(
            0,
            this.state.worldState.pandemicSeverity - 5
          );
        }
        else if (milestone === 100) {
          // At 100% research, cure is theoretically possible
          this.triggerEvent('cure_formula_discovered');
        }
      }
    });
  }
  
  /**
   * Check for time-based triggers
   * @private
   */
  _checkTimeBasedTriggers() {
    const timeRemainingHours = this.state.worldState.timeRemaining / 3600;
    
    // Trigger warnings at specific time points
    const timeWarnings = [24, 12, 6, 3, 1, 0.5]; // Hours
    
    timeWarnings.forEach(hours => {
      const eventKey = `time_remaining_${hours}h`;
      
      if (timeRemainingHours <= hours && !this.triggeredEvents[eventKey]) {
        this.triggerEvent(eventKey, { 
          hoursRemaining: hours,
          timeRemaining: this.state.worldState.timeRemaining
        });
      }
    });
  }
  
  /**
   * Check all registered condition triggers
   * @private
   */
  _checkConditionTriggers() {
    for (const [id, listener] of Object.entries(this.storyListeners)) {
      // Skip already triggered "once" listeners
      if (listener.triggered && listener.once) continue;
      
      // Check if condition is true
      if (listener.condition(this.state, this.triggeredEvents)) {
        // Mark as triggered
        listener.triggered = true;
        
        // Call the callback
        listener.callback(this.state, this.triggeredEvents);
        
        // Remove if it's a "once" listener
        if (listener.once) {
          delete this.storyListeners[id];
        }
      }
    }
  }
  
  /**
   * Special handlers for specific events
   * @param {string} eventKey Event identifier
   * @param {Object} eventData Event data
   * @private
   */
  _handleSpecialEvents(eventKey, eventData) {
    switch (eventKey) {
      case 'quantum_breach':
        // Quantum breach increases pandemic severity
        this.state.worldState.pandemicSeverity += 10;
        this.state.worldState.quantumStabilization -= 15;
        this.setFlag('caused_quantum_breach', true);
        break;
        
      case 'cure_formula_discovered':
        // Add extra time as a bonus
        this.addTime(1800); // 30 minutes extra
        break;
        
      case 'researcher_rescued':
        // Rescued researchers provide research boost
        this.advanceResearch(5);
        break;
        
      // Add more special event handlers as needed
    }
  }
  
  /**
   * Update the ending path based on player choices and state
   * @private
   */
  _updateEndingPath() {
    // Count the types of decisions made
    const decisions = this.state.decisions;
    let altruisticCount = 0;
    let pragmaticCount = 0;
    let riskyCount = 0;
    let carefulCount = 0;
    
    // Analyze decisions
    decisions.forEach(decision => {
      if (decision.context.type === 'altruistic') altruisticCount++;
      if (decision.context.type === 'pragmatic') pragmaticCount++;
      if (decision.context.type === 'risky') riskyCount++;
      if (decision.context.type === 'careful') carefulCount++;
    });
    
    // Determine primary path based on decision counts
    if (altruisticCount > pragmaticCount) {
      // Humanitarian path
      if (riskyCount > carefulCount) {
        this.state.endingPath = 'humanitarian_bold';
      } else {
        this.state.endingPath = 'humanitarian_cautious';
      }
    } else {
      // Pragmatic path
      if (riskyCount > carefulCount) {
        this.state.endingPath = 'pragmatic_bold';
      } else {
        this.state.endingPath = 'pragmatic_cautious';
      }
    }
    
    // Override for extreme choices
    if (this.getFlag('sacrificed_team', false)) {
      this.state.endingPath = 'ruthless';
    } else if (this.getFlag('saved_everyone', false)) {
      this.state.endingPath = 'heroic';
    }
    
    // Research progress also affects ending
    if (this.state.worldState.researchProgress < 30) {
      this.state.endingPath = 'failure';
    }
  }
  
  /**
   * Check if ending requirements are met
   * @param {Object} requirements Requirements to check
   * @returns {boolean} Whether requirements are met
   * @private
   */
  _checkEndingRequirements(requirements) {
    // Check world state requirements
    if (requirements.researchProgress !== undefined) {
      if (Array.isArray(requirements.researchProgress)) {
        // Range check [min, max]
        const [min, max] = requirements.researchProgress;
        if (this.state.worldState.researchProgress < min || 
            this.state.worldState.researchProgress > max) {
          return false;
        }
      } else {
        // Minimum value check
        if (this.state.worldState.researchProgress < requirements.researchProgress) {
          return false;
        }
      }
    }
    
    if (requirements.quantumStabilization !== undefined) {
      if (Array.isArray(requirements.quantumStabilization)) {
        // Range check [min, max]
        const [min, max] = requirements.quantumStabilization;
        if (this.state.worldState.quantumStabilization < min || 
            this.state.worldState.quantumStabilization > max) {
          return false;
        }
      } else {
        // Minimum value check
        if (this.state.worldState.quantumStabilization < requirements.quantumStabilization) {
          return false;
        }
      }
    }
    
    if (requirements.timeRemaining !== undefined) {
      if (this.state.worldState.timeRemaining > requirements.timeRemaining) {
        return false;
      }
    }
    
    // Check collected evidence
    if (requirements.collectedEvidence) {
      for (const evidence of requirements.collectedEvidence) {
        if (!this.hasEvidence(evidence)) {
          return false;
        }
      }
    }
    
    // Check story flags
    if (requirements.flags) {
      for (const [flag, value] of Object.entries(requirements.flags)) {
        if (this.getFlag(flag) !== value) {
          return false;
        }
      }
    }
    
    return true;
  }
}

export default StoryEngine;