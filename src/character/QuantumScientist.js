import * as THREE from 'three';
import { EventEmitter } from 'events';

import CharacterController from './CharacterController';
import CameraSystem from './CameraSystem';
import CharacterStats from './CharacterStats';
import ParticleEffects from './ParticleEffects';
import QuantumAbilities from './QuantumAbilities';
import InteractionSystem from './InteractionSystem';
import CharacterAppearance from './CharacterAppearance';

class QuantumScientist extends EventEmitter {
  constructor(scene, domElement) {
    super();
    
    // Core components
    this.scene = scene;
    this.domElement = domElement;
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    
    // Character components (initialized in load method)
    this.controller = null;
    this.cameraSystem = null;
    this.stats = null;
    this.particles = null;
    this.abilities = null;
    this.interaction = null;
    this.appearance = null;
    
    // Character model
    this.model = null;
    
    // State tracking
    this.isLoaded = false;
    this.isActive = false;
    
    // Initialize window resize handler
    this._initializeResizeHandler();
  }
  
  // Handle window resize
  _initializeResizeHandler() {
    const onResize = () => {
      if (this.camera) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', onResize);
  }
  
  // Load the character
  async load() {
    // Initialize character stats
    this.stats = new CharacterStats();
    
    // Create character model container
    this.model = new THREE.Group();
    this.scene.add(this.model);
    
    // Initialize character appearance
    this.appearance = new CharacterAppearance(this.scene, this.model);
    
    // Load character model
    const characterModel = await this.appearance.loadModel();
    this.model.add(characterModel);
    
    // Initialize character controller
    this.controller = new CharacterController(this.camera, this.scene, this.domElement);
    
    // Initialize camera system
    this.cameraSystem = new CameraSystem(this.camera, this.scene, this.domElement, this.controller);
    
    // Initialize particle effects
    this.particles = new ParticleEffects(this.scene);
    
    // Initialize quantum abilities
    this.abilities = new QuantumAbilities(
      this.controller, this.scene, this.stats, this.particles
    );
    
    // Initialize interaction system
    this.interaction = new InteractionSystem(
      this.controller, this.camera, this.scene, this.domElement
    );
    
    // Connect event listeners
    this._connectEventListeners();
    
    // Set loaded flag
    this.isLoaded = true;
    
    // Emit loaded event
    this.emit('loaded');
    
    return this;
  }
  
  // Connect event listeners between systems
  _connectEventListeners() {
    // Controller events
    this.controller.onCharacterMove((velocity) => {
      // Update particle trail based on movement
      if (this.particles) {
        // Only create trail when moving at a significant speed
        const speed = Math.sqrt(
          velocity.x * velocity.x +
          velocity.y * velocity.y +
          velocity.z * velocity.z
        );
        
        if (speed > 0.5) {
          // Movement trail is updated automatically in the particle system
        }
      }
      
      // Emit move event
      this.emit('move', {
        position: this.controller.position.clone(),
        velocity: velocity.clone(),
        speed: velocity.length()
      });
    });
    
    this.controller.onCharacterJump(() => {
      // Emit jump event
      this.emit('jump', {
        position: this.controller.position.clone()
      });
    });
    
    this.controller.onCharacterLand(() => {
      // Emit land event
      this.emit('land', {
        position: this.controller.position.clone()
      });
    });
    
    // Stats events
    this.stats.on('damageTaken', (data) => {
      // Apply visual feedback
      if (this.cameraSystem) {
        this.cameraSystem.addCameraShake(data.amount / 20, 0.3);
      }
      
      // Emit damage event
      this.emit('damage', data);
    });
    
    this.stats.on('died', () => {
      // Handle character death
      this.emit('death');
    });
    
    this.stats.on('healed', (data) => {
      // Emit heal event
      this.emit('heal', data);
    });
    
    this.stats.on('energySpent', (data) => {
      // Emit energy spent event
      this.emit('energySpent', data);
    });
    
    // Ability events
    this.abilities.on('abilityActivated', (abilityName) => {
      // Emit ability activated event
      this.emit('abilityActivated', {
        ability: abilityName,
        info: this.abilities.getAbilityInfo(abilityName)
      });
    });
    
    this.abilities.on('phaseShiftActivated', (duration) => {
      // Apply visual effects
      this.appearance.setGlowIntensity(1.8);
      
      // Emit phase shift event
      this.emit('phaseShiftActivated', {
        duration,
        position: this.controller.position.clone()
      });
    });
    
    this.abilities.on('phaseShiftDeactivated', () => {
      // Restore normal appearance
      this.appearance.setGlowIntensity(this.appearance.currentOptions.glowIntensity);
      
      // Emit event
      this.emit('phaseShiftDeactivated');
    });
    
    this.abilities.on('timeDilationActivated', (duration) => {
      // Apply visual effects
      
      // Emit event
      this.emit('timeDilationActivated', {
        duration,
        position: this.controller.position.clone(),
        radius: this.abilities.abilities.timeDilation.radius
      });
    });
    
    // Interaction events
    this.interaction.on('objectInteraction', (data) => {
      // Emit interaction event
      this.emit('interaction', data);
    });
    
    this.interaction.on('objectPickedUp', (data) => {
      // Emit pickup event
      this.emit('pickup', data);
    });
    
    this.interaction.on('objectDropped', (data) => {
      // Emit drop event
      this.emit('drop', data);
    });
    
    this.interaction.on('highlightStart', (data) => {
      // Emit highlight event
      this.emit('highlight', data);
    });
    
    this.interaction.on('highlightEnd', () => {
      // Emit unhighlight event
      this.emit('unhighlight');
    });
  }
  
  // Activate the character (start all systems)
  activate() {
    if (!this.isLoaded) {
      console.warn('Cannot activate character - not yet loaded');
      return false;
    }
    
    if (this.isActive) return true;
    
    this.isActive = true;
    
    // Emit activated event
    this.emit('activated');
    
    return true;
  }
  
  // Deactivate the character (pause all systems)
  deactivate() {
    if (!this.isActive) return true;
    
    this.isActive = false;
    
    // Emit deactivated event
    this.emit('deactivated');
    
    return true;
  }
  
  // Update the character and all systems
  update(deltaTime, obstacles = []) {
    if (!this.isLoaded || !this.isActive) return;
    
    // Update character stats
    if (this.stats) {
      this.stats.update();
    }
    
    // Update character controller
    if (this.controller) {
      this.controller.update(deltaTime, obstacles);
    }
    
    // Update camera system
    if (this.cameraSystem) {
      this.cameraSystem.update(deltaTime);
      
      // Sync camera mode with controller
      if (this.cameraSystem.viewMode !== this.controller.viewMode) {
        this.controller.viewMode = this.cameraSystem.viewMode;
      }
    }
    
    // Update particles
    if (this.particles) {
      this.particles.update(
        deltaTime, 
        this.controller.position, 
        this.controller.velocity
      );
    }
    
    // Update abilities
    if (this.abilities) {
      this.abilities.update(deltaTime);
    }
    
    // Update interaction system
    if (this.interaction) {
      this.interaction.update(deltaTime);
    }
    
    // Update appearance
    if (this.appearance) {
      this.appearance.update(deltaTime);
      
      // Update model position to match controller
      if (this.model) {
        this.model.position.copy(this.controller.position);
        
        // Only update rotation in third person mode
        if (this.controller.viewMode === 'thirdPerson') {
          this.model.rotation.y = Math.atan2(
            this.controller.velocity.x,
            this.controller.velocity.z
          );
        }
      }
    }
  }
  
  // Set the character position
  setPosition(position) {
    if (!this.isLoaded) return false;
    
    this.controller.position.copy(position);
    
    if (this.model) {
      this.model.position.copy(position);
    }
    
    return true;
  }
  
  // Set the character rotation
  setRotation(rotation) {
    if (!this.isLoaded) return false;
    
    this.controller.rotation.copy(rotation);
    
    if (this.model && this.controller.viewMode === 'thirdPerson') {
      this.model.rotation.y = rotation.y;
    }
    
    return true;
  }
  
  // Look at a target position
  lookAt(target) {
    if (!this.isLoaded) return false;
    
    // Get direction to target
    const direction = new THREE.Vector3().subVectors(target, this.controller.position).normalize();
    
    // Set rotation based on direction
    this.controller.rotation.y = Math.atan2(direction.x, direction.z);
    
    if (this.model && this.controller.viewMode === 'thirdPerson') {
      this.model.rotation.y = this.controller.rotation.y;
    }
    
    return true;
  }
  
  // Toggle between first and third person modes
  toggleViewMode() {
    if (!this.isLoaded) return false;
    
    this.cameraSystem.toggleViewMode();
    
    return true;
  }
  
  // Use a quantum ability
  useAbility(abilityName, ...args) {
    if (!this.isLoaded || !this.abilities) return false;
    
    switch (abilityName) {
      case 'phaseShift':
        return this.abilities.activatePhaseShift();
        
      case 'timeDilation':
        return this.abilities.activateTimeDilation();
        
      case 'molecularReconstruction':
        return this.abilities.useMolecularReconstruction(...args);
        
      case 'quantumTeleportation':
        return this.abilities.activateQuantumTeleportation(...args);
        
      default:
        console.warn(`Unknown ability: ${abilityName}`);
        return false;
    }
  }
  
  // Check if an ability is ready to use
  isAbilityReady(abilityName) {
    if (!this.isLoaded || !this.abilities) return false;
    
    return this.abilities.isAbilityReady(abilityName);
  }
  
  // Get all abilities info
  getAbilitiesInfo() {
    if (!this.isLoaded || !this.abilities) return {};
    
    return this.abilities.getAllAbilitiesInfo();
  }
  
  // Interact with an object in view
  interact() {
    if (!this.isLoaded || !this.interaction) return false;
    
    // The interaction is handled internally through key/mouse handlers
    // This method is just a programmatic way to trigger an interaction
    this.interaction._handleInteraction();
    
    return true;
  }
  
  // Grab an object in view
  grab() {
    if (!this.isLoaded || !this.interaction) return false;
    
    // The grabbing is handled internally through key/mouse handlers
    // This method is just a programmatic way to trigger a grab
    this.interaction._handleGrab();
    
    return true;
  }
  
  // Drop a held object
  drop() {
    if (!this.isLoaded || !this.interaction) return false;
    
    return this.interaction.dropObject();
  }
  
  // Throw a held object
  throw(force = 10) {
    if (!this.isLoaded || !this.interaction) return false;
    
    return this.interaction.throwObject(force);
  }
  
  // Register an object as interactable
  registerInteractable(object, options = {}) {
    if (!this.isLoaded || !this.interaction) return false;
    
    return this.interaction.registerInteractable(object, options);
  }
  
  // Change character appearance
  setAppearance(options = {}) {
    if (!this.isLoaded || !this.appearance) return false;
    
    // Apply each option if provided
    if (options.colorScheme !== undefined) {
      this.appearance.applyColorScheme(options.colorScheme);
    }
    
    if (options.helmet !== undefined) {
      this.appearance.setHelmet(options.helmet);
    }
    
    if (options.backpack !== undefined) {
      this.appearance.setBackpack(options.backpack);
    }
    
    if (options.shoulderPads !== undefined) {
      this.appearance.toggleShoulderPads(options.shoulderPads);
    }
    
    if (options.kneePads !== undefined) {
      this.appearance.toggleKneePads(options.kneePads);
    }
    
    if (options.glowIntensity !== undefined) {
      this.appearance.setGlowIntensity(options.glowIntensity);
    }
    
    if (options.pulseSpeed !== undefined) {
      this.appearance.setPulseSpeed(options.pulseSpeed);
    }
    
    return true;
  }
  
  // Get all appearance customization options
  getAppearanceOptions() {
    if (!this.isLoaded || !this.appearance) return {};
    
    return this.appearance.getCustomizationOptions();
  }
  
  // Take damage
  takeDamage(amount, damageType = 'physical') {
    if (!this.isLoaded || !this.stats) return false;
    
    return this.stats.takeDamage(amount, damageType);
  }
  
  // Heal the character
  heal(amount, healType = 'standard') {
    if (!this.isLoaded || !this.stats) return false;
    
    return this.stats.heal(amount, healType);
  }
  
  // Add experience points
  addExperience(amount) {
    if (!this.isLoaded || !this.stats) return false;
    
    return this.stats.addExperience(amount);
  }
  
  // Spend a skill point
  spendSkillPoint(statName, amount = 1) {
    if (!this.isLoaded || !this.stats) return false;
    
    return this.stats.spendSkillPoint(statName, amount);
  }
  
  // Get all character stats
  getStats() {
    if (!this.isLoaded || !this.stats) return {};
    
    return {
      health: this.stats.getStatValue('health'),
      maxHealth: this.stats.getStatValue('maxHealth'),
      quantumEnergy: this.stats.getStatValue('quantumEnergy'),
      maxQuantumEnergy: this.stats.getStatValue('maxQuantumEnergy'),
      scientificKnowledge: this.stats.getStatValue('scientificKnowledge'),
      maxScientificKnowledge: this.stats.getStatValue('maxScientificKnowledge'),
      level: this.stats.stats.level,
      experience: this.stats.stats.experience,
      experienceForNextLevel: this.stats.getExperienceForNextLevel(),
      skillPoints: this.stats.stats.availableSkillPoints,
    };
  }
  
  // Get the character's current position
  getPosition() {
    if (!this.isLoaded) return new THREE.Vector3();
    
    return this.controller.position.clone();
  }
  
  // Get the camera's current view direction
  getViewDirection() {
    if (!this.isLoaded || !this.cameraSystem) return new THREE.Vector3(0, 0, -1);
    
    return this.cameraSystem.getViewDirection();
  }
  
  // Dispose of all resources
  dispose() {
    // Deactivate first
    this.deactivate();
    
    // Dispose each system
    if (this.controller) this.controller.dispose();
    if (this.cameraSystem) this.cameraSystem.dispose();
    if (this.particles) this.particles.dispose();
    if (this.abilities) this.abilities.dispose();
    if (this.interaction) this.interaction.dispose();
    if (this.appearance) this.appearance.dispose();
    
    // Remove model from scene
    if (this.model && this.model.parent) {
      this.model.parent.remove(this.model);
    }
    
    // Reset flags
    this.isLoaded = false;
    this.isActive = false;
    
    // Remove event listeners
    this.removeAllListeners();
    
    // Emit disposed event
    this.emit('disposed');
  }
}

export default QuantumScientist;