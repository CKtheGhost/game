import * as THREE from 'three';
import { EventEmitter } from 'events';

class QuantumAbilities extends EventEmitter {
  constructor(character, scene, characterStats, particleEffects) {
    super();
    
    // Core components
    this.character = character;
    this.scene = scene;
    this.stats = characterStats;
    this.particles = particleEffects;
    
    // Ability settings
    this.abilities = {
      phaseShift: {
        name: 'Phase Shift',
        description: 'Shift into another dimension, allowing you to pass through solid matter for a limited time.',
        energyCost: 25,
        cooldown: 10, // seconds
        duration: 3.0, // seconds
        remainingDuration: 0,
        active: false,
        unlocked: true,
        level: 1,
        maxLevel: 5,
        upgradeStats: {
          energyCost: [-5, -5, -5, -5], // Cost reduction per level
          cooldown: [-1, -1, -2, -2], // Cooldown reduction per level
          duration: [0.5, 0.5, 1.0, 1.0], // Duration increase per level
        },
        effects: {
          // Visual effects to apply when activated
          emissiveColor: new THREE.Color(0x8800ff),
          pulseFrequency: 2.0,
          trailColor: 'phaseShift',
          opacity: 0.7,
        }
      },
      
      timeDilation: {
        name: 'Time Dilation',
        description: 'Create a field around you where time flows differently, slowing down enemies and projectiles.',
        energyCost: 35,
        cooldown: 15,
        duration: 5.0,
        remainingDuration: 0,
        radius: 5.0, // Affect entities within this radius
        timeMultiplier: 0.3, // Time flows at 30% normal speed within the field
        active: false,
        unlocked: true,
        level: 1,
        maxLevel: 5,
        upgradeStats: {
          energyCost: [-5, -5, -5, -5],
          cooldown: [-1, -2, -2, -2],
          duration: [1.0, 1.0, 2.0, 2.0],
          radius: [1.0, 1.0, 2.0, 2.0],
          timeMultiplier: [-0.05, -0.05, -0.1, -0.1], // More slowdown per level
        },
        effects: {
          emissiveColor: new THREE.Color(0x00ff88),
          pulseFrequency: 0.5,
          trailColor: 'timeDilation',
          fieldColor: new THREE.Color(0x88ff00),
        }
      },
      
      molecularReconstruction: {
        name: 'Molecular Reconstruction',
        description: 'Manipulate matter at the quantum level, allowing you to repair objects or create temporary constructs.',
        energyCost: 40,
        cooldown: 20,
        duration: 0, // Instant effect
        range: 10.0, // Maximum range for targeting
        constructDuration: 15.0, // How long created constructs last
        repairAmount: 50, // Amount of "health" restored to objects
        active: false,
        unlocked: true,
        level: 1,
        maxLevel: 5,
        upgradeStats: {
          energyCost: [-5, -5, -10, -10],
          cooldown: [-2, -2, -3, -3],
          range: [2.0, 2.0, 3.0, 3.0],
          repairAmount: [10, 15, 20, 25],
          constructDuration: [5.0, 5.0, 10.0, 10.0],
        },
        effects: {
          emissiveColor: new THREE.Color(0xff5500),
          pulseFrequency: 4.0,
          trailColor: 'molecularReconstruction',
          beamColor: new THREE.Color(0xff8800),
        }
      },
      
      quantumTeleportation: {
        name: 'Quantum Teleportation',
        description: 'Instantaneously teleport to another location through quantum entanglement.',
        energyCost: 50,
        cooldown: 30,
        maxDistance: 30.0, // Maximum teleport distance
        active: false,
        unlocked: true,
        level: 1,
        maxLevel: 5,
        upgradeStats: {
          energyCost: [-5, -10, -10, -15],
          cooldown: [-3, -3, -4, -5],
          maxDistance: [5.0, 10.0, 15.0, 20.0],
        },
        effects: {
          emissiveColor: new THREE.Color(0xffffff),
          pulseFrequency: 8.0, 
          trailColor: 'quantumTeleportation',
          teleportColor: new THREE.Color(0x00ffff),
        }
      }
    };
    
    // Visual effects
    this.visualEffects = {
      timeDilationField: null,
      molecularConstructs: [],
      teleportMarker: null,
    };
    
    // Affected objects
    this.affectedObjects = {
      inTimeDilation: [],
      reconstructed: [],
    };
    
    // Initialize visual effects
    this._initializeVisualEffects();
    
    // Event listeners for the character stats system
    this._setupEventListeners();
  }
  
