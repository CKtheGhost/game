import * as THREE from 'three';
import { Vector2, Vector3, Color } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * QuantumHUD - Advanced holographic HUD system for quantum gameplay
 * 
 * Features:
 * 1. Holographic health and energy meters
 * 2. Quantum radar showing nearby anomalies
 * 3. Research progress tracker
 * 4. Mission objective overlay
 * 5. Interactive 3D map of descent progress
 * 6. Inventory system for collected items
 * 7. Quick-access ability wheel
 */
class QuantumHUD {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // DOM container for 2D UI elements
    this.container = document.createElement('div');
    this.container.className = 'quantum-hud';
    document.body.appendChild(this.container);
    
    // Store UI component references
    this.components = {
      healthMeter: null,
      energyMeter: null,
      quantumRadar: null,
      researchTracker: null,
      missionObjectives: null,
      map3D: null,
      inventory: null,
      abilityWheel: null
    };
    
    // HUD settings
    this.settings = {
      colors: {
        primary: '#00ffff',    // Cyan
        secondary: '#ff00ff',  // Magenta
        accent: '#ffaa00',     // Orange
        warning: '#ff3300',    // Red
        positive: '#00ff99',   // Green
        background: 'rgba(0, 10, 20, 0.7)',
        backgroundLight: 'rgba(20, 40, 80, 0.5)'
      },
      glassBlur: '10px',
      borderRadius: '5px',
      borderWidth: '1px',
      transitionSpeed: '0.3s',
      scale: 1.0
    };
    
    // Player state for HUD to display
    this.playerState = {
      health: 1.0,
      energy: 0.8,
      quantumCharge: 0.5,
      anomalies: [],
      researchProgress: {
        quantum: 0.4,
        dimensional: 0.2,
        temporal: 0.6
      },
      currentMission: {
        id: 'mission_01',
        title: 'Quantum Core Stabilization',
        objectives: [
          { id: 'obj_1', description: 'Locate unstable core', completed: true },
          { id: 'obj_2', description: 'Collect stabilization crystals', completed: false, progress: 0.5 },
          { id: 'obj_3', description: 'Activate containment field', completed: false },
        ],
        location: new Vector3(-50, 10, 20)
      },
      inventory: [
        { id: 'item_1', name: 'Quantum Shard', count: 3, icon: 'quantum_shard.png' },
        { id: 'item_2', name: 'Dimensional Fragment', count: 1, icon: 'dimensional_fragment.png' },
        { id: 'item_3', name: 'Time Crystal', count: 2, icon: 'time_crystal.png' }
      ],
      abilities: [
        { id: 'ability_1', name: 'Phase Shift', cooldown: 0, icon: 'phase_shift.png' },
        { id: 'ability_2', name: 'Time Dilation', cooldown: 0.3, icon: 'time_dilation.png' },
        { id: 'ability_3', name: 'Quantum Teleport', cooldown: 0.7, icon: 'quantum_teleport.png' },
        { id: 'ability_4', name: 'Molecular Reconstruction', cooldown: 0, icon: 'molecular_reconstruction.png' }
      ],
      mapProgress: 0.35
    };
    
    // Post-processing for HUD effects
    this.composer = null;
    this.hudPass = null;
    
    // Holographic meshes for 3D UI elements
    this.holographicElements = [];
    
    // Audio for UI interactions
    this.audio = {
      hover: new Audio('/sounds/ui_hover.mp3'),
      click: new Audio('/sounds/ui_click.mp3'),
      warning: new Audio('/sounds/ui_warning.mp3'),
      notification: new Audio('/sounds/ui_notification.mp3')
    };
    
    // Interaction state
    this.hoveredElement = null;
    this.activeScreen = 'main'; // 'main', 'inventory', 'map', 'research'
    
    // Mouse position for interactivity
    this.mouse = new Vector2();
    
    // Animation timing
    this.clock = new THREE.Clock();
    this.lastUpdate = 0;
    
