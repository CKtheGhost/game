import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import QuantumEffectsIntegration from '../effects/QuantumEffectsIntegration';

/**
 * QuantumEffectsDemo - Demonstrates the usage of cosmic quantum effects
 * 
 * This example shows how to:
 * 1. Set up the various quantum effect systems
 * 2. Create interactive quantum elements
 * 3. Trigger effects through interactions
 * 4. Respond to quantum events in gameplay
 */
class QuantumEffectsDemo {
  constructor() {
    // Create the demo scene
    this._setupScene();
    
    // Create effects integration
    this.effectsIntegration = new QuantumEffectsIntegration(
      this.scene,
      this.camera,
      this.renderer
    );
    
    // Set up effect callbacks
    this._setupEffectCallbacks();
    
    // Add sample interactive elements
    this._createSampleElements();
    
    // Start animation loop
    this._animate();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Create UI for controls and status
    this._createUI();
  }
  
  /**
   * Set up the Three.js scene
   * @private
   */
  _setupScene() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);
    
    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    this.scene.add(mainLight);
    
    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);
    
    // Create player avatar (simple sphere)
    const avatarGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const avatarMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x006666,
      roughness: 0.2,
      metalness: 0.8
    });
    this.playerAvatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    this.playerAvatar.position.set(0, 0, 0);
    this.scene.add(this.playerAvatar);
    
    // Mock character controller for the player
    this.mockCharacterController = {
      getPosition: () => this.playerAvatar.position
    };
    
    // Window resize handler
    window.addEventListener('resize', () => {
      // Update camera aspect ratio
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      
      // Update renderer size
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  /**
   * Set up callbacks for quantum effects
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
    
    // Handle entanglement changes
    this.effectsIntegration.setCallback('onEntanglementChange', (data) => {
      console.log(`Quantum entanglement level: ${Math.round(data.level * 100)}%`);
      this._updateStatusUI('entanglement', data.level);
    });
    
    // Handle time dilation effects
    this.effectsIntegration.setCallback('onTimeDilation', (data) => {
      console.log(`Time dilation field created at ${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}, ${data.position.z.toFixed(2)}`);
      
      // Create demo time effect - slow down player movement when near a time dilation field
      this.playerSpeed = Math.max(0.2, 1.0 - data.intensity * 0.5);
      
      // Update UI
      this._updateStatusUI('time', this.playerSpeed);
    });
    
    // Handle quantum tunneling
    this.effectsIntegration.setCallback('onQuantumTunneling', (data) => {
      console.log(`Quantum tunnel created from (${data.startPosition.x.toFixed(2)}, ${data.startPosition.y.toFixed(2)}, ${data.startPosition.z.toFixed(2)}) to (${data.endPosition.x.toFixed(2)}, ${data.endPosition.y.toFixed(2)}, ${data.endPosition.z.toFixed(2)})`);
      
      // Create UI notification
      this._showNotification('Quantum tunnel discovered! Allows faster-than-light travel between two points.');
    });
    
    // Handle superposition collapse
    this.effectsIntegration.setCallback('onSuperpositionCollapse', (data) => {
      console.log(`Quantum superposition collapsed at ${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}, ${data.position.z.toFixed(2)} with intensity ${data.intensity.toFixed(2)}`);
      
      // Create random gameplay effect based on collapse
      if (data.intensity > 0.7) {
        this._showNotification('Powerful quantum collapse detected! Reality temporarily destabilizing...');
      }
    });
    
    // Handle interactions with quantum elements
    if (this.effectsIntegration.interactiveElements) {
      // Interaction started
      this.effectsIntegration.interactiveElements.setCallback('onInteractionStart', (data) => {
        this._showNotification(data.message);
      });
      
      // Interaction completed
      this.effectsIntegration.interactiveElements.setCallback('onInteractionComplete', (data) => {
        this._showNotification(data.message);
      });
    }
  }
  
  /**
   * Create sample interactive elements
   * @private
   */
  _createSampleElements() {
    // Create quantum computers
    this.effectsIntegration.addInteractiveElement(
      'quantum_computer',
      new THREE.Vector3(-8, 0, -5),
      { color: 0x00aaff }
    );
    
    this.effectsIntegration.addInteractiveElement(
      'quantum_computer',
      new THREE.Vector3(8, 0, -5),
      { color: 0x00ffaa }
    );
    
    // Create particle accelerator
    this.effectsIntegration.addInteractiveElement(
      'particle_accelerator',
      new THREE.Vector3(0, 0, -10),
      { scale: 0.7 }
    );
    
    // Create entanglement nodes
    this.effectsIntegration.addInteractiveElement(
      'entanglement_node',
      new THREE.Vector3(-5, 0, 5),
      { color: 0x00ffaa }
    );
    
    this.effectsIntegration.addInteractiveElement(
      'entanglement_node',
      new THREE.Vector3(5, 0, 5),
      { color: 0x00ffaa }
    );
    
    this.effectsIntegration.addInteractiveElement(
      'entanglement_node',
      new THREE.Vector3(0, 0, 10),
      { color: 0x00ffaa }
    );
    
    // Create time crystals
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 7;
      
      this.effectsIntegration.addInteractiveElement(
        'time_crystal',
        new THREE.Vector3(
          Math.cos(angle) * radius,
          1,
          Math.sin(angle) * radius
        ),
        { color: 0xaaff00 }
      );
    }
    
    // Create dark matter containers
    this.effectsIntegration.addInteractiveElement(
      'dark_matter_container',
      new THREE.Vector3(-10, 0, 0),
      { color: 0x660066 }
    );
    
    this.effectsIntegration.addInteractiveElement(
      'dark_matter_container',
      new THREE.Vector3(10, 0, 0),
      { color: 0x660066 }
    );
    
    // Set initial player speed
    this.playerSpeed = 1.0;
  }
  
  /**
   * Set up event listeners for user input
   * @private
   */
  _setupEventListeners() {
    // Player movement with WASD/Arrow keys
    window.addEventListener('keydown', (event) => {
      const moveSpeed = 0.2 * this.playerSpeed;
      
      switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          this.playerAvatar.position.z -= moveSpeed;
          break;
          
        case 's':
        case 'S':
        case 'ArrowDown':
          this.playerAvatar.position.z += moveSpeed;
          break;
          
        case 'a':
        case 'A':
        case 'ArrowLeft':
          this.playerAvatar.position.x -= moveSpeed;
          break;
          
        case 'd':
        case 'D':
        case 'ArrowRight':
          this.playerAvatar.position.x += moveSpeed;
          break;
          
        // Trigger a superposition collapse with spacebar (for demo purposes)
        case ' ':
          this.effectsIntegration._triggerSuperpositionCollapse(this.playerAvatar.position);
          break;
      }
    });
  }
  
  /**
   * Create UI for controls and status
   * @private
   */
  _createUI() {
    // Create UI container
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.zIndex = '1000';
    document.body.appendChild(uiContainer);
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Quantum Effects Demo';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#00ffff';
    uiContainer.appendChild(title);
    
    // Add controls info
    const controls = document.createElement('div');
    controls.innerHTML = `
      <p><strong>Controls:</strong></p>
      <p>WASD / Arrow Keys: Move player</p>
      <p>Mouse: Rotate camera</p>
      <p>Spacebar: Trigger quantum collapse</p>
      <p>Click on quantum objects to interact</p>
      <p>E: Progress interaction</p>
      <p>Q: Cancel interaction</p>
    `;
    controls.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    controls.style.padding = '10px';
    controls.style.borderRadius = '5px';
    uiContainer.appendChild(controls);
    
    // Add status UI
    const statusUI = document.createElement('div');
    statusUI.id = 'status-ui';
    statusUI.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    statusUI.style.padding = '10px';
    statusUI.style.borderRadius = '5px';
    statusUI.style.marginTop = '15px';
    
    statusUI.innerHTML = `
      <p><strong>Quantum Status:</strong></p>
      <div class="status-item">
        <label>Radiation Exposure:</label>
        <div class="status-bar">
          <div id="radiation-bar" class="status-fill" style="width: 0%; background: linear-gradient(to right, #ff00ff, #ff00aa);"></div>
        </div>
        <span id="radiation-value">0%</span>
      </div>
      
      <div class="status-item">
        <label>Entanglement Level:</label>
        <div class="status-bar">
          <div id="entanglement-bar" class="status-fill" style="width: 0%; background: linear-gradient(to right, #00ffaa, #00aaff);"></div>
        </div>
        <span id="entanglement-value">0%</span>
      </div>
      
      <div class="status-item">
        <label>Time Flow:</label>
        <div class="status-bar">
          <div id="time-bar" class="status-fill" style="width: 100%; background: linear-gradient(to right, #ffff00, #88ff00);"></div>
        </div>
        <span id="time-value">100%</span>
      </div>
    `;
    
    // Add custom CSS
    const style = document.createElement('style');
    style.textContent = `
      .status-item {
        margin-bottom: 10px;
      }
      
      .status-bar {
        height: 15px;
        width: 200px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 7px;
        overflow: hidden;
        margin: 5px 0;
      }
      
      .status-fill {
        height: 100%;
        width: 0%;
        transition: width 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    uiContainer.appendChild(statusUI);
    
    // Create notification area
    const notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    notificationArea.style.position = 'absolute';
    notificationArea.style.bottom = '20px';
    notificationArea.style.left = '50%';
    notificationArea.style.transform = 'translateX(-50%)';
    notificationArea.style.color = 'white';
    notificationArea.style.fontFamily = 'Arial, sans-serif';
    notificationArea.style.zIndex = '1000';
    notificationArea.style.textAlign = 'center';
    notificationArea.style.width = '80%';
    document.body.appendChild(notificationArea);
  }
  
  /**
   * Update the status UI
   * @param {string} statusType - Type of status to update
   * @param {number} value - New value (0-1)
   * @private
   */
  _updateStatusUI(statusType, value) {
    const percent = Math.round(value * 100);
    
    switch (statusType) {
      case 'radiation':
        document.getElementById('radiation-bar').style.width = `${percent}%`;
        document.getElementById('radiation-value').textContent = `${percent}%`;
        break;
        
      case 'entanglement':
        document.getElementById('entanglement-bar').style.width = `${percent}%`;
        document.getElementById('entanglement-value').textContent = `${percent}%`;
        break;
        
      case 'time':
        document.getElementById('time-bar').style.width = `${percent}%`;
        document.getElementById('time-value').textContent = `${percent}%`;
        break;
    }
  }
  
  /**
   * Show a notification message
   * @param {string} message - Message to display
   * @private
   */
  _showNotification(message) {
    const notificationArea = document.getElementById('notification-area');
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.backgroundColor = 'rgba(0, 150, 255, 0.7)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.margin = '10px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    // Add to notification area
    notificationArea.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      
      // Remove from DOM after fade out
      setTimeout(() => {
        notificationArea.removeChild(notification);
      }, 300);
    }, 5000);
  }
  
  /**
   * Animation loop
   * @private
   */
  _animate() {
    requestAnimationFrame(this._animate.bind(this));
    
    // Update orbit controls
    this.controls.update();
    
    // Update quantum effects
    if (this.effectsIntegration) {
      this.effectsIntegration.update(0.016); // Approximate delta time
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the demo when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const demo = new QuantumEffectsDemo();
});

export default QuantumEffectsDemo;