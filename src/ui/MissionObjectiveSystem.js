import * as THREE from 'three';
import { Vector3, Color } from 'three';

/**
 * MissionObjectiveSystem - Manages mission objectives and display
 * 
 * Features:
 * 1. Mission data management
 * 2. Objective tracking and updates
 * 3. UI overlay for current objectives
 * 4. Waypoint system for objectives
 * 5. Progress tracking
 * 6. Mission completion rewards
 */
class MissionObjectiveSystem {
  constructor() {
    // Mission and objective data
    this.missions = new Map();
    this.currentMission = null;
    this.activeMissionId = null;
    
    // UI elements
    this.container = null;
    this.objectivesPanel = null;
    this.missionTitle = null;
    this.objectivesList = null;
    
    // 3D elements
    this.scene = null;
    this.waypoints = new Map();
    
    // Callbacks
    this.callbacks = {
      onMissionActivated: null,
      onMissionCompleted: null,
      onObjectiveUpdated: null,
      onObjectiveCompleted: null
    };
    
    // Initialize UI
    this._initializeUI();
  }
  
  /**
   * Set the scene reference for 3D elements
   * @param {THREE.Scene} scene - Three.js scene
   */
  setScene(scene) {
    this.scene = scene;
  }
  
  /**
   * Initialize the UI container and elements
   * @private
   */
  _initializeUI() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'mission-system';
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      .mission-system {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 350px;
        pointer-events: none;
        user-select: none;
        font-family: 'Rajdhani', 'Arial', sans-serif;
        color: #00ffff;
        z-index: 1000;
      }
      
      .objectives-panel {
        background: rgba(0, 10, 20, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid #00ffff;
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        transition: all 0.3s ease;
        max-height: 0;
        opacity: 0;
      }
      
      .objectives-panel.active {
        max-height: 300px;
        opacity: 1;
      }
      
      .mission-title {
        padding: 10px 15px;
        font-size: 16px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        position: relative;
      }
      
      .mission-title:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, #00ffff, transparent);
        opacity: 0.8;
      }
      
      .objectives-list {
        padding: 10px 15px;
      }
      
      .objective-item {
        margin-bottom: 10px;
        display: flex;
        align-items: flex-start;
      }
      
      .objective-marker {
        width: 16px;
        height: 16px;
        margin-right: 10px;
        margin-top: 2px;
        border: 1px solid #00ffff;
        position: relative;
        flex-shrink: 0;
      }
      
