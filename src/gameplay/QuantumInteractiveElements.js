import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

/**
 * QuantumInteractiveElements - Creates and manages interactive quantum elements
 * 
 * Elements include:
 * - Quantum computers to hack
 * - Particle accelerators to activate
 * - Entanglement nodes to connect
 * - Time crystals to collect
 * - Dark matter containers to analyze
 */
class QuantumInteractiveElements {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Raycaster for interaction detection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Interactive elements collections
    this.interactiveElements = {
      quantumComputers: [],
      particleAccelerators: [],
      entanglementNodes: [],
      timeCrystals: [],
      darkMatterContainers: []
    };
    
    // Tracking active interactions
    this.activeInteractions = {
      hacking: null,
      accelerating: null,
      entangling: [],
      collectedCrystals: [],
      analyzingContainer: null
    };
    
    // Element status
    this.status = {
      hackProgress: 0,
      accelerationLevel: 0,
      entanglementStrength: 0,
      collectedCrystals: 0,
      analyzedContainers: 0
    };
    
    // Outline effect for highlighting interactive elements
    this.outlinePass = null;
    this._setupOutlineEffect();
    
    // Event callbacks
    this.callbacks = {
      onInteractionStart: null,
      onInteractionComplete: null,
      onCollectCrystal: null,
      onEntanglementChange: null,
      onHackProgress: null,
      onAcceleratorActivate: null,
      onDarkMatterAnalyzed: null
    };
    
