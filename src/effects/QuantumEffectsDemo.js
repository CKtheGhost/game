import * as THREE from 'three';
import { Vector3, Color } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ParticleEffects from '../character/ParticleEffects';
import CosmicQuantumEffects from './CosmicQuantumEffects';
import QuantumTunnelingPassages from './QuantumTunnelingPassages';
import QuantumInteractiveElements from '../gameplay/QuantumInteractiveElements';
import QuantumEffectsIntegration from './QuantumEffectsIntegration';

/**
 * QuantumEffectsDemo - Demonstrates the quantum effects systems
 * 
 * Features:
 * 1. Sample scene with all quantum effects
 * 2. Player character with movement controls
 * 3. Interactive quantum elements
 * 4. UI for displaying quantum status
 */
class QuantumEffectsDemo {
  constructor(container) {
    this.container = container;
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = null;
    
    // Effect systems
    this.particleEffects = null;
    this.cosmicEffects = null;
    this.tunnelingPassages = null;
    this.interactiveElements = null;
    this.effectsIntegration = null;
    
    // Player character
    this.playerAvatar = null;
    this.playerPosition = new Vector3(0, 1, 0);
    this.playerVelocity = new Vector3(0, 0, 0);
    this.playerSpeed = 1.0;
    this.playerControls = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      interact: false
    };
    
    // UI elements
    this.uiContainer = null;
    this.statusUI = {
      radiation: null,
      time: null,
      entanglement: null,
      quantum: null
    };
    