    // Initialize the HUD
    this._initialize();
  }
  
  /**
   * Initialize the HUD system
   * @private
   */
  _initialize() {
    // Create CSS styles
    this._createStyles();
    
    // Set up post-processing effects
    this._setupPostProcessing();
    
    // Create HUD components
    this._createHealthEnergyMeters();
    this._createQuantumRadar();
    this._createResearchTracker();
    this._createMissionObjectives();
    this._createMap3D();
    this._createInventory();
    this._createAbilityWheel();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Create holographic 3D elements
    this._createHolographicElements();
  }
  
  /**
   * Create CSS styles for the HUD
   * @private
   */
  _createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .quantum-hud {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        user-select: none;
        font-family: 'Rajdhani', 'Arial', sans-serif;
        color: ${this.settings.colors.primary};
        overflow: hidden;
      }
      
      .hud-component {
        position: absolute;
        background: ${this.settings.colors.background};
        backdrop-filter: blur(${this.settings.glassBlur});
        -webkit-backdrop-filter: blur(${this.settings.glassBlur});
        border: ${this.settings.borderWidth} solid ${this.settings.colors.primary};
        border-radius: ${this.settings.borderRadius};
        transition: all ${this.settings.transitionSpeed} ease;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        overflow: hidden;
      }
      
      .hud-component:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, ${this.settings.colors.primary}, transparent);
        opacity: 0.8;
      }
      
      .hud-title {
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 5px 10px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .hud-content {
        padding: 10px;
      }
      
      .meter-container {
        height: 8px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        overflow: hidden;
        margin: 5px 0;
        position: relative;
      }
      
      .meter-fill {
        height: 100%;
        width: 0%;
        transition: width 0.3s ease;
        position: relative;
      }
      
      .meter-fill:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.1) 5px,
          rgba(255, 255, 255, 0.2) 5px,
          rgba(255, 255, 255, 0.2) 10px
        );
        animation: slide 1s linear infinite;
      }
      
      .meter-health .meter-fill {
        background: linear-gradient(to right, ${this.settings.colors.warning}, ${this.settings.colors.positive});
      }
      
      .meter-energy .meter-fill {
        background: linear-gradient(to right, #0066ff, ${this.settings.colors.primary});
      }
      
      .meter-quantum .meter-fill {
        background: linear-gradient(to right, ${this.settings.colors.secondary}, ${this.settings.colors.primary});
      }
      
      .meter-label {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-bottom: 2px;
      }
      
      .hud-meters {
        position: absolute;
        left: 20px;
        bottom: 20px;
        width: 250px;
      }
      
      .hud-radar {
        position: absolute;
        right: 20px;
        bottom: 20px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .radar-container {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
      }
      
      .radar-sweep {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0);
        background: radial-gradient(circle, rgba(0,255,255,0) 30%, rgba(0,255,255,0.1) 70%, rgba(0,255,255,0.3) 100%);
        transform-origin: center;
        animation: radar-sweep 4s linear infinite;
      }
      
      .radar-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .radar-ring-1 {
        width: 30%;
        height: 30%;
      }
      
      .radar-ring-2 {
        width: 60%;
        height: 60%;
      }
      
      .radar-ring-3 {
        width: 90%;
        height: 90%;
      }
      
      .radar-center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: ${this.settings.colors.primary};
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      
      .radar-blip {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin: -3px 0 0 -3px;
        animation: blip-pulse 2s infinite;
      }
      
      .blip-anomaly {
        background: ${this.settings.colors.secondary};
      }
      
      .blip-objective {
        background: ${this.settings.colors.accent};
      }
      
      .radar-label {
        position: absolute;
        bottom: 10px;
        left: 0;
        width: 100%;
        text-align: center;
        font-size: 10px;
        letter-spacing: 1px;
      }
      
      .hud-research {
        position: absolute;
        right: 20px;
        top: 20px;
        width: 200px;
      }
      
      .research-bar {
        height: 5px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 2px;
        overflow: hidden;
        margin: 10px 0;
      }
      
      .research-fill {
        height: 100%;
        transition: width 0.5s ease;
      }
      
      .research-quantum .research-fill {
        background: ${this.settings.colors.primary};
      }
      
      .research-dimensional .research-fill {
        background: ${this.settings.colors.secondary};
      }
      
      .research-temporal .research-fill {
        background: ${this.settings.colors.accent};
      }
      
      .research-label {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }
      
      .hud-mission {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 300px;
      }
      
      .mission-objectives {
        margin-top: 5px;
      }
      
      .mission-objective {
        display: flex;
        align-items: center;
        margin: 5px 0;
        font-size: 12px;
      }
      
      .objective-indicator {
        width: 12px;
        height: 12px;
        margin-right: 8px;
        border: 1px solid ${this.settings.colors.primary};
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .objective-complete .objective-indicator {
        background: ${this.settings.colors.positive};
        border-color: ${this.settings.colors.positive};
      }
      
      .objective-complete .objective-text {
        text-decoration: line-through;
        opacity: 0.7;
      }
      
      .objective-progress {
        position: relative;
        width: 100%;
        height: 3px;
        background: rgba(0, 0, 0, 0.5);
        margin-top: 2px;
      }
      
      .objective-progress-fill {
        height: 100%;
        background: ${this.settings.colors.accent};
        transition: width 0.3s ease;
      }
      
      .hud-map {
        position: absolute;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        width: 300px;
        height: 120px;
        display: none;
      }
      
      .map-container {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .map-level {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 10px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
      }
      
      .map-progress {
        height: 100%;
        width: 0%;
        background: ${this.settings.colors.primary};
        border-radius: 5px;
        transition: width 0.5s ease;
      }
      
      .map-marker {
        position: absolute;
        width: 10px;
        height: 10px;
        margin: -5px 0 0 -5px;
        border-radius: 50%;
      }
      
      .map-player {
        background: ${this.settings.colors.primary};
        box-shadow: 0 0 10px ${this.settings.colors.primary};
        z-index: 10;
      }
      
      .map-objective {
        background: ${this.settings.colors.accent};
        animation: pulse 2s infinite;
      }
      
      .hud-inventory {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        display: none;
      }
      
      .inventory-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 5px;
        padding: 5px;
      }
      
      .inventory-slot {
        width: 60px;
        height: 60px;
        background: rgba(0, 20, 40, 0.7);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 3px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .inventory-item {
        width: 80%;
        height: 80%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
      
      .item-count {
        position: absolute;
        bottom: 2px;
        right: 5px;
        font-size: 10px;
        background: rgba(0, 0, 0, 0.7);
        padding: 0 3px;
        border-radius: 2px;
      }
      
      .hud-abilities {
        position: absolute;
        bottom: 20px;
        right: 240px;
        display: flex;
        gap: 10px;
      }
      
      .ability-slot {
        width: 50px;
        height: 50px;
        background: rgba(0, 20, 40, 0.7);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 5px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .ability-slot:hover {
        border-color: ${this.settings.colors.primary};
        transform: translateY(-3px);
      }
      
      .ability-icon {
        width: 80%;
        height: 80%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
      
      .ability-cooldown {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: rgba(0, 0, 0, 0.7);
        transition: height 0.1s linear;
      }
      
      .ability-key {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        background: ${this.settings.colors.backgroundLight};
        border: 1px solid ${this.settings.colors.primary};
        border-radius: 3px;
        padding: 0 5px;
        font-size: 10px;
      }
      
      .active-screen {
        display: block !important;
      }
      
      @keyframes radar-sweep {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes blip-pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      @keyframes slide {
        0% { background-position: 0 0; }
        100% { background-position: 20px 0; }
      }
      
      @keyframes glow {
        0% { filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.7)); }
        50% { filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.7)); }
        100% { filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.7)); }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Set up post-processing effects for the HUD
   * @private
   */
  _setupPostProcessing() {
    // Create effect composer
    this.composer = new EffectComposer(this.renderer);
    
    // Add main render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Add bloom effect for glow
    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloomPass);
    
    // Add custom HUD shader pass for holographic effect
    this.hudPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uHologramColor: { value: new Color(this.settings.colors.primary.replace('#', '0x')) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec3 uHologramColor;
        varying vec2 vUv;
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          
          // Apply holographic scanlines
          float scanline = sin(vUv.y * 150.0 + uTime * 5.0) * 0.05 + 0.05;
          
          // Apply holographic effect only to bright areas (HUD elements)
          float brightness = (texel.r + texel.g + texel.b) / 3.0;
          float hologramMask = step(0.5, brightness);
          
          // Apply the effect
          vec3 hologramColor = texel.rgb * mix(vec3(1.0), uHologramColor, 0.7);
          hologramColor += scanline * hologramMask;
          
          // Flicker effect
          float flicker = sin(uTime * 10.0) * 0.03 + 0.97;
          hologramColor *= flicker;
          
          gl_FragColor = vec4(
            mix(texel.rgb, hologramColor, hologramMask),
            texel.a
          );
        }
      `
    });
    
    this.composer.addPass(this.hudPass);
  }
  
  /**
   * Create health and energy meters
   * @private
   */
  _createHealthEnergyMeters() {
    const metersContainer = document.createElement('div');
    metersContainer.className = 'hud-component hud-meters';
    
    metersContainer.innerHTML = `
      <div class="hud-title">System Status</div>
      <div class="hud-content">
        <div class="meter-label">
          <span>Health</span>
          <span id="health-value">100%</span>
        </div>
        <div class="meter-container meter-health">
          <div class="meter-fill" id="health-meter" style="width: ${this.playerState.health * 100}%"></div>
        </div>
        
        <div class="meter-label">
          <span>Energy</span>
          <span id="energy-value">80%</span>
        </div>
        <div class="meter-container meter-energy">
          <div class="meter-fill" id="energy-meter" style="width: ${this.playerState.energy * 100}%"></div>
        </div>
        
        <div class="meter-label">
          <span>Quantum Charge</span>
          <span id="quantum-value">50%</span>
        </div>
        <div class="meter-container meter-quantum">
          <div class="meter-fill" id="quantum-meter" style="width: ${this.playerState.quantumCharge * 100}%"></div>
        </div>
      </div>
    `;
    
    this.container.appendChild(metersContainer);
    this.components.healthMeter = {
      container: metersContainer,
      healthMeter: document.getElementById('health-meter'),
      healthValue: document.getElementById('health-value'),
      energyMeter: document.getElementById('energy-meter'),
      energyValue: document.getElementById('energy-value'),
      quantumMeter: document.getElementById('quantum-meter'),
      quantumValue: document.getElementById('quantum-value')
    };
  }
  
  /**
   * Create quantum radar
   * @private
   */
  _createQuantumRadar() {
    const radarContainer = document.createElement('div');
    radarContainer.className = 'hud-component hud-radar';
    
    radarContainer.innerHTML = `
      <div class="radar-container">
        <div class="radar-sweep"></div>
        <div class="radar-ring radar-ring-1"></div>
        <div class="radar-ring radar-ring-2"></div>
        <div class="radar-ring radar-ring-3"></div>
        <div class="radar-center"></div>
        <div class="radar-label">QUANTUM RADAR</div>
        <!-- Anomaly blips will be added dynamically -->
      </div>
    `;
    
    this.container.appendChild(radarContainer);
    this.components.quantumRadar = {
      container: radarContainer,
      radarContainer: radarContainer.querySelector('.radar-container')
    };
    
    // Add initial anomalies
    this._updateRadarBlips();
  }
  
  /**
   * Create research progress tracker
   * @private
   */
  _createResearchTracker() {
    const researchContainer = document.createElement('div');
    researchContainer.className = 'hud-component hud-research';
    
    researchContainer.innerHTML = `
      <div class="hud-title">Research Progress</div>
      <div class="hud-content">
        <div class="research-label">
          <span>Quantum Physics</span>
          <span id="quantum-research-value">${Math.round(this.playerState.researchProgress.quantum * 100)}%</span>
        </div>
        <div class="research-bar research-quantum">
          <div class="research-fill" id="quantum-research-fill" style="width: ${this.playerState.researchProgress.quantum * 100}%"></div>
        </div>
        
        <div class="research-label">
          <span>Dimensional Theory</span>
          <span id="dimensional-research-value">${Math.round(this.playerState.researchProgress.dimensional * 100)}%</span>
        </div>
        <div class="research-bar research-dimensional">
          <div class="research-fill" id="dimensional-research-fill" style="width: ${this.playerState.researchProgress.dimensional * 100}%"></div>
        </div>
        
        <div class="research-label">
          <span>Temporal Mechanics</span>
          <span id="temporal-research-value">${Math.round(this.playerState.researchProgress.temporal * 100)}%</span>
        </div>
        <div class="research-bar research-temporal">
          <div class="research-fill" id="temporal-research-fill" style="width: ${this.playerState.researchProgress.temporal * 100}%"></div>
        </div>
      </div>
    `;
    
    this.container.appendChild(researchContainer);
    this.components.researchTracker = {
      container: researchContainer,
      quantumFill: document.getElementById('quantum-research-fill'),
      quantumValue: document.getElementById('quantum-research-value'),
      dimensionalFill: document.getElementById('dimensional-research-fill'),
      dimensionalValue: document.getElementById('dimensional-research-value'),
      temporalFill: document.getElementById('temporal-research-fill'),
      temporalValue: document.getElementById('temporal-research-value')
    };
  }
  
  /**
   * Create mission objectives
   * @private
   */
  _createMissionObjectives() {
    const missionContainer = document.createElement('div');
    missionContainer.className = 'hud-component hud-mission';
    
    let objectivesHTML = '';
    for (const objective of this.playerState.currentMission.objectives) {
      const completedClass = objective.completed ? 'objective-complete' : '';
      const checkmarkIcon = objective.completed ? '✓' : '';
      
      let progressHTML = '';
      if (!objective.completed && objective.progress !== undefined) {
        progressHTML = `
          <div class="objective-progress">
            <div class="objective-progress-fill" style="width: ${objective.progress * 100}%"></div>
          </div>
        `;
      }
      
      objectivesHTML += `
        <div class="mission-objective ${completedClass}" data-id="${objective.id}">
          <div class="objective-indicator">${checkmarkIcon}</div>
          <div class="objective-content">
            <div class="objective-text">${objective.description}</div>
            ${progressHTML}
          </div>
        </div>
      `;
    }
    
    missionContainer.innerHTML = `
      <div class="hud-title">Mission: ${this.playerState.currentMission.title}</div>
      <div class="hud-content">
        <div class="mission-objectives">
          ${objectivesHTML}
        </div>
      </div>
    `;
    
    this.container.appendChild(missionContainer);
    this.components.missionObjectives = {
      container: missionContainer,
      objectives: missionContainer.querySelectorAll('.mission-objective')
    };
  }
  
  /**
   * Create 3D map
   * @private
   */
  _createMap3D() {
    const mapContainer = document.createElement('div');
    mapContainer.className = 'hud-component hud-map';
    
    mapContainer.innerHTML = `
      <div class="hud-title">Facility Map</div>
      <div class="hud-content">
        <div class="map-container">
          <div class="map-level">
            <div class="map-progress" id="map-progress" style="width: ${this.playerState.mapProgress * 100}%"></div>
          </div>
          <!-- Map markers will be added dynamically -->
        </div>
      </div>
    `;
    
    this.container.appendChild(mapContainer);
    this.components.map3D = {
      container: mapContainer,
      mapContainer: mapContainer.querySelector('.map-container'),
      mapProgress: document.getElementById('map-progress')
    };
    
    // Add player marker
    const playerMarker = document.createElement('div');
    playerMarker.className = 'map-marker map-player';
    playerMarker.style.left = '30%';
    playerMarker.style.top = '50%';
    this.components.map3D.mapContainer.appendChild(playerMarker);
    
    // Add objective marker
    const objectiveMarker = document.createElement('div');
    objectiveMarker.className = 'map-marker map-objective';
    objectiveMarker.style.left = '70%';
    objectiveMarker.style.top = '30%';
    this.components.map3D.mapContainer.appendChild(objectiveMarker);
  }
  
  /**
   * Create inventory system
   * @private
   */
  _createInventory() {
    const inventoryContainer = document.createElement('div');
    inventoryContainer.className = 'hud-component hud-inventory';
    
    let inventoryHTML = '<div class="inventory-grid">';
    
    // Create slots (fill with items if available)
    for (let i = 0; i < 12; i++) {
      const item = this.playerState.inventory[i] || null;
      
      let itemHTML = '';
      if (item) {
        itemHTML = `
          <div class="inventory-item" style="background-image: url('/images/${item.icon}')"></div>
          <div class="item-count">${item.count}</div>
        `;
      }
      
      inventoryHTML += `
        <div class="inventory-slot" data-slot="${i}">
          ${itemHTML}
        </div>
      `;
    }
    
    inventoryHTML += '</div>';
    
    inventoryContainer.innerHTML = `
      <div class="hud-title">Inventory</div>
      <div class="hud-content">
        ${inventoryHTML}
      </div>
    `;
    
    this.container.appendChild(inventoryContainer);
    this.components.inventory = {
      container: inventoryContainer,
      slots: inventoryContainer.querySelectorAll('.inventory-slot')
    };
  }
  
  /**
   * Create ability wheel
   * @private
   */
  _createAbilityWheel() {
    const abilitiesContainer = document.createElement('div');
    abilitiesContainer.className = 'hud-abilities';
    
    // Create ability slots
    for (let i = 0; i < this.playerState.abilities.length; i++) {
      const ability = this.playerState.abilities[i];
      const keyBinding = i + 1; // Keys 1-4
      
      const abilitySlot = document.createElement('div');
      abilitySlot.className = 'ability-slot';
      abilitySlot.setAttribute('data-ability', ability.id);
      
      const cooldownHeight = ability.cooldown * 100;
      
      abilitySlot.innerHTML = `
        <div class="ability-icon" style="background-image: url('/images/${ability.icon}')"></div>
        <div class="ability-cooldown" style="height: ${cooldownHeight}%"></div>
        <div class="ability-key">${keyBinding}</div>
      `;
      
      abilitySlot.addEventListener('click', () => {
        this._activateAbility(ability.id);
      });
      
      abilitiesContainer.appendChild(abilitySlot);
    }
    
    this.container.appendChild(abilitiesContainer);
    this.components.abilityWheel = {
      container: abilitiesContainer,
      slots: abilitiesContainer.querySelectorAll('.ability-slot')
    };
  }
  
  /**
   * Create holographic 3D elements
   * @private
   */
  _createHolographicElements() {
    // Create holographic displays for health, energy, etc.
    this._createHolographicMeter();
    
    // Create holographic radar display
    this._createHolographicRadar();
  }
  
  /**
   * Create holographic meter display
   * @private
   */
  _createHolographicMeter() {
    // Create a simple plane geometry for the holographic display
    const geometry = new THREE.PlaneGeometry(0.5, 0.1);
    
    // Create holographic material for the meter
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uValue: { value: this.playerState.health },
        uColor: { value: new Color(0x00ffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uValue;
        uniform vec3 uColor;
        varying vec2 vUv;
        
        void main() {
          // Create holographic meter effect
          float alpha = 0.7;
          
          // Fill based on value
          if (vUv.x > uValue) {
            alpha = 0.1;
          }
          
          // Add scanlines
          float scanline = sin(vUv.y * 50.0 + uTime * 5.0) * 0.1 + 0.9;
          
          // Add edge glow
          float edge = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
          edge *= smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
          
          // Enhance edge at the fill point
          float fillEdge = smoothstep(uValue - 0.03, uValue, vUv.x) * smoothstep(uValue + 0.03, uValue, vUv.x);
          edge = max(edge, fillEdge * 3.0);
          
          // Final color
          vec3 color = uColor * scanline;
          color += edge * uColor * 0.5;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    // Create mesh
    const meter = new THREE.Mesh(geometry, material);
    meter.position.set(0, 0, -5); // Position in front of camera
    meter.userData.type = 'holographic-meter';
    
    // Store reference
    this.holographicElements.push(meter);
    
    // Add to scene
    this.scene.add(meter);
  }
  
  /**
   * Create holographic radar display
   * @private
   */
  _createHolographicRadar() {
    // Create a circle geometry for the radar
    const geometry = new THREE.CircleGeometry(0.2, 32);
    
    // Create holographic material for the radar
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0x00ffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        
        void main() {
          // Convert UV to centered coordinates
          vec2 centered = vUv * 2.0 - 1.0;
          float dist = length(centered);
          
          // Only render within the circle
          if (dist > 1.0) {
            discard;
          }
          
          // Create radar sweep effect
          float angle = atan(centered.y, centered.x);
          float normalizedAngle = angle / (2.0 * 3.14159) + 0.5;
          
          // Radar sweep line
          float sweepAngle = mod(uTime * 0.5, 1.0) * 2.0 * 3.14159;
          float sweep = smoothstep(0.0, 0.1, abs(mod(angle - sweepAngle + 3.14159, 2.0 * 3.14159) - 3.14159));
          
          // Create rings
          float rings = smoothstep(0.9, 1.0, sin(dist * 10.0) * 0.5 + 0.5) * 0.5;
          
          // Create grid effect
          float grid = smoothstep(0.9, 1.0, sin(centered.x * 20.0) * 0.5 + 0.5) * 0.3;
          grid += smoothstep(0.9, 1.0, sin(centered.y * 20.0) * 0.5 + 0.5) * 0.3;
          
          // Edge glow
          float edge = smoothstep(1.0, 0.8, dist);
          
          // Combine effects
          vec3 color = uColor * 0.5;
          color += sweep * uColor * 0.5;
          color += rings * uColor;
          color += grid * uColor;
          
          // Alpha is stronger at the edge
          float alpha = 0.7 * edge;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    // Create mesh
    const radar = new THREE.Mesh(geometry, material);
    radar.position.set(0.3, -0.2, -0.5); // Position in front of camera
    radar.userData.type = 'holographic-radar';
    
    // Store reference
    this.holographicElements.push(radar);
    
    // Add to scene
    this.scene.add(radar);
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Mouse move for interactivity
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (event) => {
      // Number keys 1-4 for abilities
      if (event.key >= '1' && event.key <= '4') {
        const abilityIndex = parseInt(event.key) - 1;
        if (abilityIndex < this.playerState.abilities.length) {
          this._activateAbility(this.playerState.abilities[abilityIndex].id);
        }
      }
      
      // Toggle UI screens
      switch (event.key.toLowerCase()) {
        case 'm':
          this._toggleScreen('map');
          break;
        case 'i':
          this._toggleScreen('inventory');
          break;
        case 'r':
          this._toggleScreen('research');
          break;
        case 'escape':
          this._toggleScreen('main');
          break;
      }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      this._onWindowResize();
    });
  }
  
  /**
   * Handle ability activation
   * @param {string} abilityId - ID of the ability to activate
   * @private
   */
  _activateAbility(abilityId) {
    // Find the ability
    const abilityIndex = this.playerState.abilities.findIndex(a => a.id === abilityId);
    if (abilityIndex === -1) return;
    
    const ability = this.playerState.abilities[abilityIndex];
    
    // Check if ability is on cooldown
    if (ability.cooldown > 0) {
      // Play error sound
      this.audio.warning.play();
      return;
    }
    
    // Play activation sound
    this.audio.click.play();
    
    // Set cooldown (just for demo, in real game this would come from gameplay system)
    ability.cooldown = 1.0;
    this._updateAbilityCooldown(abilityId, 1.0);
    
    // Decrement energy (again, just for demo)
    this.updatePlayerState({
      energy: Math.max(0, this.playerState.energy - 0.2)
    });
    
    // In a real implementation, we would trigger the actual ability effect
    console.log(`Activated ability: ${ability.name}`);
    
    // Start cooldown reduction (simulating real-time gameplay)
    this._startCooldownReduction(abilityId);
  }
  
  /**
   * Start cooldown reduction for an ability
   * @param {string} abilityId - ID of the ability
   * @private
   */
  _startCooldownReduction(abilityId) {
    const abilityIndex = this.playerState.abilities.findIndex(a => a.id === abilityId);
    if (abilityIndex === -1) return;
    
    // Reduce cooldown over time
    const interval = setInterval(() => {
      const ability = this.playerState.abilities[abilityIndex];
      ability.cooldown = Math.max(0, ability.cooldown - 0.1);
      
      this._updateAbilityCooldown(abilityId, ability.cooldown);
      
      if (ability.cooldown <= 0) {
        clearInterval(interval);
        this.audio.notification.play();
      }
    }, 300);
  }
  
  /**
   * Update ability cooldown visual
   * @param {string} abilityId - ID of the ability
   * @param {number} cooldown - Cooldown value (0-1)
   * @private
   */
  _updateAbilityCooldown(abilityId, cooldown) {
    const slot = this.components.abilityWheel.container.querySelector(`[data-ability="${abilityId}"]`);
    if (!slot) return;
    
    const cooldownElement = slot.querySelector('.ability-cooldown');
    cooldownElement.style.height = `${cooldown * 100}%`;
  }
  
  /**
   * Toggle UI screen
   * @param {string} screenName - Name of screen to toggle
   * @private
   */
  _toggleScreen(screenName) {
    // Hide all screens first
    this.components.map3D.container.classList.remove('active-screen');
    this.components.inventory.container.classList.remove('active-screen');
    
    // If already on this screen or going to main, return to main HUD
    if (this.activeScreen === screenName || screenName === 'main') {
      this.activeScreen = 'main';
      return;
    }
    
    // Show the requested screen
    this.activeScreen = screenName;
    
    switch (screenName) {
      case 'map':
        this.components.map3D.container.classList.add('active-screen');
        break;
      case 'inventory':
        this.components.inventory.container.classList.add('active-screen');
        break;
    }
    
    // Play sound
    this.audio.click.play();
  }
  
  /**
   * Update radar blips based on anomalies
   * @private
   */
  _updateRadarBlips() {
    // Clear existing blips
    const existingBlips = this.components.quantumRadar.radarContainer.querySelectorAll('.radar-blip');
    existingBlips.forEach(blip => blip.remove());
    
    // Add mission objective blip
    const objectiveBlip = document.createElement('div');
    objectiveBlip.className = 'radar-blip blip-objective';
    
    // Calculate position on radar (relative to player)
    // In a real game this would use actual world positions and distances
    objectiveBlip.style.left = '70%';
    objectiveBlip.style.top = '30%';
    
    this.components.quantumRadar.radarContainer.appendChild(objectiveBlip);
    
    // Add anomaly blips
    for (let i = 0; i < 3; i++) {
      const anomalyBlip = document.createElement('div');
      anomalyBlip.className = 'radar-blip blip-anomaly';
      
      // Random positions for demo
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      
      anomalyBlip.style.left = `${x}%`;
      anomalyBlip.style.top = `${y}%`;
      
      this.components.quantumRadar.radarContainer.appendChild(anomalyBlip);
    }
  }
  
  /**
   * Update holographic elements position relative to camera
   * @private
   */
  _updateHolographicElements() {
    // Update each holographic element
    for (const element of this.holographicElements) {
      // Update position to maintain relative position to camera
      if (element.userData.type === 'holographic-meter') {
        // For meter, position relative to camera's bottom left
        element.position.set(-0.4, -0.3, -0.5);
        element.quaternion.copy(this.camera.quaternion);
        
        // Update shader values
        if (element.material.uniforms) {
          element.material.uniforms.uTime.value = this.clock.getElapsedTime();
          element.material.uniforms.uValue.value = this.playerState.health;
        }
      } 
      else if (element.userData.type === 'holographic-radar') {
        // For radar, position relative to camera's bottom right
        element.position.set(0.4, -0.3, -0.5);
        element.quaternion.copy(this.camera.quaternion);
        
        // Update shader values
        if (element.material.uniforms) {
          element.material.uniforms.uTime.value = this.clock.getElapsedTime();
        }
      }
    }
  }
  
  /**
   * Handle window resize
   * @private
   */
  _onWindowResize() {
    // Update post-processing
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  
  /**
   * Update HUD with new player state
   * @param {Object} newState - New player state
   */
  updatePlayerState(newState) {
    // Update player state
    this.playerState = {
      ...this.playerState,
      ...newState
    };
    
    // Update health meter
    if (newState.health !== undefined) {
      this.components.healthMeter.healthMeter.style.width = `${newState.health * 100}%`;
      this.components.healthMeter.healthValue.textContent = `${Math.round(newState.health * 100)}%`;
    }
    
    // Update energy meter
    if (newState.energy !== undefined) {
      this.components.healthMeter.energyMeter.style.width = `${newState.energy * 100}%`;
      this.components.healthMeter.energyValue.textContent = `${Math.round(newState.energy * 100)}%`;
    }
    
    // Update quantum charge meter
    if (newState.quantumCharge !== undefined) {
      this.components.healthMeter.quantumMeter.style.width = `${newState.quantumCharge * 100}%`;
      this.components.healthMeter.quantumValue.textContent = `${Math.round(newState.quantumCharge * 100)}%`;
    }
    
    // Update research progress
    if (newState.researchProgress) {
      if (newState.researchProgress.quantum !== undefined) {
        this.components.researchTracker.quantumFill.style.width = `${newState.researchProgress.quantum * 100}%`;
        this.components.researchTracker.quantumValue.textContent = `${Math.round(newState.researchProgress.quantum * 100)}%`;
      }
      
      if (newState.researchProgress.dimensional !== undefined) {
        this.components.researchTracker.dimensionalFill.style.width = `${newState.researchProgress.dimensional * 100}%`;
        this.components.researchTracker.dimensionalValue.textContent = `${Math.round(newState.researchProgress.dimensional * 100)}%`;
      }
      
      if (newState.researchProgress.temporal !== undefined) {
        this.components.researchTracker.temporalFill.style.width = `${newState.researchProgress.temporal * 100}%`;
        this.components.researchTracker.temporalValue.textContent = `${Math.round(newState.researchProgress.temporal * 100)}%`;
      }
    }
    
    // Update map progress
    if (newState.mapProgress !== undefined) {
      this.components.map3D.mapProgress.style.width = `${newState.mapProgress * 100}%`;
    }
    
    // Update anomalies
    if (newState.anomalies) {
      this._updateRadarBlips();
    }
  }
  
  /**
   * Update mission objectives
   * @param {Object} mission - Mission data
   */
  updateMission(mission) {
    if (!mission) return;
    
    this.playerState.currentMission = mission;
    
    // Update mission title
    const titleElement = this.components.missionObjectives.container.querySelector('.hud-title');
    titleElement.textContent = `Mission: ${mission.title}`;
    
    // Update objectives
    const objectivesContainer = this.components.missionObjectives.container.querySelector('.mission-objectives');
    objectivesContainer.innerHTML = '';
    
    for (const objective of mission.objectives) {
      const completedClass = objective.completed ? 'objective-complete' : '';
      const checkmarkIcon = objective.completed ? '✓' : '';
      
      let progressHTML = '';
      if (!objective.completed && objective.progress !== undefined) {
        progressHTML = `
          <div class="objective-progress">
            <div class="objective-progress-fill" style="width: ${objective.progress * 100}%"></div>
          </div>
        `;
      }
      
      const objectiveElement = document.createElement('div');
      objectiveElement.className = `mission-objective ${completedClass}`;
      objectiveElement.setAttribute('data-id', objective.id);
      
      objectiveElement.innerHTML = `
        <div class="objective-indicator">${checkmarkIcon}</div>
        <div class="objective-content">
          <div class="objective-text">${objective.description}</div>
          ${progressHTML}
        </div>
      `;
      
      objectivesContainer.appendChild(objectiveElement);
    }
    
    // Play notification sound
    this.audio.notification.play();
  }
  
  /**
   * Update a single objective
   * @param {string} objectiveId - ID of the objective
   * @param {Object} update - Update data
   */
  updateObjective(objectiveId, update) {
    // Find the objective in the current mission
    const objectiveIndex = this.playerState.currentMission.objectives.findIndex(
      obj => obj.id === objectiveId
    );
    
    if (objectiveIndex === -1) return;
    
    // Update the objective
    this.playerState.currentMission.objectives[objectiveIndex] = {
      ...this.playerState.currentMission.objectives[objectiveIndex],
      ...update
    };
    
    // Update the UI
    const objective = this.playerState.currentMission.objectives[objectiveIndex];
    const objectiveElement = this.components.missionObjectives.container.querySelector(
      `.mission-objective[data-id="${objectiveId}"]`
    );
    
    if (!objectiveElement) return;
    
    // Update completed state
    if (update.completed !== undefined) {
      if (update.completed) {
        objectiveElement.classList.add('objective-complete');
        objectiveElement.querySelector('.objective-indicator').textContent = '✓';
        
        // Play completion sound
        this.audio.notification.play();
      } else {
        objectiveElement.classList.remove('objective-complete');
        objectiveElement.querySelector('.objective-indicator').textContent = '';
      }
    }
    
    // Update progress bar
    if (update.progress !== undefined && !objective.completed) {
      let progressElement = objectiveElement.querySelector('.objective-progress');
      
      if (!progressElement) {
        // Create progress bar if it doesn't exist
        const contentElement = objectiveElement.querySelector('.objective-content');
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'objective-progress';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'objective-progress-fill';
        
        progressContainer.appendChild(progressFill);
        contentElement.appendChild(progressContainer);
        
        progressElement = progressContainer;
      }
      
      // Update progress
      const progressFill = progressElement.querySelector('.objective-progress-fill');
      progressFill.style.width = `${update.progress * 100}%`;
    }
  }
  
  /**
   * Show notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification ('info', 'warning', 'success')
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `hud-notification notification-${type}`;
    notification.textContent = message;
    
    // Add to container
    this.container.appendChild(notification);
    
    // Play sound
    switch (type) {
      case 'warning':
        this.audio.warning.play();
        break;
      case 'success':
        this.audio.notification.play();
        break;
      default:
        this.audio.click.play();
        break;
    }
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      
      // Remove from DOM after animation
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  /**
   * Update HUD elements
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Update post-processing effect time
    if (this.hudPass) {
      this.hudPass.uniforms.uTime.value = this.clock.getElapsedTime();
    }
    
    // Update holographic elements
    this._updateHolographicElements();
    
    // Update particle animations and other time-based effects
    // This would be more complex in a real implementation
  }
  
  /**
   * Render the HUD
   */
  render() {
    // Use the composer to render the scene with HUD effects
    if (this.composer) {
      this.composer.render();
    } else {
      // Fallback to standard renderer
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove DOM elements
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Dispose of holographic elements
    for (const element of this.holographicElements) {
      this.scene.remove(element);
      if (element.geometry) element.geometry.dispose();
      if (element.material) element.material.dispose();
    }
    
    // Clear arrays
    this.holographicElements = [];
    
    // Remove event listeners
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onWindowResize);
  }
}

export default QuantumHUD;