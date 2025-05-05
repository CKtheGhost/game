import * as THREE from 'three';
import { EventEmitter } from 'events';

class InteractionSystem extends EventEmitter {
  constructor(character, camera, scene, domElement) {
    super();
    
    // Core components
    this.character = character;
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    
    // Interaction settings
    this.interactionDistance = 3.0; // Max distance for interactions
    this.highlightColor = new THREE.Color(0x88ffff); // Color for highlighting interactable objects
    this.outlineThickness = 0.05; // Thickness of the outline for highlighted objects
    
    // State tracking
    this.interactableObjects = []; // All interactable objects in the scene
    this.highlightedObject = null; // Currently highlighted object
    this.nearbyObjects = []; // Objects within interaction distance
    this.heldObject = null; // Object currently being held/carried
    
    // Interaction key bindings
    this.keys = {
      interact: 'KeyE',
      grab: 'KeyF',
    };
    
    // Raycaster for interaction detection
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = this.interactionDistance;
    
    // Visual feedback elements
    this.interactionMarker = this._createInteractionMarker();
    this.scene.add(this.interactionMarker);
    
    // Outline materials for highlighting
    this.outlineMaterials = new Map(); // Map of original objects to their outline meshes
    
    // Initialize input handlers
    this._initInputHandlers();
  }
  
  // Create a visual marker for interactions
  _createInteractionMarker() {
    const markerGeometry = new THREE.RingGeometry(0.3, 0.35, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: this.highlightColor,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.renderOrder = 999; // Ensure it renders on top
    marker.visible = false;
    
    return marker;
  }
  
  // Initialize input handlers
  _initInputHandlers() {
    // Interaction key handler
    const onKeyDown = (event) => {
      if (event.code === this.keys.interact) {
        this._handleInteraction();
      } else if (event.code === this.keys.grab) {
        this._handleGrab();
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    
    // Mouse click for interactions
    this.domElement.addEventListener('click', (event) => {
      // Only handle left clicks
      if (event.button !== 0) return;
      
      // Check if we're in first person mode
      if (this.character.viewMode === 'firstPerson') {
        this._handleInteraction();
      } else {
        // In third person, use mouse position for raycasting
        const mouse = new THREE.Vector2(
          (event.clientX / this.domElement.clientWidth) * 2 - 1,
          -(event.clientY / this.domElement.clientHeight) * 2 + 1
        );
        
        this._handleMouseInteraction(mouse);
      }
    });
  }
  
  // Register an object as interactable
  registerInteractable(object, options = {}) {
    // Set up object as interactable
    object.userData.interactable = true;
    
    // Store interaction options
    object.userData.interactionOptions = {
      // Allow custom interaction callback
      onInteract: options.onInteract || null,
      
      // Properties for different interaction types
      type: options.type || 'generic', // 'generic', 'pickup', 'use', 'data', 'container'
      data: options.data || null, // Any associated data
      message: options.message || 'Interact', // Message to show when highlighting
      
      // Pickup settings
      canPickup: options.canPickup || false,
      isHeld: false,
      weight: options.weight || 1.0, // Affects physics/movement when held
      holdOffset: options.holdOffset || new THREE.Vector3(0, 0, 0), // Offset when held
      snapRotation: options.snapRotation || false, // Whether to snap rotation when held
      
      // Animation settings
      animations: options.animations || {},
      currentAnimation: null,
      
      // State tracking
      isActive: options.isActive || false, // For toggleable objects
      cooldown: 0, // Cooldown before can interact again
      cooldownTime: options.cooldownTime || 0.5, // Time in seconds
      
      // Physics interactions
      affectedByForces: options.affectedByForces || false,
      breakable: options.breakable || false,
      health: options.health || 100,
    };
    
    // Create outline material if not exists
    if (!this.outlineMaterials.has(object)) {
      this._createOutlineMesh(object);
    }
    
    // Add to interactable objects list
    this.interactableObjects.push(object);
    
    // Return object for chaining
    return object;
  }
  
  // Unregister an object from being interactable
  unregisterInteractable(object) {
    // Remove interactable flag
    if (object.userData) {
      object.userData.interactable = false;
    }
    
    // Remove from highlighted if it was
    if (this.highlightedObject === object) {
      this.highlightedObject = null;
    }
    
    // Remove from nearby objects if it was
    const nearbyIndex = this.nearbyObjects.indexOf(object);
    if (nearbyIndex !== -1) {
      this.nearbyObjects.splice(nearbyIndex, 1);
    }
    
    // Drop if held
    if (this.heldObject === object) {
      this.dropObject();
    }
    
    // Remove outline mesh
    if (this.outlineMaterials.has(object)) {
      const outlineMesh = this.outlineMaterials.get(object);
      if (outlineMesh.parent) {
        outlineMesh.parent.remove(outlineMesh);
      }
      outlineMesh.geometry.dispose();
      outlineMesh.material.dispose();
      this.outlineMaterials.delete(object);
    }
    
    // Remove from interactable objects list
    const index = this.interactableObjects.indexOf(object);
    if (index !== -1) {
      this.interactableObjects.splice(index, 1);
    }
  }
  
  // Create an outline mesh for an interactable object
  _createOutlineMesh(object) {
    // Skip if object doesn't have geometry
    if (!object.geometry && (!object.children || object.children.length === 0)) {
      return;
    }
    
    let outlineGeometry;
    let originalScale = new THREE.Vector3(1, 1, 1);
    
    // If the object has its own geometry
    if (object.geometry) {
      outlineGeometry = object.geometry.clone();
      if (object.scale) {
        originalScale.copy(object.scale);
      }
    } 
    // If it's a group or has children, create a box geometry based on its bounding box
    else if (object.children && object.children.length > 0) {
      // Calculate bounding box
      const bbox = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      
      // Create slightly larger box geometry
      outlineGeometry = new THREE.BoxGeometry(
        size.x + this.outlineThickness * 2,
        size.y + this.outlineThickness * 2,
        size.z + this.outlineThickness * 2
      );
      
      // Adjust position offset based on bounding box center
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      center.sub(object.position); // Get local center
    }
    
    // Create outline material
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: this.highlightColor,
      transparent: true,
      opacity: 0.6,
      side: THREE.BackSide,
    });
    
    // Create outline mesh
    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.05); // Make slightly larger
    outlineMesh.renderOrder = 0; // Render before other objects
    outlineMesh.visible = false; // Hide by default
    
    // Add outline mesh to the scene
    if (object.parent) {
      object.parent.add(outlineMesh);
      outlineMesh.position.copy(object.position);
      outlineMesh.quaternion.copy(object.quaternion);
    } else {
      this.scene.add(outlineMesh);
    }
    
    // Store reference to the outline mesh
    this.outlineMaterials.set(object, outlineMesh);
  }
  
