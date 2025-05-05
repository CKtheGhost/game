import * as THREE from 'three';
import { Vector3, Color, Quaternion, Raycaster } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

/**
 * InteractiveMap3D - Holographic 3D map system for quantum facility
 * 
 * Features:
 * 1. Interactive 3D map showing level layout
 * 2. Player location tracking
 * 3. Mission objectives and points of interest
 * 4. Quantum anomaly detection
 * 5. Zoom and rotation controls
 * 6. Holographic visualization effects
 * 7. Navigation system with custom waypoints
 */
class InteractiveMap3D {
  constructor() {
    // DOM elements
    this.container = null;
    this.canvas = null;
    
    // Three.js objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.outlinePass = null;
    this.bloomPass = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    
    // Map data
    this.mapData = {
      levels: [],
      currentLevel: 0,
      playerPosition: new Vector3(),
      playerRotation: 0,
      objectives: new Map(),
      pointsOfInterest: new Map(),
      anomalies: new Map(),
      areas: new Map()
    };
    
    // Map objects
    this.mapObjects = {
      levels: [],
      player: null,
      objectives: new Map(),
      pointsOfInterest: new Map(),
      anomalies: new Map(),
      areas: new Map()
    };
    
    // Visual settings
    this.settings = {
      colors: {
        background: new Color(0x000814),
        walls: new Color(0x003566),
        floors: new Color(0x001d3d),
        highlight: new Color(0x00ffff),
        player: new Color(0x00ffff),
        objective: new Color(0xffd60a),
        anomaly: new Color(0xff00ff),
        poi: new Color(0x00d68f),
        path: new Color(0x00bfff)
      },
      scale: 0.1,
      playerSize: 0.3,
      markerSize: 0.2,
      wallHeight: 1.5,
      holographicIntensity: 0.7,
      gridSize: 50,
      gridDivisions: 50
    };
    
    // Interaction state
    this.isOpen = false;
    this.isRotating = false;
    this.isDragging = false;
    this.lastMousePosition = { x: 0, y: 0 };
    this.zoomLevel = 1.0;
    this.targetZoomLevel = 1.0;
    this.hovered = null;
    this.selected = null;
    
    // Raycaster for interaction
    this.raycaster = new Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Animation timings
    this.animationTimes = {
      open: 0.7,
      levelChange: 0.5,
      markerPulse: 1.5
    };
    
    // Callbacks
    this.callbacks = {
      onMapOpen: null,
      onMapClose: null,
      onPointSelected: null,
      onLevelChange: null,
      onSetWaypoint: null
    };
    
    // Initialize map system
    this._initialize();
  }
  
  /**
   * Initialize the map system
   * @private
   */
  _initialize() {
    // Create DOM container
    this._createContainer();
    
    // Set up Three.js
    this._setupThreeJS();
    
    // Create map controls
    this._createMapControls();
    
    // Set up event listeners
    this._setupEventListeners();
  }
  
  /**
   * Create DOM container
   * @private
   */
  _createContainer() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'map-3d-container';
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      .map-3d-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      
      .map-3d-container.open {
        opacity: 1;
        pointer-events: all;
      }
      
      .map-canvas-wrapper {
        position: relative;
        width: 80%;
        height: 80%;
        border: 1px solid ${this.settings.colors.highlight.getStyle()};
        background: rgba(0, 8, 20, 0.8);
        overflow: hidden;
      }
      
      .map-canvas {
        width: 100%;
        height: 100%;
      }
      
