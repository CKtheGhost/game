import * as THREE from 'three';

class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
    
    // Store all particle systems
    this.particleSystems = {
      movementTrail: null,
      phaseShift: null,
      timeDilation: null,
      molecularReconstruction: null,
      quantumTeleportation: null,
      ambientAura: null,
      quantumSuperposition: null, // New quantum superposition effect
      timeDilationField: null, // New time dilation field effect
      cosmicRadiation: null, // New cosmic radiation effect
      quantumEntanglement: null, // New quantum entanglement effect
    };
    
    // Settings
    this.settings = {
      movementTrail: {
        enabled: true,
        particleCount: 500,
        particleSize: 0.1,
        lifespan: 1.5, // seconds
        spawnRate: 25, // particles per second
        colors: [
          new THREE.Color(0x00ffff), // cyan
          new THREE.Color(0x0088ff), // blue
          new THREE.Color(0xff00ff), // magenta
        ],
        speedFactor: 1.0,
        sizeVariation: 0.5,
        gravity: -0.1,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      },
      
      phaseShift: {
        enabled: true,
        particleCount: 300,
        particleSize: 0.2,
        lifespan: 1.0,
        colors: [
          new THREE.Color(0x8800ff), // purple
          new THREE.Color(0xff00ff), // magenta
          new THREE.Color(0x0000ff), // blue
        ],
        speedFactor: 1.5,
        sizeVariation: 0.7,
        gravity: 0,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      },
      
      timeDilation: {
        enabled: true,
        particleCount: 400,
        particleSize: 0.15,
        lifespan: 2.0,
        colors: [
          new THREE.Color(0x00ff88), // teal
          new THREE.Color(0x88ff00), // lime
          new THREE.Color(0xffff00), // yellow
        ],
        speedFactor: 0.5, // slower for time dilation
        sizeVariation: 0.3,
        gravity: 0,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        // Enhanced time dilation properties
        timeWarpFactor: 3.0, // How much to warp particles 
        timeRippleSpeed: 2.0, // Speed of ripple effect
        temporalEchoCount: 3, // Number of "echoes" to create
        distortionIntensity: 0.8, // Intensity of visual distortion
      },
      
      molecularReconstruction: {
        enabled: true,
        particleCount: 600,
        particleSize: 0.08,
        lifespan: 1.2,
        colors: [
          new THREE.Color(0xff8800), // orange
          new THREE.Color(0xff0000), // red
          new THREE.Color(0x880000), // dark red
        ],
        speedFactor: 1.2,
        sizeVariation: 0.6,
        gravity: 0.05,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      },
      
      quantumTeleportation: {
        enabled: true,
        particleCount: 350,
        particleSize: 0.25,
        lifespan: 0.8,
        colors: [
          new THREE.Color(0xffffff), // white
          new THREE.Color(0x00ffff), // cyan
          new THREE.Color(0xff00ff), // magenta
        ],
        speedFactor: 2.0,
        sizeVariation: 0.9,
        gravity: -0.2,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
      },
      
      ambientAura: {
        enabled: true,
        particleCount: 200,
        particleSize: 0.1,
        lifespan: 3.0,
        colors: [
          new THREE.Color(0x0088ff), // blue
          new THREE.Color(0x00ffff), // cyan
          new THREE.Color(0x88ffff), // light cyan
        ],
        speedFactor: 0.4,
        sizeVariation: 0.4,
        gravity: 0.02,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      },
      
      // New quantum superposition effect
      quantumSuperposition: {
        enabled: true,
        particleCount: 500,
        particleSize: 0.12,
        lifespan: 1.8,
        colors: [
          new THREE.Color(0x0066ff), // blue
          new THREE.Color(0xff66ff), // pink
          new THREE.Color(0x66ffff), // cyan
        ],
        speedFactor: 0.8,
        sizeVariation: 0.4,
        gravity: 0,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        // Superposition specific properties
        stateCount: 3, // Number of quantum states to show
        stateTransitionSpeed: 1.2, // How fast states change
        waveFunctionSpread: 0.8, // How spread out the superposition is
        collapseRate: 0.3, // How quickly a superposition can collapse
        quantumFluctuationRate: 0.5, // Rate of random quantum fluctuations
      },
      
      // New time dilation field 
      timeDilationField: {
        enabled: true,
        particleCount: 300,
        particleSize: 0.2,
        lifespan: 4.0, // Longer life for field effect
        colors: [
          new THREE.Color(0x0000ff), // deep blue
          new THREE.Color(0x00ffff), // cyan
          new THREE.Color(0x00ff88), // teal
        ],
        speedFactor: 0.15, // Very slow for time dilation effect
        sizeVariation: 0.5,
        gravity: 0,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        // Field specific properties
        radius: 4.0, // Radius of effect
        dilationFactor: 5.0, // How much to slow down particles
        rippleFrequency: 3.0, // Frequency of time ripples
        curvatureIntensity: 0.8, // Intensity of space curvature
        distortionLayers: 4, // Distinct layers of distortion
      },
      
      // New cosmic radiation effect
      cosmicRadiation: {
        enabled: true,
        particleCount: 400,
        particleSize: 0.06,
        lifespan: 0.8,
        colors: [
          new THREE.Color(0x6600ff), // purple
          new THREE.Color(0xff00ff), // magenta
          new THREE.Color(0xff0066), // red-pink
        ],
        speedFactor: 2.5, // Fast streaking particles
        sizeVariation: 0.3,
        gravity: 0,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        // Radiation specific properties
        streakLength: 2.0, // Length of particle streaks
        directionality: 0.8, // How directional the radiation is
        burstFrequency: 0.5, // Frequency of radiation bursts
        energyLevels: [0.5, 1.0, 2.0], // Different radiation energy levels
        affectsGameplay: true, // Whether radiation affects gameplay
      },
      
      // New quantum entanglement effect
      quantumEntanglement: {
        enabled: true,
        particleCount: 250,
        particleSize: 0.15,
        lifespan: 3.0,
        colors: [
          new THREE.Color(0xff00aa), // pink
          new THREE.Color(0x00ffaa), // green-cyan
          new THREE.Color(0xaaff00), // yellow-green
        ],
        speedFactor: 0.6,
        sizeVariation: 0.5,
        gravity: 0,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        // Entanglement specific properties
        maxConnections: 100, // Maximum number of entanglement connections
        connectionWidth: 0.02, // Width of connection beams
        connectionOpacity: 0.5, // Opacity of connections
        connectionColor: new THREE.Color(0x88ffff), // Color of connections
        synchronizationFactor: 0.9, // How synchronized entangled particles are
        maxEntanglementDistance: 5.0, // Maximum distance for entanglement
      },
    };
    
    // Performance settings
    this.performanceMode = 'high'; // 'low', 'medium', 'high'
    
    // Create particle systems
    this._initializeParticleSystems();
  }
  
  // Initialize all particle systems
  _initializeParticleSystems() {
    // Create each particle system
    this._createMovementTrail();
    this._createAmbientAura();
    
    // Create advanced quantum effects
    this._createQuantumSuperposition();
    
    // Ability particle systems are created on demand when the ability is used
  }
  
  /**
   * Create the quantum superposition effect
   * @private
   */
  _createQuantumSuperposition() {
    const settings = this.settings.quantumSuperposition;
    if (!settings.enabled) return;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(settings.particleCount * 3);
    const colors = new Float32Array(settings.particleCount * 3);
    const sizes = new Float32Array(settings.particleCount);
    const states = new Float32Array(settings.particleCount); // Which quantum state the particle is in
    const stateSpeeds = new Float32Array(settings.particleCount); // Speed of state transitions
    const stateTransitions = new Float32Array(settings.particleCount); // Tracking state transitions
    
    // Initialize all particles in superposition state
    for (let i = 0; i < settings.particleCount; i++) {
      // Initialize in a sphere around position (0,0,0) - will follow character later
      const radius = Math.random() * settings.waveFunctionSpread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Assign random color from the settings.colors array
      const colorIndex = Math.floor(Math.random() * settings.colors.length);
      colors[i * 3] = settings.colors[colorIndex].r;
      colors[i * 3 + 1] = settings.colors[colorIndex].g;
      colors[i * 3 + 2] = settings.colors[colorIndex].b;
      
      // Random size
      sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
      
      // Initialize quantum state (random state between 0 and stateCount)
      states[i] = Math.floor(Math.random() * settings.stateCount);
      
      // Random state transition speed
      stateSpeeds[i] = (0.5 + Math.random()) * settings.stateTransitionSpeed;
      
      // State transition progress (0 to 1)
      stateTransitions[i] = Math.random();
    }
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: settings.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: settings.opacity,
      blending: settings.blending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.frustumCulled = false; // Prevent culling of particles
    
    // Add custom properties for updating
    particleSystem.userData = {
      settings: settings,
      states: states,
      stateSpeeds: stateSpeeds,
      stateTransitions: stateTransitions,
      time: 0,
      currentAmplitudes: new Float32Array(settings.stateCount).fill(1.0 / settings.stateCount), // Equal superposition initially
      isCollapsing: false,
      collapsingTo: -1, // Target state when collapsing
      collapseProgress: 0, // Progress of collapse (0 to 1)
    };
    
    // Add to scene
    this.scene.add(particleSystem);
    
    // Store reference
    this.particleSystems.quantumSuperposition = particleSystem;
  }
  
  // Set the performance mode
  setPerformanceMode(mode) {
    this.performanceMode = mode;
    
    // Adjust particle counts based on performance mode
    const scaleFactor = mode === 'low' ? 0.3 : mode === 'medium' ? 0.6 : 1.0;
    
    for (const key in this.settings) {
      const originalCount = this.settings[key].originalParticleCount || this.settings[key].particleCount;
      this.settings[key].originalParticleCount = originalCount;
      this.settings[key].particleCount = Math.floor(originalCount * scaleFactor);
    }
    
    // Recreate particle systems with new settings
    this._disposeParticleSystems();
    this._initializeParticleSystems();
  }
  
  // Create a particle texture
  _createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  // Create the movement trail particle system
  _createMovementTrail() {
    const settings = this.settings.movementTrail;
    if (!settings.enabled) return;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(settings.particleCount * 3);
    const colors = new Float32Array(settings.particleCount * 3);
    const sizes = new Float32Array(settings.particleCount);
    const lifetimes = new Float32Array(settings.particleCount);
    const velocities = new Float32Array(settings.particleCount * 3);
    
    // Initialize all particles as inactive
    for (let i = 0; i < settings.particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      colors[i * 3] = settings.colors[0].r;
      colors[i * 3 + 1] = settings.colors[0].g;
      colors[i * 3 + 2] = settings.colors[0].b;
      
      sizes[i] = 0; // Start with size 0 (inactive)
      lifetimes[i] = 0; // Inactive
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: settings.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: settings.opacity,
      blending: settings.blending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.frustumCulled = false; // Prevent culling of particles
    
    // Add custom properties for updating
    particleSystem.userData = {
      settings: settings,
      lifetimes: lifetimes,
      velocities: velocities,
      nextParticleIndex: 0,
      timeSinceLastEmission: 0,
    };
    
    // Add to scene
    this.scene.add(particleSystem);
    
    // Store reference
    this.particleSystems.movementTrail = particleSystem;
  }
  
  // Create the ambient aura particle system
  _createAmbientAura() {
    const settings = this.settings.ambientAura;
    if (!settings.enabled) return;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(settings.particleCount * 3);
    const colors = new Float32Array(settings.particleCount * 3);
    const sizes = new Float32Array(settings.particleCount);
    const lifetimes = new Float32Array(settings.particleCount);
    const velocities = new Float32Array(settings.particleCount * 3);
    
    // Initialize all particles
    for (let i = 0; i < settings.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      // Random color from the colors array
      const colorIndex = Math.floor(Math.random() * settings.colors.length);
      colors[i * 3] = settings.colors[colorIndex].r;
      colors[i * 3 + 1] = settings.colors[colorIndex].g;
      colors[i * 3 + 2] = settings.colors[colorIndex].b;
      
      sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
      lifetimes[i] = Math.random() * settings.lifespan; // Random initial lifetime
      
      // Random velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.1 * settings.speedFactor;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1 * settings.speedFactor;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1 * settings.speedFactor;
    }
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: settings.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: settings.opacity,
      blending: settings.blending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.frustumCulled = false; // Prevent culling of particles
    
    // Add custom properties for updating
    particleSystem.userData = {
      settings: settings,
      lifetimes: lifetimes,
      velocities: velocities,
    };
    
    // Add to scene
    this.scene.add(particleSystem);
    
    // Store reference
    this.particleSystems.ambientAura = particleSystem;
  }
  
  // Create a particle system for an ability effect
  _createAbilityParticleSystem(abilityName) {
    const settings = this.settings[abilityName];
    if (!settings || !settings.enabled) return null;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(settings.particleCount * 3);
    const colors = new Float32Array(settings.particleCount * 3);
    const sizes = new Float32Array(settings.particleCount);
    const lifetimes = new Float32Array(settings.particleCount);
    const velocities = new Float32Array(settings.particleCount * 3);
    
    // Initialize all particles as inactive
    for (let i = 0; i < settings.particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      colors[i * 3] = settings.colors[0].r;
      colors[i * 3 + 1] = settings.colors[0].g;
      colors[i * 3 + 2] = settings.colors[0].b;
      
      sizes[i] = 0; // Start with size 0 (inactive)
      lifetimes[i] = 0; // Inactive
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: settings.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: settings.opacity,
      blending: settings.blending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.frustumCulled = false; // Prevent culling of particles
    
    // Add custom properties for updating
    particleSystem.userData = {
      settings: settings,
      lifetimes: lifetimes,
      velocities: velocities,
      nextParticleIndex: 0,
      timeSinceLastEmission: 0,
    };
    
    // Add to scene
    this.scene.add(particleSystem);
    
    // Store reference
    this.particleSystems[abilityName] = particleSystem;
    
    return particleSystem;
  }
  
  // Update a single particle system
  _updateParticleSystem(particleSystem, deltaTime, characterPosition, characterVelocity) {
    if (!particleSystem) return;
    
    const userData = particleSystem.userData;
    const settings = userData.settings;
    const lifetimes = userData.lifetimes;
    const velocities = userData.velocities;
    
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    
    // Update existing particles
    for (let i = 0; i < settings.particleCount; i++) {
      // Skip inactive particles
      if (lifetimes[i] <= 0) continue;
      
      // Update lifetime
      lifetimes[i] -= deltaTime;
      
      // If particle died, deactivate it
      if (lifetimes[i] <= 0) {
        sizes[i] = 0;
        continue;
      }
      
      // Calculate life percentage (1.0 to 0.0)
      const lifePercentage = lifetimes[i] / settings.lifespan;
      
      // Update position based on velocity
      positions[i * 3] += velocities[i * 3] * deltaTime;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
      
      // Apply gravity
      velocities[i * 3 + 1] += settings.gravity * deltaTime;
      
      // Update size based on life (grow then shrink)
      const sizeScale = lifePercentage < 0.2 ? lifePercentage * 5 : 
                        lifePercentage > 0.8 ? (1 - lifePercentage) * 5 : 1.0;
      sizes[i] = settings.particleSize * sizeScale * (0.5 + Math.random() * settings.sizeVariation);
      
      // Update color based on life (transition through colors)
      const colorIndex = Math.floor((1 - lifePercentage) * settings.colors.length);
      const nextColorIndex = Math.min(colorIndex + 1, settings.colors.length - 1);
      const colorMix = ((1 - lifePercentage) * settings.colors.length) % 1;
      
      const color1 = settings.colors[colorIndex];
      const color2 = settings.colors[nextColorIndex];
      
      colors[i * 3] = color1.r * (1 - colorMix) + color2.r * colorMix;
      colors[i * 3 + 1] = color1.g * (1 - colorMix) + color2.g * colorMix;
      colors[i * 3 + 2] = color1.b * (1 - colorMix) + color2.b * colorMix;
    }
    
    // Handle trail emission for the movement trail
    if (particleSystem === this.particleSystems.movementTrail && characterPosition && characterVelocity) {
      // Only emit particles if character is moving
      const movementSpeed = Math.sqrt(
        characterVelocity.x * characterVelocity.x +
        characterVelocity.y * characterVelocity.y +
        characterVelocity.z * characterVelocity.z
      );
      
      if (movementSpeed > 0.1) {
        userData.timeSinceLastEmission += deltaTime;
        
        // Calculate emission rate based on movement speed
        const emissionInterval = 1.0 / (settings.spawnRate * Math.min(movementSpeed, 5.0) / 5.0);
        
        // Emit particles
        while (userData.timeSinceLastEmission >= emissionInterval) {
          this._emitMovementTrailParticle(particleSystem, characterPosition, characterVelocity);
          userData.timeSinceLastEmission -= emissionInterval;
        }
      }
    }
    
    // Handle ambient aura particles
    if (particleSystem === this.particleSystems.ambientAura && characterPosition) {
      // Update aura position to follow character
      particleSystem.position.copy(characterPosition);
      
      // Respawn dead particles
      for (let i = 0; i < settings.particleCount; i++) {
        if (lifetimes[i] <= 0) {
          // Reset position to random position around character
          positions[i * 3] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
          
          // Random color
          const colorIndex = Math.floor(Math.random() * settings.colors.length);
          colors[i * 3] = settings.colors[colorIndex].r;
          colors[i * 3 + 1] = settings.colors[colorIndex].g;
          colors[i * 3 + 2] = settings.colors[colorIndex].b;
          
          // Reset size
          sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
          
          // Reset lifetime
          lifetimes[i] = Math.random() * settings.lifespan + 0.5;
          
          // Random velocity outward from center
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.1 * settings.speedFactor * (0.5 + Math.random() * 0.5);
          velocities[i * 3] = Math.cos(angle) * speed;
          velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
          velocities[i * 3 + 2] = Math.sin(angle) * speed;
        }
      }
    }
    
    // Mark attributes as needing update
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
  }
  
  // Emit a single particle for the movement trail
  _emitMovementTrailParticle(particleSystem, characterPosition, characterVelocity) {
    const userData = particleSystem.userData;
    const settings = userData.settings;
    const lifetimes = userData.lifetimes;
    const velocities = userData.velocities;
    
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    
    // Get the next particle index
    const i = userData.nextParticleIndex;
    
    // Reset the particle
    positions[i * 3] = characterPosition.x;
    positions[i * 3 + 1] = characterPosition.y + 0.5; // Emit from character's middle
    positions[i * 3 + 2] = characterPosition.z;
    
    // Initial color (start with first color)
    colors[i * 3] = settings.colors[0].r;
    colors[i * 3 + 1] = settings.colors[0].g;
    colors[i * 3 + 2] = settings.colors[0].b;
    
    // Initial size
    sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
    
    // Set lifetime
    lifetimes[i] = settings.lifespan * (0.8 + Math.random() * 0.4);
    
    // Set velocity - based on character movement, but with some randomness
    const speedFactor = settings.speedFactor * (0.8 + Math.random() * 0.4);
    velocities[i * 3] = -characterVelocity.x * 0.2 * speedFactor + (Math.random() - 0.5) * 0.5;
    velocities[i * 3 + 1] = -characterVelocity.y * 0.2 * speedFactor + (Math.random() - 0.5) * 0.5 + 0.2; // Add slight upward drift
    velocities[i * 3 + 2] = -characterVelocity.z * 0.2 * speedFactor + (Math.random() - 0.5) * 0.5;
    
    // Move to next particle
    userData.nextParticleIndex = (i + 1) % settings.particleCount;
  }
  
  /**
   * Create a time dilation field
   * @private
   */
  _createTimeDilationField() {
    const settings = this.settings.timeDilationField;
    if (!settings.enabled) return;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(settings.particleCount * 3);
    const colors = new Float32Array(settings.particleCount * 3);
    const sizes = new Float32Array(settings.particleCount);
    const velocities = new Float32Array(settings.particleCount * 3);
    const distortionFactors = new Float32Array(settings.particleCount); // Time dilation distortion per particle
    const layerIndices = new Float32Array(settings.particleCount); // Which distortion layer the particle is in
    
    // Initialize particles in spherical layers
    for (let i = 0; i < settings.particleCount; i++) {
      // Determine which distortion layer (0 to distortionLayers-1)
      const layer = Math.floor(Math.random() * settings.distortionLayers);
      layerIndices[i] = layer;
      
      // Calculate radius based on layer (inner layers are smaller)
      const minRadius = 0.5 + (layer / settings.distortionLayers) * settings.radius;
      const maxRadius = (layer + 1) / settings.distortionLayers * settings.radius;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      
      // Random position on sphere of this radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Use color based on layer
      const t = layer / (settings.distortionLayers - 1);
      const colorIndex = Math.min(Math.floor(t * settings.colors.length), settings.colors.length - 1);
      const nextColorIndex = Math.min(colorIndex + 1, settings.colors.length - 1);
      const colorMix = (t * settings.colors.length) % 1;
      
      // Interpolate between colors
      colors[i * 3] = settings.colors[colorIndex].r * (1 - colorMix) + settings.colors[nextColorIndex].r * colorMix;
      colors[i * 3 + 1] = settings.colors[colorIndex].g * (1 - colorMix) + settings.colors[nextColorIndex].g * colorMix;
      colors[i * 3 + 2] = settings.colors[colorIndex].b * (1 - colorMix) + settings.colors[nextColorIndex].b * colorMix;
      
      // Size based on layer (inner layers are larger)
      const sizeScale = 1.0 - (layer / settings.distortionLayers) * 0.5;
      sizes[i] = settings.particleSize * sizeScale * (0.8 + Math.random() * settings.sizeVariation);
      
      // Initial velocity - orbital motion around the center
      // Perpendicular to the radius vector for circular orbit
      const speed = settings.speedFactor * (1.0 - t * 0.8); // Inner layers move faster
      
      // Create tangent vector (perpendicular to radius)
      const radialDir = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      ).normalize();
      
      // Cross product with up vector to get tangent
      const tangent = new THREE.Vector3();
      tangent.crossVectors(radialDir, new THREE.Vector3(0, 1, 0)).normalize();
      
      // If tangent is too small (near poles), use alternative direction
      if (tangent.lengthSq() < 0.1) {
        tangent.crossVectors(radialDir, new THREE.Vector3(1, 0, 0)).normalize();
      }
      
      // Set velocity in tangent direction
      velocities[i * 3] = tangent.x * speed;
      velocities[i * 3 + 1] = tangent.y * speed;
      velocities[i * 3 + 2] = tangent.z * speed;
      
      // Distortion factor increases toward center
      distortionFactors[i] = (1.0 - radius / settings.radius) * settings.curvatureIntensity;
    }
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: settings.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: settings.opacity,
      blending: settings.blending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.frustumCulled = false; // Prevent culling of particles
    
    // Add custom properties for updating
    particleSystem.userData = {
      settings: settings,
      velocities: velocities,
      distortionFactors: distortionFactors,
      layerIndices: layerIndices,
      time: 0,
      dilationIntensity: 1.0, // Overall intensity of the effect (can be changed during gameplay)
    };
    
    // Add to scene
    this.scene.add(particleSystem);
    
    // Store reference
    this.particleSystems.timeDilationField = particleSystem;
  }
  
  /**
   * Update the quantum superposition effect
   * @param {number} deltaTime - Time passed since last update
   * @param {THREE.Vector3} characterPosition - Character position
   * @private
   */
  _updateQuantumSuperposition(deltaTime, characterPosition) {
    const system = this.particleSystems.quantumSuperposition;
    if (!system) return;
    
    const userData = system.userData;
    const settings = userData.settings;
    
    // Update time
    userData.time += deltaTime;
    
    // Position system at character position
    if (characterPosition) {
      system.position.copy(characterPosition);
    }
    
    // Get attribute arrays
    const positions = system.geometry.attributes.position.array;
    const colors = system.geometry.attributes.color.array;
    const sizes = system.geometry.attributes.size.array;
    const states = userData.states;
    const stateSpeeds = userData.stateSpeeds;
    const stateTransitions = userData.stateTransitions;
    
    // Update quantum state amplitudes (probability of each state)
    if (!userData.isCollapsing) {
      // In superposition, states evolve over time
      for (let i = 0; i < settings.stateCount; i++) {
        // Quantum fluctuation - probabilities evolve over time
        const fluctuation = Math.sin(userData.time * stateSpeeds[i] * 0.5 + i * 2.0) * settings.quantumFluctuationRate;
        userData.currentAmplitudes[i] = (1.0 / settings.stateCount) + fluctuation;
      }
      
      // Normalize amplitudes to ensure sum of probabilities = 1
      let sum = 0;
      for (let i = 0; i < settings.stateCount; i++) {
        sum += userData.currentAmplitudes[i];
      }
      for (let i = 0; i < settings.stateCount; i++) {
        userData.currentAmplitudes[i] /= sum;
      }
      
      // Randomly decide if we should collapse the superposition
      if (Math.random() < settings.collapseRate * deltaTime) {
        // Begin collapsing the wave function
        userData.isCollapsing = true;
        
        // Choose a state to collapse to based on probabilities
        const rand = Math.random();
        let cumulativeProbability = 0;
        for (let i = 0; i < settings.stateCount; i++) {
          cumulativeProbability += userData.currentAmplitudes[i];
          if (rand <= cumulativeProbability) {
            userData.collapsingTo = i;
            break;
          }
        }
        userData.collapseProgress = 0;
      }
    } else {
      // Collapse is in progress
      userData.collapseProgress += deltaTime * 2.0; // Collapse speed
      
      if (userData.collapseProgress >= 1.0) {
        // Collapse complete, reset to new superposition
        userData.isCollapsing = false;
        userData.collapseProgress = 0;
        userData.collapsingTo = -1;
        
        // Reset to equal superposition
        for (let i = 0; i < settings.stateCount; i++) {
          userData.currentAmplitudes[i] = 1.0 / settings.stateCount;
        }
      } else {
        // During collapse, gradually increase probability of target state
        for (let i = 0; i < settings.stateCount; i++) {
          if (i === userData.collapsingTo) {
            userData.currentAmplitudes[i] = (1 - userData.collapseProgress) * (1.0 / settings.stateCount) + userData.collapseProgress;
          } else {
            userData.currentAmplitudes[i] = (1 - userData.collapseProgress) * (1.0 / settings.stateCount);
          }
        }
      }
    }
    
    // Update each particle
    for (let i = 0; i < settings.particleCount; i++) {
      // Update state transition
      stateTransitions[i] += deltaTime * stateSpeeds[i];
      if (stateTransitions[i] >= 1.0) {
        // Transition to a new state
        stateTransitions[i] = 0;
        
        if (userData.isCollapsing) {
          // During collapse, particles gravitate toward the chosen state
          states[i] = userData.collapsingTo;
        } else {
          // Choose next state randomly based on current amplitudes
          const rand = Math.random();
          let cumulativeProbability = 0;
          for (let j = 0; j < settings.stateCount; j++) {
            cumulativeProbability += userData.currentAmplitudes[j];
            if (rand <= cumulativeProbability) {
              states[i] = j;
              break;
            }
          }
        }
      }
      
      // Update position - particles orbit around center based on their state
      const state = states[i];
      const statePhase = (state / settings.stateCount) * Math.PI * 2;
      const time = userData.time;
      
      // Calculate base orbital motion
      const angle = time * 0.5 + statePhase;
      const orbitRadius = settings.waveFunctionSpread * (0.5 + 0.5 * Math.sin(time * 0.2 + i * 0.1));
      
      // Position is based on state and random offset
      positions[i * 3] = Math.cos(angle + i * 0.1) * orbitRadius;
      positions[i * 3 + 1] = Math.sin(time * 0.3 + i * 0.2) * orbitRadius * 0.5;
      positions[i * 3 + 2] = Math.sin(angle + i * 0.1) * orbitRadius;
      
      // Color based on state
      const colorOffset = state / settings.stateCount * settings.colors.length;
      const colorIndex = Math.floor(colorOffset) % settings.colors.length;
      const nextColorIndex = (colorIndex + 1) % settings.colors.length;
      const colorMix = colorOffset % 1;
      
      colors[i * 3] = settings.colors[colorIndex].r * (1 - colorMix) + settings.colors[nextColorIndex].r * colorMix;
      colors[i * 3 + 1] = settings.colors[colorIndex].g * (1 - colorMix) + settings.colors[nextColorIndex].g * colorMix;
      colors[i * 3 + 2] = settings.colors[colorIndex].b * (1 - colorMix) + settings.colors[nextColorIndex].b * colorMix;
      
      // Size variation during state transition
      const transitionFactor = Math.sin(stateTransitions[i] * Math.PI) * 0.3 + 0.7;
      sizes[i] = settings.particleSize * transitionFactor * (0.8 + Math.random() * 0.4);
      
      // During collapse, particles of the chosen state grow larger
      if (userData.isCollapsing && state === userData.collapsingTo) {
        sizes[i] *= (1 + userData.collapseProgress * 0.5);
      }
    }
    
    // Mark attributes as needing update
    system.geometry.attributes.position.needsUpdate = true;
    system.geometry.attributes.color.needsUpdate = true;
    system.geometry.attributes.size.needsUpdate = true;
  }
  
  /**
   * Update the time dilation field
   * @param {number} deltaTime - Time passed since last update
   * @param {THREE.Vector3} characterPosition - Character position
   * @private
   */
  _updateTimeDilationField(deltaTime, characterPosition) {
    const system = this.particleSystems.timeDilationField;
    if (!system) return;
    
    const userData = system.userData;
    const settings = userData.settings;
    
    // Update time
    userData.time += deltaTime;
    
    // Position system at character position
    if (characterPosition) {
      system.position.copy(characterPosition);
    }
    
    // Get attribute arrays
    const positions = system.geometry.attributes.position.array;
    const colors = system.geometry.attributes.color.array;
    const sizes = system.geometry.attributes.size.array;
    const velocities = userData.velocities;
    const distortionFactors = userData.distortionFactors;
    const layerIndices = userData.layerIndices;
    
    // Update each particle
    for (let i = 0; i < settings.particleCount; i++) {
      // Get current position
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      // Calculate distance from center
      const distance = Math.sqrt(x*x + y*y + z*z);
      
      // Adjust velocity based on time dilation (inner particles move slower)
      const timeFactor = Math.max(0.1, distance / settings.radius);
      const dilationFactor = Math.pow(timeFactor, settings.dilationFactor * userData.dilationIntensity);
      
      // Apply velocity with time dilation
      positions[i * 3] += velocities[i * 3] * deltaTime * dilationFactor;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * dilationFactor;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * dilationFactor;
      
      // Add time distortion - warping space around the time dilation field
      const distortion = distortionFactors[i] * Math.sin(userData.time * settings.rippleFrequency + layerIndices[i]);
      
      // Calculate normalized radial direction
      let nx = 0, ny = 0, nz = 0;
      if (distance > 0) {
        nx = positions[i * 3] / distance;
        ny = positions[i * 3 + 1] / distance;
        nz = positions[i * 3 + 2] / distance;
      }
      
      // Add ripple effect along radial direction
      positions[i * 3] += nx * distortion * 0.1;
      positions[i * 3 + 1] += ny * distortion * 0.1;
      positions[i * 3 + 2] += nz * distortion * 0.1;
      
      // Keep particles within their layer radius
      const layerIndex = layerIndices[i];
      const outerRadius = ((layerIndex + 1) / settings.distortionLayers) * settings.radius;
      
      // New position and distance after movement
      const newX = positions[i * 3];
      const newY = positions[i * 3 + 1];
      const newZ = positions[i * 3 + 2];
      const newDistance = Math.sqrt(newX*newX + newY*newY + newZ*newZ);
      
      // If particle moved outside its layer, adjust position
      if (newDistance > outerRadius) {
        const scale = outerRadius / newDistance;
        positions[i * 3] *= scale;
        positions[i * 3 + 1] *= scale;
        positions[i * 3 + 2] *= scale;
      }
      
      // Pulse size based on time and layer
      const pulse = Math.sin(userData.time * 2 + layerIndex * 0.5) * 0.2 + 0.8;
      sizes[i] = settings.particleSize * (1.0 - (layerIndex / settings.distortionLayers) * 0.5) * pulse;
      
      // Pulse color slightly
      const layer = layerIndices[i];
      const t = layer / (settings.distortionLayers - 1);
      const colorIndex = Math.min(Math.floor(t * settings.colors.length), settings.colors.length - 1);
      const nextColorIndex = Math.min(colorIndex + 1, settings.colors.length - 1);
      const colorMix = (t * settings.colors.length) % 1;
      
      // Distortion effect on color (shifts color balance based on distortion)
      const colorDistortion = distortion * 0.2;
      
      colors[i * 3] = settings.colors[colorIndex].r * (1 - colorMix) + settings.colors[nextColorIndex].r * colorMix + colorDistortion;
      colors[i * 3 + 1] = settings.colors[colorIndex].g * (1 - colorMix) + settings.colors[nextColorIndex].g * colorMix - colorDistortion;
      colors[i * 3 + 2] = settings.colors[colorIndex].b * (1 - colorMix) + settings.colors[nextColorIndex].b * colorMix;
    }
    
    // Mark attributes as needing update
    system.geometry.attributes.position.needsUpdate = true;
    system.geometry.attributes.color.needsUpdate = true;
    system.geometry.attributes.size.needsUpdate = true;
  }
  
  // Update all particle systems
  update(deltaTime, characterPosition, characterVelocity) {
    // Update movement trail
    this._updateParticleSystem(
      this.particleSystems.movementTrail, 
      deltaTime, 
      characterPosition, 
      characterVelocity
    );
    
    // Update ambient aura
    this._updateParticleSystem(
      this.particleSystems.ambientAura,
      deltaTime,
      characterPosition,
      null
    );
    
    // Update ability effects
    for (const abilityName of ['phaseShift', 'timeDilation', 'molecularReconstruction', 'quantumTeleportation']) {
      this._updateParticleSystem(
        this.particleSystems[abilityName],
        deltaTime,
        characterPosition,
        null
      );
    }
    
    // Update quantum superposition
    this._updateQuantumSuperposition(deltaTime, characterPosition);
    
    // Update time dilation field
    this._updateTimeDilationField(deltaTime, characterPosition);
  }
  
  // Trigger a phase shift effect
  triggerPhaseShift(position, direction) {
    // Create the particle system if it doesn't exist
    if (!this.particleSystems.phaseShift) {
      this._createAbilityParticleSystem('phaseShift');
    }
    
    const particleSystem = this.particleSystems.phaseShift;
    if (!particleSystem) return;
    
    const userData = particleSystem.userData;
    const settings = userData.settings;
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    const lifetimes = userData.lifetimes;
    const velocities = userData.velocities;
    
    // Emit a burst of particles
    const burstCount = Math.min(100, settings.particleCount);
    for (let j = 0; j < burstCount; j++) {
      const i = (userData.nextParticleIndex + j) % settings.particleCount;
      
      // Position particles around the character
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.5;
      positions[i * 3] = position.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;
      
      // Initial color
      const colorIndex = Math.floor(Math.random() * settings.colors.length);
      colors[i * 3] = settings.colors[colorIndex].r;
      colors[i * 3 + 1] = settings.colors[colorIndex].g;
      colors[i * 3 + 2] = settings.colors[colorIndex].b;
      
      // Initial size
      sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
      
      // Set lifetime
      lifetimes[i] = settings.lifespan * (0.6 + Math.random() * 0.8);
      
      // Set velocity - outward from character
      const speed = settings.speedFactor * (0.5 + Math.random() * 1.0);
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed * 0.5;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
      
      // If direction is provided, add a directional component
      if (direction) {
        velocities[i * 3] += direction.x * speed * 0.5;
        velocities[i * 3 + 1] += direction.y * speed * 0.5;
        velocities[i * 3 + 2] += direction.z * speed * 0.5;
      }
    }
    
    // Update particle index
    userData.nextParticleIndex = (userData.nextParticleIndex + burstCount) % settings.particleCount;
  }
  
  // Trigger a time dilation effect
  triggerTimeDilation(position, radius = 3.0) {
    // Create the particle system if it doesn't exist
    if (!this.particleSystems.timeDilation) {
      this._createAbilityParticleSystem('timeDilation');
    }
    
    const particleSystem = this.particleSystems.timeDilation;
    if (!particleSystem) return;
    
    const userData = particleSystem.userData;
    const settings = userData.settings;
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    const lifetimes = userData.lifetimes;
    const velocities = userData.velocities;
    
    // Emit particles in a sphere around the character
    const burstCount = Math.min(150, settings.particleCount);
    for (let j = 0; j < burstCount; j++) {
      const i = (userData.nextParticleIndex + j) % settings.particleCount;
      
      // Position particles on a sphere
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = radius * Math.pow(Math.random(), 1/3); // Cube root for even distribution
      
      positions[i * 3] = position.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = position.y + r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = position.z + r * Math.cos(phi);
      
      // Initial color
      const colorIndex = Math.floor(Math.random() * settings.colors.length);
      colors[i * 3] = settings.colors[colorIndex].r;
      colors[i * 3 + 1] = settings.colors[colorIndex].g;
      colors[i * 3 + 2] = settings.colors[colorIndex].b;
      
      // Initial size
      sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
      
      // Set lifetime
      lifetimes[i] = settings.lifespan * (0.8 + Math.random() * 0.4);
      
      // Set velocity - spiral around sphere
      const spiralSpeed = settings.speedFactor * (0.3 + Math.random() * 0.3);
      const dir = new THREE.Vector3(
        positions[i * 3] - position.x,
        positions[i * 3 + 1] - position.y,
        positions[i * 3 + 2] - position.z
      ).normalize();
      
      // Tangent vector for orbital motion
      const up = new THREE.Vector3(0, 1, 0);
      const tangent = new THREE.Vector3().crossVectors(dir, up).normalize();
      if (tangent.length() < 0.1) {
        // If dir is parallel to up, use a different vector
        tangent.crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize();
      }
      
      // Slightly inward to create a spiral
      velocities[i * 3] = tangent.x * spiralSpeed - dir.x * 0.1;
      velocities[i * 3 + 1] = tangent.y * spiralSpeed - dir.y * 0.1;
      velocities[i * 3 + 2] = tangent.z * spiralSpeed - dir.z * 0.1;
    }
    
    // Update particle index
    userData.nextParticleIndex = (userData.nextParticleIndex + burstCount) % settings.particleCount;
  }
  
  // Trigger a molecular reconstruction effect
  triggerMolecularReconstruction(position, targetPosition) {
    // Create the particle system if it doesn't exist
    if (!this.particleSystems.molecularReconstruction) {
      this._createAbilityParticleSystem('molecularReconstruction');
    }
    
    const particleSystem = this.particleSystems.molecularReconstruction;
    if (!particleSystem) return;
    
    const userData = particleSystem.userData;
    const settings = userData.settings;
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    const lifetimes = userData.lifetimes;
    const velocities = userData.velocities;
    
    // Direction to target
    const direction = targetPosition ? 
      new THREE.Vector3().subVectors(targetPosition, position).normalize() : 
      new THREE.Vector3(0, 1, 0);
    
    // Emit particles flowing from character to target
    const burstCount = Math.min(200, settings.particleCount);
    for (let j = 0; j < burstCount; j++) {
      const i = (userData.nextParticleIndex + j) % settings.particleCount;
      
      // Position particles around the character
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.0;
      positions[i * 3] = position.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;
      
      // Initial color
      const colorIndex = Math.floor(Math.random() * settings.colors.length);
      colors[i * 3] = settings.colors[colorIndex].r;
      colors[i * 3 + 1] = settings.colors[colorIndex].g;
      colors[i * 3 + 2] = settings.colors[colorIndex].b;
      
      // Initial size
      sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
      
      // Set lifetime
      lifetimes[i] = settings.lifespan * (0.7 + Math.random() * 0.6);
      
      // Set velocity - toward target with some randomness
      const speed = settings.speedFactor * (0.8 + Math.random() * 0.4);
      velocities[i * 3] = direction.x * speed + (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = direction.y * speed + (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = direction.z * speed + (Math.random() - 0.5) * 0.5;
    }
    
    // Update particle index
    userData.nextParticleIndex = (userData.nextParticleIndex + burstCount) % settings.particleCount;
  }
  
  // Trigger a quantum teleportation effect
  triggerQuantumTeleportation(startPosition, endPosition) {
    // Create the particle system if it doesn't exist
    if (!this.particleSystems.quantumTeleportation) {
      this._createAbilityParticleSystem('quantumTeleportation');
    }
    
    const particleSystem = this.particleSystems.quantumTeleportation;
    if (!particleSystem) return;
    
    const userData = particleSystem.userData;
    const settings = userData.settings;
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    const lifetimes = userData.lifetimes;
    const velocities = userData.velocities;
    
    // Emit particles at both locations
    const burstCount = Math.min(200, settings.particleCount);
    for (let j = 0; j < burstCount; j++) {
      const i = (userData.nextParticleIndex + j) % settings.particleCount;
      
      // Determine if particle is at start or end position
      const atStart = j < burstCount / 2;
      const basePosition = atStart ? startPosition : endPosition;
      
      // Position particles around the position
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.2;
      positions[i * 3] = basePosition.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = basePosition.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = basePosition.z + Math.sin(angle) * radius;
      
      // Initial color
      const colorIndex = Math.floor(Math.random() * settings.colors.length);
      colors[i * 3] = settings.colors[colorIndex].r;
      colors[i * 3 + 1] = settings.colors[colorIndex].g;
      colors[i * 3 + 2] = settings.colors[colorIndex].b;
      
      // Initial size
      sizes[i] = settings.particleSize * (0.5 + Math.random() * settings.sizeVariation);
      
      // Set lifetime - shorter for more intense effect
      lifetimes[i] = settings.lifespan * (0.5 + Math.random() * 0.5);
      
      // Set velocity - explode outward
      const speed = settings.speedFactor * (1.0 + Math.random() * 1.0);
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed * 2;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }
    
    // Update particle index
    userData.nextParticleIndex = (userData.nextParticleIndex + burstCount) % settings.particleCount;
  }
  
  // Set the visibility of a particle system
  setParticleSystemVisibility(name, visible) {
    if (this.particleSystems[name]) {
      this.particleSystems[name].visible = visible;
    }
  }
  
  // Dispose of all particle systems
  _disposeParticleSystems() {
    for (const name in this.particleSystems) {
      const system = this.particleSystems[name];
      if (system) {
        this.scene.remove(system);
        system.geometry.dispose();
        system.material.dispose();
        
        if (system.material.map) {
          system.material.map.dispose();
        }
        
        this.particleSystems[name] = null;
      }
    }
  }
  
  // Dispose all resources
  dispose() {
    this._disposeParticleSystems();
  }
}

export default ParticleEffects;