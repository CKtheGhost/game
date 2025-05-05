import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Vector3, Quaternion, Raycaster } from 'three';

class CharacterController {
  constructor(camera, scene, domElement) {
    // Core components
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    
    // Movement settings
    this.moveSpeed = 5.0;
    this.sprintMultiplier = 1.8;
    this.jumpForce = 10.0;
    this.gravity = 30.0;
    
    // Character physics
    this.velocity = new Vector3();
    this.direction = new Vector3();
    this.position = new Vector3(0, 2, 0);
    this.rotation = new Quaternion();
    this.height = 1.8;
    this.radius = 0.4;
    
    // Character state
    this.isSprinting = false;
    this.isJumping = false;
    this.isGrounded = false;
    this.canJump = true;
    this.isCrouching = false;
    this.viewMode = 'firstPerson'; // 'firstPerson' or 'thirdPerson'
    
    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      crouch: false,
      ability1: false,
      ability2: false,
      ability3: false,
      ability4: false,
      toggleView: false,
    };
    
    // First-person controls
    this.pointerControls = new PointerLockControls(this.camera, this.domElement);
    this.pointerControls.getObject().position.copy(this.position);
    scene.add(this.pointerControls.getObject());
    
    // Third-person components
    this.thirdPersonDistance = 5;
    this.thirdPersonHeight = 2;
    this.thirdPersonLerp = 0.1;
    this.targetPosition = new Vector3();
    this.cameraOffset = new Vector3(0, this.thirdPersonHeight, this.thirdPersonDistance);
    