  // Initialize visual effects
  _initializeVisualEffects() {
    // Create time dilation field
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.abilities.timeDilation.effects.fieldColor,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    this.visualEffects.timeDilationField = new THREE.Mesh(geometry, material);
    this.visualEffects.timeDilationField.visible = false;
    this.scene.add(this.visualEffects.timeDilationField);
    
    // Create teleport marker
    const markerGeometry = new THREE.RingGeometry(0.8, 1.0, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: this.abilities.quantumTeleportation.effects.teleportColor,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    this.visualEffects.teleportMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.visualEffects.teleportMarker.rotation.x = Math.PI * 0.5; // Lay flat
    this.visualEffects.teleportMarker.visible = false;
    this.scene.add(this.visualEffects.teleportMarker);
  }
  
  // Set up event listeners
  _setupEventListeners() {
    // Listen for ability cooldown completed
    this.stats.on('cooldownComplete', (abilityName) => {
      if (this.abilities[abilityName]) {
        this.emit('abilityCooldownComplete', abilityName);
      }
    });
    
    // Listen for ability used
    this.stats.on('abilityUsed', (data) => {
      const abilityName = data.ability;
      if (this.abilities[abilityName]) {
        this.emit('abilityActivated', abilityName);
      }
    });
  }
  
  // Activate Phase Shift ability
  activatePhaseShift() {
    const ability = this.abilities.phaseShift;
    
    // Check if ability can be used
    if (!ability.unlocked || ability.active) {
      return false;
    }
    
    // Try to use the ability through the stats system
    if (!this.stats.useAbility('phaseShift')) {
      return false;
    }
    
    // Activate the ability
    ability.active = true;
    ability.remainingDuration = ability.duration;
    
    // Apply phase shift effects
    // - Make character's collider ignore certain layers
    if (this.character.collider) {
      this.character.collider.layers.disable(1); // Assuming layer 1 is for normal objects
    }
    
    // - Set character material to be semi-transparent
    if (this.character.material) {
      this.character.material.transparent = true;
      this.character.material.opacity = ability.effects.opacity;
      this.character.material.emissive.copy(ability.effects.emissiveColor);
    }
    
    // Trigger particle effect
    if (this.particles) {
      this.particles.triggerPhaseShift(
        this.character.position,
        this.character.direction
      );
    }
    
    // Emit event
    this.emit('phaseShiftActivated', ability.duration);
    
    return true;
  }
  
  // Deactivate Phase Shift ability
  deactivatePhaseShift() {
    const ability = this.abilities.phaseShift;
    
    // If not active, nothing to do
    if (!ability.active) {
      return;
    }
    
    // Deactivate the ability
    ability.active = false;
    ability.remainingDuration = 0;
    
    // Remove phase shift effects
    // - Restore character's collider layers
    if (this.character.collider) {
      this.character.collider.layers.enable(1);
    }
    
    // - Restore character material
    if (this.character.material) {
      this.character.material.opacity = 1.0;
      this.character.material.emissive.set(0, 0, 0);
    }
    
    // Emit event
    this.emit('phaseShiftDeactivated');
  }
  
  // Activate Time Dilation ability
  activateTimeDilation() {
    const ability = this.abilities.timeDilation;
    
    // Check if ability can be used
    if (!ability.unlocked || ability.active) {
      return false;
    }
    
    // Try to use the ability through the stats system
    if (!this.stats.useAbility('timeDilation')) {
      return false;
    }
    
    // Activate the ability
    ability.active = true;
    ability.remainingDuration = ability.duration;
    
    // Show time dilation field
    if (this.visualEffects.timeDilationField) {
      this.visualEffects.timeDilationField.scale.set(
        ability.radius, ability.radius, ability.radius
      );
      this.visualEffects.timeDilationField.position.copy(this.character.position);
      this.visualEffects.timeDilationField.visible = true;
    }
    
    // Trigger particle effect
    if (this.particles) {
      this.particles.triggerTimeDilation(
        this.character.position,
        ability.radius
      );
    }
    
    // Emit event
    this.emit('timeDilationActivated', ability.duration);
    
    return true;
  }
  
  // Deactivate Time Dilation ability
  deactivateTimeDilation() {
    const ability = this.abilities.timeDilation;
    
    // If not active, nothing to do
    if (!ability.active) {
      return;
    }
    
    // Deactivate the ability
    ability.active = false;
    ability.remainingDuration = 0;
    
    // Hide time dilation field
    if (this.visualEffects.timeDilationField) {
      this.visualEffects.timeDilationField.visible = false;
    }
    
    // Reset time for affected objects
    for (const obj of this.affectedObjects.inTimeDilation) {
      if (obj.userData.originalTimeScale !== undefined) {
        obj.userData.timeScale = obj.userData.originalTimeScale;
        delete obj.userData.originalTimeScale;
      }
    }
    
    // Clear affected objects list
    this.affectedObjects.inTimeDilation = [];
    
    // Emit event
    this.emit('timeDilationDeactivated');
  }
  
  // Use Molecular Reconstruction ability
  useMolecularReconstruction(target) {
    const ability = this.abilities.molecularReconstruction;
    
    // Check if ability can be used
    if (!ability.unlocked) {
      return false;
    }
    
    // Check if target is within range
    if (target) {
      const distance = this.character.position.distanceTo(target.position);
      if (distance > ability.range) {
        this.emit('abilityOutOfRange', 'molecularReconstruction');
        return false;
      }
    }
    
    // Try to use the ability through the stats system
    if (!this.stats.useAbility('molecularReconstruction')) {
      return false;
    }
    
    // If there's a target, repair/reconstruct it
    if (target) {
      // Apply reconstruction effect to target
      if (target.userData.health !== undefined) {
        // If the target has a health value, repair it
        const oldHealth = target.userData.health;
        target.userData.health = Math.min(
          target.userData.health + ability.repairAmount,
          target.userData.maxHealth || 100
        );
        
        // Add to reconstructed objects
        this.affectedObjects.reconstructed.push({
          object: target,
          expireTime: Date.now() + ability.constructDuration * 1000
        });
        
        // Emit event
        this.emit('objectRepaired', {
          target,
          oldHealth,
          newHealth: target.userData.health,
          amount: ability.repairAmount
        });
      } else {
        // If no health value, apply a generic reconstruction effect
        // For example, make it glow temporarily
        const originalEmissive = target.material ? 
          target.material.emissive ? target.material.emissive.clone() : new THREE.Color(0, 0, 0) :
          new THREE.Color(0, 0, 0);
        
        if (target.material && target.material.emissive) {
          target.material.emissive.copy(ability.effects.emissiveColor);
          
          // Reset after duration
          setTimeout(() => {
            if (target.material && target.material.emissive) {
              target.material.emissive.copy(originalEmissive);
            }
          }, 2000);
        }
      }
    } else {
      // If no target, create a temporary construct
      this._createTemporaryConstruct(ability);
    }
    
    // Trigger particle effect
    if (this.particles) {
      this.particles.triggerMolecularReconstruction(
        this.character.position,
        target ? target.position : null
      );
    }
    
    // Emit event
    this.emit('molecularReconstructionUsed', target);
    
    return true;
  }
  
  // Create a temporary construct
  _createTemporaryConstruct(ability) {
    // Get position in front of character
    const direction = new THREE.Vector3();
    this.character.getWorldDirection(direction);
    
    const constructPosition = this.character.position.clone().add(
      direction.multiplyScalar(3) // 3 units in front
    );
    
    // Create a simple cube construct
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: ability.effects.emissiveColor,
      transparent: true,
      opacity: 0.8
    });
    
