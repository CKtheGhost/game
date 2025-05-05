import * as THREE from 'three';
import { Vector3, Color, MathUtils } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

/**
 * QuantumMap3D - Interactive 3D map for level navigation
 * 
 * Features:
 * 1. Interactive 3D visualization of the game world
 * 2. Navigation and waypoint system
 * 3. Level progress tracking
 * 4. Objective markers
 * 5. Anomaly detection and visualization
 * 6. Zoom and pan controls
 */
class QuantumMap3D {
  constructor() {
    // DOM elements
    this.container = null;
    this.canvas = null;
    this.mapInfo = null;
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.raycaster = null;
    this.clock = null;
    
    // Map data
    this.levels = [];
    this.currentLevel = 0;
    this.mapObjects = new Map(); // key: objectId, value: {mesh, type, data}
    this.playerMarker = null;
    this.highlightedObject = null;
    
    // Camera controls
    this.cameraTarget = new Vector3(0, 0, 0);
    this.cameraDistance = 20;
    this.cameraRotation = { x: Math.PI / 4, y: 0 };
    
    // Navigation
    this.waypoints = [];
    this.selectedWaypoint = null;
    
    // Interaction state
    this.isVisible = false;
    this.isDragging = false;
    this.mouse = new THREE.Vector2();
    this.dragStart = new THREE.Vector2();
    this.dragDelta = new THREE.Vector2();
    
    // Animation properties
    this.animating = false;
    this.animationTime = 0;
    this.animationTarget = null;
    
    // UI options
    this.settings = {
      colors: {
        background: new Color(0x000819),
        grid: new Color(0x113366),
        player: new Color(0x00ffff),
        objective: new Color(0xffaa00),
        anomaly: new Color(0xff00ff),
        path: new Color(0x0088ff),
        highlight: new Color(0xffffff),
        completed: new Color(0x00ff88)
      },
      mapScale: 1.0,     // Overall map scale
      levelHeight: 5.0,  // Height between levels
      showGrid: true,
      autoRotate: false,
      showAnomalies: true,
      fogDensity: 0.02,
      bloomIntensity: 0.7
    };
    
    // Initialize the map system
    this._initialize();
  }
  
  /**
   * Initialize the map system
   * @private
   */
  _initialize() {
    // Create DOM elements
    this._createDOMElements();
    
    // Create Three.js components
    this._createScene();
    this._createCamera();
    this._createRenderer();
    this._createLighting();
    this._createEffects();
    
    // Create base map elements
    this._createGrid();
    this._createPlayerMarker();
    
    // Initialize clock for animations
    this.clock = new THREE.Clock();
    
    // Set up raycaster for interaction
    this.raycaster = new THREE.Raycaster();
    
    // Set up event listeners
    this._setupEventListeners();
  }
  
  /**
   * Create DOM elements for the map system
   * @private
   */
  _createDOMElements() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'quantum-map-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 1000;
      font-family: 'Rajdhani', 'Arial', sans-serif;
      color: #00ffff;
      user-select: none;
    `;
    
    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'map-canvas-container';
    canvasContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 80%;
      border: 1px solid #00ffff;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `;
    
    // Create canvas for rendering
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;
    canvasContainer.appendChild(this.canvas);
    
    // Create map info panel
    this.mapInfo = document.createElement('div');
    this.mapInfo.className = 'map-info';
    this.mapInfo.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 10px;
      background: rgba(0, 10, 20, 0.7);
      border: 1px solid #00ffff;
      border-radius: 5px;
      font-size: 14px;
    `;
    this.mapInfo.innerHTML = `
      <div class="map-title">Quantum Facility Map</div>
      <div class="map-controls">
        <div>Mouse Drag: Rotate</div>
        <div>Mouse Wheel: Zoom</div>
        <div>Right Click: Set Waypoint</div>
        <div>M: Close Map</div>
      </div>
      <div class="map-location">
        <div>Current Level: <span class="level-name">Research Wing</span></div>
        <div>Exploration: <span class="exploration-percentage">35%</span></div>
      </div>
    `;
    canvasContainer.appendChild(this.mapInfo);
    
    // Create map legend
    const mapLegend = document.createElement('div');
    mapLegend.className = 'map-legend';
    mapLegend.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      padding: 10px;
      background: rgba(0, 10, 20, 0.7);
      border: 1px solid #00ffff;
      border-radius: 5px;
      font-size: 14px;
    `;
    mapLegend.innerHTML = `
      <div class="legend-title">Legend</div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #00ffff;"></span>
        <span class="legend-label">Player Location</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #ffaa00;"></span>
        <span class="legend-label">Objectives</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #ff00ff;"></span>
        <span class="legend-label">Quantum Anomalies</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #00ff88;"></span>
        <span class="legend-label">Completed Areas</span>
      </div>
    `;
    canvasContainer.appendChild(mapLegend);
    
