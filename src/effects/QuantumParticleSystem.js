import * as THREE from 'three';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useQuantumGame } from '../state/QuantumGameStateManager';

/**
 * QuantumParticleSystem
 * 
 * Advanced particle system for quantum-themed effects with dynamic level-of-detail (LOD)
 * optimization for 4D visualization.
 * 
 * Features:
 * - Dynamic particle count based on device performance
 * - Procedural quantum-themed particle effects
 * - Level-of-detail adjustments for distance and view angle
 * - 4D visualization techniques (hypercube projections, tesseract rotations)
 * - Interactive particles that respond to player actions
 * - Different effect presets for various quantum abilities
 */

// Shader code for quantum particles
const QuantumParticleShaders = {
  // Vertex shader
  vertexShader: `
    attribute float size;
    attribute vec4 color;
    attribute float phase;
    attribute float dimension;
    
    varying vec4 vColor;
    varying float vPhase;
    varying float vDimension;
    
    uniform float time;
    uniform float timeDilation;
    uniform vec4 wRotation; // 4D rotation parameters
    
    // Function to rotate a point in 4D space
    vec4 rotate4D(vec4 v, vec4 q) {
      // Simplified 4D rotation using quaternion-like approach
      float angle = q.w;
      vec3 axis = normalize(q.xyz);
      
      float s = sin(angle);
      float c = cos(angle);
      
      // 3D rotation
      vec3 rotated3D = v.xyz * c + cross(axis, v.xyz) * s + axis * dot(axis, v.xyz) * (1.0 - c);
      
      // 4D component (w) rotation - simplified approximation
      float rotatedW = v.w * c - dot(axis, v.xyz) * s;
      
      return vec4(rotated3D, rotatedW);
    }
    
    void main() {
      // Base position in 4D space (using w from dimension)
      vec4 pos4D = vec4(position, dimension);
      
      // Apply 4D rotation if time dilation is active
      if (timeDilation > 0.0) {
        pos4D = rotate4D(pos4D, vec4(wRotation.xyz, wRotation.w * time));
      }
      
      // Project from 4D to 3D (perspective projection)
      float w = pos4D.w;
      float projectionFactor = 1.0 / (4.0 - w);
      vec3 projectedPosition = pos4D.xyz * projectionFactor;
      
      // Add time-based oscillation
      float oscillation = sin(time * 2.0 + phase) * 0.2;
      projectedPosition += normal * oscillation;
      
      // Apply quantum fluctuation
      float quantumFluctuation = sin(time * 5.0 + phase * 10.0) * 0.05 * timeDilation;
      projectedPosition += normal * quantumFluctuation;
      
      // Set position
      vec4 mvPosition = modelViewMatrix * vec4(projectedPosition, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Dynamic size based on distance and dimension
      float sizeScale = 1.0 + sin(time + phase * 3.0) * 0.3;
      sizeScale *= 1.0 + timeDilation;
      sizeScale *= dimension * 0.5 + 0.5; // Particles from higher dimensions are larger
      
      // Set point size
      gl_PointSize = size * sizeScale * (300.0 / -mvPosition.z);
      
      // Pass variables to fragment shader
      vColor = color;
      vPhase = phase;
      vDimension = dimension;
    }
  `,
  
  // Fragment shader
  fragmentShader: `
    varying vec4 vColor;
    varying float vPhase;
    varying float vDimension;
    
    uniform float time;
    uniform float timeDilation;
    uniform sampler2D particleTexture;
    
    void main() {
      // Calculate distance from center of point
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      // Base particle color
      vec4 color = vColor;
      
      // Add time-based color pulsing
      float pulse = sin(time * 3.0 + vPhase * 5.0) * 0.5 + 0.5;
      color.rgb += vec3(0.1, 0.2, 0.3) * pulse;
      
      // Add dimension-based color effect
      color.rgb += vec3(vDimension * 0.3, vDimension * 0.1, vDimension * 0.2);
      
      // Quantum glow effect
      float glow = 1.0 - pow(dist, 0.5);
      glow *= 1.0 + timeDilation * 0.5;
      
      // Create soft edge
      float alpha = smoothstep(1.0, 0.0, dist * 2.0);
      alpha *= glow;
      
      // Apply texture if available
      if (dist < 0.5) {
        vec4 texColor = texture2D(particleTexture, gl_PointCoord);
        color *= texColor;
        alpha *= texColor.a;
      }
      
      // Output final color
      gl_FragColor = vec4(color.rgb, color.a * alpha);
      
      // Discard pixels outside of particle
      if (dist > 0.5) {
        discard;
      }
      
      // Add quantum interference patterns based on time dilation
      if (timeDilation > 0.0) {
        float interference = sin((gl_PointCoord.x * 20.0) + (gl_PointCoord.y * 20.0) + time * 10.0) * 0.5 + 0.5;
        gl_FragColor.rgb += vec3(0.0, 0.2, 0.5) * interference * timeDilation;
      }
    }
  `,
};

