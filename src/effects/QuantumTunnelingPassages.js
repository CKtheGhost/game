import * as THREE from 'three';
import { Vector3, Color, Quaternion, Matrix4, MathUtils } from 'three';

/**
 * QuantumTunnelingPassages - Creates interactive quantum tunneling passages between dimensions
 * 
 * Features:
 * 1. Quantum tunneling passages between dimensions
 * 2. Superposition effects during tunneling
 * 3. Phase shift visualization between dimensions
 * 4. Dimensional rift effects
 * 5. Interactive portals for gameplay
 */
class QuantumTunnelingPassages {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Store all tunneling passages
    this.tunnels = [];
    
    // Store portal pairs
    this.portalPairs = [];
    
    // Tunnel shader materials
    this.tunnelMaterial = null;
    
    // Portal shader materials
    this.portalMaterial = null;
    
    // Dimensional rift material
    this.riftMaterial = null;
    
    // Reference to CosmicQuantumEffects for integration
    this.cosmicEffects = null;
    
    // Tunnel gate textures for visualization
    this.tunnelGateTexture = null;
    
    // Settings
    this.settings = {
      particleDensity: 1000,
      maxTunnelLength: 50,
      tunnelRadius: 2.5,
      maxTunnelAge: 30, // seconds
      dimensionalRiftSize: 5,
      portalOscillationSpeed: 0.5,
      maxPortalTravelDistance: 100,
      nearPortalDistance: 3,
      portalActivationDistance: 1.5,
      superpositionInterval: 5, // seconds
      phaseShiftSpeed: 1.2,
    };
    