    // Initialize interactions
    this._setupEventListeners();
  }
  
  /**
   * Set up the outline effect for highlighting interactive elements
   * @private
   */
  _setupOutlineEffect() {
    // Create effect composer
    this.composer = new EffectComposer(this.renderer);
    
    // Create outline pass
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    
    // Configure outline
    this.outlinePass.edgeStrength = 3.0;
    this.outlinePass.edgeGlow = 0.7;
    this.outlinePass.edgeThickness = 1.0;
    this.outlinePass.pulsePeriod = 2;
    this.outlinePass.visibleEdgeColor.set('#00ffff');
    this.outlinePass.hiddenEdgeColor.set('#00aaff');
    
    // Add pass to composer
    this.composer.addPass(this.outlinePass);
  }
  
  /**
   * Set up event listeners for interaction
   * @private
   */
  _setupEventListeners() {
    // Mouse move event for hover detection
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      this._updateHoveredElements();
    });
    
    // Mouse click for element interaction
    window.addEventListener('click', (event) => {
      this._handleElementInteraction();
    });
    
    // Key press for specific interactions
    window.addEventListener('keydown', (event) => {
      this._handleKeyInteraction(event.key);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.outlinePass.resolution.set(window.innerWidth, window.innerHeight);
    });
  }
  
  /**
   * Update hovered elements based on mouse position
   * @private
   */
  _updateHoveredElements() {
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Get all interactive objects
    const allInteractives = [
      ...this.interactiveElements.quantumComputers,
      ...this.interactiveElements.particleAccelerators,
      ...this.interactiveElements.entanglementNodes,
      ...this.interactiveElements.timeCrystals,
      ...this.interactiveElements.darkMatterContainers
    ];
    
    // Check for intersections
    const intersects = this.raycaster.intersectObjects(allInteractives, true);
    
    // Find the top-level interactive object
    let hoveredObject = null;
    if (intersects.length > 0) {
      // Find the first object that is a direct child of an interactive element
      for (const intersect of intersects) {
        let current = intersect.object;
        
        // Traverse up to find the interactive parent
        while (current && !allInteractives.includes(current)) {
          current = current.parent;
        }
        
        if (current && allInteractives.includes(current)) {
          hoveredObject = current;
          break;
        }
      }
    }
    
    // Update outline effect
    if (hoveredObject) {
      this.outlinePass.selectedObjects = [hoveredObject];
    } else {
      this.outlinePass.selectedObjects = [];
    }
  }
  
  /**
   * Handle element interaction on click
   * @private
   */
  _handleElementInteraction() {
    // Only if we have something selected
    if (this.outlinePass.selectedObjects.length === 0) return;
    
    const selectedObject = this.outlinePass.selectedObjects[0];
    
    // Determine element type and trigger appropriate interaction
    if (this.interactiveElements.quantumComputers.includes(selectedObject)) {
      this._startHackingComputer(selectedObject);
    } else if (this.interactiveElements.particleAccelerators.includes(selectedObject)) {
      this._activateParticleAccelerator(selectedObject);
    } else if (this.interactiveElements.entanglementNodes.includes(selectedObject)) {
      this._connectEntanglementNode(selectedObject);
    } else if (this.interactiveElements.timeCrystals.includes(selectedObject)) {
      this._collectTimeCrystal(selectedObject);
    } else if (this.interactiveElements.darkMatterContainers.includes(selectedObject)) {
      this._analyzeDarkMatter(selectedObject);
    }
  }
  
  /**
   * Handle key-based interactions
   * @param {string} key - The key that was pressed
   * @private
   */
  _handleKeyInteraction(key) {
    // Only process if we have an active interaction
    if (key === 'e' || key === 'E') {
      // Advance active interaction (if any)
      if (this.activeInteractions.hacking) {
        this._progressHacking();
      } else if (this.activeInteractions.accelerating) {
        this._increaseAcceleration();
      } else if (this.activeInteractions.analyzingContainer) {
        this._progressAnalysis();
      }
    } else if (key === 'q' || key === 'Q') {
      // Cancel active interaction
      this._cancelCurrentInteraction();
    }
  }
  
  /**
   * Cancel any active interaction
   * @private
   */
  _cancelCurrentInteraction() {
    // Reset all active interactions
    if (this.activeInteractions.hacking) {
      this._resetHackingState(this.activeInteractions.hacking);
      this.activeInteractions.hacking = null;
    }
    
    if (this.activeInteractions.accelerating) {
      this._resetAcceleratorState(this.activeInteractions.accelerating);
      this.activeInteractions.accelerating = null;
    }
    
    if (this.activeInteractions.analyzingContainer) {
      this._resetAnalysisState(this.activeInteractions.analyzingContainer);
      this.activeInteractions.analyzingContainer = null;
    }
  }
  
  /**
   * Start the hacking process on a quantum computer
   * @param {THREE.Object3D} computer - The computer to hack
   * @private
   */
  _startHackingComputer(computer) {
    // Only allow one hacking interaction at a time
    if (this.activeInteractions.hacking) {
      this._resetHackingState(this.activeInteractions.hacking);
    }
    
    // Set up the hacking interaction
    this.activeInteractions.hacking = computer;
    this.status.hackProgress = 0;
    
    // Visual feedback - start hacking animation
    const hackEffect = computer.userData.hackEffect;
    if (hackEffect) {
      hackEffect.visible = true;
    }
    
    // Call event callback
    if (this.callbacks.onInteractionStart) {
      this.callbacks.onInteractionStart({
        type: 'hacking',
        object: computer,
        message: 'Hacking quantum computer... Press E repeatedly to continue.'
      });
    }
  }
  
  /**
   * Progress the hacking of a quantum computer
   * @private
   */
  _progressHacking() {
    if (!this.activeInteractions.hacking) return;
    
    const computer = this.activeInteractions.hacking;
    
    // Increase hack progress
    this.status.hackProgress += 0.1;
    
    // Visual feedback - update hacking progress
    const hologramScreen = computer.userData.screen;
    if (hologramScreen && hologramScreen.material) {
      // Update hologram color based on progress (blue to green)
      hologramScreen.material.color.setRGB(
        0,
        this.status.hackProgress * 0.5 + 0.5,
        1 - this.status.hackProgress * 0.5
      );
    }
    
    // Emit callback event
    if (this.callbacks.onHackProgress) {
      this.callbacks.onHackProgress({
        computer: computer,
        progress: this.status.hackProgress,
        complete: this.status.hackProgress >= 1.0
      });
    }
    
    // Check if hacking is complete
    if (this.status.hackProgress >= 1.0) {
      this._completeHacking(computer);
    }
  }
  
  /**
   * Complete the hacking of a quantum computer
   * @param {THREE.Object3D} computer - The hacked computer
   * @private
   */
  _completeHacking(computer) {
    // Set computer as hacked
    computer.userData.hacked = true;
    
    // Visual feedback for hacked state
    const hackEffect = computer.userData.hackEffect;
    if (hackEffect) {
      hackEffect.visible = false;
    }
    
    const successEffect = computer.userData.successEffect;
    if (successEffect) {
      successEffect.visible = true;
      
      // Create disappearing animation
      const duration = 2.0; // seconds
      let time = 0;
      
      const animateSuccess = () => {
        time += 0.016; // Approximate delta time
        
        if (time >= duration) {
          successEffect.visible = false;
          return;
        }
        
        // Fade out animation
        const opacity = 1 - (time / duration);
        if (successEffect.material) {
          successEffect.material.opacity = opacity;
        }
        
        requestAnimationFrame(animateSuccess);
      };
      
      animateSuccess();
    }
    
    // Reset active interaction
    this.activeInteractions.hacking = null;
    
    // Call completion callback
    if (this.callbacks.onInteractionComplete) {
      this.callbacks.onInteractionComplete({
        type: 'hacking',
        object: computer,
        success: true,
        message: 'Quantum computer successfully hacked.'
      });
    }
  }
  
  /**
   * Reset the hacking state of a computer
   * @param {THREE.Object3D} computer - The computer to reset
   * @private
   */
  _resetHackingState(computer) {
    const hackEffect = computer.userData.hackEffect;
    if (hackEffect) {
      hackEffect.visible = false;
    }
    
    const hologramScreen = computer.userData.screen;
    if (hologramScreen && hologramScreen.material) {
      // Reset to blue
      hologramScreen.material.color.setRGB(0, 0.5, 1);
    }
  }
  
  /**
   * Activate a particle accelerator
   * @param {THREE.Object3D} accelerator - The accelerator to activate
   * @private
   */
  _activateParticleAccelerator(accelerator) {
    // Only allow one accelerator interaction at a time
    if (this.activeInteractions.accelerating) {
      this._resetAcceleratorState(this.activeInteractions.accelerating);
    }
    
    // Set up the acceleration interaction
    this.activeInteractions.accelerating = accelerator;
    this.status.accelerationLevel = 0;
    
    // Visual feedback - start acceleration animation
    const energyRing = accelerator.userData.energyRing;
    if (energyRing) {
      energyRing.visible = true;
      energyRing.scale.set(0.1, 0.1, 0.1);
    }
    
    // Call event callback
    if (this.callbacks.onInteractionStart) {
      this.callbacks.onInteractionStart({
        type: 'acceleration',
        object: accelerator,
        message: 'Activating particle accelerator... Press E repeatedly to increase power.'
      });
    }
  }
  
  /**
   * Increase particle accelerator power
   * @private
   */
  _increaseAcceleration() {
    if (!this.activeInteractions.accelerating) return;
    
    const accelerator = this.activeInteractions.accelerating;
    
    // Increase acceleration level
    this.status.accelerationLevel += 0.2;
    this.status.accelerationLevel = Math.min(this.status.accelerationLevel, 1.0);
    
    // Visual feedback - update energy ring
    const energyRing = accelerator.userData.energyRing;
    if (energyRing) {
      // Scale up the energy ring based on power level
      energyRing.scale.set(
        0.1 + this.status.accelerationLevel * 0.9,
        0.1 + this.status.accelerationLevel * 0.9,
        0.1 + this.status.accelerationLevel * 0.9
      );
      
      // Change color based on power level (blue -> cyan -> green -> yellow -> red)
      let r = 0, g = 0, b = 0;
      
      if (this.status.accelerationLevel < 0.25) {
        // Blue to cyan
        const t = this.status.accelerationLevel / 0.25;
        r = 0;
        g = t;
        b = 1;
      } else if (this.status.accelerationLevel < 0.5) {
        // Cyan to green
        const t = (this.status.accelerationLevel - 0.25) / 0.25;
        r = 0;
        g = 1;
        b = 1 - t;
      } else if (this.status.accelerationLevel < 0.75) {
        // Green to yellow
        const t = (this.status.accelerationLevel - 0.5) / 0.25;
        r = t;
        g = 1;
        b = 0;
      } else {
        // Yellow to red
        const t = (this.status.accelerationLevel - 0.75) / 0.25;
        r = 1;
        g = 1 - t;
        b = 0;
      }
      
      if (energyRing.material) {
        energyRing.material.color.setRGB(r, g, b);
        energyRing.material.emissive.setRGB(r * 0.5, g * 0.5, b * 0.5);
      }
    }
    
    // Emit callback event
    if (this.callbacks.onAcceleratorActivate) {
      this.callbacks.onAcceleratorActivate({
        accelerator: accelerator,
        power: this.status.accelerationLevel,
        complete: this.status.accelerationLevel >= 1.0
      });
    }
    
    // Check if acceleration is at max
    if (this.status.accelerationLevel >= 1.0) {
      this._completeAcceleration(accelerator);
    }
  }
  
  /**
   * Complete the particle accelerator activation
   * @param {THREE.Object3D} accelerator - The activated accelerator
   * @private
   */
  _completeAcceleration(accelerator) {
    // Set accelerator as activated
    accelerator.userData.activated = true;
    
    // Visual feedback - activated state with particle burst
    const particles = accelerator.userData.particles;
    if (particles) {
      particles.visible = true;
      
      // Create particle burst animation
      const duration = 3.0; // seconds
      let time = 0;
      
      const animateParticles = () => {
        time += 0.016; // Approximate delta time
        
        if (time >= duration) {
          // Keep particles visible but stop animation
          return;
        }
        
        // Expand particles outward
        const scale = 1 + time;
        particles.scale.set(scale, scale, scale);
        
        requestAnimationFrame(animateParticles);
      };
      
      animateParticles();
    }
    
    // Reset active interaction
    this.activeInteractions.accelerating = null;
    
    // Call completion callback
    if (this.callbacks.onInteractionComplete) {
      this.callbacks.onInteractionComplete({
        type: 'acceleration',
        object: accelerator,
        success: true,
        message: 'Particle accelerator activated at maximum power.'
      });
    }
  }
  
  /**
   * Reset the accelerator state
   * @param {THREE.Object3D} accelerator - The accelerator to reset
   * @private
   */
  _resetAcceleratorState(accelerator) {
    const energyRing = accelerator.userData.energyRing;
    if (energyRing) {
      energyRing.visible = false;
    }
  }
  
  /**
   * Connect an entanglement node
   * @param {THREE.Object3D} node - The node to connect
   * @private
   */
  _connectEntanglementNode(node) {
    // Check if node is already entangled
    if (node.userData.entangled) {
      // Cannot re-entangle
      if (this.callbacks.onInteractionStart) {
        this.callbacks.onInteractionStart({
          type: 'entanglement',
          object: node,
          message: 'Node already entangled.',
          success: false
        });
      }
      return;
    }
    
    // Add node to entangled set
    this.activeInteractions.entangling.push(node);
    
    // Visual feedback - activate node
    const coreEffect = node.userData.core;
    if (coreEffect) {
      coreEffect.visible = true;
      
      // Pulse animation
      const pulseDuration = 1.0;
      let pulseTime = 0;
      
      const pulseAnimation = () => {
        pulseTime += 0.016;
        
        if (!node.userData.entangled) {
          // Continue pulsing while not fully entangled
          pulseTime %= pulseDuration;
          
          // Pulse scale
          const scale = 0.8 + Math.sin(pulseTime / pulseDuration * Math.PI * 2) * 0.2;
          coreEffect.scale.set(scale, scale, scale);
          
          requestAnimationFrame(pulseAnimation);
        } else {
          // Stabilize at full size when entangled
          coreEffect.scale.set(1, 1, 1);
        }
      };
      
      pulseAnimation();
    }
    
    // Check if we have multiple nodes to entangle
    if (this.activeInteractions.entangling.length >= 2) {
      this._createEntanglement();
    } else {
      // First node selected
      if (this.callbacks.onInteractionStart) {
        this.callbacks.onInteractionStart({
          type: 'entanglement',
          object: node,
          message: 'Entanglement node activated. Select a second node to create entanglement.'
        });
      }
    }
  }
  
  /**
   * Create entanglement between selected nodes
   * @private
   */
  _createEntanglement() {
    // Get the two most recently selected nodes
    const node1 = this.activeInteractions.entangling[this.activeInteractions.entangling.length - 2];
    const node2 = this.activeInteractions.entangling[this.activeInteractions.entangling.length - 1];
    
    // Mark nodes as entangled
    node1.userData.entangled = true;
    node2.userData.entangled = true;
    
    // Create visual connection between nodes
    const position1 = new THREE.Vector3();
    const position2 = new THREE.Vector3();
    
    node1.getWorldPosition(position1);
    node2.getWorldPosition(position2);
    
    // Create beam geometry
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3().subVectors(position2, position1));
    
    const beamGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const beamMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 3,
      opacity: 0.7,
      transparent: true
    });
    
    const beam = new THREE.Line(beamGeometry, beamMaterial);
    beam.position.copy(position1);
    
    // Store reference to connecting beam in both nodes
    node1.userData.entanglementBeams = node1.userData.entanglementBeams || [];
    node2.userData.entanglementBeams = node2.userData.entanglementBeams || [];
    
    node1.userData.entanglementBeams.push(beam);
    node2.userData.entanglementBeams.push(beam);
    
    // Add beam to scene
    this.scene.add(beam);
    
    // Update entanglement strength
    this.status.entanglementStrength = this.activeInteractions.entangling.length * 0.2;
    this.status.entanglementStrength = Math.min(this.status.entanglementStrength, 1.0);
    
    // Call completion callback
    if (this.callbacks.onEntanglementChange) {
      this.callbacks.onEntanglementChange({
        nodes: [node1, node2],
        strength: this.status.entanglementStrength,
        totalNodes: this.activeInteractions.entangling.length
      });
    }
    
    if (this.callbacks.onInteractionComplete) {
      this.callbacks.onInteractionComplete({
        type: 'entanglement',
        objects: [node1, node2],
        success: true,
        message: `Entanglement created. Strength: ${Math.round(this.status.entanglementStrength * 100)}%`
      });
    }
  }
  
  /**
   * Collect a time crystal
   * @param {THREE.Object3D} crystal - The crystal to collect
   * @private
   */
  _collectTimeCrystal(crystal) {
    // Check if already collected
    if (crystal.userData.collected) {
      return;
    }
    
    // Mark as collected
    crystal.userData.collected = true;
    this.activeInteractions.collectedCrystals.push(crystal);
    this.status.collectedCrystals++;
    
    // Visual feedback - crystal collection animation
    const crystalMesh = crystal;
    if (crystalMesh) {
      // Create floating animation
      const startPosition = crystalMesh.position.clone();
      const endPosition = startPosition.clone().add(new THREE.Vector3(0, 2, 0));
      const duration = 1.0; // seconds
      let time = 0;
      
      const collectAnimation = () => {
        time += 0.016; // Approximate delta time
        
        if (time >= duration) {
          // Remove crystal from scene
          this.scene.remove(crystalMesh);
          return;
        }
        
        // Move upward
        const t = time / duration;
        crystalMesh.position.lerpVectors(startPosition, endPosition, t);
        
        // Fade out
        if (crystalMesh.material) {
          crystalMesh.material.opacity = 1 - t;
        }
        
        // Spin
        crystalMesh.rotation.y += 0.1;
        
        requestAnimationFrame(collectAnimation);
      };
      
      collectAnimation();
    }
    
    // Call collection callback
    if (this.callbacks.onCollectCrystal) {
      this.callbacks.onCollectCrystal({
        crystal: crystal,
        count: this.status.collectedCrystals,
        total: this.interactiveElements.timeCrystals.length
      });
    }
    
    if (this.callbacks.onInteractionComplete) {
      this.callbacks.onInteractionComplete({
        type: 'collection',
        object: crystal,
        success: true,
        message: `Time crystal collected (${this.status.collectedCrystals}/${this.interactiveElements.timeCrystals.length})`
      });
    }
  }
  
  /**
   * Analyze a dark matter container
   * @param {THREE.Object3D} container - The container to analyze
   * @private
   */
  _analyzeDarkMatter(container) {
    // Check if already analyzed
    if (container.userData.analyzed) {
      return;
    }
    
    // Only allow one analysis at a time
    if (this.activeInteractions.analyzingContainer) {
      this._resetAnalysisState(this.activeInteractions.analyzingContainer);
    }
    
    // Set up the analysis interaction
    this.activeInteractions.analyzingContainer = container;
    container.userData.analysisProgress = 0;
    
    // Visual feedback - start analysis animation
    const analysisFx = container.userData.analysisFx;
    if (analysisFx) {
      analysisFx.visible = true;
    }
    
    // Call event callback
    if (this.callbacks.onInteractionStart) {
      this.callbacks.onInteractionStart({
        type: 'analysis',
        object: container,
        message: 'Analyzing dark matter... Press E repeatedly to continue analysis.'
      });
    }
  }
  
  /**
   * Progress dark matter analysis
   * @private
   */
  _progressAnalysis() {
    if (!this.activeInteractions.analyzingContainer) return;
    
    const container = this.activeInteractions.analyzingContainer;
    
    // Increase analysis progress
    container.userData.analysisProgress = container.userData.analysisProgress || 0;
    container.userData.analysisProgress += 0.15;
    
    // Visual feedback - update analysis effect
    const darkMatter = container.userData.darkMatter;
    if (darkMatter && darkMatter.material) {
      // Increase visibility/reveal of dark matter as analysis progresses
      darkMatter.material.opacity = container.userData.analysisProgress;
    }
    
    // Emit callback event
    if (this.callbacks.onDarkMatterAnalyzed) {
      this.callbacks.onDarkMatterAnalyzed({
        container: container,
        progress: container.userData.analysisProgress,
        complete: container.userData.analysisProgress >= 1.0
      });
    }
    
    // Check if analysis is complete
    if (container.userData.analysisProgress >= 1.0) {
      this._completeAnalysis(container);
    }
  }
  
  /**
   * Complete dark matter analysis
   * @param {THREE.Object3D} container - The analyzed container
   * @private
   */
  _completeAnalysis(container) {
    // Set container as analyzed
    container.userData.analyzed = true;
    this.status.analyzedContainers++;
    
    // Visual feedback - analysis completion
    const analysisFx = container.userData.analysisFx;
    if (analysisFx) {
      analysisFx.visible = false;
    }
    
    const darkMatter = container.userData.darkMatter;
    if (darkMatter && darkMatter.material) {
      // Fully reveal dark matter
      darkMatter.material.opacity = 1.0;
      
      // Create pulsating glow
      const pulseDuration = 2.0;
      let pulseTime = 0;
      
      const pulseAnimation = () => {
        pulseTime += 0.016;
        
        // Continuous pulse animation
        const pulse = 0.8 + Math.sin(pulseTime / pulseDuration * Math.PI * 2) * 0.2;
        
        darkMatter.scale.set(pulse, pulse, pulse);
        
        requestAnimationFrame(pulseAnimation);
      };
      
      pulseAnimation();
    }
    
    // Reset active interaction
    this.activeInteractions.analyzingContainer = null;
    
    // Call completion callback
    if (this.callbacks.onInteractionComplete) {
      this.callbacks.onInteractionComplete({
        type: 'analysis',
        object: container,
        success: true,
        message: `Dark matter analysis complete. (${this.status.analyzedContainers}/${this.interactiveElements.darkMatterContainers.length})`
      });
    }
  }
  
  /**
   * Reset analysis state
   * @param {THREE.Object3D} container - The container to reset
   * @private
   */
  _resetAnalysisState(container) {
    const analysisFx = container.userData.analysisFx;
    if (analysisFx) {
      analysisFx.visible = false;
    }
  }
  
  /**
   * Create a quantum computer in the scene
   * @param {THREE.Vector3} position - Position for the computer
   * @param {Object} options - Configuration options
   * @returns {THREE.Object3D} - The created quantum computer
   */
  createQuantumComputer(position, options = {}) {
    const defaults = {
      scale: 1.0,
      rotationY: 0,
      color: 0x00aaff,
      name: `quantum_computer_${this.interactiveElements.quantumComputers.length}`
    };
    
    const config = { ...defaults, ...options };
    
    // Create computer mesh group
    const computer = new THREE.Group();
    computer.position.copy(position);
    computer.rotation.y = config.rotationY;
    computer.scale.set(config.scale, config.scale, config.scale);
    computer.name = config.name;
    
    // Base component
    const baseGeometry = new THREE.BoxGeometry(1, 0.2, 1);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      specular: 0x111111,
      shininess: 30
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    computer.add(base);
    
    // Center column
    const columnGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 16);
    const columnMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      specular: 0x222222,
      shininess: 30
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = 0.6;
    computer.add(column);
    
    // Holographic screen
    const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
    const screenMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: new THREE.Color(config.color).multiplyScalar(0.5),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.y = 1.0;
    screen.rotation.x = -Math.PI / 6; // Tilt slightly
    computer.add(screen);
    
    // Quantum processor visual (spinning rings)
    const processorGroup = new THREE.Group();
    processorGroup.position.y = 0.7;
    
    // Create spinning rings
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const ringGeometry = new THREE.TorusGeometry(0.3 - i * 0.05, 0.02, 16, 48);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: config.color,
        emissive: new THREE.Color(config.color).multiplyScalar(0.3),
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // Rotate rings to be perpendicular to each other
      if (i === 0) {
        ring.rotation.x = Math.PI / 2;
      } else if (i === 1) {
        ring.rotation.y = Math.PI / 2;
      }
      
      processorGroup.add(ring);
      
      // Add spinning animation
      const speed = 0.5 - i * 0.1;
      const axis = i === 0 ? 'y' : i === 1 ? 'z' : 'x';
      
      // Store animation data
      ring.userData.animation = {
        speed: speed,
        axis: axis
      };
    }
    
    computer.add(processorGroup);
    
    // Hacking effect (hidden by default)
    const hackEffectGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const hackEffectMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const hackEffect = new THREE.Mesh(hackEffectGeometry, hackEffectMaterial);
    hackEffect.position.y = 0.7;
    hackEffect.visible = false;
    computer.add(hackEffect);
    
    // Success effect (hidden by default)
    const successEffectGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const successEffectMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    const successEffect = new THREE.Mesh(successEffectGeometry, successEffectMaterial);
    successEffect.position.y = 0.7;
    successEffect.visible = false;
    computer.add(successEffect);
    
    // Store references for interactions
    computer.userData = {
      type: 'quantum_computer',
      hacked: false,
      hackProgress: 0,
      processorGroup: processorGroup,
      screen: screen,
      hackEffect: hackEffect,
      successEffect: successEffect
    };
    
    // Add to scene and our list
    this.scene.add(computer);
    this.interactiveElements.quantumComputers.push(computer);
    
    return computer;
  }
  
  /**
   * Create a particle accelerator in the scene
   * @param {THREE.Vector3} position - Position for the accelerator
   * @param {Object} options - Configuration options
   * @returns {THREE.Object3D} - The created particle accelerator
   */
  createParticleAccelerator(position, options = {}) {
    const defaults = {
      scale: 1.0,
      rotationY: 0,
      color: 0x0088ff,
      name: `particle_accelerator_${this.interactiveElements.particleAccelerators.length}`
    };
    
    const config = { ...defaults, ...options };
    
    // Create accelerator mesh group
    const accelerator = new THREE.Group();
    accelerator.position.copy(position);
    accelerator.rotation.y = config.rotationY;
    accelerator.scale.set(config.scale, config.scale, config.scale);
    accelerator.name = config.name;
    
    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(2, 2.2, 0.3, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      specular: 0x111111,
      shininess: 30
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.15;
    accelerator.add(base);
    
    // Accelerator ring
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.2, 16, 48);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      specular: 0x222222,
      shininess: 30
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5;
    accelerator.add(ring);
    
    // Energy conduits along the ring
    const conduitCount = 8;
    for (let i = 0; i < conduitCount; i++) {
      const angle = (i / conduitCount) * Math.PI * 2;
      
      const conduitGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.4);
      const conduitMaterial = new THREE.MeshPhongMaterial({
        color: config.color,
        emissive: new THREE.Color(config.color).multiplyScalar(0.3),
      });
      const conduit = new THREE.Mesh(conduitGeometry, conduitMaterial);
      
      // Position around the ring
      conduit.position.x = Math.cos(angle) * 1.5;
      conduit.position.z = Math.sin(angle) * 1.5;
      conduit.position.y = 0.5;
      
      // Rotate to point to center
      conduit.lookAt(new THREE.Vector3(0, 0.5, 0));
      
      accelerator.add(conduit);
    }
    
    // Central core
    const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: new THREE.Color(config.color).multiplyScalar(0.5),
      transparent: true,
      opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = 0.5;
    accelerator.add(core);
    
    // Energy ring effect (hidden by default)
    const energyRingGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 64);
    const energyRingMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: new THREE.Color(config.color).multiplyScalar(0.8),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const energyRing = new THREE.Mesh(energyRingGeometry, energyRingMaterial);
    energyRing.rotation.x = Math.PI / 2;
    energyRing.position.y = 0.5;
    energyRing.visible = false;
    accelerator.add(energyRing);
    
    // Particle effect (hidden by default)
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere
      const radius = Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 0.5; // Center at core height
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color based on radius (blue to cyan to white)
      const t = radius / 1.5;
      particleColors[i * 3] = t;
      particleColors[i * 3 + 1] = 0.5 + t * 0.5;
      particleColors[i * 3 + 2] = 1.0;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.visible = false;
    accelerator.add(particles);
    
    // Store references for interactions
    accelerator.userData = {
      type: 'particle_accelerator',
      activated: false,
      power: 0,
      core: core,
      energyRing: energyRing,
      particles: particles
    };
    
    // Add to scene and our list
    this.scene.add(accelerator);
    this.interactiveElements.particleAccelerators.push(accelerator);
    
    return accelerator;
  }
  
  /**
   * Create an entanglement node in the scene
   * @param {THREE.Vector3} position - Position for the node
   * @param {Object} options - Configuration options
   * @returns {THREE.Object3D} - The created entanglement node
   */
  createEntanglementNode(position, options = {}) {
    const defaults = {
      scale: 1.0,
      rotationY: 0,
      color: 0x00ffaa,
      name: `entanglement_node_${this.interactiveElements.entanglementNodes.length}`
    };
    
    const config = { ...defaults, ...options };
    
    // Create node mesh group
    const node = new THREE.Group();
    node.position.copy(position);
    node.rotation.y = config.rotationY;
    node.scale.set(config.scale, config.scale, config.scale);
    node.name = config.name;
    
    // Base pedestal
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      specular: 0x111111,
      shininess: 30
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    node.add(base);
    
    // Connection points
    const pointCount = 3;
    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      
      const pointGeometry = new THREE.SphereGeometry(0.07, 16, 16);
      const pointMaterial = new THREE.MeshPhongMaterial({
        color: config.color,
        emissive: new THREE.Color(config.color).multiplyScalar(0.3),
      });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      
      // Position around the base
      point.position.x = Math.cos(angle) * 0.3;
      point.position.z = Math.sin(angle) * 0.3;
      point.position.y = 0.5;
      
      node.add(point);
    }
    
    // Core (inactive by default)
    const coreGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: new THREE.Color(config.color).multiplyScalar(0.7),
      transparent: true,
      opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = 0.7;
    core.visible = false; // Hidden until activated
    node.add(core);
    
    // Store references for interactions
    node.userData = {
      type: 'entanglement_node',
      entangled: false,
      core: core,
      entanglementBeams: []
    };
    
    // Add to scene and our list
    this.scene.add(node);
    this.interactiveElements.entanglementNodes.push(node);
    
    return node;
  }
  
  /**
   * Create a time crystal in the scene
   * @param {THREE.Vector3} position - Position for the crystal
   * @param {Object} options - Configuration options
   * @returns {THREE.Object3D} - The created time crystal
   */
  createTimeCrystal(position, options = {}) {
    const defaults = {
      scale: 1.0,
      rotationY: 0,
      color: 0xaaff00,
      name: `time_crystal_${this.interactiveElements.timeCrystals.length}`
    };
    
    const config = { ...defaults, ...options };
    
    // Create crystal geometry
    // Use octahedron for a crystal-like shape
    const crystalGeometry = new THREE.OctahedronGeometry(0.2, 1);
    const crystalMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: new THREE.Color(config.color).multiplyScalar(0.5),
      transparent: true,
      opacity: 0.8,
      shininess: 90
    });
    
    // Create the crystal mesh
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.position.copy(position);
    crystal.rotation.y = config.rotationY;
    crystal.scale.set(config.scale, config.scale * 1.5, config.scale);
    crystal.name = config.name;
    
    // Add hovering animation
    const startY = position.y;
    const hoverAnimationSpeed = 0.001 * Math.random() + 0.001;
    const rotationSpeed = 0.005 * Math.random() + 0.005;
    
    // Store animation data
    crystal.userData = {
      type: 'time_crystal',
      collected: false,
      startY: startY,
      hoverAnimationSpeed: hoverAnimationSpeed,
      rotationSpeed: rotationSpeed
    };
    
    // Add to scene and our list
    this.scene.add(crystal);
    this.interactiveElements.timeCrystals.push(crystal);
    
    return crystal;
  }
  
  /**
   * Create a dark matter container in the scene
   * @param {THREE.Vector3} position - Position for the container
   * @param {Object} options - Configuration options
   * @returns {THREE.Object3D} - The created dark matter container
   */
  createDarkMatterContainer(position, options = {}) {
    const defaults = {
      scale: 1.0,
      rotationY: 0,
      color: 0x660066,
      name: `dark_matter_container_${this.interactiveElements.darkMatterContainers.length}`
    };
    
    const config = { ...defaults, ...options };
    
    // Create container mesh group
    const container = new THREE.Group();
    container.position.copy(position);
    container.rotation.y = config.rotationY;
    container.scale.set(config.scale, config.scale, config.scale);
    container.name = config.name;
    
    // Container base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      specular: 0x111111,
      shininess: 30
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    container.add(base);
    
    // Glass cylinder
    const glassGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 16, 1, true);
    const glassMaterial = new THREE.MeshPhongMaterial({
      color: 0xaaaaff,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.3
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.y = 0.7;
    container.add(glass);
    
    // Top cap
    const capGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
    const capMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      specular: 0x222222,
      shininess: 30
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.25;
    container.add(cap);
    
    // Dark matter (initially invisible)
    const darkMatterGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const darkMatterMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: new THREE.Color(config.color).multiplyScalar(0.5),
      transparent: true,
      opacity: 0.0 // Start invisible
    });
    const darkMatter = new THREE.Mesh(darkMatterGeometry, darkMatterMaterial);
    darkMatter.position.y = 0.7;
    container.add(darkMatter);
    
    // Analysis effect (hidden by default)
    const analysisFxGeometry = new THREE.CylinderGeometry(0.45, 0.45, 1.0, 32, 8, true);
    const analysisFxMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const analysisFx = new THREE.Mesh(analysisFxGeometry, analysisFxMaterial);
    analysisFx.position.y = 0.7;
    analysisFx.visible = false;
    container.add(analysisFx);
    
    // Store references for interactions
    container.userData = {
      type: 'dark_matter_container',
      analyzed: false,
      analysisProgress: 0,
      darkMatter: darkMatter,
      analysisFx: analysisFx
    };
    
    // Add to scene and our list
    this.scene.add(container);
    this.interactiveElements.darkMatterContainers.push(container);
    
    return container;
  }
  
  /**
   * Set up callback for interaction events
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Function to call when event occurs
   */
  setCallback(eventType, callback) {
    if (typeof callback === 'function') {
      this.callbacks[eventType] = callback;
    }
  }
  
  /**
   * Update interactive elements animations
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    // Animate quantum computers
    this.interactiveElements.quantumComputers.forEach(computer => {
      // Animate processor rings
      const processorGroup = computer.userData.processorGroup;
      if (processorGroup) {
        processorGroup.rotation.y += deltaTime * 0.5;
        
        // Animate each ring
        processorGroup.children.forEach(ring => {
          if (ring.userData.animation) {
            const { speed, axis } = ring.userData.animation;
            ring.rotation[axis] += deltaTime * speed;
          }
        });
      }
    });
    
    // Animate time crystals
    this.interactiveElements.timeCrystals.forEach(crystal => {
      if (!crystal.userData.collected) {
        // Hover animation
        const hoverHeight = Math.sin(Date.now() * crystal.userData.hoverAnimationSpeed) * 0.1;
        crystal.position.y = crystal.userData.startY + hoverHeight;
        
        // Rotation
        crystal.rotation.y += crystal.userData.rotationSpeed;
      }
    });
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners
    window.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('click', this._handleClick);
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('resize', this._handleResize);
    
    // Dispose all interactive elements
    Object.values(this.interactiveElements).flat().forEach(element => {
      if (!element) return;
      
      // Remove from scene
      this.scene.remove(element);
      
      // Recursively dispose all children
      element.traverse(child => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    
    // Clear references
    this.interactiveElements = {
      quantumComputers: [],
      particleAccelerators: [],
      entanglementNodes: [],
      timeCrystals: [],
      darkMatterContainers: []
    };
    
    // Dispose outline effect
    if (this.outlinePass) {
      this.outlinePass.dispose();
    }
    
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
    }
  }
}

export default QuantumInteractiveElements;