// Particle effect presets
const PARTICLE_PRESETS = {
  // Default quantum particles
  quantum: {
    particleCount: 5000,
    size: { min: 2, max: 6 },
    color: { start: new THREE.Color(0x00ddff), end: new THREE.Color(0x0088ff) },
    speed: 0.5,
    lifetime: { min: 2, max: 5 },
    distribution: 'sphere',
    radius: 10,
    dimensionality: 3,
  },
  
  // Phase shift ability particles
  phaseShift: {
    particleCount: 3000,
    size: { min: 1, max: 4 },
    color: { start: new THREE.Color(0x00ffff), end: new THREE.Color(0x0088ff) },
    speed: 1.2,
    lifetime: { min: 0.5, max: 1.5 },
    distribution: 'sphere',
    radius: 3,
    dimensionality: 4,
    emissive: true,
    trailEffect: true,
  },
  
  // Time dilation ability particles
  timeDilation: {
    particleCount: 2000,
    size: { min: 2, max: 8 },
    color: { start: new THREE.Color(0xff00ff), end: new THREE.Color(0x8800ff) },
    speed: 0.3,
    lifetime: { min: 3, max: 8 },
    distribution: 'disc',
    radius: 8,
    dimensionality: 4,
    emissive: true,
    clockwiseRotation: true,
  },
  
  // Molecular reconstruction ability particles
  molecularReconstruction: {
    particleCount: 4000,
    size: { min: 1, max: 3 },
    color: { start: new THREE.Color(0x00ff88), end: new THREE.Color(0x00ddaa) },
    speed: 0.8,
    lifetime: { min: 1, max: 3 },
    distribution: 'cube',
    radius: 5,
    dimensionality: 3.5,
    emissive: true,
    gridAlignment: true,
  },
  
  // Quantum teleportation ability particles
  quantumTeleportation: {
    particleCount: 6000,
    size: { min: 0.5, max: 3 },
    color: { start: new THREE.Color(0xffaa00), end: new THREE.Color(0xff5500) },
    speed: 2.0,
    lifetime: { min: 0.2, max: 1.0 },
    distribution: 'tunnel',
    radius: 15,
    dimensionality: 4,
    emissive: true,
    convergencePoint: true,
  },
  
  // 4D tesseract visualization particles
  tesseract: {
    particleCount: 8000,
    size: { min: 1, max: 2 },
    color: { start: new THREE.Color(0xffffff), end: new THREE.Color(0x88ffff) },
    speed: 0.1,
    lifetime: { min: 10, max: 20 },
    distribution: 'tesseract',
    radius: 6,
    dimensionality: 4,
    emissive: true,
    rotationW: true,
  },
  
  // Quantum entanglement visualization
  entanglement: {
    particleCount: 2000,
    size: { min: 1, max: 4 },
    color: { start: new THREE.Color(0xff88ff), end: new THREE.Color(0x8888ff) },
    speed: 0.4,
    lifetime: { min: 5, max: 10 },
    distribution: 'entangled',
    radius: 12,
    dimensionality: 3.5,
    emissive: true,
    symmetricBehavior: true,
  },
};