    // Add custom styles
    const styles = document.createElement('style');
    styles.textContent = `
      .map-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      
      .map-controls {
        margin-bottom: 12px;
        font-size: 12px;
        opacity: 0.8;
      }
      
      .map-location {
        font-size: 14px;
      }
      
      .level-name, .exploration-percentage {
        color: #ffaa00;
      }
      
      .legend-title {
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
      }
      
      .legend-color {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 8px;
        border-radius: 50%;
      }
      
      .object-tooltip {
        position: absolute;
        background: rgba(0, 10, 20, 0.9);
        border: 1px solid #00ffff;
        border-radius: 3px;
        padding: 5px 10px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1010;
        transform: translate(-50%, -100%);
        margin-top: -10px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(styles);
    
    // Add to document body
    this.container.appendChild(canvasContainer);
    document.body.appendChild(this.container);
  }
  
  /**
   * Create Three.js scene
   * @private
   */
  _createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = this.settings.colors.background;
    
    // Add fog for depth
    this.scene.fog = new THREE.FogExp2(this.settings.colors.background, this.settings.fogDensity);
  }
  
  /**
   * Create camera
   * @private
   */
  _createCamera() {
    // Adjust aspect ratio based on container size
    const containerRect = this.container.getBoundingClientRect();
    const aspect = containerRect.width / containerRect.height || window.innerWidth / window.innerHeight;
    
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this._updateCameraPosition();
  }
  
  /**
   * Create renderer
   * @private
   */
  _createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    
    // Get container size
    const canvasContainer = this.canvas.parentElement;
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadow rendering
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  
  /**
   * Create lighting for the scene
   * @private
   */
  _createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);
    
    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    // Adjust shadow camera
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.far = 50;
    
    this.scene.add(directionalLight);
    
    // Add point lights for visual interest
    const pointLight1 = new THREE.PointLight(0x3366ff, 1, 20);
    pointLight1.position.set(-10, 10, -10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff66cc, 1, 20);
    pointLight2.position.set(10, 5, 10);
    this.scene.add(pointLight2);
  }
  
  /**
   * Create post-processing effects
   * @private
   */
  _createEffects() {
    // Create effect composer
    this.composer = new EffectComposer(this.renderer);
    
    // Add main render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Add bloom effect for glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.settings.bloomIntensity, // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);
    
    // Add outline pass for highlighting
    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    outlinePass.edgeStrength = a 3.0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 1.0;
    outlinePass.visibleEdgeColor.set(this.settings.colors.highlight);
    this.composer.addPass(outlinePass);
    
    // Store reference for highlighting objects
    this.outlinePass = outlinePass;
  }
  
  /**
   * Create grid for map reference
   * @private
   */
  _createGrid() {
    // Create main grid
    const gridSize = 50;
    const gridDivisions = 50;
    const grid = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      this.settings.colors.grid,
      this.settings.colors.grid.clone().multiplyScalar(0.5)
    );
    grid.position.y = 0;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    
    this.scene.add(grid);
    
    // Create level indicators (multiple floors)
    for (let i = 1; i <= 3; i++) {
      const levelGrid = new THREE.GridHelper(
        gridSize,
        gridDivisions,
        this.settings.colors.grid,
        this.settings.colors.grid.clone().multiplyScalar(0.5)
      );
      levelGrid.position.y = i * this.settings.levelHeight;
      levelGrid.material.transparent = true;
      levelGrid.material.opacity = 0.15;
      
      this.scene.add(levelGrid);
    }
    
    // Create origin marker
    const originGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const originMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.grid,
      transparent: true,
      opacity: 0.5
    });
    const originMarker = new THREE.Mesh(originGeometry, originMaterial);
    this.scene.add(originMarker);
  }
  
  /**
   * Create player marker
   * @private
   */
  _createPlayerMarker() {
    // Create marker group
    const markerGroup = new THREE.Group();
    
    // Create player icon (arrow pointing up)
    const arrowGeometry = new THREE.ConeGeometry(0.5, 1.5, 4);
    arrowGeometry.rotateX(Math.PI / 2);
    
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.player,
      transparent: true,
      opacity: 0.9
    });
    
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.y = 0.5;
    markerGroup.add(arrow);
    
    // Add ring base
    const ringGeometry = new THREE.RingGeometry(0.7, 0.9, 32);
    ringGeometry.rotateX(-Math.PI / 2);
    
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.player,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.1;
    markerGroup.add(ring);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.player,
      transparent: true,
      opacity: 0.3
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.5;
    markerGroup.add(glow);
    
    // Add to scene
    this.scene.add(markerGroup);
    
    // Store reference with animation data
    this.playerMarker = {
      group: markerGroup,
      arrow: arrow,
      ring: ring,
      glow: glow,
      position: new Vector3(0, 0, 0),
      rotation: 0,
      level: 0,
      animating: false
    };
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Mouse events for interaction
    this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
    window.addEventListener('mousemove', this._onMouseMove.bind(this));
    window.addEventListener('mouseup', this._onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this._onMouseWheel.bind(this));
    this.canvas.addEventListener('contextmenu', this._onContextMenu.bind(this));
    
    // Key events for navigation
    window.addEventListener('keydown', this._onKeyDown.bind(this));
    
    // Window resize
    window.addEventListener('resize', this._onWindowResize.bind(this));
  }
  
  /**
   * Mouse down event handler
   * @param {Event} event - Mouse event
   * @private
   */
  _onMouseDown(event) {
    if (!this.isVisible) return;
    
    if (event.button === 0) { // Left button
      this.isDragging = true;
      this.dragStart.x = event.clientX;
      this.dragStart.y = event.clientY;
      this.dragDelta.set(0, 0);
      
      this.canvas.style.cursor = 'grabbing';
    }
  }
  
  /**
   * Mouse move event handler
   * @param {Event} event - Mouse event
   * @private
   */
  _onMouseMove(event) {
    if (!this.isVisible) return;
    
    // Update normalized mouse coordinates for raycasting
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Handle drag rotation
    if (this.isDragging) {
      const dragX = event.clientX - this.dragStart.x;
      const dragY = event.clientY - this.dragStart.y;
      
      this.dragDelta.x = dragX;
      this.dragDelta.y = dragY;
      
      // Update camera rotation
      this.cameraRotation.y -= dragX * 0.01;
      this.cameraRotation.x = MathUtils.clamp(
        this.cameraRotation.x - dragY * 0.01,
        0.1,
        Math.PI / 2
      );
      
      this._updateCameraPosition();
      
      // Reset drag start for next move
      this.dragStart.x = event.clientX;
      this.dragStart.y = event.clientY;
    } else {
      // Update hover effects
      this._updateHover();
    }
  }
  
  /**
   * Mouse up event handler
   * @param {Event} event - Mouse event
   * @private
   */
  _onMouseUp(event) {
    if (!this.isVisible) return;
    
    if (event.button === 0 && this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
      
      // Check for click (small drag distance)
      if (Math.abs(this.dragDelta.x) < 5 && Math.abs(this.dragDelta.y) < 5) {
        this._handleClick();
      }
    }
  }
  
  /**
   * Mouse wheel event handler
   * @param {Event} event - Mouse wheel event
   * @private
   */
  _onMouseWheel(event) {
    if (!this.isVisible) return;
    
    event.preventDefault();
    
    // Adjust camera distance
    const zoomSpeed = 1.0;
    const delta = Math.sign(event.deltaY) * zoomSpeed;
    
    this.cameraDistance = MathUtils.clamp(
      this.cameraDistance + delta,
      5,  // Min distance
      50  // Max distance
    );
    
    this._updateCameraPosition();
  }
  
  /**
   * Context menu event handler (right click)
   * @param {Event} event - Context menu event
   * @private
   */
  _onContextMenu(event) {
    if (!this.isVisible) return;
    
    event.preventDefault();
    
    // Set waypoint at clicked position
    this._setWaypoint();
  }
  
  /**
   * Key down event handler
   * @param {Event} event - Key event
   * @private
   */
  _onKeyDown(event) {
    if (event.key.toLowerCase() === 'm') {
      this.toggle(); // Toggle map visibility
    }
  }
  
  /**
   * Window resize event handler
   * @private
   */
  _onWindowResize() {
    if (!this.isVisible) return;
    
    // Update camera aspect ratio
    const canvasContainer = this.canvas.parentElement;
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }
  
  /**
   * Handle click on map objects
   * @private
   */
  _handleClick() {
    // Perform raycasting to detect clicked objects
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Get all interactive map objects
    const interactiveObjects = [];
    this.mapObjects.forEach(obj => {
      if (obj.interactive) {
        interactiveObjects.push(obj.mesh);
      }
    });
    
    // Check for intersections
    const intersects = this.raycaster.intersectObjects(interactiveObjects, true);
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      // Find the map object
      let mapObject = null;
      for (const [id, obj] of this.mapObjects.entries()) {
        if (obj.mesh === intersectedObject || obj.mesh.children.includes(intersectedObject)) {
          mapObject = obj;
          break;
        }
      }
      
      if (mapObject) {
        // Handle click based on object type
        this._selectMapObject(mapObject);
      }
    }
  }
  
  /**
   * Update hover effects
   * @private
   */
  _updateHover() {
    // Perform raycasting to detect hovered objects
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Get all interactive map objects
    const interactiveObjects = [];
    this.mapObjects.forEach(obj => {
      if (obj.interactive) {
        interactiveObjects.push(obj.mesh);
      }
    });
    
    // Check for intersections
    const intersects = this.raycaster.intersectObjects(interactiveObjects, true);
    
    // Clear current highlight
    this.outlinePass.selectedObjects = [];
    this._hideTooltip();
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      // Find the map object
      let mapObject = null;
      for (const [id, obj] of this.mapObjects.entries()) {
        if (obj.mesh === intersectedObject || obj.mesh.children.includes(intersectedObject)) {
          mapObject = obj;
          break;
        }
      }
      
      if (mapObject) {
        // Highlight the object
        this.outlinePass.selectedObjects = [mapObject.mesh];
        
        // Show tooltip with info
        this._showTooltip(mapObject, intersects[0].point);
      }
    }
  }
  
  /**
   * Show tooltip for map object
   * @param {Object} mapObject - Map object data
   * @param {Vector3} position - World position
   * @private
   */
  _showTooltip(mapObject, position) {
    // Create tooltip if it doesn't exist
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'object-tooltip';
      this.container.appendChild(this.tooltip);
    }
    
    // Project position to screen coordinates
    const screenPosition = position.clone().project(this.camera);
    
    // Convert to CSS coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenPosition.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (screenPosition.y * -0.5 + 0.5) * rect.height + rect.top;
    
    // Position tooltip
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
    
    // Set tooltip content
    let tooltipContent = mapObject.name || 'Unknown';
    
    // Add additional info based on object type
    switch (mapObject.type) {
      case 'room':
        tooltipContent += `<br>Area: ${mapObject.data.area || 'Unknown'}`;
        if (mapObject.data.explored) {
          tooltipContent += '<br>Status: Explored';
        }
        break;
      
      case 'objective':
        tooltipContent += '<br>Objective';
        if (mapObject.data.completed) {
          tooltipContent += ' (Completed)';
        }
        break;
      
      case 'anomaly':
        tooltipContent += `<br>Anomaly Type: ${mapObject.data.anomalyType || 'Unknown'}`;
        tooltipContent += `<br>Intensity: ${mapObject.data.intensity || 'Low'}`;
        break;
        
      case 'waypoint':
        tooltipContent = 'Navigation Waypoint';
        break;
    }
    
    this.tooltip.innerHTML = tooltipContent;
    this.tooltip.style.display = 'block';
  }
  
  /**
   * Hide tooltip
   * @private
   */
  _hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
  
  /**
   * Update camera position based on current settings
   * @private
   */
  _updateCameraPosition() {
    // Calculate camera position based on target, distance, and rotation
    const spherical = new THREE.Spherical(
      this.cameraDistance,
      this.cameraRotation.x,
      this.cameraRotation.y
    );
    
    const cameraPosition = new THREE.Vector3();
    cameraPosition.setFromSpherical(spherical);
    cameraPosition.add(this.cameraTarget);
    
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(this.cameraTarget);
  }
  
  /**
   * Select a map object
   * @param {Object} mapObject - Map object data
   * @private
   */
  _selectMapObject(mapObject) {
    // Handle selection based on object type
    if (mapObject.type === 'room') {
      // Focus camera on this room
      this._focusOn(mapObject.mesh.position);
    }
    else if (mapObject.type === 'objective') {
      // Set as waypoint
      this._createWaypoint(mapObject.mesh.position, {
        color: this.settings.colors.objective,
        label: 'Objective: ' + mapObject.name
      });
    }
    else if (mapObject.type === 'anomaly') {
      // Focus on anomaly
      this._focusOn(mapObject.mesh.position);
    }
    else if (mapObject.type === 'waypoint') {
      // Remove this waypoint
      this._removeWaypoint(mapObject);
    }
  }
  
  /**
   * Focus camera on a position
   * @param {Vector3} position - Target position
   * @private
   */
  _focusOn(position) {
    // Start animation to focus on position
    this.animating = true;
    this.animationTime = 0;
    this.animationTarget = {
      position: position.clone(),
      currentTarget: this.cameraTarget.clone()
    };
  }
  
  /**
   * Set waypoint at the current mouse position
   * @private
   */
  _setWaypoint() {
    // Perform raycasting to find position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Raycast against floor planes
    const floorPlanes = [];
    for (let level = 0; level <= 3; level++) {
      const plane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0), // Normal
        -level * this.settings.levelHeight // Constant
      );
      floorPlanes.push(plane);
    }
    
    // Find closest intersection
    let closestIntersection = null;
    let closestDistance = Infinity;
    
    for (const plane of floorPlanes) {
      const intersection = new THREE.Vector3();
      const didIntersect = this.raycaster.ray.intersectPlane(plane, intersection);
      
      if (didIntersect) {
        const distance = intersection.distanceTo(this.camera.position);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIntersection = intersection;
        }
      }
    }
    
    if (closestIntersection) {
      // Create waypoint at intersection point
      this._createWaypoint(closestIntersection, {
        color: this.settings.colors.path,
        label: 'Waypoint'
      });
    }
  }
  
  /**
   * Create a waypoint
   * @param {Vector3} position - Waypoint position
   * @param {Object} options - Waypoint options
   * @private
   */
  _createWaypoint(position, options = {}) {
    const defaults = {
      color: this.settings.colors.path,
      height: 5,
      radius: 0.5,
      label: 'Waypoint'
    };
    
    const config = { ...defaults, ...options };
    
    // Create waypoint group
    const waypointGroup = new THREE.Group();
    waypointGroup.position.copy(position);
    
    // Create base (vertical line)
    const lineGeometry = new THREE.CylinderGeometry(0.05, 0.05, config.height, 8);
    lineGeometry.translate(0, config.height / 2, 0);
    
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.7
    });
    
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    waypointGroup.add(line);
    
    // Create marker (spinning diamond)
    const markerGeometry = new THREE.OctahedronGeometry(config.radius, 0);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.y = config.height;
    waypointGroup.add(marker);
    
    // Create indicator ring
    const ringGeometry = new THREE.RingGeometry(0.7, 0.9, 32);
    ringGeometry.rotateX(-Math.PI / 2);
    
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.1;
    waypointGroup.add(ring);
    
    // Add to scene
    this.scene.add(waypointGroup);
    
    // Create map object entry
    const waypointId = `waypoint_${Date.now()}`;
    this.mapObjects.set(waypointId, {
      id: waypointId,
      type: 'waypoint',
      name: config.label,
      mesh: waypointGroup,
      interactive: true,
      time: 0,
      marker: marker,
      ring: ring,
      config: config
    });
    
    // Set as selected waypoint
    this.selectedWaypoint = waypointId;
    
    return waypointId;
  }
  
  /**
   * Remove a waypoint
   * @param {Object} waypoint - Waypoint object
   * @private
   */
  _removeWaypoint(waypoint) {
    if (!waypoint || waypoint.type !== 'waypoint') return;
    
    // Remove from scene
    this.scene.remove(waypoint.mesh);
    
    // Clean up resources
    waypoint.mesh.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    
    // Remove from map objects
    this.mapObjects.delete(waypoint.id);
    
    // Clear selected waypoint if this was selected
    if (this.selectedWaypoint === waypoint.id) {
      this.selectedWaypoint = null;
    }
  }
  
  /**
   * Add a map level
   * @param {Object} levelData - Level data
   */
  addLevel(levelData) {
    // Ensure level data has required fields
    if (!levelData.id || !levelData.name) {
      console.error('Level data must include id and name.');
      return;
    }
    
    // Add to levels array
    this.levels.push({
      id: levelData.id,
      name: levelData.name,
      level: levelData.level || this.levels.length,
      rooms: [],
      connections: [],
      explorationPercentage: levelData.explorationPercentage || 0
    });
    
    // Create rooms
    if (levelData.rooms && Array.isArray(levelData.rooms)) {
      levelData.rooms.forEach(roomData => {
        this.addRoom(roomData, levelData.level || this.levels.length - 1);
      });
    }
    
    // Create connections
    if (levelData.connections && Array.isArray(levelData.connections)) {
      levelData.connections.forEach(connection => {
        this.addConnection(connection, levelData.level || this.levels.length - 1);
      });
    }
    
    // Update UI
    this._updateLevelInfo();
  }
  
  /**
   * Add a room to the map
   * @param {Object} roomData - Room data
   * @param {number} level - Level index
   */
  addRoom(roomData, level = 0) {
    if (!roomData.id || !roomData.position) {
      console.error('Room data must include id and position.');
      return;
    }
    
    // Ensure position is a Vector3
    const position = roomData.position instanceof Vector3 ? 
      roomData.position.clone() : 
      new Vector3(roomData.position.x, roomData.position.y, roomData.position.z);
    
    // Adjust y position based on level
    position.y = level * this.settings.levelHeight;
    
    // Create room mesh
    const size = roomData.size || { width: 2, height: 1, depth: 2 };
    const roomGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    
    // Choose material based on room state
    let roomMaterial;
    if (roomData.explored) {
      // Explored rooms are more visible
      roomMaterial = new THREE.MeshStandardMaterial({
        color: roomData.color || this.settings.colors.completed,
        transparent: true,
        opacity: 0.7,
        metalness: 0.5,
        roughness: 0.5
      });
    } else {
      // Unexplored rooms are ghostly
      roomMaterial = new THREE.MeshStandardMaterial({
        color: roomData.color || 0x666666,
        transparent: true,
        opacity: 0.3,
        metalness: 0.2,
        roughness: 0.8
      });
    }
    
    const roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
    roomMesh.position.copy(position);
    roomMesh.castShadow = true;
    roomMesh.receiveShadow = true;
    
    // Add to scene
    this.scene.add(roomMesh);
    
    // Store in map objects
    const roomId = roomData.id;
    this.mapObjects.set(roomId, {
      id: roomId,
      type: 'room',
      name: roomData.name || `Room ${roomId}`,
      mesh: roomMesh,
      data: {
        area: roomData.area || 'Unknown',
        explored: roomData.explored || false,
        level: level
      },
      interactive: true
    });
    
    // Add to level data
    if (this.levels[level]) {
      this.levels[level].rooms.push(roomId);
    }
    
    return roomId;
  }
  
  /**
   * Add a connection between rooms
   * @param {Object} connectionData - Connection data
   * @param {number} level - Level index
   */
  addConnection(connectionData, level = 0) {
    if (!connectionData.from || !connectionData.to) {
      console.error('Connection data must include from and to room IDs.');
      return;
    }
    
    // Get room objects
    const fromRoom = this.mapObjects.get(connectionData.from);
    const toRoom = this.mapObjects.get(connectionData.to);
    
    if (!fromRoom || !toRoom) {
      console.error('Connection rooms not found.');
      return;
    }
    
    // Create connection line
    const points = [
      fromRoom.mesh.position.clone(),
      toRoom.mesh.position.clone()
    ];
    
    // Add intermediate points if specified
    if (connectionData.points && Array.isArray(connectionData.points)) {
      points.splice(1, 0, ...connectionData.points.map(p => 
        new Vector3(p.x, level * this.settings.levelHeight, p.z)
      ));
    }
    
    // Create line geometry
    const lineGeometry = new THREE.BufferGeometry();
    
    // Create curve if more than 2 points
    if (points.length > 2) {
      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(20);
      lineGeometry.setFromPoints(curvePoints);
    } else {
      lineGeometry.setFromPoints(points);
    }
    
    // Create line material
    const lineMaterial = new THREE.LineBasicMaterial({
      color: connectionData.color || 0x888888,
      transparent: true,
      opacity: 0.5,
      linewidth: 1
    });
    
    // Create line mesh
    const line = new THREE.Line(lineGeometry, lineMaterial);
    
    // Add to scene
    this.scene.add(line);
    
    // Store in map objects
    const connectionId = `connection_${fromRoom.id}_${toRoom.id}`;
    this.mapObjects.set(connectionId, {
      id: connectionId,
      type: 'connection',
      mesh: line,
      data: {
        from: connectionData.from,
        to: connectionData.to,
        level: level
      },
      interactive: false
    });
    
    // Add to level data
    if (this.levels[level]) {
      this.levels[level].connections.push(connectionId);
    }
    
    return connectionId;
  }
  
  /**
   * Add an objective marker
   * @param {Object} objectiveData - Objective data
   */
  addObjective(objectiveData) {
    if (!objectiveData.id || !objectiveData.position) {
      console.error('Objective data must include id and position.');
      return;
    }
    
    // Ensure position is a Vector3
    const position = objectiveData.position instanceof Vector3 ? 
      objectiveData.position.clone() : 
      new Vector3(objectiveData.position.x, objectiveData.position.y, objectiveData.position.z);
    
    // Create objective marker group
    const objectiveGroup = new THREE.Group();
    objectiveGroup.position.copy(position);
    
    // Create diamond marker
    const markerGeometry = new THREE.OctahedronGeometry(0.7, 0);
    
    // Choose material based on objective state
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: objectiveData.completed ? 
        this.settings.colors.completed : 
        this.settings.colors.objective,
      wireframe: objectiveData.completed ? false : true,
      transparent: true,
      opacity: 0.8
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.y = 1.5;
    objectiveGroup.add(marker);
    
    // Add vertical line
    const lineGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    lineGeometry.translate(0, 1.5, 0);
    
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: objectiveData.completed ? 
        this.settings.colors.completed : 
        this.settings.colors.objective,
      transparent: true,
      opacity: 0.7
    });
    
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    objectiveGroup.add(line);
    
    // Add to scene
    this.scene.add(objectiveGroup);
    
    // Store in map objects
    const objectiveId = objectiveData.id;
    this.mapObjects.set(objectiveId, {
      id: objectiveId,
      type: 'objective',
      name: objectiveData.name || `Objective ${objectiveId}`,
      mesh: objectiveGroup,
      data: {
        description: objectiveData.description || '',
        completed: objectiveData.completed || false
      },
      interactive: true,
      marker: marker,
      line: line
    });
    
    return objectiveId;
  }
  
  /**
   * Add an anomaly marker
   * @param {Object} anomalyData - Anomaly data
   */
  addAnomaly(anomalyData) {
    if (!anomalyData.id || !anomalyData.position) {
      console.error('Anomaly data must include id and position.');
      return;
    }
    
    // Ensure position is a Vector3
    const position = anomalyData.position instanceof Vector3 ? 
      anomalyData.position.clone() : 
      new Vector3(anomalyData.position.x, anomalyData.position.y, anomalyData.position.z);
    
    // Create anomaly group
    const anomalyGroup = new THREE.Group();
    anomalyGroup.position.copy(position);
    
    // Create anomaly sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 12, 12);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.anomaly,
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 1.0;
    anomalyGroup.add(sphere);
    
    // Create outer glow
    const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.settings.colors.anomaly,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.0;
    anomalyGroup.add(glow);
    
    // Add to scene
    this.scene.add(anomalyGroup);
    
    // Store in map objects
    const anomalyId = anomalyData.id;
    this.mapObjects.set(anomalyId, {
      id: anomalyId,
      type: 'anomaly',
      name: anomalyData.name || `Anomaly ${anomalyId}`,
      mesh: anomalyGroup,
      data: {
        anomalyType: anomalyData.anomalyType || 'Unknown',
        intensity: anomalyData.intensity || 'Low',
        description: anomalyData.description || ''
      },
      interactive: true,
      sphere: sphere,
      glow: glow,
      time: 0
    });
    
    return anomalyId;
  }
  
  /**
   * Update player position
   * @param {Vector3} position - Player position
   * @param {number} rotation - Player rotation in radians
   * @param {number} level - Current level
   */
  updatePlayerPosition(position, rotation = 0, level = 0) {
    if (!this.playerMarker) return;
    
    // Update player marker data
    this.playerMarker.position = position.clone();
    this.playerMarker.rotation = rotation;
    this.playerMarker.level = level;
    
    // Update marker position
    const y = level * this.settings.levelHeight;
    this.playerMarker.group.position.set(position.x, y, position.z);
    
    // Update arrow rotation
    this.playerMarker.arrow.rotation.y = rotation;
    
    // Focus camera on player if not manually moved
    if (!this.isDragging && !this.animating) {
      this.cameraTarget.copy(new Vector3(position.x, y, position.z));
      this._updateCameraPosition();
    }
    
    // Update map info
    this._updateLocationInfo();
  }
  
  /**
   * Update object state
   * @param {string} objectId - Object ID
   * @param {Object} updates - Updates to apply
   */
  updateObject(objectId, updates) {
    const mapObject = this.mapObjects.get(objectId);
    if (!mapObject) return;
    
    // Apply updates based on object type
    if (mapObject.type === 'room') {
      // Room updates
      if (updates.explored !== undefined) {
        mapObject.data.explored = updates.explored;
        
        // Update material
        const material = mapObject.mesh.material;
        if (updates.explored) {
          material.color.set(this.settings.colors.completed);
          material.opacity = 0.7;
        } else {
          material.color.set(0x666666);
          material.opacity = 0.3;
        }
      }
    }
    else if (mapObject.type === 'objective') {
      // Objective updates
      if (updates.completed !== undefined) {
        mapObject.data.completed = updates.completed;
        
        // Update material
        if (updates.completed) {
          mapObject.marker.material.color.set(this.settings.colors.completed);
          mapObject.marker.material.wireframe = false;
          mapObject.line.material.color.set(this.settings.colors.completed);
        } else {
          mapObject.marker.material.color.set(this.settings.colors.objective);
          mapObject.marker.material.wireframe = true;
          mapObject.line.material.color.set(this.settings.colors.objective);
        }
      }
    }
    
    // Update data object
    if (updates.data) {
      mapObject.data = { ...mapObject.data, ...updates.data };
    }
  }
  
  /**
   * Update level exploration percentage
   * @param {string} levelId - Level ID
   * @param {number} percentage - Exploration percentage (0-100)
   */
  updateExploration(levelId, percentage) {
    // Find level by ID
    const level = this.levels.find(l => l.id === levelId);
    if (!level) return;
    
    // Update exploration percentage
    level.explorationPercentage = percentage;
    
    // Update UI
    this._updateLevelInfo();
  }
  
  /**
   * Update level information in the UI
   * @private
   */
  _updateLevelInfo() {
    if (!this.mapInfo) return;
    
    const levelIndex = this.currentLevel;
    if (levelIndex < 0 || levelIndex >= this.levels.length) return;
    
    const level = this.levels[levelIndex];
    
    // Update level name
    const levelNameElement = this.mapInfo.querySelector('.level-name');
    if (levelNameElement) {
      levelNameElement.textContent = level.name;
    }
    
    // Update exploration percentage
    const explorationElement = this.mapInfo.querySelector('.exploration-percentage');
    if (explorationElement) {
      explorationElement.textContent = `${Math.round(level.explorationPercentage)}%`;
    }
  }
  
  /**
   * Update location information
   * @private
   */
  _updateLocationInfo() {
    // Find the room the player is in
    if (!this.playerMarker || !this.mapInfo) return;
    
    let currentRoom = null;
    const playerPosition = this.playerMarker.position;
    
    // Check all rooms at current level
    for (const [id, mapObject] of this.mapObjects.entries()) {
      if (mapObject.type !== 'room' || mapObject.data.level !== this.playerMarker.level) continue;
      
      // Check if player is inside this room
      const roomMesh = mapObject.mesh;
      const roomBox = new THREE.Box3().setFromObject(roomMesh);
      
      if (roomBox.containsPoint(playerPosition)) {
        currentRoom = mapObject;
        break;
      }
    }
    
    // Update location info if found
    if (currentRoom) {
      const levelNameElement = this.mapInfo.querySelector('.level-name');
      if (levelNameElement) {
        levelNameElement.textContent = `${this.levels[this.playerMarker.level].name} - ${currentRoom.name}`;
      }
    }
  }
  
  /**
   * Toggle map visibility
   */
  toggle() {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
    
    if (this.isVisible) {
      // Update camera and renderer
      this._onWindowResize();
      
      // Update UI
      this._updateLevelInfo();
      this._updateLocationInfo();
    }
  }
  
  /**
   * Show the map
   */
  show() {
    if (!this.isVisible) {
      this.toggle();
    }
  }
  
  /**
   * Hide the map
   */
  hide() {
    if (this.isVisible) {
      this.toggle();
    }
  }
  
  /**
   * Update animation
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateAnimation(deltaTime) {
    if (!this.animating) return;
    
    this.animationTime += deltaTime;
    const duration = 1.0; // Animation duration in seconds
    
    if (this.animationTime >= duration) {
      // End of animation
      this.animating = false;
      this.cameraTarget.copy(this.animationTarget.position);
      this._updateCameraPosition();
      return;
    }
    
    // Interpolate camera target
    const t = this.animationTime / duration;
    const smoothT = MathUtils.smoothstep(t, 0, 1); // Smooth interpolation
    
    this.cameraTarget.lerpVectors(
      this.animationTarget.currentTarget,
      this.animationTarget.position,
      smoothT
    );
    
    this._updateCameraPosition();
  }
  
  /**
   * Update map objects
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateMapObjects(deltaTime) {
    // Update animated map objects
    for (const [id, mapObject] of this.mapObjects.entries()) {
      // Update waypoints
      if (mapObject.type === 'waypoint') {
        mapObject.time += deltaTime;
        
        // Rotate marker
        mapObject.marker.rotation.y += deltaTime * 1.5;
        
        // Pulse effect on ring
        const pulse = Math.sin(mapObject.time * 3) * 0.2 + 1.0;
        mapObject.ring.scale.set(pulse, pulse, pulse);
      }
      
      // Update anomalies
      else if (mapObject.type === 'anomaly') {
        mapObject.time += deltaTime;
        
        // Pulse effect on glow
        const pulse = Math.sin(mapObject.time * 2) * 0.3 + 0.7;
        mapObject.glow.scale.set(pulse, pulse, pulse);
        
        // Rotate sphere
        mapObject.sphere.rotation.y += deltaTime * 0.5;
        mapObject.sphere.rotation.x += deltaTime * 0.3;
      }
    }
    
    // Update player marker
    if (this.playerMarker) {
      // Pulse glow
      const pulse = Math.sin(this.clock.getElapsedTime() * 3) * 0.2 + 0.8;
      this.playerMarker.glow.scale.set(pulse, pulse, pulse);
    }
  }
  
  /**
   * Update the map system
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (!this.isVisible) return;
    
    // Update camera animation
    this._updateAnimation(deltaTime);
    
    // Update auto-rotation if enabled
    if (this.settings.autoRotate && !this.isDragging && !this.animating) {
      this.cameraRotation.y += deltaTime * 0.1;
      this._updateCameraPosition();
    }
    
    // Update map objects
    this._updateMapObjects(deltaTime);
    
    // Render the scene
    this.composer.render();
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('wheel', this._onMouseWheel);
    this.canvas.removeEventListener('contextmenu', this._onContextMenu);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onWindowResize);
    
    // Dispose of Three.js resources
    this.mapObjects.forEach(obj => {
      this.scene.remove(obj.mesh);
      
      if (obj.mesh.geometry) {
        obj.mesh.geometry.dispose();
      }
      
      if (obj.mesh.material) {
        if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach(mat => mat.dispose());
        } else {
          obj.mesh.material.dispose();
        }
      }
    });
    
    // Clear map objects
    this.mapObjects.clear();
    
    // Clean up player marker
    if (this.playerMarker) {
      this.scene.remove(this.playerMarker.group);
      this.playerMarker.arrow.geometry.dispose();
      this.playerMarker.arrow.material.dispose();
      this.playerMarker.ring.geometry.dispose();
      this.playerMarker.ring.material.dispose();
      this.playerMarker.glow.geometry.dispose();
      this.playerMarker.glow.material.dispose();
    }
    
    // Dispose of renderer and composer
    this.renderer.dispose();
    this.composer.renderTarget1.dispose();
    this.composer.renderTarget2.dispose();
    
    // Remove DOM elements
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default QuantumMap3D;