    // Initialize the demo
    this._initialize();
  }
  
  /**
   * Initialize the demo
   * @private
   */
  _initialize() {
    // Create Three.js components
    this._setupScene();
    this._setupCamera();
    this._setupRenderer();
    this._setupLights();
    this._setupControls();
    
    // Create player avatar
    this._createPlayerAvatar();
    
    // Create effect systems
    this._setupEffectSystems();
    
    // Create demo environment
    this._setupEnvironment();
    
    // Create UI
    this._setupUI();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Start animation loop
    this.clock = new THREE.Clock();
    this.animate();
  }
  
  /**
   * Set up the Three.js scene
   * @private
   */
  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);
    
    // Add a grid for reference
    const grid = new THREE.GridHelper(50, 50, 0x555555, 0x222222);
    this.scene.add(grid);
  }
  
  /**
   * Set up the camera
   * @private
   */
  _setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Set up the renderer
   * @private
   */
  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  /**
   * Set up lights
   * @private
   */
  _setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    
    // Adjust shadow camera
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.far = 40;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(directionalLight);
    
    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x3366ff, 1, 20);
    pointLight1.position.set(-10, 5, -10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff66ff, 1, 20);
    pointLight2.position.set(10, 5, -10);
    this.scene.add(pointLight2);
  }
  
  /**
   * Set up camera controls
   * @private
   */
  _setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
  }
  
  /**
   * Create player avatar
   * @private
   */
  _createPlayerAvatar() {
    // Create a simple character
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      emissive: 0x003366,
      metalness: 0.5,
      roughness: 0.2
    });
    
    this.playerAvatar = new THREE.Mesh(geometry, material);
    this.playerAvatar.position.copy(this.playerPosition);
    this.playerAvatar.castShadow = true;
    this.playerAvatar.receiveShadow = true;
    
    this.scene.add(this.playerAvatar);
  }
  
  /**
   * Set up effect systems
   * @private
   */
  _setupEffectSystems() {
    // Create particle effects
    this.particleEffects = new ParticleEffects(this.scene);
    
    // Create cosmic quantum effects
    this.cosmicEffects = new CosmicQuantumEffects(this.scene, this.camera, this.renderer);
    
    // Create quantum tunneling passages
    this.tunnelingPassages = new QuantumTunnelingPassages(this.scene, this.camera, this.renderer);
    
    // Create quantum interactive elements
    this.interactiveElements = new QuantumInteractiveElements(this.scene);
    
    // Create effects integration system
    this.effectsIntegration = new QuantumEffectsIntegration(this.scene, this.camera, this.renderer);
    
    // Connect systems
    this.effectsIntegration.setCharacterParticleEffects(this.particleEffects);
    this.effectsIntegration.setInteractiveElements(this.interactiveElements);
    this.tunnelingPassages.setCosmicEffects(this.cosmicEffects);
    
    // Set up effect callbacks
    this._setupEffectCallbacks();
  }
  
  /**
   * Set up callbacks for effect systems
   * @private
   */
  _setupEffectCallbacks() {
    // Handle radiation exposure
    this.effectsIntegration.setCallback('onRadiationExposureChange', (data) => {
      console.log(`Radiation exposure: ${Math.round(data.level * 100)}%`);
      this._updateStatusUI('radiation', data.level);
      
      // Visual effect on player avatar
      const glowIntensity = data.level * 0.5;
      this.playerAvatar.material.emissive.setRGB(0.4 + glowIntensity, 0.2, 0.4 + glowIntensity);
    });
    
    // Handle time dilation effects
    this.effectsIntegration.setCallback('onTimeDilation', (data) => {
      console.log(`Time dilation field created at ${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}, ${data.position.z.toFixed(2)}`);
      
      // Create demo time effect - slow down player movement when near a time dilation field
      this.playerSpeed = Math.max(0.2, 1.0 - data.intensity * 0.5);
      
      // Update UI
      this._updateStatusUI('time', this.playerSpeed);
    });
    
    // Handle entanglement state changes
    this.effectsIntegration.setCallback('onEntanglementStateChange', (data) => {
      console.log(`Entanglement state changed: ${data.isEntangled ? 'Entangled' : 'Not entangled'}`);
      this._updateStatusUI('entanglement', data.isEntangled ? 1.0 : 0.0);
    });
    
    // Handle quantum tunnel travel
    this.effectsIntegration.setCallback('onQuantumTunnelTravel', (data) => {
      console.log(`Quantum tunnel travel started from (${data.startPosition.x.toFixed(2)}, ${data.startPosition.y.toFixed(2)}, ${data.startPosition.z.toFixed(2)}) to (${data.endPosition.x.toFixed(2)}, ${data.endPosition.y.toFixed(2)}, ${data.endPosition.z.toFixed(2)})`);
      
      // Add quantum energy during tunnel travel
      this._updateStatusUI('quantum', Math.min(1.0, this.statusUI.quantum.value + 0.2));
    });
    
    // Handle interactions
    this.effectsIntegration.setCallback('onInteractionStart', (data) => {
      console.log(`Interaction started: ${data.type} - ${data.message}`);
      this._showInteractionMessage(data.message);
    });
    
    this.effectsIntegration.setCallback('onInteractionComplete', (data) => {
      console.log(`Interaction completed: ${data.type}`);
      this._showInteractionMessage('');
    });
  }
  
  /**
   * Set up the demo environment
   * @private
   */
  _setupEnvironment() {
    // Create a floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Create time dilation zones
    this.effectsIntegration.createTimeDilationZone(
      new Vector3(-10, 1, -10),
      3,
      {
        color: new Color(0x00ffaa),
        intensity: 0.8
      }
    );
    
    // Create radiation zones
    this.effectsIntegration.createRadiationZone(
      new Vector3(10, 1, -10),
      2.5,
      {
        color: new Color(0xff00aa),
        intensity: 0.6,
        damageRate: 0.05
      }
    );
    
    // Create quantum tunnels
    this.effectsIntegration.createQuantumTunnel(
      new Vector3(-10, 1, 10),
      new Vector3(10, 1, 10),
      {
        radius: 1.5,
        color1: new Color(0x8800ff),
        color2: new Color(0x00ffff)
      }
    );
    
    // Create entanglement bridges
    this.effectsIntegration.createEntanglementBridge(
      new Vector3(-5, 1, 0),
      new Vector3(5, 1, 0),
      {
        width: 0.5,
        color1: new Color(0xff00ff),
        color2: new Color(0x00ffff)
      }
    );
    
    // Create interactive quantum elements
    this._createInteractiveElements();
  }
  
  /**
   * Create interactive quantum elements
   * @private
   */
  _createInteractiveElements() {
    // Create quantum computers
    this.interactiveElements.createQuantumComputer(
      new Vector3(-5, 0, 5),
      {
        interactionDistance: 2.0,
        hackingDifficulty: 0.5,
        color: new Color(0x00aaff)
      }
    );
    
    // Create particle accelerator
    this.interactiveElements.createParticleAccelerator(
      new Vector3(5, 0, -5),
      {
        interactionDistance: 3.0,
        activationSteps: 3,
        color: new Color(0xff8800)
      }
    );
    
    // Create entanglement nodes
    const node1 = this.interactiveElements.createEntanglementNode(
      new Vector3(-8, 0, -5),
      { color: new Color(0xff00aa) }
    );
    
    const node2 = this.interactiveElements.createEntanglementNode(
      new Vector3(-8, 0, 5),
      { color: new Color(0xff00aa) }
    );
    
    // Create time crystals
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 12;
      
      this.interactiveElements.createTimeCrystal(
        new Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ),
        {
          color: new Color(0x00ffaa),
          collectible: true
        }
      );
    }
    
    // Create dark matter container
    this.interactiveElements.createDarkMatterContainer(
      new Vector3(8, 0, 0),
      {
        interactionDistance: 2.0,
        analysisTime: 5.0,
        color: new Color(0x440066)
      }
    );
  }
  
  /**
   * Set up UI elements
   * @private
   */
  _setupUI() {
    // Create UI container
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '10px';
    this.uiContainer.style.left = '10px';
    this.uiContainer.style.color = 'white';
    this.uiContainer.style.fontFamily = 'monospace';
    this.uiContainer.style.fontSize = '14px';
    this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.uiContainer.style.padding = '10px';
    this.uiContainer.style.borderRadius = '5px';
    this.uiContainer.style.width = '250px';
    
    // Create status displays
    this._createStatusDisplay('radiation', 'Radiation Exposure', '#ff00aa');
    this._createStatusDisplay('time', 'Time Flow', '#00ffaa');
    this._createStatusDisplay('entanglement', 'Entanglement', '#ff66ff');
    this._createStatusDisplay('quantum', 'Quantum Energy', '#00aaff');
    
    // Create interaction message
    this.interactionMessage = document.createElement('div');
    this.interactionMessage.style.position = 'absolute';
    this.interactionMessage.style.bottom = '20px';
    this.interactionMessage.style.left = '50%';
    this.interactionMessage.style.transform = 'translateX(-50%)';
    this.interactionMessage.style.color = 'white';
    this.interactionMessage.style.fontFamily = 'monospace';
    this.interactionMessage.style.fontSize = '16px';
    this.interactionMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.interactionMessage.style.padding = '10px';
    this.interactionMessage.style.borderRadius = '5px';
    this.interactionMessage.style.display = 'none';
    
    // Add controls description
    const controlsInfo = document.createElement('div');
    controlsInfo.style.marginTop = '20px';
    controlsInfo.style.borderTop = '1px solid rgba(255, 255, 255, 0.3)';
    controlsInfo.style.paddingTop = '10px';
    controlsInfo.innerHTML = `
      <div><b>Controls:</b></div>
      <div>WASD - Move Player</div>
      <div>E - Interact</div>
      <div>OrbitControls - Camera</div>
    `;
    
    this.uiContainer.appendChild(controlsInfo);
    
    // Add UI to document
    document.body.appendChild(this.uiContainer);
    document.body.appendChild(this.interactionMessage);
  }
  
  /**
   * Create a status display bar
   * @param {string} id - ID of the status
   * @param {string} label - Label to display
   * @param {string} color - Color of the status bar
   * @private
   */
  _createStatusDisplay(id, label, color) {
    const container = document.createElement('div');
    container.style.marginBottom = '10px';
    
    const labelElem = document.createElement('div');
    labelElem.textContent = label;
    labelElem.style.marginBottom = '3px';
    
    const barContainer = document.createElement('div');
    barContainer.style.width = '100%';
    barContainer.style.height = '15px';
    barContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    barContainer.style.borderRadius = '3px';
    barContainer.style.overflow = 'hidden';
    
    const barFill = document.createElement('div');
    barFill.style.width = '0%';
    barFill.style.height = '100%';
    barFill.style.backgroundColor = color;
    barFill.style.transition = 'width 0.3s ease';
    
    barContainer.appendChild(barFill);
    container.appendChild(labelElem);
    container.appendChild(barContainer);
    this.uiContainer.appendChild(container);
    
    // Store reference
    this.statusUI[id] = {
      container: container,
      label: labelElem,
      bar: barFill,
      value: 0
    };
  }
  
  /**
   * Update status UI
   * @param {string} id - ID of the status to update
   * @param {number} value - New value (0-1)
   * @private
   */
  _updateStatusUI(id, value) {
    if (!this.statusUI[id]) return;
    
    const statusItem = this.statusUI[id];
    statusItem.value = value;
    statusItem.bar.style.width = `${value * 100}%`;
    
    // Update label with percentage
    if (id === 'radiation' || id === 'quantum') {
      statusItem.label.textContent = `${id === 'radiation' ? 'Radiation Exposure' : 'Quantum Energy'}: ${Math.round(value * 100)}%`;
    } else if (id === 'time') {
      statusItem.label.textContent = `Time Flow: ${(value * 100).toFixed(0)}%`;
    } else if (id === 'entanglement') {
      statusItem.label.textContent = `Entanglement: ${value > 0.5 ? 'Active' : 'Inactive'}`;
    }
  }
  
  /**
   * Show interaction message
   * @param {string} message - Message to display
   * @private
   */
  _showInteractionMessage(message) {
    if (message && message.trim() !== '') {
      this.interactionMessage.textContent = message;
      this.interactionMessage.style.display = 'block';
    } else {
      this.interactionMessage.style.display = 'none';
    }
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.playerControls.forward = true;
          break;
        case 's':
          this.playerControls.backward = true;
          break;
        case 'a':
          this.playerControls.left = true;
          break;
        case 'd':
          this.playerControls.right = true;
          break;
        case 'e':
          this.playerControls.interact = true;
          break;
      }
    });
    
    window.addEventListener('keyup', (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.playerControls.forward = false;
          break;
        case 's':
          this.playerControls.backward = false;
          break;
        case 'a':
          this.playerControls.left = false;
          break;
        case 'd':
          this.playerControls.right = false;
          break;
        case 'e':
          this.playerControls.interact = false;
          this._handleInteract();
          break;
      }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      
      if (this.cosmicEffects) {
        this.cosmicEffects.onWindowResize();
      }
    });
  }
  
  /**
   * Handle player interaction
   * @private
   */
  _handleInteract() {
    // First check for interactive elements
    if (this.interactiveElements) {
      const interacted = this.interactiveElements.interact(this.playerPosition);
      
      if (interacted) {
        return;
      }
    }
    
    // If no interactive element interaction, try tunnels or portals
    if (this.effectsIntegration) {
      this.effectsIntegration.activateNearestTunnelOrPortal(this.playerPosition);
    }
  }
  
  /**
   * Update player position based on controls
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updatePlayer(deltaTime) {
    // Calculate movement direction from camera
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Calculate camera right vector
    const cameraRight = new THREE.Vector3(
      cameraDirection.z,
      0,
      -cameraDirection.x
    );
    
    // Reset velocity
    this.playerVelocity.set(0, 0, 0);
    
    // Apply movement based on controls
    if (this.playerControls.forward) {
      this.playerVelocity.add(cameraDirection);
    }
    if (this.playerControls.backward) {
      this.playerVelocity.sub(cameraDirection);
    }
    if (this.playerControls.left) {
      this.playerVelocity.sub(cameraRight);
    }
    if (this.playerControls.right) {
      this.playerVelocity.add(cameraRight);
    }
    
    // Normalize and apply speed
    if (this.playerVelocity.lengthSq() > 0) {
      this.playerVelocity.normalize().multiplyScalar(this.playerSpeed * 5 * deltaTime);
      
      // Update position
      this.playerPosition.add(this.playerVelocity);
      
      // Apply any position constraints here
      // For example, keep player on the floor
      this.playerPosition.y = 1;
      
      // Update avatar position
      this.playerAvatar.position.copy(this.playerPosition);
      
      // Make camera follow player (with smooth damping)
      const cameraTargetPosition = this.playerPosition.clone();
      cameraTargetPosition.y = 10; // Camera height
      
      // Calculate camera look position
      const lookAhead = this.playerPosition.clone().add(
        cameraDirection.clone().multiplyScalar(10)
      );
      
      // Update orbit controls target
      this.controls.target.lerp(this.playerPosition, 0.1);
      
      // Trigger player movement effects
      if (this.particleEffects) {
        // Update movement trail
        this.particleEffects.update(
          deltaTime,
          this.playerPosition,
          this.playerVelocity
        );
      }
    }
  }
  
  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // Update controls
    this.controls.update();
    
    // Update player
    this._updatePlayer(deltaTime);
    
    // Update effects
    if (this.effectsIntegration) {
      this.effectsIntegration.update(deltaTime, this.playerPosition);
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Dispose of Three.js resources
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    // Dispose of renderer
    this.renderer.dispose();
    
    // Dispose of effect systems
    if (this.effectsIntegration) {
      this.effectsIntegration.dispose();
    }
    
    if (this.particleEffects) {
      this.particleEffects.dispose();
    }
    
    // Remove DOM elements
    if (this.uiContainer && this.uiContainer.parentNode) {
      this.uiContainer.parentNode.removeChild(this.uiContainer);
    }
    
    if (this.interactionMessage && this.interactionMessage.parentNode) {
      this.interactionMessage.parentNode.removeChild(this.interactionMessage);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this._onWindowResize);
  }
}

export default QuantumEffectsDemo;