// Performance profiles for different devices
const PERFORMANCE_PROFILES = {
  low: {
    particleMultiplier: 0.3,
    maxParticleCount: 2000,
    minParticleSize: 2,
    dimensionality: 3, // Limit to 3D
    disableEmissive: true,
    simplifiedShader: true,
    lowerUpdateFrequency: true,
  },
  medium: {
    particleMultiplier: 0.6,
    maxParticleCount: 5000,
    minParticleSize: 1,
    dimensionality: 3.5, // Allow partial 4D effects
    disableEmissive: false,
    simplifiedShader: false,
    lowerUpdateFrequency: false,
  },
  high: {
    particleMultiplier: 1.0,
    maxParticleCount: 10000,
    minParticleSize: 0.5,
    dimensionality: 4, // Full 4D effects
    disableEmissive: false,
    simplifiedShader: false,
    lowerUpdateFrequency: false,
  },
};

/**
 * Create particle geometry and attributes
 * @param {Object} preset - Particle effect preset
 * @param {Object} performanceProfile - Performance profile
 */
const createParticleGeometry = (preset, performanceProfile) => {
  // Adjust particle count based on performance profile
  const particleCount = Math.min(
    Math.floor(preset.particleCount * performanceProfile.particleMultiplier),
    performanceProfile.maxParticleCount
  );
  
  // Create particle geometry
  const geometry = new THREE.BufferGeometry();
  
  // Position attribute (3D)
  const positions = new Float32Array(particleCount * 3);
  
  // Size attribute
  const sizes = new Float32Array(particleCount);
  
  // Color attribute (RGBA)
  const colors = new Float32Array(particleCount * 4);
  
  // Phase attribute (for animation variation)
  const phases = new Float32Array(particleCount);
  
  // Dimension attribute (for 4D effects)
  const dimensions = new Float32Array(particleCount);
  
  // Lifetime attribute
  const lifetimes = new Float32Array(particleCount);
  
  // Maximum lifetime attribute
  const maxLifetimes = new Float32Array(particleCount);
  
  // Velocity attribute
  const velocities = new Float32Array(particleCount * 3);
  
  // Distribution of particles based on preset
  for (let i = 0; i < particleCount; i++) {
    // Generate position based on distribution type
    let position = new THREE.Vector3();
    
    switch (preset.distribution) {
      case 'sphere':
        position = randomSpherePosition(preset.radius);
        break;
        
      case 'disc':
        position = randomDiscPosition(preset.radius);
        break;
        
      case 'cube':
        position = randomCubePosition(preset.radius);
        break;
        
      case 'tunnel':
        position = randomTunnelPosition(preset.radius);
        break;
        
      case 'tesseract':
        position = randomTesseractPosition(preset.radius);
        break;
        
      case 'entangled':
        position = randomEntangledPosition(preset.radius, i, particleCount);
        break;
        
      default:
        position = randomSpherePosition(preset.radius);
    }
    
    // Set position
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    
    // Set random size between min and max
    const minSize = Math.max(preset.size.min, performanceProfile.minParticleSize);
    const sizeRange = preset.size.max - minSize;
    sizes[i] = minSize + Math.random() * sizeRange;
    
    // Set color (interpolate between start and end)
    const colorT = Math.random();
    const color = preset.color.start.clone().lerp(preset.color.end, colorT);
    
    colors[i * 4] = color.r;
    colors[i * 4 + 1] = color.g;
    colors[i * 4 + 2] = color.b;
    colors[i * 4 + 3] = 1.0; // Alpha
    
    // Set random phase
    phases[i] = Math.random() * Math.PI * 2;
    
    // Set dimension value (limited by performance profile)
    const maxDim = Math.min(preset.dimensionality, performanceProfile.dimensionality);
    dimensions[i] = 3 + Math.random() * (maxDim - 3);
    
    // Set lifetime and max lifetime
    maxLifetimes[i] = preset.lifetime.min + Math.random() * (preset.lifetime.max - preset.lifetime.min);
    lifetimes[i] = maxLifetimes[i] * Math.random(); // Start at random point in lifecycle
    
    // Set velocity (direction away from center, scaled by speed)
    const velocity = position.clone().normalize().multiplyScalar(preset.speed * (0.5 + Math.random() * 0.5));
    
    velocities[i * 3] = velocity.x;
    velocities[i * 3 + 1] = velocity.y;
    velocities[i * 3 + 2] = velocity.z;
  }
  
  // Add attributes to geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('dimension', new THREE.BufferAttribute(dimensions, 1));
  
  // Store non-attribute data in userData
  geometry.userData = {
    lifetimes,
    maxLifetimes,
    velocities,
    preset,
  };
  
  return geometry;
};

