import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

import QuantumScientist from '../character/QuantumScientist';

class CharacterDemo {
  constructor(container) {
    // DOM container
    this.container = container || document.body;
    
    // Three.js components
    this.scene = null;
    this.renderer = null;
    this.stats = null;
    this.clock = null;
    this.gui = null;
    
    // Character instance
    this.character = null;
    
    // Environment objects
    this.environment = {
      ground: null,
      obstacles: [],
      interactables: [],
      lights: [],
    };
    
    // UI elements
    this.uiElements = {
      stats: null,
      controls: null,
      debugInfo: null,
    };
    
    // Initialize the demo
    this.initialize();
  }
  
  // Initialize the demo
  async initialize() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111133);
    this.scene.fog = new THREE.FogExp2(0x111133, 0.05);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Create clock for timing
    this.clock = new THREE.Clock();
    
    // Create performance stats
    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);
    
    // Create GUI
    this.gui = new GUI();
    this.gui.close();
    
    // Create environment
    this._createEnvironment();
    
    // Create character
    await this._createCharacter();
    
    // Create UI elements
    this._createUI();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Start animation loop
    this.animate();
  }
  
  // Create environment objects
  _createEnvironment() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333366,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.environment.ground = ground;
    
    // Create lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);
    this.environment.lights.push(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);
    this.environment.lights.push(directionalLight);
    
    // Add some point lights for atmosphere
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff88];
    for (let i = 0; i < 4; i++) {
      const pointLight = new THREE.PointLight(colors[i], 2, 8, 2);
      const x = Math.cos(i * Math.PI / 2) * 15;
      const z = Math.sin(i * Math.PI / 2) * 15;
      pointLight.position.set(x, 1, z);
      this.scene.add(pointLight);
      this.environment.lights.push(pointLight);
    }
    
    // Create some obstacles
    this._createObstacles();
    
    // Create some interactable objects
    this._createInteractables();
  }
  
  // Create obstacles in the environment
  _createObstacles() {
    // Create some boxes as obstacles
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x3366aa,
      roughness: 0.7,
      metalness: 0.3,
    });
    
    // Create boxes in a circle
    const radius = 15;
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const box = new THREE.Mesh(boxGeometry, boxMaterial.clone());
      box.position.set(x, 1, z);
      box.castShadow = true;
      box.receiveShadow = true;
      
      this.scene.add(box);
      this.environment.obstacles.push(box);
    }
    
    // Create a central structure
    const centerGeometry = new THREE.CylinderGeometry(3, 3, 5, 16);
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0x4477cc,
      roughness: 0.5,
      metalness: 0.5,
      emissive: 0x0033aa,
      emissiveIntensity: 0.2,
    });
    
    const centerStructure = new THREE.Mesh(centerGeometry, centerMaterial);
    centerStructure.position.set(0, 2.5, 0);
    centerStructure.castShadow = true;
    centerStructure.receiveShadow = true;
    
    this.scene.add(centerStructure);
    this.environment.obstacles.push(centerStructure);
    
    // Create some walls
    const wallGeometry = new THREE.BoxGeometry(20, 4, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x6699cc,
      roughness: 0.6,
      metalness: 0.4,
    });
    
    // Create four walls in a square
    const wallPositions = [
      [0, 2, -25], // North
      [0, 2, 25],  // South
      [-25, 2, 0], // West
      [25, 2, 0],  // East
    ];
    
    const wallRotations = [
      [0, 0, 0],       // North
      [0, Math.PI, 0], // South
      [0, Math.PI / 2, 0], // West
      [0, -Math.PI / 2, 0], // East
    ];
    
    for (let i = 0; i < 4; i++) {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
      wall.position.set(...wallPositions[i]);
      wall.rotation.set(...wallRotations[i]);
      wall.castShadow = true;
      wall.receiveShadow = true;
      
      this.scene.add(wall);
      this.environment.obstacles.push(wall);
    }
  }
  
  // Create interactable objects
  _createInteractables() {
    // Create interactable objects with different types
    
    // 1. Pickup objects
    const pickupGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const pickupMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00aaaa,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
    });
    
    // Create several pickup objects
    const pickupPositions = [
      [5, 0.3, 5],
      [-5, 0.3, 5],
      [5, 0.3, -5],
      [-5, 0.3, -5],
    ];
    
    for (let i = 0; i < pickupPositions.length; i++) {
      const pickup = new THREE.Mesh(pickupGeometry, pickupMaterial.clone());
      pickup.position.set(...pickupPositions[i]);
      pickup.castShadow = true;
      pickup.receiveShadow = true;
      
      this.scene.add(pickup);
      this.environment.interactables.push(pickup);
    }
    
    // 2. Data console
    const consoleGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const consoleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xaa00aa,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
    });
    
    const dataConsole = new THREE.Mesh(consoleGeometry, consoleMaterial);
    dataConsole.position.set(8, 0.75, 8);
    dataConsole.castShadow = true;
    dataConsole.receiveShadow = true;
    
    this.scene.add(dataConsole);
    this.environment.interactables.push(dataConsole);
    
    // 3. Energy crystal
    const crystalGeometry = new THREE.TetrahedronGeometry(0.5, 2);
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xaaaa00,
      emissiveIntensity: 1.0,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.position.set(-8, 0.5, -8);
    crystal.castShadow = true;
    
    // Add animation to the crystal
    crystal.userData.animateRotation = true;
    crystal.userData.rotationSpeed = 1.0;
    
    this.scene.add(crystal);
    this.environment.interactables.push(crystal);
    
    // 4. Control panel (toggleable)
    const panelGeometry = new THREE.BoxGeometry(1.5, 0.3, 1);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00aa66,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.4,
    });
    
    const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    controlPanel.position.set(-8, 1, 8);
    controlPanel.castShadow = true;
    controlPanel.receiveShadow = true;
    
    // Add buttons to the panel
    const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    const buttonMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xaa0000 }),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00 }),
      new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000aa }),
    ];
    
    const buttonPositions = [
      [-0.4, 0.2, 0],
      [0, 0.2, 0],
      [0.4, 0.2, 0],
    ];
    
    for (let i = 0; i < 3; i++) {
      const button = new THREE.Mesh(buttonGeometry, buttonMaterials[i]);
      button.position.set(...buttonPositions[i]);
      controlPanel.add(button);
    }
    
    this.scene.add(controlPanel);
    this.environment.interactables.push(controlPanel);
  }
  
  // Create the character
  async _createCharacter() {
    // Create quantum scientist character
    this.character = new QuantumScientist(this.scene, this.renderer.domElement);
    
    // Load and activate the character
    await this.character.load();
    this.character.activate();
    
    // Register interactable objects
    this._registerInteractables();
    
    // Set up character event listeners
    this._setupCharacterEvents();
    
    // Create character GUI controls
    this._createCharacterGUI();
  }
  
  // Register interactable objects with the character
  _registerInteractables() {
    // Skip if character isn't loaded yet
    if (!this.character || !this.character.isLoaded) return;
    
    // Register pickups
    for (let i = 0; i < 4; i++) {
      const pickup = this.environment.interactables[i];
      
      this.character.registerInteractable(pickup, {
        type: 'pickup',
        canPickup: true,
        message: 'Pick up Quantum Orb',
        holdOffset: new THREE.Vector3(0, 0, -0.5),
        weight: 1.0,
      });
    }
    
    // Register data console
    const dataConsole = this.environment.interactables[4];
    
    this.character.registerInteractable(dataConsole, {
      type: 'data',
      message: 'Access Data Console',
      data: {
        title: 'Quantum Research Terminal',
        entries: [
          'Entry #1: Phase shift experiments successful. Dimensional barrier reached.',
          'Entry #2: Time dilation field stable for 5.3 seconds at 35% quantum energy.',
          'Entry #3: WARNING: Molecular reconstruction requires further calibration.',
          'Entry #4: Quantum teleportation accuracy increased to 97.8% with new algorithm.',
        ],
      },
      onInteract: (object, character) => {
        console.log('Data console accessed');
        // Show data entries in the UI
        this._showDataEntries(object.userData.interactionOptions.data);
      },
    });
    
    // Register energy crystal
    const crystal = this.environment.interactables[5];
    
    this.character.registerInteractable(crystal, {
      type: 'use',
      message: 'Absorb Quantum Energy',
      onInteract: (object, character) => {
        console.log('Energy crystal absorbed');
        
        // Restore quantum energy
        this.character.stats.modifyStat('quantumEnergy', 50);
        
        // Emit particles
        this.character.particles.triggerQuantumTeleportation(
          object.position,
          character.position
        );
        
        // Remove the crystal
        object.visible = false;
        setTimeout(() => {
          object.visible = true;
        }, 30000); // Respawn after 30 seconds
      },
    });
    
    // Register control panel
    const controlPanel = this.environment.interactables[6];
    
    this.character.registerInteractable(controlPanel, {
      type: 'use',
      message: 'Toggle Control Panel',
      isActive: false,
      onInteract: (object, character) => {
        const isActive = object.userData.interactionOptions.isActive;
        console.log(`Control panel ${isActive ? 'activated' : 'deactivated'}`);
        
        // Change emissive intensity based on state
        object.traverse(child => {
          if (child.material && child.material.emissive) {
            child.material.emissiveIntensity = isActive ? 1.0 : 0.2;
          }
        });
        
        // Trigger an effect when activated
        if (isActive) {
          // Start platforms moving or doors opening, etc.
          this._triggerEnvironmentEvent(isActive);
        }
      },
    });
  }
  
  // Create UI elements
  _createUI() {
    // Create stats display
    const statsElement = document.createElement('div');
    statsElement.id = 'character-stats';
    statsElement.style.position = 'absolute';
    statsElement.style.top = '10px';
    statsElement.style.left = '10px';
    statsElement.style.color = 'white';
    statsElement.style.fontFamily = 'monospace';
    statsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    statsElement.style.padding = '10px';
    statsElement.style.borderRadius = '5px';
    statsElement.style.userSelect = 'none';
    statsElement.style.zIndex = '1000';
    statsElement.innerHTML = 'Character Stats';
    
    this.container.appendChild(statsElement);
    this.uiElements.stats = statsElement;
    
    // Create controls info
    const controlsElement = document.createElement('div');
    controlsElement.id = 'controls-info';
    controlsElement.style.position = 'absolute';
    controlsElement.style.bottom = '10px';
    controlsElement.style.left = '10px';
    controlsElement.style.color = 'white';
    controlsElement.style.fontFamily = 'monospace';
    controlsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    controlsElement.style.padding = '10px';
    controlsElement.style.borderRadius = '5px';
    controlsElement.style.userSelect = 'none';
    controlsElement.style.zIndex = '1000';
    controlsElement.innerHTML = `
      <h3>Controls</h3>
      <p>WASD: Move</p>
      <p>Space: Jump</p>
      <p>Shift: Sprint</p>
      <p>E: Interact</p>
      <p>F: Grab/Drop</p>
      <p>Q: Phase Shift</p>
      <p>R: Time Dilation</p>
      <p>T: Molecular Reconstruction</p>
      <p>Y: Quantum Teleportation</p>
      <p>V: Toggle View</p>
    `;
    
    this.container.appendChild(controlsElement);
    this.uiElements.controls = controlsElement;
    
    // Create debug info
    const debugElement = document.createElement('div');
    debugElement.id = 'debug-info';
    debugElement.style.position = 'absolute';
    debugElement.style.top = '10px';
    debugElement.style.right = '10px';
    debugElement.style.color = 'white';
    debugElement.style.fontFamily = 'monospace';
    debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    debugElement.style.padding = '10px';
    debugElement.style.borderRadius = '5px';
    debugElement.style.userSelect = 'none';
    debugElement.style.zIndex = '1000';
    debugElement.style.maxWidth = '300px';
    debugElement.style.display = 'none';
    debugElement.innerHTML = 'Debug Info';
    
    this.container.appendChild(debugElement);
    this.uiElements.debugInfo = debugElement;
    
    // Update stats for the first time
    this._updateUI();
  }
  
  // Set up event listeners
  _setupEventListeners() {
    // Window resize handler
    window.addEventListener('resize', () => {
      // Update renderer
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Update camera aspect ratio
      if (this.character && this.character.camera) {
        this.character.camera.aspect = window.innerWidth / window.innerHeight;
        this.character.camera.updateProjectionMatrix();
      }
    });
    
    // Toggle debug info with backtick key
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Backquote') {
        this.uiElements.debugInfo.style.display = 
          this.uiElements.debugInfo.style.display === 'none' ? 'block' : 'none';
      }
    });
    
    // Ability key handlers
    window.addEventListener('keydown', (event) => {
      if (!this.character || !this.character.isLoaded) return;
      
      switch (event.code) {
        case 'KeyQ':
          this.character.useAbility('phaseShift');
          break;
        case 'KeyR':
          this.character.useAbility('timeDilation');
          break;
        case 'KeyT':
          this.character.useAbility('molecularReconstruction');
          break;
        case 'KeyY':
          // Use the ability at the position the camera is looking at
          const direction = this.character.getViewDirection();
          const position = this.character.getPosition().clone();
          const targetPosition = position.clone().add(
            direction.multiplyScalar(10)
          );
          this.character.useAbility('quantumTeleportation', targetPosition);
          break;
      }
    });
  }
  
  // Set up character event listeners
  _setupCharacterEvents() {
    if (!this.character) return;
    
    // Interaction events
    this.character.on('interaction', (data) => {
      console.log('Interaction:', data);
    });
    
    this.character.on('pickup', (data) => {
      console.log('Picked up:', data);
    });
    
    this.character.on('drop', (data) => {
      console.log('Dropped:', data);
    });
    
    this.character.on('highlight', (data) => {
      // Update UI to show interaction message
      if (data && data.message) {
        // Show interaction prompt in UI
        this._showInteractionPrompt(data.message);
      }
    });
    
    this.character.on('unhighlight', () => {
      // Hide interaction prompt
      this._hideInteractionPrompt();
    });
    
    // Ability events
    this.character.on('abilityActivated', (data) => {
      console.log('Ability activated:', data);
    });
    
    this.character.on('phaseShiftActivated', (data) => {
      console.log('Phase Shift activated:', data);
    });
    
    this.character.on('timeDilationActivated', (data) => {
      console.log('Time Dilation activated:', data);
    });
    
    // Stats events
    this.character.on('damage', (data) => {
      console.log('Damage taken:', data);
    });
    
    this.character.on('heal', (data) => {
      console.log('Healed:', data);
    });
    
    this.character.on('energySpent', (data) => {
      console.log('Energy spent:', data);
    });
  }
  
  // Create GUI controls for the character
  _createCharacterGUI() {
    if (!this.character || !this.gui) return;
    
    // Get appearance options
    const appearanceOptions = this.character.getAppearanceOptions();
    
    // Create appearance folder
    const appearanceFolder = this.gui.addFolder('Appearance');
    
    // Color scheme control
    const colorSchemes = {};
    appearanceOptions.colorSchemes.forEach(scheme => {
      colorSchemes[scheme] = scheme;
    });
    
    appearanceFolder.add({ colorScheme: appearanceOptions.current.colorScheme }, 'colorScheme', colorSchemes)
      .name('Color Scheme')
      .onChange(value => {
        this.character.setAppearance({ colorScheme: value });
      });
    
    // Helmet control
    const helmetTypes = {};
    appearanceOptions.helmetTypes.forEach(type => {
      helmetTypes[type] = type;
    });
    
    appearanceFolder.add({ helmet: appearanceOptions.current.helmet }, 'helmet', helmetTypes)
      .name('Helmet')
      .onChange(value => {
        this.character.setAppearance({ helmet: value });
      });
    
    // Backpack control
    const backpackTypes = {};
    appearanceOptions.backpackTypes.forEach(type => {
      backpackTypes[type] = type;
    });
    
    appearanceFolder.add({ backpack: appearanceOptions.current.backpack }, 'backpack', backpackTypes)
      .name('Backpack')
      .onChange(value => {
        this.character.setAppearance({ backpack: value });
      });
    
    // Glow controls
    appearanceFolder.add({ glowIntensity: appearanceOptions.current.glowIntensity }, 'glowIntensity', 0, 2)
      .name('Glow Intensity')
      .onChange(value => {
        this.character.setAppearance({ glowIntensity: value });
      });
    
    appearanceFolder.add({ pulseSpeed: appearanceOptions.current.pulseSpeed }, 'pulseSpeed', 0, 3)
      .name('Pulse Speed')
      .onChange(value => {
        this.character.setAppearance({ pulseSpeed: value });
      });
    
    // Create abilities folder
    const abilitiesFolder = this.gui.addFolder('Abilities');
    
    // Add buttons for each ability
    abilitiesFolder.add({ phaseShift: () => this.character.useAbility('phaseShift') }, 'phaseShift')
      .name('Phase Shift');
    
    abilitiesFolder.add({ timeDilation: () => this.character.useAbility('timeDilation') }, 'timeDilation')
      .name('Time Dilation');
    
    abilitiesFolder.add({ molecularReconstruction: () => this.character.useAbility('molecularReconstruction') }, 'molecularReconstruction')
      .name('Molecular Reconstruction');
    
    abilitiesFolder.add({ 
      quantumTeleportation: () => {
        const direction = this.character.getViewDirection();
        const position = this.character.getPosition().clone();
        const targetPosition = position.clone().add(
          direction.multiplyScalar(10)
        );
        this.character.useAbility('quantumTeleportation', targetPosition);
      } 
    }, 'quantumTeleportation')
      .name('Quantum Teleportation');
    
    // Create camera folder
    const cameraFolder = this.gui.addFolder('Camera');
    
    // Toggle view mode
    cameraFolder.add({ toggleView: () => this.character.toggleViewMode() }, 'toggleView')
      .name('Toggle View');
  }
  
  // Update UI elements
  _updateUI() {
    if (!this.character || !this.uiElements.stats) return;
    
    // Get character stats
    const stats = this.character.getStats();
    
    // Update stats display
    this.uiElements.stats.innerHTML = `
      <h3>Character Stats</h3>
      <p>Health: ${stats.health.toFixed(0)}/${stats.maxHealth.toFixed(0)}</p>
      <p>Quantum Energy: ${stats.quantumEnergy.toFixed(0)}/${stats.maxQuantumEnergy.toFixed(0)}</p>
      <p>Scientific Knowledge: ${stats.scientificKnowledge.toFixed(0)}/${stats.maxScientificKnowledge.toFixed(0)}</p>
      <p>Level: ${stats.level}</p>
      <p>Experience: ${stats.experience.toFixed(0)}</p>
      <p>Next Level: ${stats.experienceForNextLevel.toFixed(0)}</p>
      <p>Skill Points: ${stats.skillPoints}</p>
    `;
    
    // Update debug info
    if (this.uiElements.debugInfo) {
      const pos = this.character.getPosition();
      const abilities = this.character.getAbilitiesInfo();
      
      this.uiElements.debugInfo.innerHTML = `
        <h3>Debug Info</h3>
        <p>Position: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}</p>
        <p>FPS: ${Math.round(1 / this.clock.getDelta())}</p>
        <h4>Abilities:</h4>
        <p>Phase Shift: ${abilities.phaseShift.cooldownPercent.toFixed(0)}% cooldown</p>
        <p>Time Dilation: ${abilities.timeDilation.cooldownPercent.toFixed(0)}% cooldown</p>
        <p>Molecular Reconstruction: ${abilities.molecularReconstruction.cooldownPercent.toFixed(0)}% cooldown</p>
        <p>Quantum Teleportation: ${abilities.quantumTeleportation.cooldownPercent.toFixed(0)}% cooldown</p>
        <p>Active Abilities: ${Object.values(abilities).filter(a => a.active).map(a => a.name).join(', ') || 'None'}</p>
      `;
    }
  }
  
  // Show interaction prompt
  _showInteractionPrompt(message) {
    // Could create a temporary element or update existing UI
    console.log('Interaction prompt:', message);
  }
  
  // Hide interaction prompt
  _hideInteractionPrompt() {
    // Hide the interaction prompt
    console.log('Hiding interaction prompt');
  }
  
  // Show data entries in the UI
  _showDataEntries(data) {
    // Create or update a modal dialog
    console.log('Data entries:', data);
    
    // Create a modal dialog to display the data
    let modal = document.getElementById('data-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'data-modal';
      modal.style.position = 'absolute';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'rgba(0, 0, 50, 0.9)';
      modal.style.color = 'cyan';
      modal.style.padding = '20px';
      modal.style.borderRadius = '10px';
      modal.style.border = '2px solid cyan';
      modal.style.minWidth = '400px';
      modal.style.maxWidth = '600px';
      modal.style.maxHeight = '80vh';
      modal.style.overflowY = 'auto';
      modal.style.fontFamily = 'monospace';
      modal.style.zIndex = '2000';
      modal.style.boxShadow = '0 0 20px cyan';
      
      this.container.appendChild(modal);
    }
    
    // Populate the modal
    let content = `<h2>${data.title}</h2>`;
    
    if (data.entries && data.entries.length) {
      content += '<ul style="list-style-type: none; padding: 0;">';
      
      for (const entry of data.entries) {
        content += `<li style="margin-bottom: 10px;">${entry}</li>`;
      }
      
      content += '</ul>';
    }
    
    content += '<div style="text-align: center; margin-top: 20px;">';
    content += '<button id="close-modal" style="background-color: cyan; color: black; border: none; padding: 8px 16px; cursor: pointer; border-radius: 5px;">Close</button>';
    content += '</div>';
    
    modal.innerHTML = content;
    modal.style.display = 'block';
    
    // Add close button handler
    document.getElementById('close-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Allow closing with Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.style.display = 'none';
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
  }
  
  // Trigger environment event (from interacting with control panel)
  _triggerEnvironmentEvent(activated) {
    // Do something interesting in the environment
    console.log('Environment event triggered, activated:', activated);
    
    // For example, animate some objects
    const animatedObjects = this.environment.obstacles.slice(0, 4); // First 4 obstacles
    
    if (activated) {
      // Start animations
      for (const obj of animatedObjects) {
        obj.userData.animatingUp = true;
        obj.userData.animationProgress = 0;
      }
    } else {
      // Stop animations
      for (const obj of animatedObjects) {
        obj.userData.animatingUp = false;
      }
    }
  }
  
  // Animation loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Get delta time
    const deltaTime = Math.min(0.1, this.clock.getDelta());
    
    // Update physics and animations
    this._updatePhysics(deltaTime);
    
    // Update character
    if (this.character && this.character.isLoaded) {
      this.character.update(deltaTime, this.environment.obstacles);
    }
    
    // Update UI
    this._updateUI();
    
    // Render scene
    this.renderer.render(this.scene, this.character?.camera || this.camera);
    
    // Update stats
    this.stats.update();
  }
  
  // Update physics and animations
  _updatePhysics(deltaTime) {
    // Update interactive objects
    for (const obj of this.environment.interactables) {
      // Handle rotation animations
      if (obj.userData.animateRotation) {
        obj.rotation.y += deltaTime * (obj.userData.rotationSpeed || 1.0);
        obj.rotation.x += deltaTime * (obj.userData.rotationSpeed || 1.0) * 0.5;
      }
    }
    
    // Update obstacle animations
    for (const obj of this.environment.obstacles) {
      if (obj.userData.animatingUp !== undefined) {
        if (obj.userData.animatingUp) {
          // Animate up
          obj.userData.animationProgress = Math.min(1, (obj.userData.animationProgress || 0) + deltaTime * 0.5);
          obj.position.y = 1 + Math.sin(obj.userData.animationProgress * Math.PI) * 3;
        } else {
          // Animate down
          obj.userData.animationProgress = Math.max(0, (obj.userData.animationProgress || 0) - deltaTime * 0.5);
          obj.position.y = 1 + Math.sin(obj.userData.animationProgress * Math.PI) * 3;
        }
      }
    }
    
    // Animate point lights
    for (let i = 0; i < this.environment.lights.length; i++) {
      const light = this.environment.lights[i];
      
      if (light.type === 'PointLight') {
        // Animate intensity
        light.intensity = 1 + Math.sin(Date.now() * 0.001 * (i + 1) * 0.5) * 0.5;
      }
    }
  }
  
  // Clean up resources
  dispose() {
    // Dispose character
    if (this.character) {
      this.character.dispose();
    }
    
    // Dispose GUI
    if (this.gui) {
      this.gui.destroy();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this._onResize);
    
    // Remove UI elements
    for (const element of Object.values(this.uiElements)) {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
    
    // Remove renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export default CharacterDemo;