      .objective-marker:before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
        background: transparent;
        transition: all 0.2s ease;
      }
      
      .objective-completed .objective-marker:before {
        background: #00ffaa;
      }
      
      .objective-marker.optional {
        border-style: dashed;
      }
      
      .objective-content {
        flex-grow: 1;
      }
      
      .objective-description {
        font-size: 14px;
        margin-bottom: 4px;
        transition: all 0.2s ease;
      }
      
      .objective-completed .objective-description {
        text-decoration: line-through;
        opacity: 0.7;
      }
      
      .objective-progress {
        height: 4px;
        background: rgba(0, 0, 0, 0.3);
        position: relative;
        overflow: hidden;
        border-radius: 2px;
      }
      
      .objective-progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: #ffaa00;
        transition: width 0.3s ease;
      }
      
      .objective-count {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
      }
      
      .mission-complete-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 10, 20, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 2px solid #00ffff;
        border-radius: 5px;
        padding: 20px;
        width: 400px;
        text-align: center;
        z-index: 2000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.5s ease;
      }
      
      .mission-complete-panel.show {
        opacity: 1;
        visibility: visible;
      }
      
      .mission-complete-title {
        font-size: 24px;
        margin-bottom: 10px;
        color: #00ffaa;
      }
      
      .mission-complete-subtitle {
        font-size: 18px;
        margin-bottom: 20px;
        color: #00ffff;
      }
      
      .mission-rewards {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
      }
      
      .mission-reward {
        text-align: center;
      }
      
      .reward-icon {
        width: 50px;
        height: 50px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #00ffff;
        margin: 0 auto 5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .reward-name {
        font-size: 14px;
      }
      
      .reward-value {
        font-size: 16px;
        color: #ffaa00;
      }
      
      .objective-notification {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(0, 10, 20, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid #00ffff;
        border-radius: 5px;
        padding: 10px 20px;
        color: #00ffff;
        text-align: center;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
      }
      
      .objective-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      
      @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
      
      .objective-highlight {
        animation: pulse 2s infinite;
      }
    `;
    
    document.head.appendChild(style);
    
    // Create objectives panel
    this.objectivesPanel = document.createElement('div');
    this.objectivesPanel.className = 'objectives-panel';
    
    // Create mission title
    this.missionTitle = document.createElement('div');
    this.missionTitle.className = 'mission-title';
    
    // Create objectives list
    this.objectivesList = document.createElement('div');
    this.objectivesList.className = 'objectives-list';
    
    // Assemble the panel
    this.objectivesPanel.appendChild(this.missionTitle);
    this.objectivesPanel.appendChild(this.objectivesList);
    this.container.appendChild(this.objectivesPanel);
    
    // Add to document
    document.body.appendChild(this.container);
    
    // Create mission complete panel (initially hidden)
    this._createMissionCompletePanel();
  }
  
  /**
   * Create the mission complete panel
   * @private
   */
  _createMissionCompletePanel() {
    const panel = document.createElement('div');
    panel.className = 'mission-complete-panel';
    panel.id = 'mission-complete-panel';
    
    panel.innerHTML = `
      <div class="mission-complete-title">Mission Complete</div>
      <div class="mission-complete-subtitle" id="mission-complete-name">Quantum Core Stabilization</div>
      <div class="mission-rewards">
        <div class="mission-reward">
          <div class="reward-icon">XP</div>
          <div class="reward-name">Experience</div>
          <div class="reward-value" id="reward-xp">+500</div>
        </div>
        <div class="mission-reward">
          <div class="reward-icon">$</div>
          <div class="reward-name">Credits</div>
          <div class="reward-value" id="reward-credits">+200</div>
        </div>
        <div class="mission-reward">
          <div class="reward-icon">⚡</div>
          <div class="reward-name">Energy Cells</div>
          <div class="reward-value" id="reward-energy">+5</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add click handler to hide the panel
    panel.addEventListener('click', () => {
      panel.classList.remove('show');
    });
  }
  
  /**
   * Create a 3D waypoint for an objective
   * @param {string} objectiveId - ID of the objective
   * @param {Vector3} position - World position
   * @param {Object} options - Waypoint options
   * @private
   */
  _createWaypoint(objectiveId, position, options = {}) {
    if (!this.scene) return;
    
    const defaults = {
      color: new Color(0xffaa00),
      size: 1.0,
      pulsing: true,
      showDistance: true,
      showLine: true
    };
    
    const config = { ...defaults, ...options };
    
    // Create a group to hold all waypoint elements
    const waypointGroup = new THREE.Group();
    waypointGroup.position.copy(position);
    
    // Create a marker mesh (spinning diamond)
    const markerGeometry = new THREE.OctahedronGeometry(config.size * 0.5, 0);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    waypointGroup.add(marker);
    
    // Create a pulsing ring
    const ringGeometry = new THREE.RingGeometry(config.size * 0.7, config.size * 0.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Align horizontally
    waypointGroup.add(ring);
    
    // Create a vertical line from ground to marker
    let line = null;
    if (config.showLine) {
      const lineGeometry = new THREE.BufferGeometry();
      const lineVertices = new Float32Array([
        0, -position.y, 0, // Start at ground level
        0, 0, 0            // End at marker position
      ]);
      
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.5
      });
      
      line = new THREE.Line(lineGeometry, lineMaterial);
      waypointGroup.add(line);
    }
    
    // Add to scene
    this.scene.add(waypointGroup);
    
    // Store reference with animation data
    this.waypoints.set(objectiveId, {
      group: waypointGroup,
      marker: marker,
      ring: ring,
      line: line,
      config: config,
      time: 0
    });
    
    return waypointGroup;
  }
  
  /**
   * Update waypoint animations
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateWaypoints(deltaTime) {
    if (!this.scene) return;
    
    // Update each waypoint
    for (const [objectiveId, waypoint] of this.waypoints.entries()) {
      waypoint.time += deltaTime;
      
      // Rotate marker
      waypoint.marker.rotation.y += deltaTime * 1.5;
      waypoint.marker.rotation.x += deltaTime * 0.7;
      
      // Pulse ring scale
      if (waypoint.config.pulsing) {
        const pulse = Math.sin(waypoint.time * 3) * 0.2 + 1.2;
        waypoint.ring.scale.set(pulse, pulse, pulse);
        
        // Also pulse opacity
        waypoint.ring.material.opacity = (Math.sin(waypoint.time * 3) * 0.3 + 0.7) * 0.5;
      }
    }
  }
  
  /**
   * Update distance indicators for waypoints
   * @param {Vector3} playerPosition - Current player position
   * @private
   */
  _updateWaypointDistances(playerPosition) {
    if (!this.scene || !playerPosition) return;
    
    for (const [objectiveId, waypoint] of this.waypoints.entries()) {
      if (!waypoint.config.showDistance) continue;
      
      // Calculate distance
      const waypointPosition = waypoint.group.position.clone();
      const distance = waypointPosition.distanceTo(playerPosition);
      
      // Check if distance indicator exists
      if (!waypoint.distanceIndicator) {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        // Create a sprite with the canvas as texture
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 1, 1);
        sprite.position.y = 2; // Position above the marker
        
        waypoint.group.add(sprite);
        waypoint.distanceIndicator = {
          sprite: sprite,
          canvas: canvas,
          context: context,
          texture: texture
        };
      }
      
      // Update distance text
      const { context, texture } = waypoint.distanceIndicator;
      
      // Clear canvas
      context.clearRect(0, 0, 256, 128);
      
      // Draw background
      context.fillStyle = 'rgba(0, 10, 20, 0.7)';
      context.fillRect(64, 32, 128, 32);
      
      // Draw border
      context.strokeStyle = waypoint.config.color.getStyle();
      context.lineWidth = 2;
      context.strokeRect(64, 32, 128, 32);
      
      // Draw distance text
      context.fillStyle = '#ffffff';
      context.font = '24px "Rajdhani", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Format distance
      let distanceText;
      if (distance < 10) {
        distanceText = `${distance.toFixed(1)}m`;
      } else {
        distanceText = `${Math.round(distance)}m`;
      }
      
      context.fillText(distanceText, 128, 48);
      
      // Update texture
      texture.needsUpdate = true;
      
      // Face the sprite to the camera
      waypoint.distanceIndicator.sprite.material.rotation = 0;
    }
  }
  
  /**
   * Define a new mission
   * @param {string} missionId - Unique mission ID
   * @param {Object} missionData - Mission data
   */
  defineMission(missionId, missionData) {
    // Validate mission data
    if (!missionData.title || !missionData.objectives || !Array.isArray(missionData.objectives)) {
      console.error('Invalid mission data. Must include title and objectives array.');
      return;
    }
    
    // Process objectives to ensure they have the required fields
    const objectives = missionData.objectives.map(obj => ({
      id: obj.id || `obj_${Math.random().toString(36).substr(2, 9)}`,
      description: obj.description || 'Unknown objective',
      completed: false,
      optional: obj.optional || false,
      progress: obj.progress || 0,
      maxProgress: obj.maxProgress || 1,
      position: obj.position ? new Vector3(obj.position.x, obj.position.y, obj.position.z) : null,
      waypointOptions: obj.waypointOptions || {}
    }));
    
    // Create mission object
    const mission = {
      id: missionId,
      title: missionData.title,
      description: missionData.description || '',
      objectives: objectives,
      rewards: missionData.rewards || {},
      completed: false,
      waypoints: missionData.waypoints !== false // Enable waypoints by default
    };
    
    // Store mission
    this.missions.set(missionId, mission);
    
    return mission;
  }
  
  /**
   * Activate a mission
   * @param {string} missionId - ID of mission to activate
   */
  activateMission(missionId) {
    const mission = this.missions.get(missionId);
    if (!mission) {
      console.error(`Mission with ID ${missionId} not found.`);
      return;
    }
    
    // Set as current mission
    this.currentMission = mission;
    this.activeMissionId = missionId;
    
    // Update UI
    this.missionTitle.textContent = mission.title;
    this._updateObjectivesList();
    
    // Show the panel
    this.objectivesPanel.classList.add('active');
    
    // Create waypoints for each objective with a position
    if (mission.waypoints && this.scene) {
      for (const objective of mission.objectives) {
        if (objective.position) {
          this._createWaypoint(
            objective.id,
            objective.position,
            objective.waypointOptions
          );
        }
      }
    }
    
    // Trigger callback
    if (this.callbacks.onMissionActivated) {
      this.callbacks.onMissionActivated(mission);
    }
    
    // Show notification
    this._showNotification(`New Mission: ${mission.title}`);
    
    return mission;
  }
  
  /**
   * Update the objectives list in the UI
   * @private
   */
  _updateObjectivesList() {
    if (!this.currentMission) return;
    
    // Clear the list
    this.objectivesList.innerHTML = '';
    
    // Add each objective
    for (const objective of this.currentMission.objectives) {
      const objectiveElement = document.createElement('div');
      objectiveElement.className = `objective-item ${objective.completed ? 'objective-completed' : ''}`;
      objectiveElement.setAttribute('data-id', objective.id);
      
      // Create marker (checkbox)
      const marker = document.createElement('div');
      marker.className = `objective-marker ${objective.optional ? 'optional' : ''}`;
      
      // Create content container
      const content = document.createElement('div');
      content.className = 'objective-content';
      
      // Create description
      const description = document.createElement('div');
      description.className = 'objective-description';
      description.textContent = objective.description;
      
      content.appendChild(description);
      
      // Create progress bar if needed
      if (!objective.completed && objective.maxProgress > 1) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'objective-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'objective-progress-bar';
        progressBar.style.width = `${(objective.progress / objective.maxProgress) * 100}%`;
        
        progressContainer.appendChild(progressBar);
        content.appendChild(progressContainer);
        
        // Add count text
        const countText = document.createElement('div');
        countText.className = 'objective-count';
        countText.textContent = `${objective.progress} / ${objective.maxProgress}`;
        content.appendChild(countText);
      }
      
      // Assemble the item
      objectiveElement.appendChild(marker);
      objectiveElement.appendChild(content);
      
      this.objectivesList.appendChild(objectiveElement);
    }
  }
  
  /**
   * Update an objective
   * @param {string} objectiveId - ID of the objective to update
   * @param {Object} updates - Updates to apply
   */
  updateObjective(objectiveId, updates) {
    if (!this.currentMission) return;
    
    // Find the objective
    const objective = this.currentMission.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      console.error(`Objective with ID ${objectiveId} not found in current mission.`);
      return;
    }
    
    // Check if this update completes the objective
    let newlyCompleted = false;
    if (updates.completed && !objective.completed) {
      newlyCompleted = true;
    }
    
    // Check for progress updates
    let progressUpdated = false;
    if (updates.progress !== undefined && updates.progress !== objective.progress) {
      progressUpdated = true;
      
      // Check if progress completion
      if (updates.progress >= objective.maxProgress && !objective.completed) {
        updates.completed = true;
        newlyCompleted = true;
      }
    }
    
    // Apply updates
    Object.assign(objective, updates);
    
    // Update UI
    this._updateObjectivesList();
    
    // Update waypoint if objective is completed
    if (newlyCompleted && this.waypoints.has(objectiveId)) {
      this._removeWaypoint(objectiveId);
    }
    
    // Check if mission is completed
    this._checkMissionCompletion();
    
    // Trigger callbacks
    if (newlyCompleted && this.callbacks.onObjectiveCompleted) {
      this.callbacks.onObjectiveCompleted(objective, this.currentMission);
      
      // Show notification
      this._showNotification(`Objective Complete: ${objective.description}`);
    } else if (progressUpdated && this.callbacks.onObjectiveUpdated) {
      this.callbacks.onObjectiveUpdated(objective, this.currentMission);
      
      if (progressUpdated && objective.maxProgress > 1) {
        // Show progress notification for collection objectives
        this._showNotification(`Progress: ${objective.progress}/${objective.maxProgress}`);
      }
    }
    
    return objective;
  }
  
  /**
   * Check if the current mission is completed
   * @private
   */
  _checkMissionCompletion() {
    if (!this.currentMission || this.currentMission.completed) return;
    
    // Check if all required objectives are completed
    const allRequiredCompleted = this.currentMission.objectives
      .filter(obj => !obj.optional)
      .every(obj => obj.completed);
    
    if (allRequiredCompleted) {
      this.currentMission.completed = true;
      
      // Show mission complete UI
      this._showMissionComplete(this.currentMission);
      
      // Trigger callback
      if (this.callbacks.onMissionCompleted) {
        this.callbacks.onMissionCompleted(this.currentMission);
      }
      
      // Remove all waypoints
      this._removeAllWaypoints();
    }
  }
  
  /**
   * Remove a waypoint
   * @param {string} objectiveId - ID of the objective
   * @private
   */
  _removeWaypoint(objectiveId) {
    if (!this.waypoints.has(objectiveId)) return;
    
    const waypoint = this.waypoints.get(objectiveId);
    
    // Remove from scene
    this.scene.remove(waypoint.group);
    
    // Dispose resources
    waypoint.marker.geometry.dispose();
    waypoint.marker.material.dispose();
    
    waypoint.ring.geometry.dispose();
    waypoint.ring.material.dispose();
    
    if (waypoint.line) {
      waypoint.line.geometry.dispose();
      waypoint.line.material.dispose();
    }
    
    if (waypoint.distanceIndicator) {
      waypoint.distanceIndicator.sprite.material.map.dispose();
      waypoint.distanceIndicator.sprite.material.dispose();
    }
    
    // Remove from map
    this.waypoints.delete(objectiveId);
  }
  
  /**
   * Remove all waypoints
   * @private
   */
  _removeAllWaypoints() {
    for (const objectiveId of this.waypoints.keys()) {
      this._removeWaypoint(objectiveId);
    }
  }
  
  /**
   * Show mission complete UI
   * @param {Object} mission - Completed mission
   * @private
   */
  _showMissionComplete(mission) {
    // Get the panel
    const panel = document.getElementById('mission-complete-panel');
    if (!panel) return;
    
    // Update content
    const missionName = panel.querySelector('#mission-complete-name');
    missionName.textContent = mission.title;
    
    // Update rewards
    if (mission.rewards) {
      if (mission.rewards.xp) {
        const xpElement = panel.querySelector('#reward-xp');
        if (xpElement) xpElement.textContent = `+${mission.rewards.xp}`;
      }
      
      if (mission.rewards.credits) {
        const creditsElement = panel.querySelector('#reward-credits');
        if (creditsElement) creditsElement.textContent = `+${mission.rewards.credits}`;
      }
      
      if (mission.rewards.energy) {
        const energyElement = panel.querySelector('#reward-energy');
        if (energyElement) energyElement.textContent = `+${mission.rewards.energy}`;
      }
    }
    
    // Show the panel
    panel.classList.add('show');
    
    // Hide after a delay
    setTimeout(() => {
      panel.classList.remove('show');
    }, 8000);
  }
  
  /**
   * Show notification
   * @param {string} message - Notification message
   * @private
   */
  _showNotification(message) {
    // Check if notification element exists
    let notification = document.querySelector('.objective-notification');
    
    if (!notification) {
      // Create notification element
      notification = document.createElement('div');
      notification.className = 'objective-notification';
      document.body.appendChild(notification);
    }
    
    // Update message
    notification.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after delay
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  /**
   * Get the current mission
   * @returns {Object} Current mission data
   */
  getCurrentMission() {
    return this.currentMission;
  }
  
  /**
   * Get a mission by ID
   * @param {string} missionId - Mission ID
   * @returns {Object} Mission data
   */
  getMission(missionId) {
    return this.missions.get(missionId);
  }
  
  /**
   * Get an objective from the current mission
   * @param {string} objectiveId - Objective ID
   * @returns {Object} Objective data
   */
  getObjective(objectiveId) {
    if (!this.currentMission) return null;
    
    return this.currentMission.objectives.find(obj => obj.id === objectiveId);
  }
  
  /**
   * Set a callback function
   * @param {string} callbackName - Name of callback
   * @param {Function} callback - Callback function
   */
  setCallback(callbackName, callback) {
    if (this.callbacks.hasOwnProperty(callbackName)) {
      this.callbacks[callbackName] = callback;
    }
  }
  
  /**
   * Update the mission system
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position
   */
  update(deltaTime, playerPosition) {
    // Update waypoints
    this._updateWaypoints(deltaTime);
    
    // Update waypoint distances
    if (playerPosition) {
      this._updateWaypointDistances(playerPosition);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove all waypoints
    this._removeAllWaypoints();
    
    // Remove UI elements
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    const completePanel = document.getElementById('mission-complete-panel');
    if (completePanel && completePanel.parentNode) {
      completePanel.parentNode.removeChild(completePanel);
    }
    
    const notification = document.querySelector('.objective-notification');
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    
    // Clear data
    this.missions.clear();
    this.currentMission = null;
  }
}

export default MissionObjectiveSystem;