/**
 * Create particle material with shaders
 * @param {Object} preset - Particle effect preset
 * @param {Object} performanceProfile - Performance profile
 */
const createParticleMaterial = (preset, performanceProfile) => {
  // Create particle texture
  const texture = createParticleTexture();
  
  // Use simplified shader for low performance devices
  const vertexShader = performanceProfile.simplifiedShader ? 
    createSimplifiedVertexShader() : QuantumParticleShaders.vertexShader;
    
  const fragmentShader = performanceProfile.simplifiedShader ?
    createSimplifiedFragmentShader() : QuantumParticleShaders.fragmentShader;
  
  // Create material with shaders
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      timeDilation: { value: 0 },
      particleTexture: { value: texture },
      wRotation: { value: new THREE.Vector4(0, 1, 0, 0.1) }, // 4D rotation params
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  
  return material;
};

/**
 * Create a simplified vertex shader for low-performance devices
 */
const createSimplifiedVertexShader = () => {
  return `
    attribute float size;
    attribute vec4 color;
    attribute float phase;
    
    varying vec4 vColor;
    varying float vPhase;
    
    uniform float time;
    
    void main() {
      // Basic position calculation
      vec3 pos = position;
      
      // Add simple oscillation
      pos += normal * (sin(time * 2.0 + phase) * 0.1);
      
      // Set position
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Set size with distance attenuation
      gl_PointSize = size * (300.0 / -mvPosition.z);
      
      // Pass variables to fragment shader
      vColor = color;
      vPhase = phase;
    }
  `;
};

/**
 * Create a simplified fragment shader for low-performance devices
 */
const createSimplifiedFragmentShader = () => {
  return `
    varying vec4 vColor;
    varying float vPhase;
    
    uniform float time;
    uniform sampler2D particleTexture;
    
    void main() {
      // Distance from center
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      // Simple circular particle
      float alpha = 1.0 - (dist * 2.0);
      alpha = clamp(alpha, 0.0, 1.0);
      
      // Simple color pulsing
      vec4 color = vColor;
      color.rgb += vec3(0.1) * sin(time * 2.0 + vPhase);
      
      // Output
      gl_FragColor = vec4(color.rgb, color.a * alpha);
      
      // Discard pixels outside circle
      if (dist > 0.5) {
        discard;
      }
    }
  `;
};

/**
 * Create a texture for particles
 */
const createParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  
  const context = canvas.getContext('2d');
  
  // Create gradient
  const gradient = context.createRadialGradient(
    32, 32, 0,
    32, 32, 32
  );
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  // Draw circle
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(32, 32, 32, 0, Math.PI * 2);
  context.fill();
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
};

/**
 * Generate a random position on a sphere
 * @param {number} radius - Sphere radius
 */