      .map-controls {
        position: absolute;
        bottom: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .map-button {
        width: 40px;
        height: 40px;
        background: rgba(0, 8, 20, 0.8);
        border: 1px solid ${this.settings.colors.highlight.getStyle()};
        color: ${this.settings.colors.highlight.getStyle()};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .map-button:hover {
        background: rgba(0, 255, 255, 0.2);
      }
      
      .map-level-controls {
        position: absolute;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .map-level-indicator {
        background: rgba(0, 8, 20, 0.8);
        border: 1px solid ${this.settings.colors.highlight.getStyle()};
        color: ${this.settings.colors.highlight.getStyle()};
        padding: 5px 15px;
        font-family: 'Rajdhani', sans-serif;
        text-align: center;
      }
      
      .map-legend {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 8, 20, 0.8);
        border: 1px solid ${this.settings.colors.highlight.getStyle()};
        padding: 10px;
        font-family: 'Rajdhani', sans-serif;
        color: white;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        margin-right: 10px;
      }
      
      .info-panel {
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0, 8, 20, 0.8);
        border: 1px solid ${this.settings.colors.highlight.getStyle()};
        padding: 15px;
        font-family: 'Rajdhani', sans-serif;
        color: white;
        max-width: 250px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .info-panel.visible {
        opacity: 1;
      }
      
      .info-title {
        color: ${this.settings.colors.highlight.getStyle()};
        font-size: 16px;
        margin-bottom: 5px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        padding-bottom: 5px;
      }
      
      .info-description {
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .info-action {
        display: inline-block;
        background: rgba(0, 255, 255, 0.2);
        border: 1px solid ${this.settings.colors.highlight.getStyle()};
        color: ${this.settings.colors.highlight.getStyle()};
        padding: 5px 10px;
        margin-top: 5px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      
      .info-action:hover {
        background: rgba(0, 255, 255, 0.4);
      }
      
      .map-watermark {
        position: absolute;
        right: 20px;
        bottom: 90px;
        font-family: 'Rajdhani', sans-serif;
        color: rgba(0, 255, 255, 0.5);
        font-size: 12px;
        pointer-events: none;
      }
      
      @keyframes pulse {
        0% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
        100% { opacity: 0.7; transform: scale(1); }
      }
      
      .map-scanning-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: ${this.settings.colors.highlight.getStyle()};
        opacity: 0.7;
        pointer-events: none;
        animation: scanLine 4s linear infinite;
      }
      
      @keyframes scanLine {
        0% { top: 0; opacity: 0.7; }
        49% { opacity: 0.7; }
        50% { top: 100%; opacity: 0; }
        51% { top: 0; opacity: 0; }
        52% { opacity: 0.7; }
        100% { top: 0; opacity: 0.7; }
      }
    `;
    
    document.head.appendChild(style);
    
    // Create canvas wrapper
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'map-canvas-wrapper';
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'map-canvas';
    canvasWrapper.appendChild(this.canvas);
    
    // Add scanning effect line
    const scanningEffect = document.createElement('div');
    scanningEffect.className = 'map-scanning-effect';
    canvasWrapper.appendChild(scanningEffect);
    
    // Create info panel (initially hidden)
    const infoPanel = document.createElement('div');
    infoPanel.className = 'info-panel';
    infoPanel.innerHTML = `
      <div class="info-title">Select a location</div>
      <div class="info-description">Hover over points of interest to see details.</div>
    `;
    canvasWrapper.appendChild(infoPanel);
    this.infoPanel = infoPanel;
    
    // Create map watermark
    const watermark = document.createElement('div');
    watermark.className = 'map-watermark';
    watermark.textContent = 'QUANTUM LABS FACILITY MAP v2.7';
    canvasWrapper.appendChild(watermark);
    
    // Add canvas wrapper to container
    this.container.appendChild(canvasWrapper);
    
    // Add container to document (initially hidden)
    document.body.appendChild(this.container);
  }
  
  /**
   * Set up Three.js scene, camera, and renderer
   * @private
   */
  _setupThreeJS() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = this.settings.colors.background;
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth * 0.8 / (window.innerHeight * 0.8),
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 15);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create effect composer for post-processing
    this.composer = new EffectComposer(this.renderer);
    
    // Add render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Add outline pass for selection
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength = 3;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.edgeThickness = 1;
    this.outlinePass.pulsePeriod = 2;
    this.outlinePass.visibleEdgeColor.set(this.settings.colors.highlight);
    this.outlinePass.hiddenEdgeColor.set(this.settings.colors.highlight);
    this.composer.addPass(this.outlinePass);
    
    // Add bloom pass for glow
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);
    
    // Set up basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);
    
    // Add a grid for reference
    const grid = new THREE.GridHelper(
      this.settings.gridSize,
      this.settings.gridDivisions,
      this.settings.colors.highlight,
      this.settings.colors.walls.clone().multiplyScalar(0.5)
    );
    grid.position.y = -0.01; // Slightly below the map
    this.scene.add(grid);
    
    // Add holographic material for map
    this.holographicMaterial = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: this.settings.colors.walls },
        holographicColor: { value: this.settings.colors.highlight },
        intensity: { value: this.settings.holographicIntensity },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 holographicColor;
        uniform float intensity;
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Calculate fresnel effect for edges
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 2.0);
          
          // Calculate scanlines
          float scanline = sin(vPosition.y * 50.0 + time * 5.0) * 0.1 + 0.9;
          
          // Mix base color with holographic color based on fresnel
          vec3 color = mix(baseColor, holographicColor, fresnel * intensity);
          
          // Apply scanlines
          color *= scanline;
          
          // Calculate opacity - more transparent in the middle, more opaque on edges
          float opacity = mix(0.5, 0.9, fresnel);
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }
  
  /**
   * Create map controls
   * @private
   */
  _createMapControls() {
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'map-controls';
    
    // Create control buttons
    const buttons = [
      { icon: '+', action: () => this._zoomMap(0.1) },
      { icon: '−', action: () => this._zoomMap(-0.1) },
      { icon: '⟲', action: () => this._resetMapView() },
      { icon: '×', action: () => this.closeMap() }
    ];
    
    buttons.forEach(button => {
      const buttonElement = document.createElement('div');
      buttonElement.className = 'map-button';
      buttonElement.textContent = button.icon;
      buttonElement.addEventListener('click', button.action);
      controlsContainer.appendChild(buttonElement);
    });
    
    // Add to canvas wrapper
    const canvasWrapper = this.container.querySelector('.map-canvas-wrapper');
    canvasWrapper.appendChild(controlsContainer);
    
    // Create level controls
    const levelControls = document.createElement('div');
    levelControls.className = 'map-level-controls';
    
    // Up button
    const upButton = document.createElement('div');
    upButton.className = 'map-button';
    upButton.textContent = '↑';
    upButton.addEventListener('click', () => this._changeLevel(1));
    levelControls.appendChild(upButton);
    
    // Level indicator
    const levelIndicator = document.createElement('div');
    levelIndicator.className = 'map-level-indicator';
    levelIndicator.textContent = 'Level 1';
    levelControls.appendChild(levelIndicator);
    this.levelIndicator = levelIndicator;
    
    // Down button
    const downButton = document.createElement('div');
    downButton.className = 'map-button';
    downButton.textContent = '↓';
    downButton.addEventListener('click', () => this._changeLevel(-1));
    levelControls.appendChild(downButton);
    
    canvasWrapper.appendChild(levelControls);
    
    // Create map legend
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    
    const legendItems = [
      { color: this.settings.colors.player.getStyle(), label: 'You' },
      { color: this.settings.colors.objective.getStyle(), label: 'Objectives' },
      { color: this.settings.colors.poi.getStyle(), label: 'Points of Interest' },
      { color: this.settings.colors.anomaly.getStyle(), label: 'Quantum Anomalies' }
    ];
    
    legendItems.forEach(item => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      
      const colorBox = document.createElement('div');
      colorBox.className = 'legend-color';
      colorBox.style.backgroundColor = item.color;
      
      const label = document.createElement('div');
      label.textContent = item.label;
      
      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });
    
    canvasWrapper.appendChild(legend);
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Mouse events for interaction
    this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this));
    
    // Window resize
    window.addEventListener('resize', this._onWindowResize.bind(this));
    
    // Keyboard events
    window.addEventListener('keydown', (event) => {
      if (this.isOpen) {
        if (event.key === 'Escape') {
          this.closeMap();
        } else if (event.key === 'm') {
          this.closeMap();
        }
      }
    });
  }
  
  /**
   * Handle mouse down
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _onMouseDown(event) {
    if (!this.isOpen) return;
    
    // Check if right mouse button (rotation)
    if (event.button === 2) {
      this.isRotating = true;
    }
    // Check if left mouse button (selection or panning)
    else if (event.button === 0) {
      // Check for selection
      this._checkSelection(event);
      
      // Start dragging if not on a selectable object
      if (!this.selected) {
        this.isDragging = true;
      }
    }
    
    this.lastMousePosition.x = event.clientX;
    this.lastMousePosition.y = event.clientY;
    
    // Prevent default to avoid text selection
    event.preventDefault();
  }
  
  /**
   * Handle mouse move
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _onMouseMove(event) {
    if (!this.isOpen) return;
    
    // Update mouse position for raycasting
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Check for hover (only if not dragging or rotating)
    if (!this.isDragging && !this.isRotating) {
      this._checkHover();
    }
    
    // Handle rotation
    if (this.isRotating) {
      const deltaX = event.clientX - this.lastMousePosition.x;
      const deltaY = event.clientY - this.lastMousePosition.y;
      
      // Rotate the camera around the center
      const rotationSpeed = 0.01;
      this._rotateCamera(deltaX * rotationSpeed, deltaY * rotationSpeed);
    }
    
    // Handle panning
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMousePosition.x;
      const deltaY = event.clientY - this.lastMousePosition.y;
      
      // Pan the camera
      const panSpeed = 0.02;
      this._panCamera(deltaX * panSpeed, deltaY * panSpeed);
    }
    
    this.lastMousePosition.x = event.clientX;
    this.lastMousePosition.y = event.clientY;
  }
  
  /**
   * Handle mouse up
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _onMouseUp(event) {
    this.isRotating = false;
    this.isDragging = false;
  }
  
  /**
   * Handle mouse wheel
   * @param {WheelEvent} event - Wheel event
   * @private
   */
  _onMouseWheel(event) {
    if (!this.isOpen) return;
    
    // Zoom the camera
    const zoomDelta = event.deltaY * 0.001;
    this._zoomMap(zoomDelta);
    
    // Prevent default to avoid page scrolling
    event.preventDefault();
  }
  
  /**
   * Handle window resize
   * @private
   */
  _onWindowResize() {
    if (!this.isOpen) return;
    
    // Update camera aspect ratio
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer and composer
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.composer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
  
  /**
   * Zoom the map
   * @param {number} amount - Amount to zoom (positive for zoom in, negative for zoom out)
   * @private
   */
  _zoomMap(amount) {
    // Calculate new zoom level
    this.targetZoomLevel = Math.max(0.5, Math.min(2.5, this.targetZoomLevel - amount));
  }
  
  /**
   * Reset map view
   * @private
   */
  _resetMapView() {
    // Reset camera position and rotation
    this.camera.position.set(0, 15, 15);
    this.camera.lookAt(0, 0, 0);
    
    // Reset zoom
    this.targetZoomLevel = 1.0;
    this.zoomLevel = 1.0;
  }
  
  /**
   * Rotate the camera
   * @param {number} deltaX - X rotation amount
   * @param {number} deltaY - Y rotation amount
   * @private
   */
  _rotateCamera(deltaX, deltaY) {
    // Get camera position relative to center
    const offset = this.camera.position.clone().sub(new Vector3(0, 0, 0));
    
    // Calculate rotation around Y axis (horizontal)
    const theta = Math.atan2(offset.x, offset.z);
    const phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
    
    // Apply rotation
    const newTheta = theta - deltaX;
    const newPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, phi + deltaY));
    
    // Convert back to Cartesian coordinates
    const radius = offset.length();
    offset.x = radius * Math.sin(newPhi) * Math.sin(newTheta);
    offset.z = radius * Math.sin(newPhi) * Math.cos(newTheta);
    offset.y = radius * Math.cos(newPhi);
    
    // Update camera position
    this.camera.position.copy(offset);
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Pan the camera
   * @param {number} deltaX - X pan amount
   * @param {number} deltaY - Y pan amount
   * @private
   */
  _panCamera(deltaX, deltaY) {
    // Calculate camera right and up vectors
    const right = new Vector3();
    const up = new Vector3(0, 1, 0);
    right.crossVectors(this.camera.up, this.camera.getWorldDirection(new Vector3()));
    right.normalize();
    
    // Move camera
    this.camera.position.addScaledVector(right, -deltaX * this.zoomLevel * 10);
    this.camera.position.addScaledVector(up, deltaY * this.zoomLevel * 10);
  }
  
  /**
   * Change level
   * @param {number} direction - Direction to change (1 for up, -1 for down)
   * @private
   */
  _changeLevel(direction) {
    const newLevel = this.mapData.currentLevel + direction;
    
    // Check if level exists
    if (newLevel >= 0 && newLevel < this.mapData.levels.length) {
      // Hide current level
      if (this.mapObjects.levels[this.mapData.currentLevel]) {
        this.mapObjects.levels[this.mapData.currentLevel].visible = false;
      }
      
      // Update current level
      this.mapData.currentLevel = newLevel;
      
      // Show new level
      if (this.mapObjects.levels[newLevel]) {
        this.mapObjects.levels[newLevel].visible = true;
      }
      
      // Update level indicator
      this.levelIndicator.textContent = `Level ${newLevel + 1}`;
      
      // Update markers visibility
      this._updateMarkersVisibility();
      
      // Trigger callback
      if (this.callbacks.onLevelChange) {
        this.callbacks.onLevelChange(newLevel);
      }
    }
  }
  
  /**
   * Check hover interaction
   * @private
   */
  _checkHover() {
    // Cast ray from mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Create a list of all interactive objects
    const interactiveObjects = [];
    
    // Add objectives
    this.mapObjects.objectives.forEach(objective => {
      if (objective.visible) {
        interactiveObjects.push(objective);
      }
    });
    
    // Add points of interest
    this.mapObjects.pointsOfInterest.forEach(poi => {
      if (poi.visible) {
        interactiveObjects.push(poi);
      }
    });
    
    // Add anomalies
    this.mapObjects.anomalies.forEach(anomaly => {
      if (anomaly.visible) {
        interactiveObjects.push(anomaly);
      }
    });
    
    // Check for intersections
    const intersects = this.raycaster.intersectObjects(interactiveObjects);
    
    // Handle hover
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;
      
      // If hovering a new object
      if (this.hovered !== hoveredObject) {
        // Clear previous hover
        if (this.hovered) {
          this.outlinePass.selectedObjects = [];
        }
        
        // Set new hover
        this.hovered = hoveredObject;
        this.outlinePass.selectedObjects = [this.hovered];
        
        // Update info panel
        this._updateInfoPanel(this.hovered);
      }
    } else {
      // Clear hover if not intersecting
      if (this.hovered) {
        this.hovered = null;
        this.outlinePass.selectedObjects = [];
        
        // Hide info panel
        this.infoPanel.classList.remove('visible');
      }
    }
  }
  
  /**
   * Check selection interaction
   * @param {MouseEvent} event - Mouse event
   * @private
   */
  _checkSelection(event) {
    // Use the current hover object as the selection
    if (this.hovered) {
      this.selected = this.hovered;
      
      // Trigger callback
      if (this.callbacks.onPointSelected) {
        const userData = this.selected.userData;
        this.callbacks.onPointSelected(userData.type, userData.id, userData.data);
      }
    } else {
      this.selected = null;
    }
  }
  
  /**
   * Update info panel for hovered object
   * @param {THREE.Object3D} object - Hovered object
   * @private
   */
  _updateInfoPanel(object) {
    if (!object || !object.userData) return;
    
    const userData = object.userData;
    let title, description, actions = [];
    
    // Format based on type
    switch (userData.type) {
      case 'objective':
        const objective = this.mapData.objectives.get(userData.id);
        title = objective.title || 'Mission Objective';
        description = objective.description || '';
        actions.push({
          label: 'Set Waypoint',
          action: () => this._setWaypoint(userData.id, 'objective')
        });
        break;
        
      case 'poi':
        const poi = this.mapData.pointsOfInterest.get(userData.id);
        title = poi.title || 'Point of Interest';
        description = poi.description || '';
        if (poi.actions) {
          actions = poi.actions.map(action => ({
            label: action.label,
            action: () => this._triggerPointAction(userData.id, action.type)
          }));
        }
        actions.push({
          label: 'Set Waypoint',
          action: () => this._setWaypoint(userData.id, 'poi')
        });
        break;
        
      case 'anomaly':
        const anomaly = this.mapData.anomalies.get(userData.id);
        title = anomaly.title || 'Quantum Anomaly';
        description = anomaly.description || 'Unknown quantum signature detected.';
        actions.push({
          label: 'Investigate',
          action: () => this._setWaypoint(userData.id, 'anomaly')
        });
        break;
        
      default:
        return;
    }
    
    // Update info panel content
    this.infoPanel.innerHTML = `
      <div class="info-title">${title}</div>
      <div class="info-description">${description}</div>
      ${actions.map(action => `
        <div class="info-action" data-id="${userData.id}" data-type="${action.label}">${action.label}</div>
      `).join('')}
    `;
    
    // Add event listeners to action buttons
    const actionButtons = this.infoPanel.querySelectorAll('.info-action');
    actionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const type = button.getAttribute('data-type');
        const action = actions.find(a => a.label === type);
        if (action) {
          action.action();
        }
      });
    });
    
    // Show panel
    this.infoPanel.classList.add('visible');
  }
  
  /**
   * Set waypoint for navigation
   * @param {string} id - ID of the target
   * @param {string} type - Type of target ('objective', 'poi', 'anomaly')
   * @private
   */
  _setWaypoint(id, type) {
    if (this.callbacks.onSetWaypoint) {
      let data;
      
      switch (type) {
        case 'objective':
          data = this.mapData.objectives.get(id);
          break;
        case 'poi':
          data = this.mapData.pointsOfInterest.get(id);
          break;
        case 'anomaly':
          data = this.mapData.anomalies.get(id);
          break;
      }
      
      if (data) {
        this.callbacks.onSetWaypoint(id, type, data);
        
        // Show confirmation
        this._showWaypointConfirmation(data.title || 'Location');
        
        // Close map
        setTimeout(() => {
          this.closeMap();
        }, 500);
      }
    }
  }
  
  /**
   * Show waypoint confirmation
   * @param {string} locationName - Name of the waypoint location
   * @private
   */
  _showWaypointConfirmation(locationName) {
    // Create confirmation element
    const confirmation = document.createElement('div');
    confirmation.style.position = 'absolute';
    confirmation.style.top = '50%';
    confirmation.style.left = '50%';
    confirmation.style.transform = 'translate(-50%, -50%)';
    confirmation.style.background = 'rgba(0, 255, 255, 0.2)';
    confirmation.style.border = '1px solid ' + this.settings.colors.highlight.getStyle();
    confirmation.style.color = 'white';
    confirmation.style.padding = '10px 20px';
    confirmation.style.fontFamily = 'Rajdhani, sans-serif';
    confirmation.style.borderRadius = '5px';
    confirmation.style.pointerEvents = 'none';
    confirmation.style.zIndex = '2000';
    confirmation.textContent = `Waypoint set to: ${locationName}`;
    
    // Add to canvas wrapper
    const canvasWrapper = this.container.querySelector('.map-canvas-wrapper');
    canvasWrapper.appendChild(confirmation);
    
    // Remove after a delay
    setTimeout(() => {
      canvasWrapper.removeChild(confirmation);
    }, 2000);
  }
  
  /**
   * Trigger action for a point
   * @param {string} id - ID of the point
   * @param {string} actionType - Type of action
   * @private
   */
  _triggerPointAction(id, actionType) {
    // Implementation depends on the game needs
    console.log(`Triggered action ${actionType} for point ${id}`);
  }
  
  /**
   * Update visibility of markers based on current level
   * @private
   */
  _updateMarkersVisibility() {
    const currentLevel = this.mapData.currentLevel;
    
    // Update objectives
    this.mapObjects.objectives.forEach((object, id) => {
      const objective = this.mapData.objectives.get(id);
      object.visible = objective.level === currentLevel;
    });
    
    // Update points of interest
    this.mapObjects.pointsOfInterest.forEach((object, id) => {
      const poi = this.mapData.pointsOfInterest.get(id);
      object.visible = poi.level === currentLevel;
    });
    
    // Update anomalies
    this.mapObjects.anomalies.forEach((object, id) => {
      const anomaly = this.mapData.anomalies.get(id);
      object.visible = anomaly.level === currentLevel;
    });
    
    // Always show player if on current level
    if (this.mapObjects.player) {
      this.mapObjects.player.visible = this.mapData.playerPosition.level === currentLevel;
    }
  }
  
  /**
   * Create a marker object
   * @param {Vector3} position - Position
   * @param {Color} color - Color
   * @param {string} type - Type of marker
   * @param {Object} options - Additional options
   * @returns {THREE.Group} Marker group
   * @private
   */
  _createMarker(position, color, type, options = {}) {
    const markerGroup = new THREE.Group();
    
    // Create base marker (sphere)
    const markerGeometry = new THREE.SphereGeometry(this.settings.markerSize, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    markerGroup.add(marker);
    
    // Create glow effect
    const glowGeometry = new THREE.SphereGeometry(this.settings.markerSize * 1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    markerGroup.add(glow);
    
    // Set position
    markerGroup.position.copy(position);
    
    // Store animation data
    markerGroup.userData = {
      type: type,
      id: options.id,
      data: options.data,
      baseScale: 1.0,
      time: Math.random() * Math.PI * 2, // Random start time for animation
      glow: glow,
      marker: marker
    };
    
    return markerGroup;
  }
  
  /**
   * Create a player marker
   * @param {Vector3} position - Player position
   * @param {number} rotation - Player rotation
   * @returns {THREE.Group} Player marker group
   * @private
   */
  _createPlayerMarker(position, rotation) {
    const playerGroup = new THREE.Group();
    
    // Create player body (cone pointing in direction)
    const coneGeometry = new THREE.ConeGeometry(this.settings.playerSize, this.settings.playerSize * 2, 8);
    coneGeometry.rotateX(Math.PI / 2); // Orient cone to point forward
    
    const coneMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.player,
      transparent: true,
      opacity: 0.8
    });
    
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    playerGroup.add(cone);
    
    // Create glow effect
    const glowGeometry = new THREE.SphereGeometry(this.settings.playerSize * 1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.player,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    playerGroup.add(glow);
    
    // Set position and rotation
    playerGroup.position.copy(position);
    playerGroup.rotation.y = rotation;
    
    // Store animation data
    playerGroup.userData = {
      type: 'player',
      time: 0,
      glow: glow,
      cone: cone
    };
    
    return playerGroup;
  }
  
  /**
   * Animate markers
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _animateMarkers(deltaTime) {
    // Animate player marker
    if (this.mapObjects.player) {
      const playerData = this.mapObjects.player.userData;
      playerData.time += deltaTime;
      
      // Pulse effect
      const pulse = Math.sin(playerData.time * 3) * 0.1 + 1.1;
      playerData.glow.scale.set(pulse, pulse, pulse);
      
      // Update player position and rotation if changed
      if (this.mapData.playerPosition.x !== this.mapObjects.player.position.x ||
          this.mapData.playerPosition.y !== this.mapObjects.player.position.y ||
          this.mapData.playerPosition.z !== this.mapObjects.player.position.z) {
        
        this.mapObjects.player.position.copy(this.mapData.playerPosition);
      }
      
      if (this.mapData.playerRotation !== this.mapObjects.player.rotation.y) {
        this.mapObjects.player.rotation.y = this.mapData.playerRotation;
      }
    }
    
    // Animate objective markers
    this.mapObjects.objectives.forEach(objective => {
      const data = objective.userData;
      data.time += deltaTime;
      
      // Pulse effect
      const pulse = Math.sin(data.time * 2) * 0.2 + 1.0;
      data.glow.scale.set(pulse, pulse, pulse);
    });
    
    // Animate anomaly markers (more dramatic)
    this.mapObjects.anomalies.forEach(anomaly => {
      const data = anomaly.userData;
      data.time += deltaTime;
      
      // Pulse effect
      const pulse = Math.sin(data.time * 4) * 0.3 + 1.0;
      data.glow.scale.set(pulse, pulse, pulse);
      
      // Rotation
      anomaly.rotation.y += deltaTime * 2;
    });
    
    // POI markers (subtle)
    this.mapObjects.pointsOfInterest.forEach(poi => {
      const data = poi.userData;
      data.time += deltaTime;
      
      // Subtle pulse
      const pulse = Math.sin(data.time * 1.5) * 0.1 + 1.0;
      data.glow.scale.set(pulse, pulse, pulse);
    });
  }
  
  /**
   * Update smooth camera zoom
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateCameraZoom(deltaTime) {
    // Smooth zoom towards target
    if (this.zoomLevel !== this.targetZoomLevel) {
      this.zoomLevel += (this.targetZoomLevel - this.zoomLevel) * deltaTime * 5;
      
      // Apply zoom to camera (adjust frustum)
      if (this.camera.isOrthographicCamera) {
        this.camera.zoom = this.zoomLevel;
        this.camera.updateProjectionMatrix();
      } else {
        // For perspective camera, move closer/further
        const direction = new Vector3();
        this.camera.getWorldDirection(direction);
        
        // Move along view direction
        const distance = this.camera.position.length();
        const targetDistance = distance / this.zoomLevel;
        
        this.camera.position.setLength(targetDistance);
      }
    }
  }
  
  /**
   * Load map data
   * @param {Object} mapData - Map data
   */
  loadMapData(mapData) {
    this.mapData = mapData;
    
    // Clear existing objects
    this._clearMapObjects();
    
    // Create map levels
    this._createMapLevels();
    
    // Create markers
    this._createMarkers();
    
    // Update level indicator
    this.levelIndicator.textContent = `Level ${this.mapData.currentLevel + 1}`;
    
    // Update visibility
    this._updateMarkersVisibility();
  }
  
  /**
   * Clear existing map objects
   * @private
   */
  _clearMapObjects() {
    // Remove levels
    this.mapObjects.levels.forEach(level => {
      this.scene.remove(level);
      level.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    });
    
    // Remove player marker
    if (this.mapObjects.player) {
      this.scene.remove(this.mapObjects.player);
      this.mapObjects.player = null;
    }
    
    // Remove objectives
    this.mapObjects.objectives.forEach(obj => {
      this.scene.remove(obj);
    });
    
    // Remove POIs
    this.mapObjects.pointsOfInterest.forEach(poi => {
      this.scene.remove(poi);
    });
    
    // Remove anomalies
    this.mapObjects.anomalies.forEach(anomaly => {
      this.scene.remove(anomaly);
    });
    
    // Clear collections
    this.mapObjects.levels = [];
    this.mapObjects.objectives = new Map();
    this.mapObjects.pointsOfInterest = new Map();
    this.mapObjects.anomalies = new Map();
    this.mapObjects.areas = new Map();
  }
  
  /**
   * Create map levels from data
   * @private
   */
  _createMapLevels() {
    // Create each level
    this.mapData.levels.forEach((levelData, index) => {
      const levelGroup = new THREE.Group();
      
      // Create walls
      if (levelData.walls) {
        levelData.walls.forEach(wall => {
          const wallGeometry = new THREE.BoxGeometry(
            wall.width, 
            this.settings.wallHeight,
            wall.depth
          );
          
          const wallMaterial = this.holographicMaterial.clone();
          
          const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
          wallMesh.position.set(wall.x, wall.y, wall.z);
          
          if (wall.rotation) {
            wallMesh.rotation.y = wall.rotation;
          }
          
          levelGroup.add(wallMesh);
        });
      }
      
      // Create floors
      if (levelData.floors) {
        levelData.floors.forEach(floor => {
          const floorGeometry = new THREE.PlaneGeometry(
            floor.width,
            floor.depth
          );
          
          const floorMaterial = this.holographicMaterial.clone();
          floorMaterial.uniforms.baseColor.value = this.settings.colors.floors;
          
          const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
          floorMesh.position.set(floor.x, floor.y, floor.z);
          floorMesh.rotation.x = -Math.PI / 2; // Horizontal plane
          
          if (floor.rotation) {
            floorMesh.rotation.z = floor.rotation;
          }
          
          levelGroup.add(floorMesh);
        });
      }
      
      // Set visibility (only current level visible)
      levelGroup.visible = index === this.mapData.currentLevel;
      
      // Add to scene
      this.scene.add(levelGroup);
      
      // Store reference
      this.mapObjects.levels[index] = levelGroup;
    });
  }
  
  /**
   * Create markers from map data
   * @private
   */
  _createMarkers() {
    // Create player marker
    this.mapObjects.player = this._createPlayerMarker(
      this.mapData.playerPosition,
      this.mapData.playerRotation
    );
    this.scene.add(this.mapObjects.player);
    
    // Create objective markers
    this.mapData.objectives.forEach((objective, id) => {
      const marker = this._createMarker(
        objective.position,
        this.settings.colors.objective,
        'objective',
        { id, data: objective }
      );
      
      this.scene.add(marker);
      this.mapObjects.objectives.set(id, marker);
    });
    
    // Create POI markers
    this.mapData.pointsOfInterest.forEach((poi, id) => {
      const marker = this._createMarker(
        poi.position,
        this.settings.colors.poi,
        'poi',
        { id, data: poi }
      );
      
      this.scene.add(marker);
      this.mapObjects.pointsOfInterest.set(id, marker);
    });
    
    // Create anomaly markers
    this.mapData.anomalies.forEach((anomaly, id) => {
      const marker = this._createMarker(
        anomaly.position,
        this.settings.colors.anomaly,
        'anomaly',
        { id, data: anomaly }
      );
      
      this.scene.add(marker);
      this.mapObjects.anomalies.set(id, marker);
    });
  }
  
  /**
   * Open the map
   */
  openMap() {
    if (this.isOpen) return;
    
    // Show the container
    this.container.classList.add('open');
    this.isOpen = true;
    
    // Reset view
    this._resetMapView();
    
    // Start animation loop
    this._animate();
    
    // Trigger callback
    if (this.callbacks.onMapOpen) {
      this.callbacks.onMapOpen();
    }
    
    // Prevent right-click context menu
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  
  /**
   * Close the map
   */
  closeMap() {
    if (!this.isOpen) return;
    
    // Hide the container
    this.container.classList.remove('open');
    this.isOpen = false;
    
    // Clear selection
    this.selected = null;
    this.hovered = null;
    this.outlinePass.selectedObjects = [];
    
    // Hide info panel
    this.infoPanel.classList.remove('visible');
    
    // Stop animation loop (handled by isOpen flag)
    
    // Trigger callback
    if (this.callbacks.onMapClose) {
      this.callbacks.onMapClose();
    }
  }
  
  /**
   * Toggle the map
   */
  toggleMap() {
    if (this.isOpen) {
      this.closeMap();
    } else {
      this.openMap();
    }
  }
  
  /**
   * Update player position on the map
   * @param {Vector3} position - Player position
   * @param {number} rotation - Player rotation in radians
   * @param {number} level - Current level
   */
  updatePlayerPosition(position, rotation, level) {
    // Update data
    this.mapData.playerPosition = { 
      x: position.x * this.settings.scale, 
      y: position.y * this.settings.scale, 
      z: position.z * this.settings.scale,
      level: level 
    };
    this.mapData.playerRotation = rotation;
    
    // Update object (actual update happens in animation)
    if (this.mapObjects.player) {
      this.mapObjects.player.visible = level === this.mapData.currentLevel;
    }
  }
  
  /**
   * Add or update an objective
   * @param {string} id - Objective ID
   * @param {Object} data - Objective data
   */
  updateObjective(id, data) {
    // Convert position to map scale
    if (data.position) {
      data.position = {
        x: data.position.x * this.settings.scale,
        y: data.position.y * this.settings.scale,
        z: data.position.z * this.settings.scale
      };
    }
    
    // Update or add to map data
    if (this.mapData.objectives.has(id)) {
      const existing = this.mapData.objectives.get(id);
      this.mapData.objectives.set(id, { ...existing, ...data });
    } else {
      this.mapData.objectives.set(id, data);
    }
    
    // Update or create marker
    if (this.mapObjects.objectives.has(id)) {
      const marker = this.mapObjects.objectives.get(id);
      
      // Update position if provided
      if (data.position) {
        marker.position.set(data.position.x, data.position.y, data.position.z);
      }
      
      // Update visibility
      marker.visible = data.level === this.mapData.currentLevel;
    } else if (data.position) {
      // Create new marker
      const marker = this._createMarker(
        new Vector3(data.position.x, data.position.y, data.position.z),
        this.settings.colors.objective,
        'objective',
        { id, data }
      );
      
      marker.visible = data.level === this.mapData.currentLevel;
      this.scene.add(marker);
      this.mapObjects.objectives.set(id, marker);
    }
  }
  
  /**
   * Add or update a point of interest
   * @param {string} id - POI ID
   * @param {Object} data - POI data
   */
  updatePointOfInterest(id, data) {
    // Convert position to map scale
    if (data.position) {
      data.position = {
        x: data.position.x * this.settings.scale,
        y: data.position.y * this.settings.scale,
        z: data.position.z * this.settings.scale
      };
    }
    
    // Update or add to map data
    if (this.mapData.pointsOfInterest.has(id)) {
      const existing = this.mapData.pointsOfInterest.get(id);
      this.mapData.pointsOfInterest.set(id, { ...existing, ...data });
    } else {
      this.mapData.pointsOfInterest.set(id, data);
    }
    
    // Update or create marker
    if (this.mapObjects.pointsOfInterest.has(id)) {
      const marker = this.mapObjects.pointsOfInterest.get(id);
      
      // Update position if provided
      if (data.position) {
        marker.position.set(data.position.x, data.position.y, data.position.z);
      }
      
      // Update visibility
      marker.visible = data.level === this.mapData.currentLevel;
    } else if (data.position) {
      // Create new marker
      const marker = this._createMarker(
        new Vector3(data.position.x, data.position.y, data.position.z),
        this.settings.colors.poi,
        'poi',
        { id, data }
      );
      
      marker.visible = data.level === this.mapData.currentLevel;
      this.scene.add(marker);
      this.mapObjects.pointsOfInterest.set(id, marker);
    }
  }
  
  /**
   * Add or update an anomaly
   * @param {string} id - Anomaly ID
   * @param {Object} data - Anomaly data
   */
  updateAnomaly(id, data) {
    // Convert position to map scale
    if (data.position) {
      data.position = {
        x: data.position.x * this.settings.scale,
        y: data.position.y * this.settings.scale,
        z: data.position.z * this.settings.scale
      };
    }
    
    // Update or add to map data
    if (this.mapData.anomalies.has(id)) {
      const existing = this.mapData.anomalies.get(id);
      this.mapData.anomalies.set(id, { ...existing, ...data });
    } else {
      this.mapData.anomalies.set(id, data);
    }
    
    // Update or create marker
    if (this.mapObjects.anomalies.has(id)) {
      const marker = this.mapObjects.anomalies.get(id);
      
      // Update position if provided
      if (data.position) {
        marker.position.set(data.position.x, data.position.y, data.position.z);
      }
      
      // Update visibility
      marker.visible = data.level === this.mapData.currentLevel;
    } else if (data.position) {
      // Create new marker
      const marker = this._createMarker(
        new Vector3(data.position.x, data.position.y, data.position.z),
        this.settings.colors.anomaly,
        'anomaly',
        { id, data }
      );
      
      marker.visible = data.level === this.mapData.currentLevel;
      this.scene.add(marker);
      this.mapObjects.anomalies.set(id, marker);
    }
  }
  
  /**
   * Remove an objective
   * @param {string} id - Objective ID
   */
  removeObjective(id) {
    // Remove from data
    this.mapData.objectives.delete(id);
    
    // Remove marker
    if (this.mapObjects.objectives.has(id)) {
      const marker = this.mapObjects.objectives.get(id);
      this.scene.remove(marker);
      
      // Dispose geometry and materials
      marker.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      
      this.mapObjects.objectives.delete(id);
    }
  }
  
  /**
   * Set a callback function
   * @param {string} name - Callback name
   * @param {Function} callback - Callback function
   */
  setCallback(name, callback) {
    if (this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name] = callback;
    }
  }
  
  /**
   * Main animation loop
   * @private
   */
  _animate() {
    if (!this.isOpen) return;
    
    requestAnimationFrame(this._animate.bind(this));
    
    const deltaTime = this.clock.getDelta();
    
    // Update holographic material time
    this.scene.traverse(obj => {
      if (obj.material && obj.material.uniforms && obj.material.uniforms.time) {
        obj.material.uniforms.time.value += deltaTime;
      }
    });
    
    // Update markers animation
    this._animateMarkers(deltaTime);
    
    // Update camera zoom
    this._updateCameraZoom(deltaTime);
    
    // Render scene with post-processing
    this.composer.render();
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Clean up Three.js resources
    this._clearMapObjects();
    
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('wheel', this._onMouseWheel);
    window.removeEventListener('resize', this._onWindowResize);
    
    // Dispose renderer and composer
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
    }
    
    // Remove DOM elements
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default InteractiveMap3D;