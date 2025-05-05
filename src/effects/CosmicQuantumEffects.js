import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Vector2, Vector3, Color, Quaternion, MathUtils } from 'three';

/**
 * CosmicQuantumEffects - Enhances the game with cosmic quantum visual effects
 * 
 * Features:
 * 1. Quantum field visualizations connecting all elements
 * 2. Cosmic background with procedural nebulae and black holes
 * 3. Entanglement bridges between levels
 * 4. Time dilation effects near massive quantum objects
 * 5. Quantum tunneling passages between dimensions
 */
class CosmicQuantumEffects {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Store all effect systems
    this.effects = {
      quantumField: null,
      cosmicBackground: null,
      entanglementBridges: [],
      timeDilationZones: [],
      quantumTunnels: [],
    };
    
    // Store all interactive elements
    this.interactiveElements = {
      quantumComputers: [],
      particleAccelerators: [],
      entanglementNodes: [],
      timeCrystals: [],
      darkMatterContainers: [],
    };
    
    // Post-processing effects
    this.composer = null;
    this.timeDilationPass = null;
    this.quantumPass = null;
    
    // Black hole shader
    this.blackHoleShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uRadius: { value: 0.5 },
        uIntensity: { value: 2.0 },
        uPosition: { value: new Vector2(0.5, 0.5) },
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
        uniform float uRadius;
        uniform float uIntensity;
        uniform vec2 uPosition;
        varying vec2 vUv;
        
        float distortion(vec2 position, float radius, float intensity) {
          float dist = distance(position, uPosition);
          float bend = max(0.0, 1.0 - dist / radius) * intensity;
          return bend;
        }
        