const randomSpherePosition = (radius) => {
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.acos(2 * Math.random() - 1);
  const r = radius * Math.cbrt(Math.random()); // Cubic root for uniform volume distribution
  
  const x = r * Math.sin(theta) * Math.cos(phi);
  const y = r * Math.sin(theta) * Math.sin(phi);
  const z = r * Math.cos(theta);
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Generate a random position on a disc
 * @param {number} radius - Disc radius
 */
const randomDiscPosition = (radius) => {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * Math.PI * 2;
  
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  const z = (Math.random() - 0.5) * radius * 0.1; // Small z variation
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Generate a random position within a cube
 * @param {number} size - Cube size
 */
const randomCubePosition = (size) => {
  const halfSize = size / 2;
  
  const x = (Math.random() - 0.5) * size;
  const y = (Math.random() - 0.5) * size;
  const z = (Math.random() - 0.5) * size;
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Generate a random position in a tunnel shape
 * @param {number} radius - Tunnel radius
 */
const randomTunnelPosition = (radius) => {
  const thetaResolution = 10;
  const theta = Math.floor(Math.random() * thetaResolution) * (Math.PI * 2 / thetaResolution);
  const r = radius * (0.8 + Math.random() * 0.2);
  const length = radius * 2;
  
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  const z = (Math.random() - 0.5) * length;
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Generate a random position in a tesseract projection
 * @param {number} size - Tesseract size
 */
const randomTesseractPosition = (size) => {
  // Generate a random 4D point in a tesseract
  const x4D = (Math.random() - 0.5) * size;
  const y4D = (Math.random() - 0.5) * size;
  const z4D = (Math.random() - 0.5) * size;
  const w4D = (Math.random() - 0.5) * size;
  
  // Project to 3D (simple perspective projection)
  const wFactor = 1 / (4 - w4D);
  
  const x = x4D * wFactor;
  const y = y4D * wFactor;
  const z = z4D * wFactor;
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Generate positions for entangled particles
 * @param {number} radius - System radius
 * @param {number} index - Particle index
 * @param {number} total - Total particles
 */
const randomEntangledPosition = (radius, index, total) => {
  // Create pairs of entangled particles
  const isPair = index % 2 === 0;
  const pairIndex = Math.floor(index / 2);
  const pairCount = Math.floor(total / 2);
  
  // Each pair has a shared random seed
  const seed = pairIndex / pairCount;
  
  // Generate base position
  const phi = seed * Math.PI * 2;
  const theta = Math.acos(2 * seed - 1);
  const r = radius * Math.random();
  
  let x = r * Math.sin(theta) * Math.cos(phi);
  let y = r * Math.sin(theta) * Math.sin(phi);
  let z = r * Math.cos(theta);
  
  // For the second particle in pair, generate symmetrically opposite position
  if (!isPair) {
    x = -x + (Math.random() - 0.5) * 0.5;
    y = -y + (Math.random() - 0.5) * 0.5;
    z = -z + (Math.random() - 0.5) * 0.5;
  }
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Update particles for animation
 * @param {THREE.BufferGeometry} geometry - Particle geometry
 * @param {THREE.ShaderMaterial} material - Particle material
 * @param {number} deltaTime - Time since last update
 */
const updateParticles = (geometry, material, deltaTime) => {
  // Get attributes
  const positions = geometry.attributes.position.array;
  const colors = geometry.attributes.color.array;
  
  // Get stored data
  const { lifetimes, maxLifetimes, velocities, preset } = geometry.userData;
  
  // Update time uniform
  material.uniforms.time.value += deltaTime;
  
  // Loop through particles
  for (let i = 0; i < positions.length / 3; i++) {
    // Update lifetime
    lifetimes[i] -= deltaTime;
    
    // Reset dead particles
    if (lifetimes[i] <= 0) {
      resetParticle(i, positions, colors, lifetimes, maxLifetimes, velocities, preset);
    } else {
      // Update position based on velocity
      positions[i * 3] += velocities[i * 3] * deltaTime;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
      
      // Fade out color as lifetime approaches end
      const lifeRatio = lifetimes[i] / maxLifetimes[i];
      colors[i * 4 + 3] = lifeRatio;
    }
  }
  
  // Mark attributes for update
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
};

/**
 * Reset a particle to a new position
 */
const resetParticle = (index, positions, colors, lifetimes, maxLifetimes, velocities, preset) => {
  // Generate new position based on distribution
  let position;
  
  switch (preset.distribution) {
    case 'sphere':
      position = randomSpherePosition(preset.radius);
      break;
    case 'disc':
      position = randomDiscPosition(preset.radius);
      break;
    case 'cube':
      position = randomCubePosition(preset.radius);
      break;
    case 'tunnel':
      position = randomTunnelPosition(preset.radius);
      break;
    case 'tesseract':
      position = randomTesseractPosition(preset.radius);
      break;
    case 'entangled':
      // For entangled, we need more information to properly reset
      // For now, use sphere distribution as fallback
      position = randomSpherePosition(preset.radius);
      break;
    default:
      position = randomSpherePosition(preset.radius);
  }
  
  // Set new position
  positions[index * 3] = position.x;
  positions[index * 3 + 1] = position.y;
  positions[index * 3 + 2] = position.z;
  
  // Reset color alpha
  colors[index * 4 + 3] = 1.0;
  
  // Reset lifetime
  lifetimes[index] = maxLifetimes[index];
  
  // Reset velocity
  const velocity = position.clone().normalize().multiplyScalar(preset.speed * (0.5 + Math.random() * 0.5));
  
  velocities[index * 3] = velocity.x;
  velocities[index * 3 + 1] = velocity.y;
  velocities[index * 3 + 2] = velocity.z;
};

/**
 * Set time dilation effect intensity
 * @param {THREE.ShaderMaterial} material - Particle material
 * @param {number} intensity - Effect intensity (0-1)
 */
const setTimeDilationEffect = (material, intensity) => {
  material.uniforms.timeDilation.value = intensity;
};

/**
 * Set 4D rotation parameters
 * @param {THREE.ShaderMaterial} material - Particle material
 * @param {THREE.Vector3} axis - Rotation axis
 * @param {number} speed - Rotation speed
 */
const set4DRotation = (material, axis, speed) => {
  material.uniforms.wRotation.value.set(axis.x, axis.y, axis.z, speed);
};

/**
 * Detect device performance level
 */
const detectPerformanceLevel = () => {
  // Try to use hardware info if available
  const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  const hasLowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (hasLowMemory || hasLowCPU || isMobile) {
    return 'low';
  }
  
  // Try WebGL capabilities
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      // Check for high-end GPU indicators
      const isHighEnd = /NVIDIA|RTX|GTX|Radeon|AMD|Intel Iris|Apple GPU/i.test(renderer);
      
      if (isHighEnd) return 'high';
    }
    
    // Check for WebGL 2 support as another indicator
    const isWebGL2Supported = !!window.WebGL2RenderingContext;
    
    if (isWebGL2Supported) return 'medium';
    
    // Check max textures as a rough indicator
    const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    
    if (maxTextures > 16) return 'medium';
    
    return 'low';
  } catch (e) {
    return 'low';
  }
};

/**
 * The main QuantumParticleSystem component for React integration
 */
const QuantumParticleSystem = () => {
  const quantumGame = useQuantumGame();
  
  // Refs
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);
  const materialRef = useRef(null);
  const geometryRef = useRef(null);
  const performanceProfileRef = useRef(null);
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  
  // State
  const [initialized, setInitialized] = useState(false);
  const [particleType, setParticleType] = useState('quantum');
  
  // Initialize particle system
  useEffect(() => {
    // Detect device performance
    const performanceLevel = detectPerformanceLevel();
    performanceProfileRef.current = PERFORMANCE_PROFILES[performanceLevel];
    
    // Create scene (if in Three.js environment)
    // Note: You would either integrate with an existing Three.js scene or create one
    
    return () => {
      // Clean up
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
        if (materialRef.current.uniforms.particleTexture.value) {
          materialRef.current.uniforms.particleTexture.value.dispose();
        }
      }
    };
  }, []);
  
  /**
   * Create a particle effect system
   * @param {string} type - Particle preset type
   * @param {THREE.Scene} scene - Three.js scene to add to
   */
  const createParticleEffect = useCallback((type, scene) => {
    // Skip if no scene
    if (!scene) return null;
    
    // Get preset and performance profile
    const preset = PARTICLE_PRESETS[type] || PARTICLE_PRESETS.quantum;
    const performanceProfile = performanceProfileRef.current || PERFORMANCE_PROFILES.medium;
    
    // Create geometry
    const geometry = createParticleGeometry(preset, performanceProfile);
    geometryRef.current = geometry;
    
    // Create material
    const material = createParticleMaterial(preset, performanceProfile);
    materialRef.current = material;
    
    // Create particle system
    const particles = new THREE.Points(geometry, material);
    
    // Add to scene
    scene.add(particles);
    
    // Store reference
    particlesRef.current = particles;
    
    return particles;
  }, []);
  
  /**
   * Animation loop
   */
  const animate = useCallback((time) => {
    if (!particlesRef.current || !materialRef.current || !geometryRef.current) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Calculate delta time
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    const deltaTime = (time - previousTimeRef.current) / 1000;
    previousTimeRef.current = time;
    
    // Update particles
    updateParticles(geometryRef.current, materialRef.current, deltaTime);
    
    // Update time dilation effect based on game state
    const timeDilationActive = quantumGame.abilities?.timeDilation?.active;
    setTimeDilationEffect(materialRef.current, timeDilationActive ? 1.0 : 0.0);
    
    // Update 4D rotation
    const rotationAxis = new THREE.Vector3(
      Math.sin(time * 0.0001),
      Math.cos(time * 0.0001),
      Math.sin(time * 0.0002) * Math.cos(time * 0.0002)
    ).normalize();
    
    set4DRotation(materialRef.current, rotationAxis, 0.1);
    
    // Continue animation loop
    requestRef.current = requestAnimationFrame(animate);
  }, [quantumGame]);
  
  // Start animation loop
  useEffect(() => {
    if (particlesRef.current && materialRef.current && geometryRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
  
  /**
   * Change particle effect type
   * @param {string} type - Particle preset type
   */
  const changeParticleType = useCallback((type) => {
    if (!sceneRef.current) return;
    
    // Remove existing particles
    if (particlesRef.current) {
      sceneRef.current.remove(particlesRef.current);
      
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      
      particlesRef.current = null;
      geometryRef.current = null;
      materialRef.current = null;
    }
    
    // Create new particles
    createParticleEffect(type, sceneRef.current);
    
    // Update state
    setParticleType(type);
  }, [createParticleEffect]);
  
  /**
   * Create a one-time burst of particles
   * @param {Object} options - Burst options
   */
  const createParticleBurst = useCallback((options = {}) => {
    const {
      position = new THREE.Vector3(0, 0, 0),
      count = 100,
      color = new THREE.Color(0x00ddff),
      size = 3,
      speed = 2,
      duration = 1,
    } = options;
    
    if (!sceneRef.current) return;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 4);
    const sizes = new Float32Array(count);
    
    // Initialize attributes
    for (let i = 0; i < count; i++) {
      // Start all particles at burst position
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      // Set color
      colors[i * 4] = color.r;
      colors[i * 4 + 1] = color.g;
      colors[i * 4 + 2] = color.b;
      colors[i * 4 + 3] = 1.0;
      
      // Random size variation
      sizes[i] = size * (0.5 + Math.random() * 0.5);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });
    
    // Create particle system
    const particles = new THREE.Points(geometry, material);
    sceneRef.current.add(particles);
    
    // Generate random velocities
    const velocities = [];
    for (let i = 0; i < count; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2 * speed,
        (Math.random() - 0.5) * 2 * speed,
        (Math.random() - 0.5) * 2 * speed
      );
      velocities.push(velocity);
    }
    
    // Animation
    let time = 0;
    const animate = () => {
      const deltaTime = 1 / 60; // Fixed delta time
      time += deltaTime;
      
      // Update positions
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i].x * deltaTime;
        positions[i * 3 + 1] += velocities[i].y * deltaTime;
        positions[i * 3 + 2] += velocities[i].z * deltaTime;
        
        // Fade out
        const fadeRatio = 1 - (time / duration);
        colors[i * 4 + 3] = Math.max(0, fadeRatio);
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
      if (time < duration) {
        requestAnimationFrame(animate);
      } else {
        // Clean up
        sceneRef.current.remove(particles);
        geometry.dispose();
        material.dispose();
      }
    };
    
    requestAnimationFrame(animate);
  }, []);
  
  // Expose API
  return {
    initialized,
    particleType,
    changeParticleType,
    createParticleBurst,
    setTimeDilationEffect: (intensity) => {
      if (materialRef.current) {
        setTimeDilationEffect(materialRef.current, intensity);
      }
    },
    set4DRotation: (axis, speed) => {
      if (materialRef.current) {
        set4DRotation(materialRef.current, axis, speed);
      }
    },
  };
};

/**
 * Hook to use the particle system
 */
export const useQuantumParticles = () => {
  const [system] = useState(() => QuantumParticleSystem());
  
  return system;
};

export default useQuantumParticles;