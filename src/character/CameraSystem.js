import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class CameraSystem {
  constructor(camera, scene, domElement, character) {
    // Core components
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.character = character;
    
    // Camera settings
    this.viewMode = 'firstPerson'; // 'firstPerson' or 'thirdPerson'
    this.firstPersonHeight = 1.7; // Eye height when in first person
    
    // Third person settings
    this.thirdPersonDistance = 5.0;
    this.thirdPersonHeight = 2.0;
    this.thirdPersonOffset = new THREE.Vector3(0, 0, 0);
    this.minDistance = 1.5;
    this.maxDistance = 10.0;
    this.collisionLayers = [];
    
    // Camera transition
    this.transitionDuration = 0.5; // seconds
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.startPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.startQuaternion = new THREE.Quaternion();
    this.targetQuaternion = new THREE.Quaternion();
    
    // Controls
    this.pointerControls = new PointerLockControls(this.camera, this.domElement);
    this.orbitControls = new OrbitControls(this.camera, this.domElement);
    
    // Setup controls
    this._setupControls();
    
    // Initialize camera position
    this._updateFirstPersonCamera();
    
    // Event handlers
    this._initEventHandlers();
  }
  
  // Setup the camera controls
  _setupControls() {
    // Add the pointer lock controls to the scene
    this.scene.add(this.pointerControls.getObject());
    
    // Configure orbit controls for third person mode
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.1;
    this.orbitControls.rotateSpeed = 0.7;
    this.orbitControls.minPolarAngle = Math.PI * 0.1; // Prevent looking too far down
    this.orbitControls.maxPolarAngle = Math.PI * 0.8; // Prevent looking too far up
    this.orbitControls.enableZoom = true;
    this.orbitControls.minDistance = this.minDistance;
    this.orbitControls.maxDistance = this.maxDistance;
    this.orbitControls.enablePan = false;
    
    // Disable orbit controls by default (first person mode is default)
    this.orbitControls.enabled = false;
  }
  
  // Initialize event handlers
  _initEventHandlers() {
    // Lock pointer on click
    this.domElement.addEventListener('click', () => {
      if (this.viewMode === 'firstPerson') {
        this.pointerControls.lock();
      }
    });
    
    // Listen for scroll wheel to adjust third person distance
    this.domElement.addEventListener('wheel', (event) => {
      if (this.viewMode === 'thirdPerson') {
        // Adjust third person distance based on scroll
        this.thirdPersonDistance += event.deltaY * 0.01;
        // Clamp to min/max
        this.thirdPersonDistance = Math.max(
          this.minDistance,
          Math.min(this.maxDistance, this.thirdPersonDistance)
        );
      }
    });
    
    // Handle pointer lock state changes
    this.pointerControls.addEventListener('lock', () => {
      console.log('Camera controls locked');
    });
    
    this.pointerControls.addEventListener('unlock', () => {
      console.log('Camera controls unlocked');
    });
  }
  
  // Toggle between first-person and third-person view
  toggleViewMode() {
    const previousMode = this.viewMode;
    this.viewMode = this.viewMode === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
    
    // If we were in third person, save the current orbit orientation
    if (previousMode === 'thirdPerson') {
      this.thirdPersonDistance = this.orbitControls.getDistance();
    }
    
    // Enable/disable appropriate controls
    if (this.viewMode === 'firstPerson') {
      this.orbitControls.enabled = false;
      this._startCameraTransition(this._getFirstPersonCameraPosition());
    } else {
      // Unlock pointer controls when switching to third person
      if (this.pointerControls.isLocked) {
        this.pointerControls.unlock();
      }
      this.orbitControls.enabled = true;
      this._startCameraTransition(this._getThirdPersonCameraPosition());
    }
    
    console.log(`Camera view changed to ${this.viewMode}`);
  }
  
  // Get the first person camera position
  _getFirstPersonCameraPosition() {
    return new THREE.Vector3(
      this.character.position.x,
      this.character.position.y + this.firstPersonHeight,
      this.character.position.z
    );
  }
  
  // Get the third person camera position
  _getThirdPersonCameraPosition() {
    // Get current camera direction
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement on the horizontal plane
    direction.normalize();
    
    // Calculate the desired camera position
    return new THREE.Vector3(
      this.character.position.x - direction.x * this.thirdPersonDistance,
      this.character.position.y + this.thirdPersonHeight,
      this.character.position.z - direction.z * this.thirdPersonDistance
    );
  }
  
  // Start a smooth camera transition between modes
  _startCameraTransition(targetPosition) {
    // Set transition properties
    this.isTransitioning = true;
    this.transitionProgress = 0;
    
    // Save start position and rotation
    this.startPosition.copy(this.camera.position);
    this.startQuaternion.copy(this.camera.quaternion);
    
    // Set target position
    this.targetPosition.copy(targetPosition);
    
    // Calculate target quaternion (looking at character)
    const lookAtPoint = new THREE.Vector3(
      this.character.position.x,
      this.character.position.y + 1.5, // Look at upper body
      this.character.position.z
    );
    
    const tempCamera = new THREE.Object3D();
    tempCamera.position.copy(targetPosition);
    tempCamera.lookAt(lookAtPoint);
    this.targetQuaternion.copy(tempCamera.quaternion);
  }
  
  // Update the camera transition
  _updateCameraTransition(deltaTime) {
    if (!this.isTransitioning) return;
    
    // Update progress
    this.transitionProgress += deltaTime / this.transitionDuration;
    
    // Clamp progress to 0-1
    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.isTransitioning = false;
    }
    
    // Use easing function for smooth transition (cubic ease in/out)
    const t = this.transitionProgress;
    const easedProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Interpolate position and rotation
    this.camera.position.lerpVectors(this.startPosition, this.targetPosition, easedProgress);
    this.camera.quaternion.slerpQuaternions(this.startQuaternion, this.targetQuaternion, easedProgress);
  }
  
  // Update the first person camera
  _updateFirstPersonCamera() {
    if (this.viewMode !== 'firstPerson' || this.isTransitioning) return;
    
    // First person camera is controlled by PointerLockControls
    // Just update the position to match the character
    this.pointerControls.getObject().position.copy(this._getFirstPersonCameraPosition());
  }
  
  // Update the third person camera
  _updateThirdPersonCamera() {
    if (this.viewMode !== 'thirdPerson' || this.isTransitioning) return;
    
    // Set orbit controls target to character position
    this.orbitControls.target.set(
      this.character.position.x,
      this.character.position.y + 1.0, // Target character torso
      this.character.position.z
    );
    
    // Handle camera collisions
    this._handleCameraCollisions();
    
    // Update orbit controls
    this.orbitControls.update();
  }
  
  // Handle camera collisions with environment
  _handleCameraCollisions() {
    if (this.collisionLayers.length === 0) return;
    
    // Cast a ray from character to camera to detect obstacles
    const raycaster = new THREE.Raycaster();
    const characterPos = new THREE.Vector3(
      this.character.position.x,
      this.character.position.y + 1.5,
      this.character.position.z
    );
    
    const directionToCamera = new THREE.Vector3().subVectors(this.camera.position, characterPos).normalize();
    raycaster.set(characterPos, directionToCamera);
    
    // Check for intersections with obstacle layers
    const intersects = raycaster.intersectObjects(this.collisionLayers, true);
    
    if (intersects.length > 0) {
      // If an obstacle is found between character and camera
      const distance = intersects[0].distance;
      
      // If the obstacle is closer than the desired camera distance
      if (distance < this.thirdPersonDistance) {
        // Move camera closer to avoid clipping
        const newPosition = new THREE.Vector3().addVectors(
          characterPos,
          directionToCamera.multiplyScalar(distance * 0.9) // 90% of the distance to obstacle
        );
        
        this.camera.position.copy(newPosition);
      }
    }
  }
  
  // Set collision layers for camera obstruction checks
  setCollisionLayers(layers) {
    this.collisionLayers = Array.isArray(layers) ? layers : [layers];
  }
  
  // Update the camera system
  update(deltaTime) {
    // Handle camera transition if active
    if (this.isTransitioning) {
      this._updateCameraTransition(deltaTime);
      return;
    }
    
    // Update camera based on current view mode
    if (this.viewMode === 'firstPerson') {
      this._updateFirstPersonCamera();
    } else {
      this._updateThirdPersonCamera();
    }
  }
  
  // Set the camera field of view
  setFOV(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }
  
  // Add a camera shake effect (e.g., for impacts or abilities)
  addCameraShake(intensity = 1.0, duration = 0.5) {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const originalPosition = this.camera.position.clone();
    
    const shakeInterval = setInterval(() => {
      const currentTime = Date.now();
      
      if (currentTime >= endTime) {
        // End shake
        clearInterval(shakeInterval);
        return;
      }
      
      // Calculate remaining shake intensity
      const remainingTime = (endTime - currentTime) / (duration * 1000);
      const currentIntensity = intensity * remainingTime;
      
      // Apply random offset
      if (this.viewMode === 'firstPerson') {
        this.camera.position.x += (Math.random() - 0.5) * 0.1 * currentIntensity;
        this.camera.position.y += (Math.random() - 0.5) * 0.1 * currentIntensity;
        this.camera.position.z += (Math.random() - 0.5) * 0.1 * currentIntensity;
      }
    }, 16); // ~60fps
  }
  
  // Get the current camera view direction
  getViewDirection() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }
  
  // Dispose of event listeners and resources
  dispose() {
    this.pointerControls.dispose();
    this.orbitControls.dispose();
  }
}

export default CameraSystem;