        void main() {
          vec2 direction = vUv - uPosition;
          float len = length(direction);
          vec2 distorted = vUv;
          
          if (len < uRadius) {
            float bend = distortion(vUv, uRadius, uIntensity);
            float phi = atan(direction.y, direction.x);
            
            float innerRadius = uRadius * 0.2;
            if (len < innerRadius) {
              // Black hole center (event horizon)
              float t = len / innerRadius;
              distorted = uPosition + direction * (t * t * t);
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              return;
            } else {
              // Distortion effect
              float swirl = sin(phi * 3.0 + uTime * 0.5) * 0.5 + 0.5;
              float attraction = 1.0 - (len / uRadius);
              distorted = uPosition + normalize(direction) * (len - bend * swirl * attraction);
            }
          }
          
          vec4 color = texture2D(tDiffuse, distorted);
          
          // Add accretion disk glow
          if (len < uRadius && len > uRadius * 0.2) {
            float glow = (1.0 - len / uRadius) * (len / (uRadius * 0.2));
            float glowPulse = (sin(uTime * 2.0) * 0.5 + 0.5) * 0.3 + 0.7;
            color.r += glow * 0.5 * glowPulse;
            color.g += glow * 0.3 * glowPulse;
            color.b += glow * 0.8 * glowPulse;
          }
          
          gl_FragColor = color;
        }
      `,
    };
    
    // Time dilation shader
    this.timeDilationShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uCenterPosition: { value: new Vector2(0.5, 0.5) },
        uRadius: { value: 0.3 },
        uIntensity: { value: 0.5 },
        uNoiseScale: { value: 20.0 },
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
        uniform vec2 uCenterPosition;
        uniform float uRadius;
        uniform float uIntensity;
        uniform float uNoiseScale;
        
        varying vec2 vUv;
        
        // Simplex noise function
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          float distance = length(vUv - uCenterPosition);
          float factor = smoothstep(uRadius, 0.0, distance);
          
          // Calculate noise for the distortion
          float noise = snoise(vUv * uNoiseScale + vec2(uTime * 0.1, 0.0));
          
          // Generate time dilation distortion
          vec2 offset = normalize(vUv - uCenterPosition) * factor * uIntensity;
          offset *= sin(uTime + noise * 2.0) * 0.1 + 0.9; // Pulsating effect
          
          // Chromatic aberration
          float r = texture2D(tDiffuse, vUv + offset * 1.1).r;
          float g = texture2D(tDiffuse, vUv + offset * 1.0).g;
          float b = texture2D(tDiffuse, vUv + offset * 0.9).b;
          
          // Combine colors with pulse effect
          float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
          vec4 finalColor = vec4(r, g, b, 1.0);
          
          // Add time ripples
          if (factor > 0.05) {
            float ripple = sin((distance * 20.0 - uTime * 2.0) * 3.1415) * 0.5 + 0.5;
            ripple *= smoothstep(0.0, 0.2, factor);
            finalColor.rgb += vec3(0.0, 0.3, 0.5) * ripple * pulse * factor;
          }
          
          gl_FragColor = finalColor;
        }
      `,
    };
    
    // Initialize systems
    this._initialize();
  }
  
  /**
   * Initialize all quantum effect systems
   * @private
   */
  _initialize() {
    this._initPostProcessing();
    this._createQuantumField();
    this._createCosmicBackground();
    
    // Set up default interactive elements
    this._createDefaultInteractiveElements();
  }
  
  /**
   * Initialize post processing effects
   * @private
   */
  _initPostProcessing() {
    // Create an EffectComposer
    this.composer = new EffectComposer(this.renderer);
    
    // Add a render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Add bloom effect for glowing elements
    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloomPass);
    
    // Add time dilation shader pass
    this.timeDilationPass = new ShaderPass(this.timeDilationShader);
    this.timeDilationPass.enabled = false; // Enable only when near time dilation zones
    this.composer.addPass(this.timeDilationPass);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  /**
   * Create the quantum field visualization
   * @private
   */
  _createQuantumField() {
    const fieldGeometry = new THREE.BufferGeometry();
    const nodeCount = 300;
    const maxConnections = 600;
    
    // Create nodes
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeSizes = new Float32Array(nodeCount);
    const nodeColors = new Float32Array(nodeCount * 3);
    
    // Create connections
    const linePositions = new Float32Array(maxConnections * 6); // Two points per line (6 values)
    const lineColors = new Float32Array(maxConnections * 6);
    
    // Initialize node positions in a sphere shape
    for (let i = 0; i < nodeCount; i++) {
      // Random position on a sphere
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 10; // Field radius
      
      nodePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      nodePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      nodePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random size
      nodeSizes[i] = 0.05 + Math.random() * 0.15;
      
      // Quantum colors (blue to cyan to magenta)
      const colorFactor = Math.random();
      nodeColors[i * 3] = colorFactor > 0.5 ? colorFactor : 0;           // R
      nodeColors[i * 3 + 1] = colorFactor < 0.7 ? 0.5 + colorFactor * 0.5 : 0; // G
      nodeColors[i * 3 + 2] = 0.5 + colorFactor * 0.5;                   // B
    }
    
    // Create connections between nearby nodes
    let connectionCount = 0;
    for (let i = 0; i < nodeCount && connectionCount < maxConnections; i++) {
      const ix = nodePositions[i * 3];
      const iy = nodePositions[i * 3 + 1];
      const iz = nodePositions[i * 3 + 2];
      
      // Find closest nodes to connect
      for (let j = i + 1; j < nodeCount && connectionCount < maxConnections; j++) {
        const jx = nodePositions[j * 3];
        const jy = nodePositions[j * 3 + 1];
        const jz = nodePositions[j * 3 + 2];
        
        // Calculate distance
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Connect if close enough
        if (distance < 5) {
          // First point
          linePositions[connectionCount * 6] = ix;
          linePositions[connectionCount * 6 + 1] = iy;
          linePositions[connectionCount * 6 + 2] = iz;
          
          // Second point
          linePositions[connectionCount * 6 + 3] = jx;
          linePositions[connectionCount * 6 + 4] = jy;
          linePositions[connectionCount * 6 + 5] = jz;
          
          // Line color (fade from one node's color to the other)
          lineColors[connectionCount * 6] = nodeColors[i * 3];
          lineColors[connectionCount * 6 + 1] = nodeColors[i * 3 + 1];
          lineColors[connectionCount * 6 + 2] = nodeColors[i * 3 + 2];
          
          lineColors[connectionCount * 6 + 3] = nodeColors[j * 3];
          lineColors[connectionCount * 6 + 4] = nodeColors[j * 3 + 1];
          lineColors[connectionCount * 6 + 5] = nodeColors[j * 3 + 2];
          
          connectionCount++;
        }
      }
    }
    
    // Create nodes
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
    nodeGeometry.setAttribute('size', new THREE.BufferAttribute(nodeSizes, 1));
    
    // Create node material
    const nodeTexture = this._createParticleTexture();
    const nodeMaterial = new THREE.PointsMaterial({
      size: 1.0,
      map: nodeTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    // Create node system
    const nodeSystem = new THREE.Points(nodeGeometry, nodeMaterial);
    nodeSystem.frustumCulled = false;
    
    // Create connections
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions.slice(0, connectionCount * 6), 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors.slice(0, connectionCount * 6), 3));
    
    // Create line material
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    
    // Create line system
    const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    lineSystem.frustumCulled = false;
    
    // Group everything
    const quantumField = new THREE.Group();
    quantumField.add(nodeSystem);
    quantumField.add(lineSystem);
    
    // Store references with additional animation data
    quantumField.userData = {
      nodeSystem: nodeSystem,
      lineSystem: lineSystem,
      nodeVelocities: new Float32Array(nodeCount * 3),
      time: 0,
      connectionCount: connectionCount,
    };
    
    // Initialize node velocities with small random values
    for (let i = 0; i < nodeCount * 3; i++) {
      quantumField.userData.nodeVelocities[i] = (Math.random() - 0.5) * 0.02;
    }
    
    // Add to scene
    this.scene.add(quantumField);
    this.effects.quantumField = quantumField;
  }
  
  /**
   * Create a cosmic background with nebulae and black holes
   * @private
   */
  _createCosmicBackground() {
    // Create a background sphere
    const bgGeometry = new THREE.SphereGeometry(100, 64, 64);
    bgGeometry.scale(-1, 1, 1); // Invert so it's visible from inside
    
    // Create nebula shader material
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
        uColorShift: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uColorShift;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simplex noise function
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          // First corner
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

          // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          // Permutations
          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                     i.z + vec3(0.0, i1.z, i2.z)) +
                     i.y + vec3(0.0, i1.y, i2.y)) +
                     i.x + vec3(0.0, i1.x, i2.x));

          // Gradients
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          // Normalise gradients
          vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
        
        // Star field function
        vec3 starField(vec3 dir, float time) {
          vec3 color = vec3(0.0);
          float size = 0.002;
          
          for (int i = 0; i < 3; i++) {
            float layer = float(i) * 0.2;
            vec3 p = dir * (100.0 + layer * 20.0) + time * (1.0 + layer * 2.0);
            vec3 id = floor(p * 0.001 * (1.0 + size));
            float rnd = fract(sin(dot(id, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            
            if (rnd > 0.99) {
              float brightness = fract(rnd * 1000.0) * 0.5 + 0.5;
              float starSize = (fract(rnd * 10.0) * 0.8 + 0.2) * size;
              vec3 starPos = id + fract(sin(id * 10.0) * 10.0);
              float dist = length(p - starPos * 1000.0) / 1000.0;
              float star = 1.0 - smoothstep(0.0, starSize, dist);
              
              // Twinkle
              float twinkle = sin(time * (fract(rnd * 10.0) * 5.0 + 1.0) + rnd * 10.0) * 0.5 + 0.5;
              
              // Star color
              vec3 starColor = vec3(
                0.6 + 0.4 * cos(rnd * 1.0 + 0.0),
                0.6 + 0.4 * cos(rnd * 1.0 + 2.0),
                0.6 + 0.4 * cos(rnd * 1.0 + 4.0)
              );
              
              color += star * brightness * mix(0.5, 1.0, twinkle) * starColor;
            }
          }
          
          return color;
        }
        
        // Nebula function
        vec3 nebula(vec3 dir, float time, float colorShift) {
          vec3 p = dir * 20.0;
          float freq = 0.8;
          
          float f1 = snoise(p * freq + time * 0.05) * 0.5 + 0.5;
          float f2 = snoise(p * freq * 2.0 - time * 0.08) * 0.5 + 0.5;
          float f3 = snoise(p * freq * 4.0 + time * 0.12) * 0.5 + 0.5;
          
          float nebulaDensity = f1 * f2 * f3;
          nebulaDensity = smoothstep(0.4, 0.9, nebulaDensity);
          
          // Vary the color based on direction and noise
          vec3 baseColor1 = vec3(0.1, 0, 0.3); // Dark purple
          vec3 baseColor2 = vec3(0, 0.3, 0.6); // Deep blue
          vec3 baseColor3 = vec3(0.6, 0.2, 0.5); // Pinkish
          
          // Mix colors based on position and time
          float mixFactor1 = snoise(p * 0.1 + time * 0.02) * 0.5 + 0.5;
          float mixFactor2 = snoise(p * 0.2 - time * 0.03) * 0.5 + 0.5;
          
          vec3 nebulaColor = mix(baseColor1, baseColor2, mixFactor1);
          nebulaColor = mix(nebulaColor, baseColor3, mixFactor2);
          
          // Add color variation based on colorShift uniform
          nebulaColor = mix(
            nebulaColor,
            vec3(nebulaColor.r * 0.5, nebulaColor.g * 1.5, nebulaColor.b),
            colorShift
          );
          
          return nebulaColor * nebulaDensity * 1.5;
        }
        
        void main() {
          vec3 dir = normalize(vPosition);
          
          // Stars
          vec3 color = starField(dir, uTime);
          
          // Nebula
          color += nebula(dir, uTime, uColorShift);
          
          // Enhance with circular gradients for cosmic look
          float gradientMask = smoothstep(0.4, 1.0, length(dir.xz));
          color = mix(color, color * vec3(1.0, 0.6, 1.0), gradientMask * 0.3);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    
    // Create sphere with nebula material
    const backgroundSphere = new THREE.Mesh(bgGeometry, nebulaMaterial);
    
    // Create black holes
    const blackHoles = [];
    const blackHoleCount = 2; // 2 black holes in the background
    
    for (let i = 0; i < blackHoleCount; i++) {
      // Create a simple placeholder for the black hole 
      // (actual rendering is done in post-processing)
      const blackHoleGeometry = new THREE.SphereGeometry(1, 32, 32);
      const blackHoleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.0, // Invisible, just marking position
      });
      
      const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
      
      // Random position on the background sphere
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 10; // Just inside the background sphere
      
      blackHole.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(phi) * Math.sin(theta),
        distance * Math.cos(phi)
      );
      
      // Random size
      const blackHoleSize = 2 + Math.random() * 3;
      blackHole.scale.set(blackHoleSize, blackHoleSize, blackHoleSize);
      
      // Store in array
      blackHoles.push(blackHole);
      this.scene.add(blackHole);
    }
    
    // Create cosmic background group
    const cosmicBackground = new THREE.Group();
    cosmicBackground.add(backgroundSphere);
    
    // Store references for updating
    cosmicBackground.userData = {
      material: nebulaMaterial,
      time: 0,
      blackHoles: blackHoles,
      rotationSpeed: 0.001, // Very slow rotation
    };
    
    // Add to scene
    this.scene.add(cosmicBackground);
    this.effects.cosmicBackground = cosmicBackground;
  }
  
  /**
   * Create a particle texture
   * @private
   */
  _createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Create an entanglement bridge between two points
   * @param {Vector3} startPosition - Start position of the bridge
   * @param {Vector3} endPosition - End position of the bridge
   * @param {Object} options - Bridge configuration options
   * @returns {Object} Bridge object
   */
  createEntanglementBridge(startPosition, endPosition, options = {}) {
    const defaults = {
      width: 1,
      density: 100,
      color1: new Color(0x00ffff),
      color2: new Color(0xff00ff),
      lifespan: -1, // -1 for permanent
      pulseSpeed: 1.5,
    };
    
    const config = { ...defaults, ...options };
    
    // Create bridge geometry
    const bridgeGeometry = new THREE.BufferGeometry();
    const particleCount = config.density;
    
    // Create arrays for particle attributes
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    
    // Direction vector
    const direction = new Vector3().subVectors(endPosition, startPosition);
    const distance = direction.length();
    direction.normalize();
    
    // Create basis vectors for the bridge's "tube"
    const up = new Vector3(0, 1, 0);
    let right = new Vector3().crossVectors(direction, up);
    if (right.lengthSq() < 0.1) {
      // If direction is too close to up, use a different base vector
      up.set(0, 0, 1);
      right = new Vector3().crossVectors(direction, up);
    }
    right.normalize();
    up.crossVectors(right, direction).normalize();
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      // Position along the bridge
      const t = Math.random();
      const basePosition = new Vector3().lerpVectors(startPosition, endPosition, t);
      
      // Random offset within tube
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * config.width;
      const offset = new Vector3()
        .addScaledVector(right, Math.cos(angle) * radius)
        .addScaledVector(up, Math.sin(angle) * radius);
      
      const finalPosition = basePosition.clone().add(offset);
      
      positions[i * 3] = finalPosition.x;
      positions[i * 3 + 1] = finalPosition.y;
      positions[i * 3 + 2] = finalPosition.z;
      
      // Color gradient from color1 to color2
      const colorMix = Math.random();
      colors[i * 3] = config.color1.r * (1 - colorMix) + config.color2.r * colorMix;
      colors[i * 3 + 1] = config.color1.g * (1 - colorMix) + config.color2.g * colorMix;
      colors[i * 3 + 2] = config.color1.b * (1 - colorMix) + config.color2.b * colorMix;
      
      // Random size
      sizes[i] = 0.05 + Math.random() * 0.15;
      
      // Random phase for animation
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    // Add attributes to geometry
    bridgeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    bridgeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    bridgeGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const bridgeMaterial = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create particle system
    const bridgeSystem = new THREE.Points(bridgeGeometry, bridgeMaterial);
    bridgeSystem.frustumCulled = false;
    
    // Store reference with additional data
    bridgeSystem.userData = {
      startPosition: startPosition.clone(),
      endPosition: endPosition.clone(),
      positions: positions,
      phases: phases,
      distance: distance,
      direction: direction,
      right: right,
      up: up,
      config: config,
      time: 0,
      creationTime: Date.now() / 1000,
    };
    
    // Add to scene
    this.scene.add(bridgeSystem);
    
    // Store in array
    this.effects.entanglementBridges.push(bridgeSystem);
    
    return bridgeSystem;
  }
  
  /**
   * Create a time dilation zone
   * @param {Vector3} position - Center position of the time dilation zone
   * @param {number} radius - Radius of the zone
   * @param {Object} options - Configuration options
   * @returns {Object} Time dilation zone object
   */
  createTimeDilationZone(position, radius, options = {}) {
    const defaults = {
      intensity: 1.0,
      color: new Color(0x00ffff),
      pulseSpeed: 0.5,
      particleCount: 200,
    };
    
    const config = { ...defaults, ...options };
    
    // Create particles
    const zoneGeometry = new THREE.BufferGeometry();
    const particleCount = config.particleCount;
    
    // Create arrays for particle attributes
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      // Random position within sphere
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = radius * Math.pow(Math.random(), 1/3); // Cube root for even distribution
      
      positions[i * 3] = position.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = position.y + r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = position.z + r * Math.cos(phi);
      
      // Color (based on distance from center)
      const dist = r / radius;
      colors[i * 3] = config.color.r * (1 - dist * 0.5);
      colors[i * 3 + 1] = config.color.g * (1 - dist * 0.5);
      colors[i * 3 + 2] = config.color.b * (1 - dist * 0.5);
      
      // Random size
      sizes[i] = 0.05 + Math.random() * 0.15;
      
      // Random phase for animation
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    // Add attributes to geometry
    zoneGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    zoneGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    zoneGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const zoneMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create particle system
    const zoneSystem = new THREE.Points(zoneGeometry, zoneMaterial);
    zoneSystem.frustumCulled = false;
    
    // Create a glow sphere
    const glowGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(config.color) },
        uRadius: { value: radius },
        uIntensity: { value: config.intensity },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uRadius;
        uniform float uIntensity;
        uniform float uTime;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float intensity = uIntensity * 0.5;
          float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
          float rimPower = mix(2.0, 3.0, pulse);
          
          // Fresnel effect
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float rim = 1.0 - max(dot(viewDirection, vNormal), 0.0);
          rim = pow(rim, rimPower);
          
          // Ripple effect
          float ripple = sin(length(vPosition) * 10.0 - uTime * 5.0) * 0.5 + 0.5;
          ripple *= 0.2;
          
          vec3 finalColor = uColor * (intensity + rim * 0.5 + ripple);
          finalColor *= mix(0.8, 1.2, pulse);
          
          // Fade out at the edges
          float edgeFade = 1.0 - smoothstep(0.8 * uRadius, uRadius, length(vPosition));
          finalColor *= edgeFade;
          
          gl_FragColor = vec4(finalColor, rim * 0.5 * edgeFade);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create glow sphere
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.position.copy(position);
    
    // Create a group for time dilation zone
    const zoneGroup = new THREE.Group();
    zoneGroup.add(zoneSystem);
    zoneGroup.add(glowSphere);
    
    // Store reference with additional data
    zoneGroup.userData = {
      position: position.clone(),
      radius: radius,
      particleSystem: zoneSystem,
      glowSphere: glowSphere,
      positions: positions,
      phases: phases,
      config: config,
      time: 0,
    };
    
    // Add to scene
    this.scene.add(zoneGroup);
    
    // Store in array
    this.effects.timeDilationZones.push(zoneGroup);
    
    return zoneGroup;
  }
  
  /**
   * Create a quantum tunnel passage
   * @param {Vector3} startPosition - Start position of the tunnel
   * @param {Vector3} endPosition - End position of the tunnel
   * @param {Object} options - Configuration options
   * @returns {Object} Quantum tunnel object
   */
  createQuantumTunnel(startPosition, endPosition, options = {}) {
    const defaults = {
      radius: 2,
      length: null, // Will be calculated from start to end
      segments: 20,
      color1: new Color(0x8800ff),
      color2: new Color(0x00ffff),
      rotationSpeed: 1.0,
    };
    
    const config = { ...defaults, ...options };
    
    // Calculate direction and length
    const direction = new Vector3().subVectors(endPosition, startPosition);
    const tunnelLength = config.length || direction.length();
    direction.normalize();
    
    // Create tunnel geometry
    const tunnelGroup = new THREE.Group();
    tunnelGroup.position.copy(startPosition);
    
    // Align rotation to direction vector
    const quat = new Quaternion();
    quat.setFromUnitVectors(new Vector3(0, 0, 1), direction);
    tunnelGroup.quaternion.copy(quat);
    
    // Create spiral rings
    const numRings = 10;
    const rings = [];
    
    for (let i = 0; i < numRings; i++) {
      // Create ring geometry
      const ringGeometry = new THREE.TorusGeometry(
        config.radius, 
        0.1, 
        16, 
        48
      );
      
      // Create ring material
      const t = i / (numRings - 1);
      const ringColor = new Color().lerpColors(config.color1, config.color2, t);
      
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
      
      // Create ring mesh
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // Position ring along the tunnel
      ring.position.z = t * tunnelLength;
      
      // Add random initial rotation
      ring.rotation.x = Math.random() * Math.PI * 2;
      ring.rotation.y = Math.random() * Math.PI * 2;
      
      // Add to group
      tunnelGroup.add(ring);
      rings.push(ring);
    }
    
    // Create particle field for the tunnel interior
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      // Random position within tunnel
      const z = Math.random() * tunnelLength;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * config.radius * 0.9;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;
      
      // Color gradient along the tunnel
      const t = z / tunnelLength;
      const color = new Color().lerpColors(config.color1, config.color2, t);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Random size
      sizes[i] = 0.05 + Math.random() * 0.1;
    }
    
    // Add attributes to geometry
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this._createParticleTexture(),
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.frustumCulled = false;
    
    // Add to tunnel group
    tunnelGroup.add(particleSystem);
    
    // Create tunnel entrance and exit glows
    const entranceGlow = this._createTunnelGlow(config.radius, config.color1);
    entranceGlow.position.z = 0;
    tunnelGroup.add(entranceGlow);
    
    const exitGlow = this._createTunnelGlow(config.radius, config.color2);
    exitGlow.position.z = tunnelLength;
    tunnelGroup.add(exitGlow);
    
    // Store reference with additional data
    tunnelGroup.userData = {
      startPosition: startPosition.clone(),
      endPosition: endPosition.clone(),
      direction: direction.clone(),
      length: tunnelLength,
      radius: config.radius,
      rings: rings,
      particleSystem: particleSystem,
      particlePositions: positions,
      config: config,
      time: 0,
      entranceGlow: entranceGlow,
      exitGlow: exitGlow,
    };
    
    // Add to scene
    this.scene.add(tunnelGroup);
    
    // Store in array
    this.effects.quantumTunnels.push(tunnelGroup);
    
    return tunnelGroup;
  }
  
  /**
   * Create a glow effect for tunnel entrances
   * @param {number} radius - Radius of the tunnel
   * @param {Color} color - Glow color
   * @returns {Object3D} Glow mesh
   * @private
   */
  _createTunnelGlow(radius, color) {
    // Create ring geometry
    const glowGeometry = new THREE.RingGeometry(radius * 0.8, radius * 1.5, 32);
    
    // Create glow material
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: color },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        
        varying vec2 vUv;
        
        void main() {
          // Calculate distance from center
          float dist = length(vUv - vec2(0.5, 0.5)) * 2.0;
          
          // Inner ring glow
          float ring = 1.0 - abs(dist - 1.0) * 2.0;
          ring = pow(ring, 3.0);
          
          // Pulsation
          float pulse = (sin(uTime * 2.0) * 0.5 + 0.5) * 0.3 + 0.7;
          
          // Rays emanating from the center
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float rays = sin(angle * 16.0 + uTime * 4.0) * 0.5 + 0.5;
          rays *= smoothstep(0.0, 0.1, dist) * (1.0 - smoothstep(0.8, 1.0, dist));
          
          vec3 finalColor = uColor * (ring + rays * 0.3) * pulse;
          float alpha = ring * 0.7 + rays * 0.3;
          
          gl_FragColor = vec4(finalColor, alpha * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    
    return glowMesh;
  }
  
  /**
   * Create default interactive elements
   * @private
   */
  _createDefaultInteractiveElements() {
    // We'll implement these in QuantumInteractiveElements.js
  }
  
  /**
   * Update black hole shader uniforms
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateBlackHoleShader(deltaTime) {
    // This will be implemented when we integrate with the rendering pipeline
    // The shader is already defined in this class
  }
  
  /**
   * Update time dilation shader uniforms
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position
   * @private
   */
  _updateTimeDilationShader(deltaTime, playerPosition) {
    // Check if we should be showing time dilation
    if (!this.timeDilationPass || !playerPosition) return;
    
    let showEffect = false;
    let closestDist = Infinity;
    let closestZone = null;
    
    // Find the closest time dilation zone
    for (const zone of this.effects.timeDilationZones) {
      const dist = zone.userData.position.distanceTo(playerPosition);
      const radius = zone.userData.radius;
      
      if (dist < radius * 1.5 && dist < closestDist) {
        closestDist = dist;
        closestZone = zone;
        showEffect = true;
      }
    }
    
    // Enable/disable effect
    this.timeDilationPass.enabled = showEffect;
    
    if (showEffect && closestZone) {
      // Calculate screen-space position for the effect center
      const tempV = closestZone.userData.position.clone();
      tempV.project(this.camera);
      
      // Convert to UV coordinates (0-1)
      const centerX = (tempV.x + 1) / 2;
      const centerY = (tempV.y + 1) / 2;
      
      // Update shader uniforms
      this.timeDilationPass.uniforms.uTime.value += deltaTime;
      this.timeDilationPass.uniforms.uCenterPosition.value.set(centerX, centerY);
      
      // Calculate effect intensity based on distance
      const normalizedDist = closestDist / closestZone.userData.radius;
      const intensity = MathUtils.clamp(1.5 - normalizedDist, 0, 1);
      this.timeDilationPass.uniforms.uIntensity.value = intensity * closestZone.userData.config.intensity;
      
      // Radius in screen space (adjust as needed)
      const screenRadius = MathUtils.clamp(0.2 / normalizedDist, 0.1, 0.5);
      this.timeDilationPass.uniforms.uRadius.value = screenRadius;
    }
  }
  
  /**
   * Update quantum field
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateQuantumField(deltaTime) {
    const field = this.effects.quantumField;
    if (!field) return;
    
    field.userData.time += deltaTime;
    
    const nodeSystem = field.userData.nodeSystem;
    const lineSystem = field.userData.lineSystem;
    const positions = nodeSystem.geometry.attributes.position.array;
    const velocities = field.userData.nodeVelocities;
    const connectionCount = field.userData.connectionCount;
    
    // Update node positions
    for (let i = 0; i < positions.length / 3; i++) {
      // Add velocity to position
      positions[i * 3] += velocities[i * 3] * deltaTime * 10;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 10;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 10;
      
      // Small sinusoidal motion
      const time = field.userData.time;
      const pulseFactor = Math.sin(time * 0.5 + i * 0.1) * 0.02;
      positions[i * 3] += Math.sin(time + i) * pulseFactor;
      positions[i * 3 + 1] += Math.cos(time * 1.1 + i * 0.5) * pulseFactor;
      positions[i * 3 + 2] += Math.sin(time * 0.7 + i * 0.3) * pulseFactor;
      
      // Keep within a boundary
      const dist = Math.sqrt(
        positions[i * 3] * positions[i * 3] +
        positions[i * 3 + 1] * positions[i * 3 + 1] +
        positions[i * 3 + 2] * positions[i * 3 + 2]
      );
      
      const maxRadius = 25;
      if (dist > maxRadius) {
        const scale = maxRadius / dist;
        positions[i * 3] *= scale;
        positions[i * 3 + 1] *= scale;
        positions[i * 3 + 2] *= scale;
        
        // Reverse velocity
        velocities[i * 3] *= -0.5;
        velocities[i * 3 + 1] *= -0.5;
        velocities[i * 3 + 2] *= -0.5;
      }
      
      // Random velocity changes
      if (Math.random() < 0.01) {
        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      }
    }
    
    // Update line positions
    const linePositions = lineSystem.geometry.attributes.position.array;
    
    // Update only used connections
    for (let i = 0; i < connectionCount; i++) {
      // Get node indices (first and second node of the connection)
      const node1Idx = i * 2;
      const node2Idx = i * 2 + 1;
      
      // Update line start point (first 3 values) from node positions
      linePositions[i * 6] = positions[node1Idx * 3];
      linePositions[i * 6 + 1] = positions[node1Idx * 3 + 1];
      linePositions[i * 6 + 2] = positions[node1Idx * 3 + 2];
      
      // Update line end point (second 3 values) from node positions
      linePositions[i * 6 + 3] = positions[node2Idx * 3];
      linePositions[i * 6 + 4] = positions[node2Idx * 3 + 1];
      linePositions[i * 6 + 5] = positions[node2Idx * 3 + 2];
    }
    
    // Mark attributes as needing update
    nodeSystem.geometry.attributes.position.needsUpdate = true;
    lineSystem.geometry.attributes.position.needsUpdate = true;
    
    // Slowly rotate the entire field
    field.rotation.y += deltaTime * 0.05;
  }
  
  /**
   * Update cosmic background
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateCosmicBackground(deltaTime) {
    const background = this.effects.cosmicBackground;
    if (!background) return;
    
    background.userData.time += deltaTime;
    
    // Update nebula material
    background.userData.material.uniforms.uTime.value = background.userData.time;
    
    // Slightly change color hue over time
    const colorShift = (Math.sin(background.userData.time * 0.05) * 0.5 + 0.5);
    background.userData.material.uniforms.uColorShift.value = colorShift;
    
    // Slowly rotate background
    background.rotation.y += deltaTime * 0.01;
    
    // Update black holes
    for (const blackHole of background.userData.blackHoles) {
      // Rotate black holes
      blackHole.rotation.x += deltaTime * 0.03;
      blackHole.rotation.y += deltaTime * 0.02;
    }
  }
  
  /**
   * Update entanglement bridges
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateEntanglementBridges(deltaTime) {
    // Update each bridge
    for (let i = this.effects.entanglementBridges.length - 1; i >= 0; i--) {
      const bridge = this.effects.entanglementBridges[i];
      
      // Update time
      bridge.userData.time += deltaTime;
      
      // Check if the bridge should disappear
      if (bridge.userData.config.lifespan > 0) {
        const age = (Date.now() / 1000) - bridge.userData.creationTime;
        if (age > bridge.userData.config.lifespan) {
          // Remove bridge
          this.scene.remove(bridge);
          bridge.geometry.dispose();
          bridge.material.dispose();
          this.effects.entanglementBridges.splice(i, 1);
          continue;
        }
      }
      
      // Get particle data
      const positions = bridge.geometry.attributes.position.array;
      const sizes = bridge.geometry.attributes.size.array;
      const phases = bridge.userData.phases;
      
      // Animate particles
      for (let j = 0; j < sizes.length; j++) {
        // Pulsating size
        const pulseFactor = Math.sin(
          bridge.userData.time * bridge.userData.config.pulseSpeed + phases[j]
        ) * 0.5 + 1.0;
        
        sizes[j] = (0.05 + Math.random() * 0.15) * pulseFactor;
        
        // Subtle position animation along the bridge direction
        const originalX = positions[j * 3];
        const originalY = positions[j * 3 + 1];
        const originalZ = positions[j * 3 + 2];
        
        // Small sinusoidal motion
        const positionFactor = Math.sin(
          bridge.userData.time * 0.5 + j * 0.1
        ) * 0.1;
        
        positions[j * 3] = originalX + bridge.userData.direction.x * positionFactor;
        positions[j * 3 + 1] = originalY + bridge.userData.direction.y * positionFactor;
        positions[j * 3 + 2] = originalZ + bridge.userData.direction.z * positionFactor;
      }
      
      // Mark attributes as needing update
      bridge.geometry.attributes.position.needsUpdate = true;
      bridge.geometry.attributes.size.needsUpdate = true;
    }
  }
  
  /**
   * Update time dilation zones
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateTimeDilationZones(deltaTime) {
    // Update each time dilation zone
    for (const zone of this.effects.timeDilationZones) {
      // Update time
      zone.userData.time += deltaTime;
      
      // Get particle data
      const particleSystem = zone.userData.particleSystem;
      const positions = particleSystem.geometry.attributes.position.array;
      const sizes = particleSystem.geometry.attributes.size.array;
      const phases = zone.userData.phases;
      
      // Animate particles
      for (let j = 0; j < sizes.length; j++) {
        // Pulsating size
        const pulseFactor = Math.sin(
          zone.userData.time * zone.userData.config.pulseSpeed + phases[j]
        ) * 0.5 + 1.0;
        
        sizes[j] = (0.05 + Math.random() * 0.15) * pulseFactor;
        
        // Orbiting motion
        const orbitSpeed = 0.2 * deltaTime;
        
        // Calculate vector from center
        const dx = positions[j * 3] - zone.userData.position.x;
        const dy = positions[j * 3 + 1] - zone.userData.position.y;
        const dz = positions[j * 3 + 2] - zone.userData.position.z;
        
        // Distance from center
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Time distortion: Particles closer to center move slower
        const timeFactor = dist / zone.userData.radius;
        const actualOrbitSpeed = orbitSpeed * timeFactor;
        
        // Apply rotation around y-axis
        const angle = actualOrbitSpeed;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        
        const newX = zone.userData.position.x + (dx * cosAngle - dz * sinAngle);
        const newZ = zone.userData.position.z + (dx * sinAngle + dz * cosAngle);
        
        positions[j * 3] = newX;
        positions[j * 3 + 2] = newZ;
        
        // Slight oscillation in y-axis
        positions[j * 3 + 1] += Math.sin(zone.userData.time * 2 + j * 0.1) * 0.01 * timeFactor;
      }
      
      // Update glow sphere
      const glowSphere = zone.userData.glowSphere;
      glowSphere.material.uniforms.uTime.value = zone.userData.time;
      
      // Mark attributes as needing update
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.size.needsUpdate = true;
    }
  }
  
  /**
   * Update quantum tunnels
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateQuantumTunnels(deltaTime) {
    // Update each quantum tunnel
    for (const tunnel of this.effects.quantumTunnels) {
      // Update time
      tunnel.userData.time += deltaTime;
      
      // Update rings
      for (let i = 0; i < tunnel.userData.rings.length; i++) {
        const ring = tunnel.userData.rings[i];
        const rotationSpeed = tunnel.userData.config.rotationSpeed;
        
        // Rotate ring around the tunnel axis
        ring.rotation.z += deltaTime * rotationSpeed * (i % 2 === 0 ? 1 : -1);
        
        // Make the radius oscillate
        const t = tunnel.userData.time + i * 0.5;
        const oscFactor = Math.sin(t) * 0.1 + 0.9;
        ring.scale.set(oscFactor, oscFactor, 1);
      }
      
      // Update particles
      const particleSystem = tunnel.userData.particleSystem;
      const positions = particleSystem.geometry.attributes.position.array;
      
      // Move particles through the tunnel
      for (let i = 0; i < positions.length / 3; i++) {
        // Move along z-axis (tunnel axis)
        positions[i * 3 + 2] += deltaTime * 2;
        
        // If particle leaves the tunnel, wrap it back to the start
        if (positions[i * 3 + 2] > tunnel.userData.length) {
          positions[i * 3 + 2] -= tunnel.userData.length;
          
          // Randomize x,y position when it reappears
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * tunnel.userData.radius * 0.9;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.sin(angle) * radius;
        }
      }
      
      // Update entrance/exit glows
      tunnel.userData.entranceGlow.material.uniforms.uTime.value = tunnel.userData.time;
      tunnel.userData.exitGlow.material.uniforms.uTime.value = tunnel.userData.time;
      
      // Mark particle attributes as needing update
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }
  }
  
  /**
   * Update all quantum effects
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position
   */
  update(deltaTime, playerPosition) {
    // Update quantum field
    this._updateQuantumField(deltaTime);
    
    // Update cosmic background
    this._updateCosmicBackground(deltaTime);
    
    // Update entanglement bridges
    this._updateEntanglementBridges(deltaTime);
    
    // Update time dilation zones
    this._updateTimeDilationZones(deltaTime);
    
    // Update quantum tunnels
    this._updateQuantumTunnels(deltaTime);
    
    // Update time dilation shader if player is near a time dilation zone
    this._updateTimeDilationShader(deltaTime, playerPosition);
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Clean up all effects
    
    // Quantum field
    if (this.effects.quantumField) {
      this.scene.remove(this.effects.quantumField);
      this.effects.quantumField.userData.nodeSystem.geometry.dispose();
      this.effects.quantumField.userData.nodeSystem.material.dispose();
      this.effects.quantumField.userData.lineSystem.geometry.dispose();
      this.effects.quantumField.userData.lineSystem.material.dispose();
    }
    
    // Cosmic background
    if (this.effects.cosmicBackground) {
      this.scene.remove(this.effects.cosmicBackground);
      this.effects.cosmicBackground.children[0].geometry.dispose();
      this.effects.cosmicBackground.children[0].material.dispose();
      
      for (const blackHole of this.effects.cosmicBackground.userData.blackHoles) {
        this.scene.remove(blackHole);
        blackHole.geometry.dispose();
        blackHole.material.dispose();
      }
    }
    
    // Entanglement bridges
    for (const bridge of this.effects.entanglementBridges) {
      this.scene.remove(bridge);
      bridge.geometry.dispose();
      bridge.material.dispose();
    }
    
    // Time dilation zones
    for (const zone of this.effects.timeDilationZones) {
      this.scene.remove(zone);
      zone.userData.particleSystem.geometry.dispose();
      zone.userData.particleSystem.material.dispose();
      zone.userData.glowSphere.geometry.dispose();
      zone.userData.glowSphere.material.dispose();
    }
    
    // Quantum tunnels
    for (const tunnel of this.effects.quantumTunnels) {
      this.scene.remove(tunnel);
      
      // Dispose rings
      for (const ring of tunnel.userData.rings) {
        ring.geometry.dispose();
        ring.material.dispose();
      }
      
      // Dispose particle system
      tunnel.userData.particleSystem.geometry.dispose();
      tunnel.userData.particleSystem.material.dispose();
      
      // Dispose glow meshes
      tunnel.userData.entranceGlow.geometry.dispose();
      tunnel.userData.entranceGlow.material.dispose();
      tunnel.userData.exitGlow.geometry.dispose();
      tunnel.userData.exitGlow.material.dispose();
    }
    
    // Clear references
    this.effects = {
      quantumField: null,
      cosmicBackground: null,
      entanglementBridges: [],
      timeDilationZones: [],
      quantumTunnels: [],
    };
    
    // Dispose post-processing
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
    }
  }
}

export default CosmicQuantumEffects;