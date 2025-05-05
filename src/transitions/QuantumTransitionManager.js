import { gsap } from 'gsap';
import { useGameState } from '../contexts/GameStateContext';
import * as THREE from 'three';

/**
 * QuantumTransitionManager
 * 
 * Handles smooth transitions between different sections/levels of the experience
 * with advanced quantum-themed effects.
 */
export default class QuantumTransitionManager {
  constructor(container) {
    // DOM container
    this.container = container || document.body;
    
    // References to transition elements
    this.transitionOverlay = null;
    this.particleContainer = null;
    this.rippleCanvas = null;
    
    // Three.js elements for 3D transitions
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.transitionObjects = null;
    
    // Tracks active transition state
    this.isTransitioning = false;
    this.currentTransitionType = null;
    this.transitionCallback = null;
    
    // Transition options and presets
    this.transitionPresets = {
      quantum: {
        duration: 2.0,
        ease: "power3.inOut",
        particleCount: 1000,
        particleSize: 3,
        colorStart: '#00ffff',
        colorEnd: '#ff00ff',
        shockwaveColor: '#ffffff',
      },
      entanglement: {
        duration: 1.8,
        ease: "back.out(1.5)",
        particleCount: 600,
        particleSize: 4,
        colorStart: '#ffff00',
        colorEnd: '#00ff88',
        shockwaveColor: '#88ffff',
      },
      phaseShift: {
        duration: 1.2,
        ease: "expo.inOut",
        particleCount: 800,
        particleSize: 2,
        colorStart: '#ff00ff',
        colorEnd: '#0088ff',
        shockwaveColor: '#ffffff',
      },
      timeDilation: {
        duration: 2.5,
        ease: "elastic.out(1, 0.5)",
        particleCount: 300,
        particleSize: 5,
        colorStart: '#00ffaa',
        colorEnd: '#aa00ff',
        shockwaveColor: '#ffaa00',
      },
      teleportation: {
        duration: 0.8,
        ease: "power4.in",
        particleCount: 2000,
        particleSize: 1,
        colorStart: '#ffffff',
        colorEnd: '#00ffff',
        shockwaveColor: '#ffffff',
      }
    };
    
    // Initialize transition elements
    this._initialize();
  }
  
  /**
   * Initialize transition elements
   */
  _initialize() {
    // Create transition overlay
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'quantum-transition-overlay';
    this.transitionOverlay.style.position = 'fixed';
    this.transitionOverlay.style.top = '0';
    this.transitionOverlay.style.left = '0';
    this.transitionOverlay.style.width = '100vw';
    this.transitionOverlay.style.height = '100vh';
    this.transitionOverlay.style.pointerEvents = 'none';
    this.transitionOverlay.style.zIndex = '10000';
    this.transitionOverlay.style.opacity = '0';
    this.transitionOverlay.style.visibility = 'hidden';
    this.transitionOverlay.style.transition = 'visibility 0s linear 0.5s';
    this.transitionOverlay.style.background = 'rgba(0, 0, 0, 0)';
    this.container.appendChild(this.transitionOverlay);
    
    // Create particle container for 2D effects
    this.particleContainer = document.createElement('div');
    this.particleContainer.className = 'quantum-particle-container';
    this.particleContainer.style.position = 'absolute';
    this.particleContainer.style.top = '0';
    this.particleContainer.style.left = '0';
    this.particleContainer.style.width = '100%';
    this.particleContainer.style.height = '100%';
    this.particleContainer.style.overflow = 'hidden';
    this.transitionOverlay.appendChild(this.particleContainer);
    
    // Create canvas for ripple/shockwave effects
    this.rippleCanvas = document.createElement('canvas');
    this.rippleCanvas.className = 'quantum-ripple-canvas';
    this.rippleCanvas.style.position = 'absolute';
    this.rippleCanvas.style.top = '0';
    this.rippleCanvas.style.left = '0';
    this.rippleCanvas.style.width = '100%';
    this.rippleCanvas.style.height = '100%';
    this.rippleCanvas.width = window.innerWidth;
    this.rippleCanvas.height = window.innerHeight;
    this.transitionOverlay.appendChild(this.rippleCanvas);
    
    // Initialize Three.js for 3D transitions
    this._initializeThreeJs();
    
    // Set up window resize handler
    window.addEventListener('resize', this._handleResize.bind(this));
  }
  