  // Update highlighted object outline position
  _updateOutlinePosition(object) {
    if (!this.outlineMaterials.has(object)) return;
    
    const outlineMesh = this.outlineMaterials.get(object);
    outlineMesh.position.copy(object.position);
    outlineMesh.quaternion.copy(object.quaternion);
  }
  
  // Find interactable object in view
  _findInteractableInView() {
    // Create direction vector from camera
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    // Set up raycaster from character perspective
    this.raycaster.set(
      this.character.position.clone().add(new THREE.Vector3(0, 1.6, 0)), // Eye level
      direction
    );
    
    // Find intersections with interactable objects
    const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);
    
    // Return the first interactable object found
    if (intersects.length > 0) {
      // Find the actual interactable object (may be a parent of what was hit)
      let interactable = intersects[0].object;
      
      // Traverse up the parent chain to find interactable
      while (interactable && (!interactable.userData || !interactable.userData.interactable)) {
        interactable = interactable.parent;
      }
      
      if (interactable && interactable.userData && interactable.userData.interactable) {
        return {
          object: interactable,
          distance: intersects[0].distance,
          point: intersects[0].point
        };
      }
    }
    
    return null;
  }
  
  // Find interactable object using mouse position (for third person)
  _findInteractableWithMouse(mouse) {
    // Update the raycaster with the mouse position
    this.raycaster.setFromCamera(mouse, this.camera);
    
    // Find intersections with interactable objects
    const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);
    
    // Return the first interactable object found
    if (intersects.length > 0) {
      // Find the actual interactable object (may be a parent of what was hit)
      let interactable = intersects[0].object;
      
      // Traverse up the parent chain to find interactable
      while (interactable && (!interactable.userData || !interactable.userData.interactable)) {
        interactable = interactable.parent;
      }
      
      if (interactable && interactable.userData && interactable.userData.interactable) {
        return {
          object: interactable,
          distance: intersects[0].distance,
          point: intersects[0].point
        };
      }
    }
    
    return null;
  }
  
  // Update nearby objects
  _updateNearbyObjects() {
    this.nearbyObjects = [];
    
    // Check distance to all interactable objects
    for (const object of this.interactableObjects) {
      if (!object.position) continue;
      
      const distance = this.character.position.distanceTo(object.position);
      
      if (distance <= this.interactionDistance) {
        this.nearbyObjects.push(object);
      }
    }
    
    // Sort by distance
    this.nearbyObjects.sort((a, b) => {
      const distA = this.character.position.distanceTo(a.position);
      const distB = this.character.position.distanceTo(b.position);
      return distA - distB;
    });
  }
  
  // Handle interaction key press
  _handleInteraction() {
    // If we're holding an object, this is a drop action
    if (this.heldObject) {
      this.dropObject();
      return;
    }
    
    // Find interactable in view
    const interactable = this._findInteractableInView();
    
    if (interactable && interactable.object) {
      this._interactWith(interactable.object);
    }
  }
  
  // Handle mouse-based interaction (for third person)
  _handleMouseInteraction(mouse) {
    // If we're holding an object, this is a drop action
    if (this.heldObject) {
      this.dropObject();
      return;
    }
    
    // Find interactable with mouse
    const interactable = this._findInteractableWithMouse(mouse);
    
    if (interactable && interactable.object) {
      // Check if object is within interaction range
      const distance = this.character.position.distanceTo(interactable.object.position);
      
      if (distance <= this.interactionDistance) {
        this._interactWith(interactable.object);
      } else {
        // Outside interaction range - emit event so character can potentially move toward it
        this.emit('interactionOutOfRange', {
          object: interactable.object,
          distance: distance,
          position: interactable.object.position
        });
      }
    }
  }
  
  // Handle grab key press
  _handleGrab() {
    // If already holding an object, drop it
    if (this.heldObject) {
      this.dropObject();
      return;
    }
    
    // Find interactable in view
    const interactable = this._findInteractableInView();
    
    if (interactable && interactable.object) {
      const options = interactable.object.userData.interactionOptions;
      
      // Check if object can be picked up
      if (options && options.canPickup) {
        this.pickupObject(interactable.object);
      }
    }
  }
  
  // Interact with an object
  _interactWith(object) {
    if (!object.userData || !object.userData.interactable) return;
    
    const options = object.userData.interactionOptions;
    
    // Check cooldown
    if (options.cooldown > 0) return;
    
    // Set cooldown
    options.cooldown = options.cooldownTime;
    
    // Handle interaction based on type
    switch (options.type) {
      case 'pickup':
        this.pickupObject(object);
        break;
        
      case 'use':
        // Toggle active state
        options.isActive = !options.isActive;
        
        // Call custom interaction handler if provided
        if (options.onInteract) {
          options.onInteract(object, this.character);
        }
        
        // Emit event
        this.emit('objectUsed', {
          object: object,
          isActive: options.isActive
        });
        break;
        
      case 'data':
        // Emit event for data viewing
        this.emit('dataAccessed', {
          object: object,
          data: options.data
        });
        break;
        
      case 'container':
        // Emit event for container opening
        this.emit('containerOpened', {
          object: object,
          contents: options.data
        });
        break;
        
      case 'generic':
      default:
        // Call custom interaction handler if provided
        if (options.onInteract) {
          options.onInteract(object, this.character);
        }
        
        // Emit generic interaction event
        this.emit('objectInteraction', {
          object: object,
          type: options.type
        });
        break;
    }
  }
  
  // Pick up an object
  pickupObject(object) {
    if (!object.userData || !object.userData.interactable) return;
    
    const options = object.userData.interactionOptions;
    
    // Check if object can be picked up
    if (!options.canPickup) return;
    
    // If already holding something, drop it first
    if (this.heldObject) {
      this.dropObject();
    }
    
    // Save original parent and position/rotation
    options.originalParent = object.parent;
    options.originalPosition = object.position.clone();
    options.originalRotation = object.quaternion.clone();
    
    // Remove from original parent
    if (object.parent) {
      object.parent.remove(object);
    }
    
    // Add to character as child
    this.character.add(object);
    
    // Position based on hold offset
    object.position.copy(options.holdOffset);
    
    // If snap rotation, reset rotation
    if (options.snapRotation) {
      object.rotation.set(0, 0, 0);
    }
    
    // Update state
    options.isHeld = true;
    this.heldObject = object;
    
    // Hide highlight
    if (this.outlineMaterials.has(object)) {
      this.outlineMaterials.get(object).visible = false;
    }
    
    // Emit event
    this.emit('objectPickedUp', {
      object: object,
      weight: options.weight
    });
  }
  
  // Drop a held object
  dropObject() {
    if (!this.heldObject) return;
    
    const object = this.heldObject;
    const options = object.userData.interactionOptions;
    
    // Remove from character
    this.character.remove(object);
    
    // Get drop position in front of character
    const dropDistance = 1.5;
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.character.quaternion);
    const dropPosition = this.character.position.clone().add(
      direction.multiplyScalar(dropDistance).add(new THREE.Vector3(0, 1, 0))
    );
    
    // Add back to original parent or scene
    if (options.originalParent) {
      options.originalParent.add(object);
    } else {
      this.scene.add(object);
    }
    
    // Set to drop position
    object.position.copy(dropPosition);
    
    // Apply some forward momentum if physics enabled
    if (options.affectedByForces && object.userData.velocity) {
      const dropVelocity = direction.clone().multiplyScalar(2);
      object.userData.velocity.copy(dropVelocity);
    }
    
    // Update state
    options.isHeld = false;
    this.heldObject = null;
    
    // Emit event
    this.emit('objectDropped', {
      object: object,
      position: dropPosition
    });
  }
  
  // Throw the held object
  throwObject(force = 10) {
    if (!this.heldObject) return;
    
    const object = this.heldObject;
    const options = object.userData.interactionOptions;
    
    // Remove from character
    this.character.remove(object);
    
    // Get throw direction
    const throwDirection = new THREE.Vector3();
    this.camera.getWorldDirection(throwDirection);
    
    // Get throw position
    const throwPosition = this.character.position.clone().add(
      new THREE.Vector3(0, 1.6, 0).add(throwDirection.clone().multiplyScalar(0.5))
    );
    
    // Add to scene
    this.scene.add(object);
    
    // Set to throw position
    object.position.copy(throwPosition);
    
    // Apply physics impulse
    if (options.affectedByForces && object.userData.velocity) {
      const throwVelocity = throwDirection.clone().multiplyScalar(force);
      object.userData.velocity.copy(throwVelocity);
    }
    
    // Update state
    options.isHeld = false;
    this.heldObject = null;
    
    // Emit event
    this.emit('objectThrown', {
      object: object,
      direction: throwDirection,
      force: force
    });
  }
  
  // Update the interaction system
  update(deltaTime) {
    // Update cooldowns on all interactable objects
    for (const object of this.interactableObjects) {
      if (object.userData && object.userData.interactionOptions) {
        const options = object.userData.interactionOptions;
        
        if (options.cooldown > 0) {
          options.cooldown -= deltaTime;
          if (options.cooldown < 0) options.cooldown = 0;
        }
      }
    }
    
    // Update nearby objects
    this._updateNearbyObjects();
    
    // Find interactable in view
    const interactable = this._findInteractableInView();
    
    // Update highlighted object
    if (this.highlightedObject && (!interactable || interactable.object !== this.highlightedObject)) {
      // No longer highlighted
      if (this.outlineMaterials.has(this.highlightedObject)) {
        this.outlineMaterials.get(this.highlightedObject).visible = false;
      }
      
      this.highlightedObject = null;
      this.interactionMarker.visible = false;
      
      this.emit('highlightEnd', null);
    }
    
    if (interactable && interactable.object && this.highlightedObject !== interactable.object) {
      // New highlighted object
      this.highlightedObject = interactable.object;
      
      // Show outline
      if (this.outlineMaterials.has(this.highlightedObject)) {
        this.outlineMaterials.get(this.highlightedObject).visible = true;
        this._updateOutlinePosition(this.highlightedObject);
      }
      
      // Show interaction marker at the hit point
      this.interactionMarker.position.copy(interactable.point);
      
      // Orient marker to face camera
      this.interactionMarker.lookAt(this.camera.position);
      
      // Make marker visible
      this.interactionMarker.visible = true;
      
      // Get interaction message
      const message = this.highlightedObject.userData.interactionOptions?.message || 'Interact';
      
      // Emit highlight event
      this.emit('highlightStart', {
        object: this.highlightedObject,
        message: message,
        type: this.highlightedObject.userData.interactionOptions?.type
      });
    }
    
    // Update held object animations
    if (this.heldObject && this.heldObject.userData.interactionOptions) {
      const options = this.heldObject.userData.interactionOptions;
      
      if (options.currentAnimation) {
        const animation = options.animations[options.currentAnimation];
        
        if (animation && animation.update) {
          animation.update(deltaTime);
        }
      }
    }
  }
  
  // Dispose of resources
  dispose() {
    // Clean up interaction marker
    if (this.interactionMarker) {
      this.scene.remove(this.interactionMarker);
      this.interactionMarker.geometry.dispose();
      this.interactionMarker.material.dispose();
    }
    
    // Clean up outline meshes
    for (const [obj, mesh] of this.outlineMaterials.entries()) {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
      
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    
    // Drop any held object
    if (this.heldObject) {
      this.dropObject();
    }
    
    // Clear all lists
    this.outlineMaterials.clear();
    this.interactableObjects = [];
    this.nearbyObjects = [];
    this.highlightedObject = null;
  }
}

export default InteractionSystem;