    // Character mesh (placeholder - will be replaced with actual character model)
    this.characterGroup = new THREE.Group();
    const geometry = new THREE.CapsuleGeometry(this.radius, this.height - this.radius * 2, 4, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x005555, wireframe: true });
    this.characterMesh = new THREE.Mesh(geometry, material);
    this.characterMesh.position.y = this.height / 2;
    this.characterGroup.add(this.characterMesh);
    this.scene.add(this.characterGroup);
    
    // Collision detection
    this.raycaster = new Raycaster();
    this.rayDirections = [
      new Vector3(0, -1, 0), // Down
      new Vector3(0, 1, 0),  // Up
      new Vector3(1, 0, 0),  // Right
      new Vector3(-1, 0, 0), // Left
      new Vector3(0, 0, 1),  // Forward
      new Vector3(0, 0, -1), // Backward
    ];
    
    // Callbacks for user code
    this.onMove = null;
    this.onJump = null;
    this.onLand = null;
    this.onCollision = null;
    
    // Initialize control handlers
    this._initKeyboardControls();
    this._initMouseControls();
    this._initPointerLock();
  }
  
  // Initialize keyboard input
  _initKeyboardControls() {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
          this.keys.forward = true;
          break;
        case 'KeyS':
          this.keys.backward = true;
          break;
        case 'KeyA':
          this.keys.left = true;
          break;
        case 'KeyD':
          this.keys.right = true;
          break;
        case 'Space':
          this.keys.jump = true;
          break;
        case 'ShiftLeft':
          this.keys.sprint = true;
          break;
        case 'KeyC':
          this.keys.crouch = true;
          break;
        case 'KeyQ':
          this.keys.ability1 = true;
          break;
        case 'KeyE':
          this.keys.ability2 = true;
          break;
        case 'KeyF':
          this.keys.ability3 = true;
          break;
        case 'KeyR':
          this.keys.ability4 = true;
          break;
        case 'KeyV':
          if (!this.keys.toggleView) {
            this.keys.toggleView = true;
            this.toggleViewMode();
          }
          break;
      }
    };
    
    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          this.keys.forward = false;
          break;
        case 'KeyS':
          this.keys.backward = false;
          break;
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
        case 'ShiftLeft':
          this.keys.sprint = false;
          break;
        case 'KeyC':
          this.keys.crouch = false;
          break;
        case 'KeyQ':
          this.keys.ability1 = false;
          break;
        case 'KeyE':
          this.keys.ability2 = false;
          break;
        case 'KeyF':
          this.keys.ability3 = false;
          break;
        case 'KeyR':
          this.keys.ability4 = false;
          break;
        case 'KeyV':
          this.keys.toggleView = false;
          break;
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }
  
  // Initialize mouse controls
  _initMouseControls() {
    // Mouse controls are handled by PointerLockControls for first-person mode
    // For third-person, we'll add additional mouse handling
    document.addEventListener('mousemove', (event) => {
      if (this.viewMode === 'thirdPerson' && this.pointerControls.isLocked) {
        // Custom third-person camera rotation
        // We'll implement this in the camera system
      }
    });
  }
  
  // Initialize pointer lock controls
  _initPointerLock() {
    const lockPointer = () => {
      this.pointerControls.lock();
    };
    
    this.domElement.addEventListener('click', lockPointer);
    
    this.pointerControls.addEventListener('lock', () => {
      console.log('Controls locked');
    });
    
    this.pointerControls.addEventListener('unlock', () => {
      console.log('Controls unlocked');
    });
  }
  
  // Toggle between first-person and third-person view modes
  toggleViewMode() {
    this.viewMode = this.viewMode === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
    
    if (this.viewMode === 'firstPerson') {
      // Reset camera to first person view
      this.camera.position.copy(this.position.clone().add(new Vector3(0, this.height * 0.8, 0)));
    } else {
      // Setup third person camera position
      this._updateThirdPersonCamera();
    }
    
    console.log(`View mode changed to ${this.viewMode}`);
  }
  
  // Update third-person camera position
  _updateThirdPersonCamera() {
    if (this.viewMode !== 'thirdPerson') return;
    
    // Get the camera's forward direction (ignoring vertical component)
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    
    // Calculate the desired camera position
    this.targetPosition.copy(this.position)
      .add(new Vector3(0, this.thirdPersonHeight, 0))
      .sub(direction.multiplyScalar(this.thirdPersonDistance));
    
    // Smoothly interpolate the camera position
    this.camera.position.lerp(this.targetPosition, this.thirdPersonLerp);
    
    // Make camera look at the character
    this.camera.lookAt(
      this.position.x,
      this.position.y + this.height * 0.8,
      this.position.z
    );
  }
  
  // Check if the character is grounded
  _checkGrounded(obstacles) {
    const rayStart = this.position.clone();
    rayStart.y += 0.1; // Small offset to avoid precision issues
    
    this.raycaster.set(rayStart, this.rayDirections[0]); // Down direction
    const intersects = this.raycaster.intersectObjects(obstacles, true);
    
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    
    if (intersects.length > 0) {
      const distance = intersects[0].distance;
      
      if (distance < 0.3) { // If very close to the ground
        this.isGrounded = true;
        
        if (!wasGrounded) {
          // Just landed
          this.velocity.y = 0;
          
          if (this.onLand) {
            this.onLand();
          }
        }
      }
    }
    
    return this.isGrounded;
  }
  
  // Handle movement input
  _handleMovement(deltaTime) {
    // Calculate movement speed
    let speed = this.moveSpeed;
    
    if (this.keys.sprint) {
      this.isSprinting = true;
      speed *= this.sprintMultiplier;
    } else {
      this.isSprinting = false;
    }
    
    if (this.keys.crouch) {
      this.isCrouching = true;
      speed *= 0.5;
    } else {
      this.isCrouching = false;
    }
    
    // Reset movement direction
    this.direction.set(0, 0, 0);
    
    // Update movement direction based on keyboard input
    if (this.keys.forward) {
      this.direction.z = -1;
    } else if (this.keys.backward) {
      this.direction.z = 1;
    }
    
    if (this.keys.left) {
      this.direction.x = -1;
    } else if (this.keys.right) {
      this.direction.x = 1;
    }
    
    // Normalize direction if moving diagonally
    if (this.direction.length() > 1) {
      this.direction.normalize();
    }
    
    // Apply camera rotation to movement direction
    this.direction.applyQuaternion(this.camera.quaternion);
    this.direction.y = 0; // Keep movement on the horizontal plane
    this.direction.normalize();
    
    // Apply movement to velocity
    this.velocity.x = this.direction.x * speed;
    this.velocity.z = this.direction.z * speed;
    
    // Handle jumping
    if (this.keys.jump && this.isGrounded && this.canJump) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
      
      if (this.onJump) {
        this.onJump();
      }
      
      // Prevent rapid repeated jumps
      this.canJump = false;
      setTimeout(() => {
        this.canJump = true;
      }, 300);
    }
    
    // Apply gravity if not grounded
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime;
    }
    
    // Apply velocity to position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Prevent falling below ground level
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
    
    // Update character mesh position
    this.characterGroup.position.copy(this.position);
    
    // Update camera position for first-person mode
    if (this.viewMode === 'firstPerson') {
      this.pointerControls.getObject().position.copy(
        this.position.clone().add(new Vector3(0, this.height * 0.8, 0))
      );
    }
    
    // Trigger move callback
    if (this.onMove && (this.velocity.x !== 0 || this.velocity.z !== 0)) {
      this.onMove(this.velocity.clone());
    }
  }
  
  // Check for collisions and resolve them
  _handleCollisions(obstacles, deltaTime) {
    const collisionMargin = 0.2;
    
    // Check for collisions in each direction
    for (let i = 0; i < this.rayDirections.length; i++) {
      if (i === 0) continue; // Skip down direction, handled by _checkGrounded
      
      const rayStart = this.position.clone();
      // Adjust ray start position based on character dimensions
      switch (i) {
        case 1: // Up
          rayStart.y += this.height;
          break;
        case 2: // Right
        case 3: // Left
        case 4: // Forward
        case 5: // Backward
          rayStart.y += this.height / 2;
          break;
      }
      
      this.raycaster.set(rayStart, this.rayDirections[i]);
      const intersects = this.raycaster.intersectObjects(obstacles, true);
      
      if (intersects.length > 0) {
        const distance = intersects[0].distance;
        
        if (distance < this.radius + collisionMargin) {
          // Collision detected, resolve it
          const pushBack = this.rayDirections[i].clone().multiplyScalar(-(this.radius + collisionMargin - distance));
          this.position.add(pushBack);
          
          // Reflect velocity component in this direction
          switch (i) {
            case 1: // Up
              if (this.velocity.y > 0) this.velocity.y = 0;
              break;
            case 2: // Right
              if (this.velocity.x > 0) this.velocity.x = 0;
              break;
            case 3: // Left
              if (this.velocity.x < 0) this.velocity.x = 0;
              break;
            case 4: // Forward
              if (this.velocity.z > 0) this.velocity.z = 0;
              break;
            case 5: // Backward
              if (this.velocity.z < 0) this.velocity.z = 0;
              break;
          }
          
          if (this.onCollision) {
            this.onCollision(intersects[0].object, this.rayDirections[i]);
          }
        }
      }
    }
  }
  
  // Update character visuals based on state
  _updateCharacterVisuals() {
    // Update character visual effects based on state (sprint, crouch, etc.)
    // For now just modifies the character mesh
    if (this.isCrouching) {
      this.characterMesh.scale.y = 0.7;
      this.characterMesh.position.y = (this.height * 0.7) / 2;
    } else {
      this.characterMesh.scale.y = 1.0;
      this.characterMesh.position.y = this.height / 2;
    }
    
    // Update character rotation to face movement direction
    if (this.velocity.x !== 0 || this.velocity.z !== 0) {
      const angle = Math.atan2(this.velocity.x, this.velocity.z);
      this.characterGroup.rotation.y = angle;
    }
  }
  
  // Main update method to be called in the animation loop
  update(deltaTime, obstacles = []) {
    // Check if character is on the ground
    this._checkGrounded(obstacles);
    
    // Handle movement based on user input
    this._handleMovement(deltaTime);
    
    // Handle collisions with obstacles
    this._handleCollisions(obstacles, deltaTime);
    
    // Update third-person camera if in that mode
    if (this.viewMode === 'thirdPerson') {
      this._updateThirdPersonCamera();
    }
    
    // Update character visual representation
    this._updateCharacterVisuals();
  }
  
  // Register a callback for movement events
  onCharacterMove(callback) {
    this.onMove = callback;
  }
  
  // Register a callback for jump events
  onCharacterJump(callback) {
    this.onJump = callback;
  }
  
  // Register a callback for landing events
  onCharacterLand(callback) {
    this.onLand = callback;
  }
  
  // Register a callback for collision events
  onCharacterCollision(callback) {
    this.onCollision = callback;
  }
  
  // Dispose of event listeners and resources
  dispose() {
    // Remove event listeners
    this.pointerControls.dispose();
    
    // Remove the character from the scene
    this.scene.remove(this.characterGroup);
  }
}

export default CharacterController;