    // Create shader materials
    this._createMaterials();
  }
  
  /**
   * Set reference to CosmicQuantumEffects instance for integrated effects
   * @param {CosmicQuantumEffects} cosmicEffects
   */
  setCosmicEffects(cosmicEffects) {
    this.cosmicEffects = cosmicEffects;
  }
  
  /**
   * Create shader materials for tunnels and portals
   * @private
   */
  _createMaterials() {
    // Create tunnel gate texture
    this.tunnelGateTexture = this._createTunnelGateTexture();
    
    // Portal material - shows the destination dimension
    this.portalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDistortionFrequency: { value: 5.0 },
        uDistortionScale: { value: 0.05 },
        uColorShift: { value: 0.5 },
        uBorderWidth: { value: 0.1 },
        uBorderColor: { value: new Color(0x00ffff) },
        uRippleFrequency: { value: 2.0 },
        uRippleScale: { value: 0.1 },
        uRippleSpeed: { value: 1.0 },
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
        uniform float uTime;
        uniform float uDistortionFrequency;
        uniform float uDistortionScale;
        uniform float uColorShift;
        uniform float uBorderWidth;
        uniform vec3 uBorderColor;
        uniform float uRippleFrequency;
        uniform float uRippleScale;
        uniform float uRippleSpeed;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Simplex noise function for distortion
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
          // Distorted UVs for the portal effect
          vec2 distortedUv = vUv;
          
          // Distance from center for circular portal
          float dist = distance(distortedUv, vec2(0.5, 0.5));
          
          // Border effect
          float borderMask = smoothstep(0.5 - uBorderWidth, 0.5, dist);
          
          // Time-based ripple effect
          float ripple = sin((dist * uRippleFrequency - uTime * uRippleSpeed) * 3.1415) * 0.5 + 0.5;
          ripple *= smoothstep(0.0, 0.3, dist) * smoothstep(0.5, 0.4, dist);
          
          // Apply noise distortion to UVs
          float noise = snoise(distortedUv * uDistortionFrequency + vec2(uTime * 0.1, uTime * 0.2));
          distortedUv += noise * uDistortionScale * (1.0 - borderMask);
          
          // Create swirling effect
          float angle = atan(distortedUv.y - 0.5, distortedUv.x - 0.5);
          float swirl = sin(angle * 10.0 + uTime * 0.5) * 0.5 + 0.5;
          
          // Base portal colors - dimensional colors
          vec3 color1 = vec3(0.0, 0.5, 1.0); // Blue
          vec3 color2 = vec3(1.0, 0.3, 0.8); // Pink
          vec3 color3 = vec3(0.3, 0.8, 1.0); // Cyan
          
          // Mix colors based on position and time
          float mixFactor1 = sin(uTime * 0.2) * 0.5 + 0.5;
          float mixFactor2 = cos(uTime * 0.3) * 0.5 + 0.5;
          vec3 baseColor = mix(color1, color2, mixFactor1);
          baseColor = mix(baseColor, color3, mixFactor2);
          
          // Apply swirl and ripple effects
          baseColor = mix(baseColor, baseColor * 1.5, swirl * 0.3);
          baseColor += vec3(0.1, 0.3, 0.6) * ripple;
          
          // Increase intensity toward center
          float centerIntensity = 1.0 - dist * 2.0;
          centerIntensity = max(0.0, centerIntensity);
          baseColor *= 1.0 + centerIntensity;
          
          // Apply border
          vec3 finalColor = mix(baseColor, uBorderColor, borderMask);
          
          // Portal depth - darker center
          finalColor *= smoothstep(0.0, 0.2, dist);
          
          // Apply color shift based on time
          float shift = sin(uTime * 0.1) * 0.5 + 0.5;
          finalColor = mix(finalColor, 
                          vec3(finalColor.r * 0.5, finalColor.g * 1.3, finalColor.b * 1.1), 
                          shift * uColorShift);
          
          // Control opacity - more transparent toward center
          float alpha = mix(0.8, 1.0, dist * 2.0);
          alpha = min(1.0, alpha);
          
          // Inside portal is invisible (for seeing through to the other side)
          if (dist < 0.45) {
            alpha = 0.0;
          }
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    
    // Tunnel interior material - used for the tunnel passages
    this.tunnelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLength: { value: 10.0 },
        uRadius: { value: 2.0 },
        uColor1: { value: new Color(0x8800ff) },
        uColor2: { value: new Color(0x00ffff) },
        uPhaseShift: { value: 0.0 },
        uTravelProgress: { value: 0.0 },
        uNoiseIntensity: { value: 0.05 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uLength;
        uniform float uNoiseIntensity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vDist;
        
        // Simplex noise function
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec3 v) {
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
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate distortion based on noise
          float noise = snoise(vec3(position.x * 0.1, position.y * 0.1, position.z * 0.1 + uTime * 0.2));
          
          // Apply subtle distortion to vertex
          vec3 distortedPosition = position;
          vec3 normal = normalize(position - vec3(0.0, 0.0, position.z)); // Radial normal
          distortedPosition += normal * noise * uNoiseIntensity;
          
          // Apply a wave effect traveling down the tunnel
          float wave = sin(position.z * 0.5 - uTime * 2.0) * 0.02;
          distortedPosition += normal * wave;
          
          // Calculate normalized distance from center (for tunnel cross-section)
          vec2 xy = position.xy;
          vDist = length(xy) / uRadius;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uLength;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uPhaseShift;
        uniform float uTravelProgress;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vDist;
        
        void main() {
          // Normalized position along tunnel
          float zNorm = vPosition.z / uLength;
          
          // Create stripes effect flowing through the tunnel
          float stripes = sin(vPosition.z * 5.0 - uTime * 10.0) * 0.5 + 0.5;
          stripes *= 0.2; // Reduce intensity
          
          // Generate gradient between the two colors
          float t = zNorm + uPhaseShift;
          t = fract(t); // Wrap around from 0 to 1
          vec3 baseColor = mix(uColor1, uColor2, t);
          
          // Add stripes
          baseColor += stripes * vec3(0.2, 0.5, 0.5);
          
          // Add edge glow
          float edgeGlow = smoothstep(0.7, 1.0, vDist);
          baseColor += edgeGlow * vec3(0.5, 0.2, 0.5);
          
          // Add travel effect flash (flashlight) at the point of travel
          float travelFlash = smoothstep(0.1, 0.0, abs(zNorm - uTravelProgress));
          baseColor += travelFlash * vec3(1.0, 1.0, 1.0);
          
          // Add spinning light rays
          float angle = atan(vPosition.y, vPosition.x);
          float rays = sin(angle * 12.0 + uTime * 3.0) * 0.5 + 0.5;
          rays *= smoothstep(0.0, 0.1, vDist) * (1.0 - smoothstep(0.8, 1.0, vDist));
          rays *= 0.3; // Reduce intensity
          
          baseColor += rays * vec3(0.5, 0.8, 1.0);
          
          // Add pulsing glow
          float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
          baseColor *= 0.8 + pulse * 0.4;
          
          // Final color
          vec4 finalColor = vec4(baseColor, 1.0);
          
          gl_FragColor = finalColor;
        }
      `,
      side: THREE.BackSide, // Render on the inside of the tube
      transparent: true,
    });
    
    // Dimensional rift material - for visualizing tears in space-time
    this.riftMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
        uSize: { value: 5.0 },
        uColor1: { value: new Color(0xff00ff) },
        uColor2: { value: new Color(0x00ffff) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        
        varying vec3 vPosition;
        varying float vDistortion;
        
        // Simplex noise function
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec3 v) {
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
        
        void main() {
          vPosition = position;
          
          // Generate distortion based on position and time
          float noise1 = snoise(vec3(position.x * 0.1, position.y * 0.1, position.z * 0.1 + uTime * 0.3));
          float noise2 = snoise(vec3(position.x * 0.2 + uTime * 0.1, position.y * 0.2, position.z * 0.2));
          
          // Combine noise
          float noise = noise1 * 0.6 + noise2 * 0.4;
          vDistortion = noise;
          
          // Apply distortion to vertex
          vec3 distortedPosition = position;
          distortedPosition += normalize(position) * noise * uIntensity;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        
        varying vec3 vPosition;
        varying float vDistortion;
        
        void main() {
          // Create a distortion-based mask
          float mask = (vDistortion * 0.5 + 0.5);
          
          // Mix between the two colors based on distortion and time
          float t = mask * sin(uTime * 0.2) * 0.5 + 0.5;
          vec3 color = mix(uColor1, uColor2, t);
          
          // Add electric arcs
          float arc = smoothstep(0.2, 0.3, abs(sin(vPosition.x * 10.0 + vPosition.y * 10.0 + uTime * 5.0)));
          arc *= smoothstep(0.6, 0.0, mask); // Only show arcs in less distorted areas
          
          // Add glow
          float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
          
          // Final color with arcs and pulse
          vec3 finalColor = color + arc * vec3(0.5, 0.8, 1.0) * pulse;
          
          // Opacity based on distortion
          float alpha = smoothstep(0.0, 0.4, mask);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }
  
  /**
   * Create a texture for tunnel entrances
   * @private
   */
  _createTunnelGateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create radial gradient for the gate
    const outerRadius = canvas.width / 2;
    const innerRadius = canvas.width / 2 * 0.7;
    
    const gradient = context.createRadialGradient(
      centerX, centerY, innerRadius,
      centerX, centerY, outerRadius
    );
    
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
    gradient.addColorStop(0.5, 'rgba(128, 0, 255, 0.5)');
    gradient.addColorStop(0.8, 'rgba(255, 0, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
    
    // Draw gate
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      if (dist < outerRadius && dist > innerRadius) {
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.5 + 0.5;
        
        context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        context.fillRect(x, y, size, size);
      }
    }
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Create a quantum tunneling passage between two points/dimensions
   * @param {Vector3} startPosition - Start position of the tunnel
   * @param {Vector3} endPosition - End position of the tunnel
   * @param {Object} options - Configuration options
   * @returns {Object} The tunnel object
   */
  createTunnel(startPosition, endPosition, options = {}) {
    const defaults = {
      radius: this.settings.tunnelRadius,
      segments: 32,
      radialSegments: 16,
      color1: new Color(0x8800ff),
      color2: new Color(0x00ffff),
      lifespan: 30, // seconds
      interactive: true
    };
    
    const config = { ...defaults, ...options };
    
    // Calculate direction and length
    const direction = new Vector3().subVectors(endPosition, startPosition);
    const tunnelLength = Math.min(direction.length(), this.settings.maxTunnelLength);
    direction.normalize();
    
    // Create tunnel group
    const tunnelGroup = new THREE.Group();
    tunnelGroup.position.copy(startPosition);
    
    // Align rotation to direction vector
    const quat = new Quaternion();
    quat.setFromUnitVectors(new Vector3(0, 0, 1), direction);
    tunnelGroup.quaternion.copy(quat);
    
    // Create tunnel geometry - a tube
    const tunnelGeometry = new THREE.CylinderGeometry(
      config.radius, config.radius, 
      tunnelLength, 
      config.radialSegments, 
      config.segments, 
      true // Open-ended
    );
    
    // Rotate the cylinder geometry to align with z-axis
    tunnelGeometry.rotateX(Math.PI / 2);
    
    // Move the geometry so its base is at the origin
    tunnelGeometry.translate(0, 0, tunnelLength / 2);
    
    // Create tunnel material (clone the shared shader material)
    const tunnelMaterialInstance = this.tunnelMaterial.clone();
    tunnelMaterialInstance.uniforms.uLength.value = tunnelLength;
    tunnelMaterialInstance.uniforms.uRadius.value = config.radius;
    tunnelMaterialInstance.uniforms.uColor1.value = config.color1;
    tunnelMaterialInstance.uniforms.uColor2.value = config.color2;
    
    // Create tunnel mesh
    const tunnelMesh = new THREE.Mesh(tunnelGeometry, tunnelMaterialInstance);
    tunnelGroup.add(tunnelMesh);
    
    // Create entrance and exit portals
    const entrancePortal = this._createPortal(config.radius, config.color1);
    entrancePortal.position.set(0, 0, 0);
    tunnelGroup.add(entrancePortal);
    
    const exitPortal = this._createPortal(config.radius, config.color2);
    exitPortal.position.set(0, 0, tunnelLength);
    tunnelGroup.add(exitPortal);
    
    // Create particle system inside the tunnel
    const particleSystem = this._createTunnelParticles(
      tunnelLength, 
      config.radius, 
      config.color1, 
      config.color2
    );
    tunnelGroup.add(particleSystem);
    
    // Store reference with additional data
    tunnelGroup.userData = {
      startPosition: startPosition.clone(),
      endPosition: endPosition.clone(),
      direction: direction.clone(),
      length: tunnelLength,
      radius: config.radius,
      config: config,
      time: 0,
      phaseShift: 0,
      travelProgress: -1, // -1 means no travel in progress
      material: tunnelMaterialInstance,
      particleSystem: particleSystem,
      entrancePortal: entrancePortal,
      exitPortal: exitPortal,
      creationTime: Date.now() / 1000,
      lastSuperpositionTime: 0,
      isInSuperposition: false,
      superpositionEffects: [],
      travelingObjects: []
    };
    
    // Add to scene
    this.scene.add(tunnelGroup);
    
    // Store in array
    this.tunnels.push(tunnelGroup);
    
    // Create dimensional rifts at both ends of the tunnel if we have CosmicQuantumEffects
    if (this.cosmicEffects) {
      // Create rift at start position
      const entranceRift = this._createDimensionalRift(startPosition, options);
      tunnelGroup.userData.entranceRift = entranceRift;
      
      // Create rift at end position
      const exitRift = this._createDimensionalRift(endPosition, {
        ...options,
        color: config.color2
      });
      tunnelGroup.userData.exitRift = exitRift;
    }
    
    return tunnelGroup;
  }
  
  /**
   * Create a portal for tunnel entrances and exits
   * @param {number} radius - Portal radius
   * @param {Color} color - Portal color
   * @returns {Object} Portal mesh
   * @private
   */
  _createPortal(radius, color) {
    // Create disc geometry for the portal
    const portalGeometry = new THREE.CircleGeometry(radius * 1.2, 32);
    
    // Clone the shared portal material
    const portalMaterialInstance = this.portalMaterial.clone();
    portalMaterialInstance.uniforms.uBorderColor.value = color;
    
    // Create portal mesh
    const portal = new THREE.Mesh(portalGeometry, portalMaterialInstance);
    
    // Add glow effect
    const glowGeometry = new THREE.RingGeometry(radius * 0.9, radius * 1.5, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    glowRing.position.z = -0.01; // Slightly behind the portal
    
    // Group portal elements
    const portalGroup = new THREE.Group();
    portalGroup.add(portal);
    portalGroup.add(glowRing);
    
    // Store reference
    portalGroup.userData = {
      radius: radius,
      color: color,
      material: portalMaterialInstance,
      glowRing: glowRing
    };
    
    return portalGroup;
  }
  
  /**
   * Create particles inside the tunnel
   * @param {number} tunnelLength - Length of the tunnel
   * @param {number} radius - Radius of the tunnel
   * @param {Color} color1 - Start color
   * @param {Color} color2 - End color
   * @returns {Object} Particle system
   * @private
   */
  _createTunnelParticles(tunnelLength, radius, color1, color2) {
    // Determine particle count based on density and tunnel size
    const particleCount = Math.min(
      this.settings.particleDensity,
      Math.floor(tunnelLength * radius * 10)
    );
    
    // Create particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    
    // Create arrays for particle attributes
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3); // For animation
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      // Random position within the tunnel
      const z = Math.random() * tunnelLength;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.8; // Keep particles within 80% of radius
      
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = z;
      
      // Color gradient along tunnel
      const t = z / tunnelLength;
      const particleColor = new Color().lerpColors(color1, color2, t);
      
      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;
      
      // Random size
      sizes[i] = 0.05 + Math.random() * 0.15;
      
      // Random velocity (particles will flow along the tunnel)
      velocities[i * 3] = (Math.random() - 0.5) * 0.02; // Small random x movement
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02; // Small random y movement
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // Flow toward or away from the center
    }
    
    // Add attributes to geometry
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this._createParticleTexture()
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.frustumCulled = false;
    
    // Store velocities in userData
    particleSystem.userData = {
      velocities: velocities,
      tunnelLength: tunnelLength,
      radius: radius * 0.8,
      color1: color1,
      color2: color2
    };
    
    return particleSystem;
  }
  
  /**
   * Create a dimensional rift effect
   * @param {Vector3} position - Position of the rift
   * @param {Object} options - Configuration options
   * @returns {Object} Rift object
   * @private
   */
  _createDimensionalRift(position, options = {}) {
    const defaults = {
      size: this.settings.dimensionalRiftSize,
      color: new Color(0xff00ff)
    };
    
    const config = { ...defaults, ...options };
    
    // Create rift geometry (distorted sphere)
    const riftGeometry = new THREE.IcosahedronGeometry(config.size, 3);
    
    // Clone the shared rift material
    const riftMaterialInstance = this.riftMaterial.clone();
    riftMaterialInstance.uniforms.uSize.value = config.size;
    riftMaterialInstance.uniforms.uColor1.value = config.color;
    riftMaterialInstance.uniforms.uColor2.value = new Color().setHSL(
      (config.color.getHSL({}).h + 0.5) % 1.0, // Complementary hue
      config.color.getHSL({}).s,
      config.color.getHSL({}).l
    );
    
    // Create rift mesh
    const riftMesh = new THREE.Mesh(riftGeometry, riftMaterialInstance);
    riftMesh.position.copy(position);
    
    // Add to scene
    this.scene.add(riftMesh);
    
    // Store reference
    riftMesh.userData = {
      config: config,
      material: riftMaterialInstance,
      time: 0
    };
    
    return riftMesh;
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
   * Create a portal pair that allows travel between locations
   * @param {Vector3} position1 - Position of the first portal
   * @param {Vector3} position2 - Position of the second portal
   * @param {Object} options - Configuration options
   * @returns {Object} Portal pair object
   */
  createPortalPair(position1, position2, options = {}) {
    const defaults = {
      radius: 2.0,
      color1: new Color(0x8800ff),
      color2: new Color(0x00ffff),
      rotationSpeed: 0.5,
      interactiveDistance: 3.0
    };
    
    const config = { ...defaults, ...options };
    
    // Create portal meshes
    const portal1 = this._createPortal(config.radius, config.color1);
    const portal2 = this._createPortal(config.radius, config.color2);
    
    // Position portals
    portal1.position.copy(position1);
    portal2.position.copy(position2);
    
    // Determine orientation (facing away from each other)
    const direction = new Vector3().subVectors(position2, position1).normalize();
    
    const quaternion1 = new Quaternion().setFromUnitVectors(
      new Vector3(0, 0, 1), direction
    );
    portal1.quaternion.copy(quaternion1);
    
    const quaternion2 = new Quaternion().setFromUnitVectors(
      new Vector3(0, 0, 1), direction.clone().negate()
    );
    portal2.quaternion.copy(quaternion2);
    
    // Store reference
    const portalPair = {
      portal1: portal1,
      portal2: portal2,
      position1: position1.clone(),
      position2: position2.clone(),
      direction1: direction.clone(),
      direction2: direction.clone().negate(),
      config: config,
      time: 0,
      active: true,
      travelingObjects: []
    };
    
    // Add to scene
    this.scene.add(portal1);
    this.scene.add(portal2);
    
    // Store in array
    this.portalPairs.push(portalPair);
    
    return portalPair;
  }
  
  /**
   * Start traveling through a tunnel
   * @param {Object} tunnel - The tunnel to travel through
   * @param {Object} traveler - Object that will travel (usually the player or camera)
   */
  startTunnelTravel(tunnel, traveler) {
    // Only proceed if there's no travel in progress
    if (tunnel.userData.travelProgress >= 0 && tunnel.userData.travelProgress < 1) {
      return false;
    }
    
    // Store the traveler
    tunnel.userData.travelingObjects.push({
      object: traveler,
      startPosition: traveler.position.clone(),
      progress: 0
    });
    
    // Set travel in progress
    tunnel.userData.travelProgress = 0;
    
    return true;
  }
  
  /**
   * Create a superposition effect where the tunnel exists in multiple states
   * @param {Object} tunnel - The tunnel to put in superposition
   */
  createSuperposition(tunnel) {
    // Only proceed if not already in superposition
    if (tunnel.userData.isInSuperposition) {
      return false;
    }
    
    // Mark as in superposition
    tunnel.userData.isInSuperposition = true;
    tunnel.userData.lastSuperpositionTime = tunnel.userData.time;
    
    // Create ghost tunnels as overlay effects
    const ghostCount = 3; // Number of ghost tunnels
    const ghostTunnels = [];
    
    for (let i = 0; i < ghostCount; i++) {
      // Create a copy of the main tunnel geometry
      const ghostGeometry = tunnel.children[0].geometry.clone(); // Copy from first child (tunnel mesh)
      
      // Create ghost material
      const ghostMaterial = new THREE.MeshBasicMaterial({
        color: new Color().lerpColors(
          tunnel.userData.config.color1,
          tunnel.userData.config.color2,
          i / (ghostCount - 1)
        ),
        transparent: true,
        opacity: 0.3,
        wireframe: i % 2 === 0, // Alternate between solid and wireframe
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      // Create ghost mesh
      const ghostTunnel = new THREE.Mesh(ghostGeometry, ghostMaterial);
      
      // Position initially at same position as original
      ghostTunnel.position.set(0, 0, 0);
      ghostTunnel.rotation.set(0, 0, 0);
      
      // Add to tunnel group
      tunnel.add(ghostTunnel);
      
      // Store reference
      ghostTunnels.push({
        mesh: ghostTunnel,
        offset: new Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        rotationOffset: new Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        pulseFactor: 0.5 + Math.random() * 0.5
      });
    }
    
    // Store ghosts
    tunnel.userData.superpositionEffects = ghostTunnels;
    
    // If we have cosmicEffects, also add superposition particle effects
    if (this.cosmicEffects) {
      // This would integrate with the quantum superposition effects
      // Implementation depends on the CosmicQuantumEffects API
    }
    
    return true;
  }
  
  /**
   * End superposition effect, collapsing to a single state
   * @param {Object} tunnel - The tunnel to collapse
   */
  collapseSuperposition(tunnel) {
    // Only proceed if in superposition
    if (!tunnel.userData.isInSuperposition) {
      return false;
    }
    
    // Remove ghost tunnels
    for (const ghost of tunnel.userData.superpositionEffects) {
      tunnel.remove(ghost.mesh);
      ghost.mesh.geometry.dispose();
      ghost.mesh.material.dispose();
    }
    
    // Mark as no longer in superposition
    tunnel.userData.isInSuperposition = false;
    tunnel.userData.superpositionEffects = [];
    
    return true;
  }
  
  /**
   * Update a single tunnel
   * @param {Object} tunnel - The tunnel to update
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position
   * @private
   */
  _updateTunnel(tunnel, deltaTime, playerPosition) {
    // Update time
    tunnel.userData.time += deltaTime;
    
    // Check tunnel age
    if (tunnel.userData.config.lifespan > 0) {
      const age = (tunnel.userData.time + tunnel.userData.creationTime) - (Date.now() / 1000);
      if (age > tunnel.userData.config.lifespan) {
        // Handle tunnel expiration
        this.removeTunnel(tunnel);
        return;
      }
    }
    
    // Update phase shift
    tunnel.userData.phaseShift += deltaTime * this.settings.phaseShiftSpeed;
    tunnel.userData.material.uniforms.uPhaseShift.value = tunnel.userData.phaseShift;
    tunnel.userData.material.uniforms.uTime.value = tunnel.userData.time;
    
    // Update portal materials
    tunnel.userData.entrancePortal.userData.material.uniforms.uTime.value = tunnel.userData.time;
    tunnel.userData.exitPortal.userData.material.uniforms.uTime.value = tunnel.userData.time;
    
    // Rotate portals slightly
    tunnel.userData.entrancePortal.rotation.z += deltaTime * 0.2;
    tunnel.userData.exitPortal.rotation.z -= deltaTime * 0.2;
    
    // Update tunnel particles
    this._updateTunnelParticles(tunnel.userData.particleSystem, deltaTime, tunnel.userData.travelProgress);
    
    // Update dimensional rifts if they exist
    if (tunnel.userData.entranceRift) {
      tunnel.userData.entranceRift.userData.time += deltaTime;
      tunnel.userData.entranceRift.userData.material.uniforms.uTime.value = tunnel.userData.entranceRift.userData.time;
      
      // Pulse the rift intensity
      const pulse = Math.sin(tunnel.userData.entranceRift.userData.time * 2) * 0.5 + 0.5;
      tunnel.userData.entranceRift.userData.material.uniforms.uIntensity.value = 0.5 + pulse * 0.5;
    }
    
    if (tunnel.userData.exitRift) {
      tunnel.userData.exitRift.userData.time += deltaTime;
      tunnel.userData.exitRift.userData.material.uniforms.uTime.value = tunnel.userData.exitRift.userData.time;
      
      // Pulse the rift intensity (with slight phase offset)
      const pulse = Math.sin(tunnel.userData.exitRift.userData.time * 2 + 1) * 0.5 + 0.5;
      tunnel.userData.exitRift.userData.material.uniforms.uIntensity.value = 0.5 + pulse * 0.5;
    }
    
    // Update superposition effects if active
    if (tunnel.userData.isInSuperposition) {
      this._updateSuperposition(tunnel, deltaTime);
      
      // Check if we should collapse the superposition
      const superpositionDuration = tunnel.userData.time - tunnel.userData.lastSuperpositionTime;
      if (superpositionDuration > 5) { // Collapse after 5 seconds
        this.collapseSuperposition(tunnel);
      }
    } else {
      // Random chance to create superposition
      const timeSinceLastSuperposition = tunnel.userData.time - tunnel.userData.lastSuperpositionTime;
      if (timeSinceLastSuperposition > this.settings.superpositionInterval && Math.random() < 0.02) {
        this.createSuperposition(tunnel);
      }
    }
    
    // Update travel progress if travel is in progress
    if (tunnel.userData.travelProgress >= 0) {
      tunnel.userData.travelProgress += deltaTime * 0.5; // Travel speed
      tunnel.userData.material.uniforms.uTravelProgress.value = tunnel.userData.travelProgress;
      
      // Update traveling objects
      for (let i = 0; i < tunnel.userData.travelingObjects.length; i++) {
        const traveler = tunnel.userData.travelingObjects[i];
        traveler.progress = tunnel.userData.travelProgress;
        
        // Calculate new position
        if (traveler.progress < 1) {
          // Start position in world space
          const startPos = tunnel.userData.startPosition.clone();
          
          // End position in world space
          const endPos = tunnel.userData.endPosition.clone();
          
          // Interpolate position along the tunnel
          const newPos = new Vector3().lerpVectors(startPos, endPos, traveler.progress);
          
          // Update traveler position
          traveler.object.position.copy(newPos);
        } else {
          // Travel complete - remove from traveling objects
          traveler.object.position.copy(tunnel.userData.endPosition);
          tunnel.userData.travelingObjects.splice(i, 1);
          i--;
        }
      }
      
      // If travel complete and no more travelers, reset travel progress
      if (tunnel.userData.travelProgress >= 1 && tunnel.userData.travelingObjects.length === 0) {
        tunnel.userData.travelProgress = -1;
        tunnel.userData.material.uniforms.uTravelProgress.value = -1;
      }
    }
    
    // Check for player proximity if interactive
    if (tunnel.userData.config.interactive && playerPosition) {
      // Check distance to entrance portal
      const distToEntrance = playerPosition.distanceTo(tunnel.userData.startPosition);
      
      // If player is very close to entrance, start tunnel travel
      if (distToEntrance < this.settings.portalActivationDistance && tunnel.userData.travelProgress < 0) {
        this.startTunnelTravel(tunnel, { position: playerPosition });
      }
    }
  }
  
  /**
   * Update a single portal pair
   * @param {Object} portalPair - The portal pair to update
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position
   * @private
   */
  _updatePortalPair(portalPair, deltaTime, playerPosition) {
    // Update time
    portalPair.time += deltaTime;
    
    // Update portal materials
    portalPair.portal1.userData.material.uniforms.uTime.value = portalPair.time;
    portalPair.portal2.userData.material.uniforms.uTime.value = portalPair.time;
    
    // Rotate portals
    portalPair.portal1.rotation.z += deltaTime * portalPair.config.rotationSpeed;
    portalPair.portal2.rotation.z -= deltaTime * portalPair.config.rotationSpeed;
    
    // Check for player proximity if playerPosition provided
    if (playerPosition && portalPair.active) {
      // Check distance to portal 1
      const distToPortal1 = playerPosition.distanceTo(portalPair.position1);
      
      // If player is very close to portal 1, teleport to portal 2
      if (distToPortal1 < portalPair.config.radius * 0.8) {
        // Calculate player position relative to portal 1
        const relativePos = new Vector3().subVectors(playerPosition, portalPair.position1);
        
        // Transform relative position to portal 2's orientation
        const matrix1 = new Matrix4().makeRotationFromQuaternion(portalPair.portal1.quaternion);
        const matrix2 = new Matrix4().makeRotationFromQuaternion(portalPair.portal2.quaternion);
        const invMatrix1 = new Matrix4().copy(matrix1).invert();
        
        // Remove portal 1's rotation
        relativePos.applyMatrix4(invMatrix1);
        
        // Flip direction for exit (player should come out the other side)
        relativePos.z = -relativePos.z;
        
        // Apply portal 2's rotation
        relativePos.applyMatrix4(matrix2);
        
        // Set new player position
        const newPosition = new Vector3().addVectors(portalPair.position2, relativePos);
        
        // Store in traveling objects to update on next frame
        portalPair.travelingObjects.push({
          object: { position: playerPosition },
          targetPosition: newPosition,
          progress: 0
        });
      }
      
      // Check distance to portal 2 (same logic as above but swapped)
      const distToPortal2 = playerPosition.distanceTo(portalPair.position2);
      
      if (distToPortal2 < portalPair.config.radius * 0.8) {
        const relativePos = new Vector3().subVectors(playerPosition, portalPair.position2);
        
        const matrix1 = new Matrix4().makeRotationFromQuaternion(portalPair.portal2.quaternion);
        const matrix2 = new Matrix4().makeRotationFromQuaternion(portalPair.portal1.quaternion);
        const invMatrix1 = new Matrix4().copy(matrix1).invert();
        
        relativePos.applyMatrix4(invMatrix1);
        relativePos.z = -relativePos.z;
        relativePos.applyMatrix4(matrix2);
        
        const newPosition = new Vector3().addVectors(portalPair.position1, relativePos);
        
        portalPair.travelingObjects.push({
          object: { position: playerPosition },
          targetPosition: newPosition,
          progress: 0
        });
      }
    }
    
    // Update traveling objects
    for (let i = 0; i < portalPair.travelingObjects.length; i++) {
      const traveler = portalPair.travelingObjects[i];
      traveler.progress += deltaTime * 10; // Fast teleport
      
      if (traveler.progress >= 1) {
        // Teleport complete
        traveler.object.position.copy(traveler.targetPosition);
        portalPair.travelingObjects.splice(i, 1);
        i--;
      } else {
        // During teleport - fade out/in effect
        // This could be handled by a visual effect if needed
      }
    }
  }
  
  /**
   * Update tunnel particles
   * @param {Object} particleSystem - The particle system to update
   * @param {number} deltaTime - Time since last frame
   * @param {number} travelProgress - Current travel progress (-1 if no travel)
   * @private
   */
  _updateTunnelParticles(particleSystem, deltaTime, travelProgress) {
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    const velocities = particleSystem.userData.velocities;
    const tunnelLength = particleSystem.userData.tunnelLength;
    const radius = particleSystem.userData.radius;
    
    // Travel effect increases particle velocity
    const travelSpeedup = travelProgress >= 0 ? 5.0 : 1.0;
    
    // Update particles
    for (let i = 0; i < positions.length / 3; i++) {
      // Update position based on velocity
      positions[i * 3] += velocities[i * 3] * deltaTime * travelSpeedup;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * travelSpeedup;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * travelSpeedup;
      
      // Keep within tunnel bounds
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const r = Math.sqrt(x*x + y*y);
      
      if (r > radius) {
        const scale = radius / r;
        positions[i * 3] *= scale;
        positions[i * 3 + 1] *= scale;
        
        // Bounce velocity inward
        velocities[i * 3] *= -0.5;
        velocities[i * 3 + 1] *= -0.5;
      }
      
      // Keep within tunnel length
      if (positions[i * 3 + 2] < 0) {
        positions[i * 3 + 2] = tunnelLength;
        // Randomize x,y position
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = Math.sin(angle) * r;
      } else if (positions[i * 3 + 2] > tunnelLength) {
        positions[i * 3 + 2] = 0;
        // Randomize x,y position
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = Math.sin(angle) * r;
      }
      
      // Update color based on position in tunnel
      const t = positions[i * 3 + 2] / tunnelLength;
      const color = new Color().lerpColors(
        particleSystem.userData.color1,
        particleSystem.userData.color2,
        t
      );
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Update size - particles near travel wave are larger
      if (travelProgress >= 0) {
        const travelZ = travelProgress * tunnelLength;
        const distFromTravel = Math.abs(positions[i * 3 + 2] - travelZ);
        const travelEffect = Math.max(0, 1 - distFromTravel / (tunnelLength * 0.1));
        sizes[i] = 0.05 + Math.random() * 0.15 + travelEffect * 0.2;
      } else {
        sizes[i] = 0.05 + Math.random() * 0.15;
      }
    }
    
    // Mark attributes as needing update
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
  }
  
  /**
   * Update superposition effects for a tunnel
   * @param {Object} tunnel - The tunnel with superposition
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateSuperposition(tunnel, deltaTime) {
    for (const ghost of tunnel.userData.superpositionEffects) {
      // Calculate oscillation based on time
      const time = tunnel.userData.time;
      const offset = ghost.offset;
      const rotOffset = ghost.rotationOffset;
      
      // Apply oscillating offset
      ghost.mesh.position.x = Math.sin(time * ghost.pulseFactor) * offset.x;
      ghost.mesh.position.y = Math.cos(time * ghost.pulseFactor * 1.3) * offset.y;
      ghost.mesh.position.z = Math.sin(time * ghost.pulseFactor * 0.7) * offset.z;
      
      // Apply oscillating rotation
      ghost.mesh.rotation.x = Math.sin(time * ghost.pulseFactor * 0.5) * rotOffset.x;
      ghost.mesh.rotation.y = Math.cos(time * ghost.pulseFactor * 0.7) * rotOffset.y;
      ghost.mesh.rotation.z = Math.sin(time * ghost.pulseFactor * 0.9) * rotOffset.z;
      
      // Pulse opacity
      const opacity = 0.2 + Math.sin(time * ghost.pulseFactor * 2) * 0.1;
      ghost.mesh.material.opacity = opacity;
    }
  }
  
  /**
   * Remove a tunnel and clean up its resources
   * @param {Object} tunnel - The tunnel to remove
   */
  removeTunnel(tunnel) {
    // Find index in tunnels array
    const index = this.tunnels.indexOf(tunnel);
    if (index === -1) return;
    
    // Remove from array
    this.tunnels.splice(index, 1);
    
    // Dispose of resources
    tunnel.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    // Remove from scene
    this.scene.remove(tunnel);
    
    // Remove dimensional rifts if they exist
    if (tunnel.userData.entranceRift) {
      tunnel.userData.entranceRift.geometry.dispose();
      tunnel.userData.entranceRift.material.dispose();
      this.scene.remove(tunnel.userData.entranceRift);
    }
    
    if (tunnel.userData.exitRift) {
      tunnel.userData.exitRift.geometry.dispose();
      tunnel.userData.exitRift.material.dispose();
      this.scene.remove(tunnel.userData.exitRift);
    }
  }
  
  /**
   * Update all quantum tunneling passages
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position (optional)
   */
  update(deltaTime, playerPosition) {
    // Update all tunnels
    for (let i = this.tunnels.length - 1; i >= 0; i--) {
      this._updateTunnel(this.tunnels[i], deltaTime, playerPosition);
    }
    
    // Update all portal pairs
    for (let i = this.portalPairs.length - 1; i >= 0; i--) {
      this._updatePortalPair(this.portalPairs[i], deltaTime, playerPosition);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove all tunnels
    for (const tunnel of this.tunnels) {
      this.removeTunnel(tunnel);
    }
    
    // Remove all portal pairs
    for (const pair of this.portalPairs) {
      // Dispose of portal 1
      pair.portal1.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.scene.remove(pair.portal1);
      
      // Dispose of portal 2
      pair.portal2.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.scene.remove(pair.portal2);
    }
    
    // Clear arrays
    this.tunnels = [];
    this.portalPairs = [];
    
    // Dispose of shared materials
    if (this.tunnelMaterial) this.tunnelMaterial.dispose();
    if (this.portalMaterial) this.portalMaterial.dispose();
    if (this.riftMaterial) this.riftMaterial.dispose();
    
    // Dispose of textures
    if (this.tunnelGateTexture) this.tunnelGateTexture.dispose();
  }
}

export default QuantumTunnelingPassages;