    const construct = new THREE.Mesh(geometry, material);
    construct.position.copy(constructPosition);
    construct.position.y += 0.5; // So bottom is at ground level
    
    // Add to scene
    this.scene.add(construct);
    
    // Add to constructs list
    this.visualEffects.molecularConstructs.push({
      object: construct,
      expireTime: Date.now() + ability.constructDuration * 1000
    });
    
    // Emit event
    this.emit('constructCreated', construct);
    
    return construct;
  }
  
  // Activate Quantum Teleportation ability
  activateQuantumTeleportation(targetPosition) {
    const ability = this.abilities.quantumTeleportation;
    
    // Check if ability can be used
    if (!ability.unlocked || ability.active) {
      return false;
    }
    
    // Check if target position is within range
    if (targetPosition) {
      const distance = this.character.position.distanceTo(targetPosition);
      if (distance > ability.maxDistance) {
        this.emit('abilityOutOfRange', 'quantumTeleportation');
        return false;
      }
    } else {
      // If no target position, use character's forward direction
      const direction = new THREE.Vector3();
      this.character.getWorldDirection(direction);
      
      targetPosition = this.character.position.clone().add(
        direction.multiplyScalar(ability.maxDistance)
      );
      
      // Perform a raycast to find any obstacles
      const raycaster = new THREE.Raycaster(
        this.character.position,
        direction,
        0,
        ability.maxDistance
      );
      
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      
      if (intersects.length > 0) {
        // If hit something, teleport just in front of it
        targetPosition = intersects[0].point.clone().sub(
          direction.multiplyScalar(0.5) // 0.5 units away from obstacle
        );
      }
    }
    
    // Try to use the ability through the stats system
    if (!this.stats.useAbility('quantumTeleportation')) {
      return false;
    }
    
    // Save current position for effects
    const startPosition = this.character.position.clone();
    
    // Teleport the character
    this.character.position.copy(targetPosition);
    
    // Trigger particle effects at both positions
    if (this.particles) {
      this.particles.triggerQuantumTeleportation(
        startPosition,
        targetPosition
      );
    }
    
    // Emit event
    this.emit('quantumTeleportationUsed', {
      startPosition,
      endPosition: targetPosition
    });
    
    return true;
  }
  
  // Show teleport marker at target location
  showTeleportMarker(position) {
    if (!this.visualEffects.teleportMarker) return;
    
    // Update marker position
    this.visualEffects.teleportMarker.position.copy(position);
    this.visualEffects.teleportMarker.position.y += 0.05; // Slightly above ground
    
    // Calculate if teleport is in range
    const distance = this.character.position.distanceTo(position);
    const ability = this.abilities.quantumTeleportation;
    const inRange = distance <= ability.maxDistance;
    
    // Update marker color based on range
    this.visualEffects.teleportMarker.material.color.set(
      inRange ? ability.effects.teleportColor : new THREE.Color(0xff0000)
    );
    
    // Make marker visible
    this.visualEffects.teleportMarker.visible = true;
  }
  
  // Hide teleport marker
  hideTeleportMarker() {
    if (this.visualEffects.teleportMarker) {
      this.visualEffects.teleportMarker.visible = false;
    }
  }
  
  // Update time dilation effects on objects in the field
  _updateTimeDilationField() {
    const ability = this.abilities.timeDilation;
    
    if (!ability.active) return;
    
    // Update field position to follow character
    if (this.visualEffects.timeDilationField) {
      this.visualEffects.timeDilationField.position.copy(this.character.position);
    }
    
    // Find objects within the field radius
    const fieldRadius = ability.radius;
    const objectsInScene = this.scene.children.filter(obj => 
      obj !== this.character && 
      obj !== this.visualEffects.timeDilationField &&
      obj.userData.canBeTimeDilated !== false
    );
    
    // Update affected objects list
    this.affectedObjects.inTimeDilation = [];
    
    for (const obj of objectsInScene) {
      if (obj.position && this.character.position.distanceTo(obj.position) <= fieldRadius) {
        // Object is in the time dilation field
        
        // Store original time scale if not already
        if (obj.userData.originalTimeScale === undefined) {
          obj.userData.originalTimeScale = obj.userData.timeScale || 1.0;
        }
        
        // Apply time dilation
        obj.userData.timeScale = obj.userData.originalTimeScale * ability.timeMultiplier;
        
        // Add to affected objects
        this.affectedObjects.inTimeDilation.push(obj);
      } else if (obj.userData.originalTimeScale !== undefined) {
        // Object was in field but now isn't - restore time
        obj.userData.timeScale = obj.userData.originalTimeScale;
        delete obj.userData.originalTimeScale;
      }
    }
  }
  
  // Update abilities
  update(deltaTime) {
    // Update duration of active abilities
    for (const abilityName in this.abilities) {
      const ability = this.abilities[abilityName];
      
      if (ability.active && ability.remainingDuration > 0) {
        ability.remainingDuration -= deltaTime;
        
        // Check if ability duration has expired
        if (ability.remainingDuration <= 0) {
          ability.remainingDuration = 0;
          
          // Deactivate the ability
          switch (abilityName) {
            case 'phaseShift':
              this.deactivatePhaseShift();
              break;
            case 'timeDilation':
              this.deactivateTimeDilation();
              break;
            // Other abilities don't have durations (they're instant)
          }
        }
      }
    }
    
    // Update time dilation field
    if (this.abilities.timeDilation.active) {
      this._updateTimeDilationField();
    }
    
    // Update molecular constructs
    const now = Date.now();
    for (let i = this.visualEffects.molecularConstructs.length - 1; i >= 0; i--) {
      const construct = this.visualEffects.molecularConstructs[i];
      
      // Check if construct has expired
      if (now >= construct.expireTime) {
        // Fade out construct
        if (construct.object.material) {
          construct.object.material.opacity -= deltaTime * 0.5;
          
          if (construct.object.material.opacity <= 0) {
            // Remove from scene
            this.scene.remove(construct.object);
            
            // Remove from list
            this.visualEffects.molecularConstructs.splice(i, 1);
            
            // Emit event
            this.emit('constructExpired', construct.object);
          }
        } else {
          // No material to fade, just remove
          this.scene.remove(construct.object);
          this.visualEffects.molecularConstructs.splice(i, 1);
        }
      }
    }
    
    // Update reconstructed objects
    for (let i = this.affectedObjects.reconstructed.length - 1; i >= 0; i--) {
      const reconstructed = this.affectedObjects.reconstructed[i];
      
      // Check if reconstruction has expired
      if (now >= reconstructed.expireTime) {
        // Remove from list
        this.affectedObjects.reconstructed.splice(i, 1);
      }
    }
  }
  
  // Upgrade an ability to the next level
  upgradeAbility(abilityName) {
    const ability = this.abilities[abilityName];
    
    if (!ability) {
      console.warn(`Attempted to upgrade unknown ability: ${abilityName}`);
      return false;
    }
    
    // Check if ability is already at max level
    if (ability.level >= ability.maxLevel) {
      this.emit('abilityAlreadyMaxLevel', abilityName);
      return false;
    }
    
    // Check if player has enough skill points
    if (this.stats.stats.availableSkillPoints < 1) {
      this.emit('insufficientSkillPoints', {
        required: 1,
        available: this.stats.stats.availableSkillPoints
      });
      return false;
    }
    
    // Spend skill point
    this.stats.stats.availableSkillPoints -= 1;
    this.stats.stats.spentSkillPoints += 1;
    
    // Get upgrade level (0-based)
    const upgradeLevel = ability.level - 1;
    
    // Apply upgrades
    for (const stat in ability.upgradeStats) {
      if (upgradeLevel < ability.upgradeStats[stat].length) {
        const upgradeValue = ability.upgradeStats[stat][upgradeLevel];
        ability[stat] += upgradeValue;
      }
    }
    
    // Increase ability level
    ability.level += 1;
    
    // Emit event
    this.emit('abilityUpgraded', {
      ability: abilityName,
      newLevel: ability.level,
      maxLevel: ability.maxLevel
    });
    
    return true;
  }
  
  // Get ability information (for UI)
  getAbilityInfo(abilityName) {
    const ability = this.abilities[abilityName];
    
    if (!ability) {
      return null;
    }
    
    // Calculate cooldown percentage
    const cooldownValue = this.stats.getAbilityCooldown(abilityName);
    const cooldownPercent = cooldownValue > 0 ? 
      (cooldownValue / this.abilities[abilityName].cooldown) * 100 : 0;
    
    // Return ability info with current state
    return {
      name: ability.name,
      description: ability.description,
      energyCost: ability.energyCost,
      cooldown: ability.cooldown,
      cooldownRemaining: cooldownValue,
      cooldownPercent: cooldownPercent,
      active: ability.active,
      duration: ability.duration,
      remainingDuration: ability.remainingDuration,
      level: ability.level,
      maxLevel: ability.maxLevel,
      unlocked: ability.unlocked,
      canUse: this.stats.canUseAbility(abilityName) && !ability.active,
    };
  }
  
  // Get all abilities info
  getAllAbilitiesInfo() {
    const info = {};
    
    for (const abilityName in this.abilities) {
      info[abilityName] = this.getAbilityInfo(abilityName);
    }
    
    return info;
  }
  
  // Check if an ability is ready to use
  isAbilityReady(abilityName) {
    return this.stats.canUseAbility(abilityName);
  }
  
  // Dispose of resources
  dispose() {
    // Clean up visual effects
    if (this.visualEffects.timeDilationField) {
      this.scene.remove(this.visualEffects.timeDilationField);
      this.visualEffects.timeDilationField.geometry.dispose();
      this.visualEffects.timeDilationField.material.dispose();
    }
    
    if (this.visualEffects.teleportMarker) {
      this.scene.remove(this.visualEffects.teleportMarker);
      this.visualEffects.teleportMarker.geometry.dispose();
      this.visualEffects.teleportMarker.material.dispose();
    }
    
    // Clean up constructs
    for (const construct of this.visualEffects.molecularConstructs) {
      this.scene.remove(construct.object);
      construct.object.geometry.dispose();
      construct.object.material.dispose();
    }
    
    // Clear lists
    this.visualEffects.molecularConstructs = [];
    this.affectedObjects.inTimeDilation = [];
    this.affectedObjects.reconstructed = [];
  }
}

export default QuantumAbilities;