  /**
   * Initialize Three.js for 3D transition effects
   */
  _initializeThreeJs() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 10;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.transitionOverlay.appendChild(this.renderer.domElement);
    
    // Create transition objects group
    this.transitionObjects = new THREE.Group();
    this.scene.add(this.transitionObjects);
  }
  
  /**
   * Handle window resize
   */
  _handleResize() {
    // Update canvas dimensions
    this.rippleCanvas.width = window.innerWidth;
    this.rippleCanvas.height = window.innerHeight;
    
    // Update renderer
    if (this.renderer) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Update camera
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    
    // Re-render if active
    if (this.isTransitioning) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Create 2D particle effect
   * @param {Object} options - Particle effect options
   */
  _create2DParticles(options) {
    const { particleCount, particleSize, colorStart, colorEnd } = options;
    
    // Clear any existing particles
    this.particleContainer.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'quantum-particle';
      particle.style.position = 'absolute';
      particle.style.width = `${particleSize}px`;
      particle.style.height = `${particleSize}px`;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = i % 2 === 0 ? colorStart : colorEnd;
      particle.style.opacity = '0';
      particle.style.transform = 'translate(-50%, -50%)';
      
      // Random initial position (centered)
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      this.particleContainer.appendChild(particle);
      
      // Animate particle
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.8;
      const duration = options.duration * (0.8 + Math.random() * 0.4);
      const delay = Math.random() * options.duration * 0.5;
      
      gsap.to(particle, {
        left: `${x + Math.cos(angle) * distance}px`,
        top: `${y + Math.sin(angle) * distance}px`,
        opacity: 1,
        duration: duration * 0.3,
        delay: delay,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(particle, {
            opacity: 0,
            duration: duration * 0.7,
            delay: 0,
            ease: 'power2.in'
          });
        }
      });
    }
  }
  
  /**
   * Create ripple/shockwave effect
   * @param {Object} options - Shockwave effect options
   */
  _createShockwaveEffect(options) {
    const canvas = this.rippleCanvas;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const shockwaveColor = options.shockwaveColor || '#ffffff';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create shockwave animation
    let progress = 0;
    const duration = options.duration * 1000; // convert to ms
    const maxRadius = Math.max(canvas.width, canvas.height);
    const startTime = performance.now();
    
    const animateShockwave = (timestamp) => {
      const elapsed = timestamp - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw shockwave
      const radius = maxRadius * Math.pow(progress, 0.8);
      const lineWidth = 15 * (1 - progress);
      
      ctx.strokeStyle = shockwaveColor;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1 - progress;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Continue animation if not complete
      if (progress < 1 && this.isTransitioning) {
        requestAnimationFrame(animateShockwave);
      }
    };
    
    // Start animation
    requestAnimationFrame(animateShockwave);
  }
  
  /**
   * Create 3D transition effect
   * @param {Object} options - Transition effect options
   */
  _create3DTransitionEffect(options) {
    // Clear existing objects
    while (this.transitionObjects.children.length > 0) {
      const object = this.transitionObjects.children[0];
      this.transitionObjects.remove(object);
    }
    
    // Create different 3D effects based on transition type
    switch (this.currentTransitionType) {
      case 'quantum':
        this._createQuantumPortalEffect(options);
        break;
        
      case 'entanglement':
        this._createEntanglementEffect(options);
        break;
        
      case 'phaseShift':
        this._createPhaseShiftEffect(options);
        break;
        
      case 'timeDilation':
        this._createTimeDilationEffect(options);
        break;
        
      case 'teleportation':
        this._createTeleportationEffect(options);
        break;
        
      default:
        this._createQuantumPortalEffect(options);
    }
    
    // Start rendering loop
    this._startRenderLoop();
  }
  
  /**
   * Create quantum portal effect
   * @param {Object} options - Effect options
   */
  _createQuantumPortalEffect(options) {
    // Create a portal ring
    const ringGeometry = new THREE.TorusGeometry(5, 0.5, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(options.colorStart),
      transparent: true,
      opacity: 0
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.transitionObjects.add(ring);
    
    // Create portal particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = options.particleCount;
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + (Math.random() - 0.5) * 2;
      
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(options.colorEnd),
      size: options.particleSize * 0.1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.transitionObjects.add(particles);
    
    // Store animation objects
    this.animatedObjects = {
      ring,
      particles,
      rotation: { value: 0 },
      scale: { value: 0.1 }
    };
    
    // Animate portal
    gsap.to(this.animatedObjects.scale, {
      value: 1,
      duration: options.duration * 0.4,
      ease: 'power2.out'
    });
    
    gsap.to(ringMaterial, {
      opacity: 0.8,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(ringMaterial, {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    gsap.to(particlesMaterial, {
      opacity: 0.6,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(particlesMaterial, {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    gsap.to(this.animatedObjects.rotation, {
      value: Math.PI * 2,
      duration: options.duration,
      ease: 'none',
      repeat: 1,
      onUpdate: () => {
        ring.rotation.z = this.animatedObjects.rotation.value;
      }
    });
  }
  
  /**
   * Create entanglement effect
   * @param {Object} options - Effect options
   */
  _createEntanglementEffect(options) {
    // Create two entangled spheres
    const sphere1Geometry = new THREE.SphereGeometry(1, 32, 32);
    const sphere2Geometry = new THREE.SphereGeometry(1, 32, 32);
    
    const sphere1Material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(options.colorStart),
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    
    const sphere2Material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(options.colorEnd),
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    
    const sphere1 = new THREE.Mesh(sphere1Geometry, sphere1Material);
    const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
    
    sphere1.position.set(-3, 0, 0);
    sphere2.position.set(3, 0, 0);
    
    this.transitionObjects.add(sphere1);
    this.transitionObjects.add(sphere2);
    
    // Create connection line
    const connectionGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -3, 0, 0,
      3, 0, 0
    ]);
    connectionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });
    
    const connection = new THREE.Line(connectionGeometry, connectionMaterial);
    this.transitionObjects.add(connection);
    
    // Store animated objects
    this.animatedObjects = {
      sphere1,
      sphere2,
      connection,
      rotation1: { value: 0 },
      rotation2: { value: 0 },
      positions: { x1: -3, x2: 3 }
    };
    
    // Animate entanglement
    gsap.to([sphere1Material, sphere2Material], {
      opacity: 0.8,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to([sphere1Material, sphere2Material], {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    gsap.to(connectionMaterial, {
      opacity: 0.5,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(connectionMaterial, {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    gsap.to(this.animatedObjects.rotation1, {
      value: Math.PI * 4,
      duration: options.duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        sphere1.rotation.x = this.animatedObjects.rotation1.value;
        sphere1.rotation.y = this.animatedObjects.rotation1.value * 0.7;
      }
    });
    
    gsap.to(this.animatedObjects.rotation2, {
      value: -Math.PI * 4,
      duration: options.duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        sphere2.rotation.x = this.animatedObjects.rotation2.value;
        sphere2.rotation.y = this.animatedObjects.rotation2.value * 0.7;
      }
    });
    
    gsap.to(this.animatedObjects.positions, {
      x1: 3,
      x2: -3,
      duration: options.duration,
      ease: options.ease,
      onUpdate: () => {
        sphere1.position.x = this.animatedObjects.positions.x1;
        sphere2.position.x = this.animatedObjects.positions.x2;
        
        // Update connection line
        const positions = connectionGeometry.attributes.position.array;
        positions[0] = this.animatedObjects.positions.x1;
        positions[3] = this.animatedObjects.positions.x2;
        connectionGeometry.attributes.position.needsUpdate = true;
      }
    });
  }
  
  /**
   * Create phase shift effect
   * @param {Object} options - Effect options
   */
  _createPhaseShiftEffect(options) {
    // Create a grid of points that will phase shift
    const gridSize = 20;
    const spacing = 0.5;
    
    const gridGeometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let x = -gridSize/2; x < gridSize/2; x++) {
      for (let y = -gridSize/2; y < gridSize/2; y++) {
        vertices.push(x * spacing, y * spacing, 0);
      }
    }
    
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const gridMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(options.colorStart),
      size: options.particleSize * 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    
    const grid = new THREE.Points(gridGeometry, gridMaterial);
    this.transitionObjects.add(grid);
    
    // Store animation values
    this.animatedObjects = {
      grid,
      phase: { value: 0 },
      waveIntensity: { value: 0 }
    };
    
    // Animate phase shift
    gsap.to(gridMaterial, {
      opacity: 1,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(gridMaterial, {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    gsap.to(this.animatedObjects.waveIntensity, {
      value: 1,
      duration: options.duration * 0.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1
    });
    
    gsap.to(this.animatedObjects.phase, {
      value: Math.PI * 2,
      duration: options.duration,
      ease: 'none',
      onUpdate: () => {
        const positions = gridGeometry.attributes.position.array;
        const phase = this.animatedObjects.phase.value;
        const intensity = this.animatedObjects.waveIntensity.value;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const distance = Math.sqrt(x * x + y * y);
          
          // Apply a wave pattern
          positions[i + 2] = Math.sin(distance - phase) * intensity * 2;
        }
        
        gridGeometry.attributes.position.needsUpdate = true;
      }
    });
  }
  
  /**
   * Create time dilation effect
   * @param {Object} options - Effect options
   */
  _createTimeDilationEffect(options) {
    // Create a clock-like structure with orbiting particles
    const clockCenter = new THREE.Group();
    this.transitionObjects.add(clockCenter);
    
    // Create clock face
    const clockFaceGeometry = new THREE.CircleGeometry(4, 32);
    const clockFaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0
    });
    const clockFace = new THREE.Mesh(clockFaceGeometry, clockFaceMaterial);
    clockCenter.add(clockFace);
    
    // Create clock hands
    const handGeometry = new THREE.BoxGeometry(0.1, 3, 0.1);
    const hourHandMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(options.colorStart),
      transparent: true,
      opacity: 0
    });
    const minuteHandMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(options.colorEnd),
      transparent: true,
      opacity: 0
    });
    
    const hourHand = new THREE.Mesh(handGeometry, hourHandMaterial);
    hourHand.position.set(0, 1.5, 0.1);
    clockCenter.add(hourHand);
    
    const minuteHand = new THREE.Mesh(handGeometry, minuteHandMaterial);
    minuteHand.position.set(0, 1.5, 0.2);
    minuteHand.scale.set(1, 1.3, 1);
    clockCenter.add(minuteHand);
    
    // Create orbiting particles
    const particleCount = options.particleCount;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 5 + (Math.random() - 0.5) * 2;
      
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      particleSizes[i] = Math.random() * options.particleSize * 0.1 + 0.05;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(options.colorEnd),
      size: 1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.transitionObjects.add(particles);
    
    // Store animated objects and properties
    this.animatedObjects = {
      clockCenter,
      hourHand,
      minuteHand,
      particles,
      hourRotation: { value: 0 },
      minuteRotation: { value: 0 },
      particleRotation: { value: 0 },
      timeDilation: { value: 1 }
    };
    
    // Animate time dilation effect
    gsap.to([hourHandMaterial, minuteHandMaterial, clockFaceMaterial], {
      opacity: 0.7,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to([hourHandMaterial, minuteHandMaterial, clockFaceMaterial], {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    gsap.to(particleMaterial, {
      opacity: 0.8,
      duration: options.duration * 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(particleMaterial, {
          opacity: 0,
          duration: options.duration * 0.3,
          delay: options.duration * 0.4,
          ease: 'power2.in'
        });
      }
    });
    
    // Animate hands
    gsap.to(this.animatedObjects.hourRotation, {
      value: Math.PI * 4,
      duration: options.duration,
      ease: 'none',
      onUpdate: () => {
        hourHand.rotation.z = -this.animatedObjects.hourRotation.value;
      }
    });
    
    gsap.to(this.animatedObjects.minuteRotation, {
      value: Math.PI * 16,
      duration: options.duration,
      ease: 'none',
      onUpdate: () => {
        minuteHand.rotation.z = -this.animatedObjects.minuteRotation.value;
      }
    });
    
    // Animate time dilation
    gsap.to(this.animatedObjects.timeDilation, {
      value: 0.1,
      duration: options.duration * 0.5,
      ease: 'power2.in',
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        clockCenter.scale.set(
          this.animatedObjects.timeDilation.value,
          this.animatedObjects.timeDilation.value,
          this.animatedObjects.timeDilation.value
        );
      }
    });
    
    // Animate particle orbit
    gsap.to(this.animatedObjects.particleRotation, {
      value: Math.PI * 2,
      duration: options.duration,
      ease: 'none',
      onUpdate: () => {
        particles.rotation.z = this.animatedObjects.particleRotation.value;
      }
    });
  }
  
  /**
   * Create teleportation effect
   * @param {Object} options - Effect options
   */
  _createTeleportationEffect(options) {
    // Create a flash of particles that converge/diverge
    const particleCount = options.particleCount;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleTargets = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position far from center
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = 15;
      
      particlePositions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      particlePositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      particlePositions[i * 3 + 2] = r * Math.cos(theta);
      
      // Targets at center
      particleTargets[i * 3] = 0;
      particleTargets[i * 3 + 1] = 0;
      particleTargets[i * 3 + 2] = 0;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(options.colorStart),
      size: options.particleSize * 0.1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.transitionObjects.add(particles);
    
    // Store animation properties
    this.animatedObjects = {
      particles,
      progress: { value: 0 }
    };
    
    // Animate teleportation
    gsap.to(particleMaterial, {
      opacity: 0.8,
      duration: options.duration * 0.2,
      ease: 'power1.in',
      onComplete: () => {
        gsap.to(particleMaterial, {
          opacity: 0,
          duration: options.duration * 0.2,
          delay: options.duration * 0.6,
          ease: 'power1.out'
        });
      }
    });
    
    // Animate particles converging to center then exploding outward
    gsap.to(this.animatedObjects.progress, {
      value: 1,
      duration: options.duration * 0.5,
      ease: 'power3.in',
      onUpdate: () => {
        const positions = particleGeometry.attributes.position.array;
        const progress = this.animatedObjects.progress.value;
        
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = particlePositions[i * 3] * (1 - progress) + particleTargets[i * 3] * progress;
          positions[i * 3 + 1] = particlePositions[i * 3 + 1] * (1 - progress) + particleTargets[i * 3 + 1] * progress;
          positions[i * 3 + 2] = particlePositions[i * 3 + 2] * (1 - progress) + particleTargets[i * 3 + 2] * progress;
        }
        
        particleGeometry.attributes.position.needsUpdate = true;
      },
      onComplete: () => {
        // Explode outward
        gsap.to(this.animatedObjects.progress, {
          value: 0,
          duration: options.duration * 0.5,
          ease: 'power2.out',
          onUpdate: () => {
            const positions = particleGeometry.attributes.position.array;
            const progress = 1 - this.animatedObjects.progress.value;
            
            for (let i = 0; i < particleCount; i++) {
              positions[i * 3] = particleTargets[i * 3] * (1 - progress) - particlePositions[i * 3] * progress;
              positions[i * 3 + 1] = particleTargets[i * 3 + 1] * (1 - progress) - particlePositions[i * 3 + 1] * progress;
              positions[i * 3 + 2] = particleTargets[i * 3 + 2] * (1 - progress) - particlePositions[i * 3 + 2] * progress;
            }
            
            particleGeometry.attributes.position.needsUpdate = true;
          }
        });
      }
    });
  }
  
  /**
   * Start animation render loop
   */
  _startRenderLoop() {
    if (!this.isTransitioning) return;
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Continue animation loop if transitioning
    if (this.isTransitioning) {
      requestAnimationFrame(this._startRenderLoop.bind(this));
    }
  }
  
  /**
   * Get transition preset options
   * @param {string} type - Transition type
   * @returns {Object} Transition options
   */
  _getTransitionOptions(type) {
    return this.transitionPresets[type] || this.transitionPresets.quantum;
  }
  
  /**
   * Perform a transition with the specified type
   * @param {string} type - Transition type
   * @param {Object} options - Additional transition options
   * @param {Function} callback - Callback to run when transition completes
   * @returns {Promise} Resolves when transition completes
   */
  transition(type, options = {}, callback) {
    return new Promise((resolve) => {
      // Don't start a new transition if one is in progress
      if (this.isTransitioning) {
        console.warn('Transition already in progress');
        resolve(false);
        return;
      }
      
      // Set transition state
      this.isTransitioning = true;
      this.currentTransitionType = type;
      this.transitionCallback = callback;
      
      // Get transition options by merging preset with custom options
      const transitionOptions = {
        ...this._getTransitionOptions(type),
        ...options,
      };
      
      // Show transition overlay
      this.transitionOverlay.style.visibility = 'visible';
      this.transitionOverlay.style.transition = 'none';
      
      gsap.to(this.transitionOverlay.style, {
        opacity: 1,
        duration: transitionOptions.duration * 0.3,
        ease: 'power2.out',
        onComplete: () => {
          // Execute callback after transition in
          if (typeof this.transitionCallback === 'function') {
            this.transitionCallback();
          }
          
          // Transition out
          gsap.to(this.transitionOverlay.style, {
            opacity: 0,
            duration: transitionOptions.duration * 0.3,
            delay: transitionOptions.duration * 0.4,
            ease: 'power2.in',
            onComplete: () => {
              // Hide overlay
              this.transitionOverlay.style.visibility = 'hidden';
              this.transitionOverlay.style.transition = 'visibility 0s linear 0.5s';
              
              // Reset state
              this.isTransitioning = false;
              this.currentTransitionType = null;
              this.transitionCallback = null;
              
              // Resolve promise
              resolve(true);
            }
          });
        }
      });
      
      // Create transition effects
      this._create2DParticles(transitionOptions);
      this._createShockwaveEffect(transitionOptions);
      this._create3DTransitionEffect(transitionOptions);
    });
  }
  
  /**
   * Quantum transition (portal effect)
   * @param {Object} options - Transition options
   * @param {Function} callback - Callback function
   * @returns {Promise} Resolves when transition completes
   */
  quantumTransition(options = {}, callback) {
    return this.transition('quantum', options, callback);
  }
  
  /**
   * Entanglement transition (connecting spheres)
   * @param {Object} options - Transition options
   * @param {Function} callback - Callback function
   * @returns {Promise} Resolves when transition completes
   */
  entanglementTransition(options = {}, callback) {
    return this.transition('entanglement', options, callback);
  }
  
  /**
   * Phase shift transition (wave effect)
   * @param {Object} options - Transition options
   * @param {Function} callback - Callback function
   * @returns {Promise} Resolves when transition completes
   */
  phaseShiftTransition(options = {}, callback) {
    return this.transition('phaseShift', options, callback);
  }
  
  /**
   * Time dilation transition (clock effect)
   * @param {Object} options - Transition options
   * @param {Function} callback - Callback function
   * @returns {Promise} Resolves when transition completes
   */
  timeDilationTransition(options = {}, callback) {
    return this.transition('timeDilation', options, callback);
  }
  
  /**
   * Teleportation transition (flash effect)
   * @param {Object} options - Transition options
   * @param {Function} callback - Callback function
   * @returns {Promise} Resolves when transition completes
   */
  teleportationTransition(options = {}, callback) {
    return this.transition('teleportation', options, callback);
  }
  
  /**
   * Transition to a specific level with appropriate effect
   * @param {number} fromLevel - Current level
   * @param {number} toLevel - Target level
   * @param {Object} options - Custom transition options
   * @returns {Promise} Resolves when transition completes
   */
  transitionToLevel(fromLevel, toLevel, options = {}) {
    // Determine appropriate transition type based on level change
    let transitionType = 'quantum'; // default
    
    // Choose transition based on level difference
    const levelDifference = Math.abs(toLevel - fromLevel);
    
    if (levelDifference === 1) {
      transitionType = 'phaseShift';
    } else if (levelDifference === 2) {
      transitionType = 'entanglement';
    } else if (levelDifference === 3) {
      transitionType = 'timeDilation';
    } else if (levelDifference >= 4) {
      transitionType = 'teleportation';
    }
    
    // Perform the transition
    return this.transition(transitionType, options, () => {
      // Get game state context
      const gameState = useGameState();
      
      // Update game state level during transition
      if (gameState) {
        gameState.advanceToLevel(toLevel);
      }
      
      // Scroll to the appropriate section
      const targetSection = document.querySelector(`[data-level="${toLevel}"]`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'auto' });
      }
    });
  }
  
  /**
   * Clean up and dispose resources
   */
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this._handleResize);
    
    // Clean up Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Remove elements
    if (this.transitionOverlay && this.transitionOverlay.parentNode) {
      this.transitionOverlay.parentNode.removeChild(this.transitionOverlay);
    }
  }
}

/**
 * React hook for using the QuantumTransitionManager
 * @returns {QuantumTransitionManager} Transition manager instance
 */
export const useQuantumTransition = (() => {
  let instance = null;
  
  return () => {
    if (!instance) {
      instance = new QuantumTransitionManager(document.body);
    }
    
    return instance;
  };
})();