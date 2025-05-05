import * as THREE from 'three';

class CharacterAppearance {
  constructor(scene, characterModel) {
    // Core components
    this.scene = scene;
    this.characterModel = characterModel; // The root mesh/group of the character
    
    // Character parts - these will be set when a model is loaded
    this.parts = {
      head: null,
      body: null,
      leftArm: null,
      rightArm: null,
      leftLeg: null,
      rightLeg: null,
      helmet: null,
      backpack: null,
    };
    
    // Track original materials to allow reverting changes
    this.originalMaterials = new Map();
    
    // Base color schemes
    this.colorSchemes = {
      default: {
        primary: new THREE.Color(0x0044aa),
        secondary: new THREE.Color(0x00ccff),
        accent: new THREE.Color(0xff00ff),
        emissive: new THREE.Color(0x00ffff),
        metallic: 0.7,
        roughness: 0.3,
      },
      midnight: {
        primary: new THREE.Color(0x000033),
        secondary: new THREE.Color(0x0000aa),
        accent: new THREE.Color(0x8800ff),
        emissive: new THREE.Color(0x8800ff),
        metallic: 0.9,
        roughness: 0.2,
      },
      quantum: {
        primary: new THREE.Color(0x330044),
        secondary: new THREE.Color(0x8800ff),
        accent: new THREE.Color(0xff00ff),
        emissive: new THREE.Color(0xff00ff),
        metallic: 0.8,
        roughness: 0.2,
      },
      plasma: {
        primary: new THREE.Color(0x004433),
        secondary: new THREE.Color(0x00ffaa),
        accent: new THREE.Color(0xffff00),
        emissive: new THREE.Color(0x00ffaa),
        metallic: 0.6,
        roughness: 0.4,
      },
      molten: {
        primary: new THREE.Color(0x330000),
        secondary: new THREE.Color(0xaa0000),
        accent: new THREE.Color(0xff8800),
        emissive: new THREE.Color(0xff8800),
        metallic: 0.5,
        roughness: 0.5,
      },
    };
    
    // Character accessories
    this.accessories = {
      helmetTypes: [
        'standard',
        'enhanced',
        'advanced',
        'prototype',
        'none',
      ],
      backpackTypes: [
        'standard',
        'utility',
        'advanced',
        'quantum',
        'none',
      ],
      shoulderPads: false,
      kneePads: false,
      gloves: true,
      boots: true,
    };
    
    // Customization options
    this.currentOptions = {
      colorScheme: 'default',
      helmet: 'standard',
      backpack: 'standard',
      shoulderPads: false,
      kneePads: false,
      gloves: true,
      boots: true,
      glowIntensity: 1.0,
      pulseSpeed: 1.0,
    };
    
    // Effects
    this.effects = {
      glowIntensity: 1.0,
      pulseSpeed: 1.0,
      pulseTime: 0,
    };
    
    // Initialize standard textures
    this.textures = this._initializeTextures();
    
    // Placeholder for actual loaded model
    this.modelLoaded = false;
  }
  
  // Initialize standard textures
  _initializeTextures() {
    // Create normal map for suit
    const normalMap = this._createNormalMap();
    
    // Create roughness map
    const roughnessMap = this._createRoughnessMap();
    
    // Create emissive map for glowing circuit patterns
    const emissiveMap = this._createEmissiveMap();
    
    return {
      normalMap,
      roughnessMap,
      emissiveMap,
    };
  }
  
  // Create a procedural normal map
  _createNormalMap() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    
    // Fill with base color
    ctx.fillStyle = '#8080ff'; // Neutral normal map base
    ctx.fillRect(0, 0, size, size);
    
    // Add grid pattern
    ctx.strokeStyle = '#6060ff';
    ctx.lineWidth = 2;
    
    // Horizontal lines
    for (let y = 0; y < size; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < size; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    
    // Add some noise for texture detail
    for (let i = 0; i < 5000; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const radius = Math.random() * 2 + 1;
      
      ctx.fillStyle = Math.random() > 0.5 ? '#7070ff' : '#9090ff';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }
  
  // Create a procedural roughness map
  _createRoughnessMap() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    
    // Fill with base roughness
    ctx.fillStyle = '#808080'; // Medium roughness
    ctx.fillRect(0, 0, size, size);
    
    // Add smoother areas (darker in roughness map)
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const radius = Math.random() * 40 + 20;
      
      // Create gradient for smooth transition
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#303030'); // Smoother (less rough)
      gradient.addColorStop(1, '#808080'); // Back to base roughness
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add rougher areas (lighter in roughness map)
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const radius = Math.random() * 20 + 10;
      
      // Create gradient for smooth transition
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#a0a0a0'); // Rougher
      gradient.addColorStop(1, '#808080'); // Back to base roughness
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add grain
    for (let i = 0; i < 10000; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const value = Math.floor(Math.random() * 40 + 80); // 80-120 range
      
      ctx.fillStyle = `rgb(${value},${value},${value})`;
      ctx.fillRect(x, y, 1, 1);
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }
  
  // Create a procedural emissive map for glowing circuit patterns
  _createEmissiveMap() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    
    // Fill with black (no emission)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    // Draw circuit pattern
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Main grid lines
    const cellSize = 64;
    ctx.beginPath();
    for (let x = 0; x < size; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
    }
    for (let y = 0; y < size; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
    }
    ctx.stroke();
    
    // Add circuit connections
    ctx.lineWidth = 3;
    
    for (let y = 0; y < size; y += cellSize) {
      for (let x = 0; x < size; x += cellSize) {
        if (Math.random() > 0.3) continue; // Skip some cells
        
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        
        // Draw various patterns
        const pattern = Math.floor(Math.random() * 5);
        
        ctx.beginPath();
        
        switch (pattern) {
          case 0: // Cross
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x, y + cellSize);
            break;
          case 1: // Circle
            ctx.arc(centerX, centerY, cellSize / 3, 0, Math.PI * 2);
            break;
          case 2: // Square
            ctx.rect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
            break;
          case 3: // Diagonal line
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            break;
          case 4: // Arc
            ctx.arc(centerX, centerY, cellSize / 3, 0, Math.PI);
            break;
        }
        
        ctx.stroke();
      }
    }
    
    // Add glow nodes
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const radius = Math.random() * 6 + 4;
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow
      const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius * 3);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }
  
  // Load a character model
  async loadModel(modelPath) {
    // In a real application, you would load the model from a file
    // For this example, we'll create a placeholder character model
    
    // Create a simple humanoid figure
    const group = new THREE.Group();
    
    // Material for the character
    const material = new THREE.MeshStandardMaterial({
      color: this.colorSchemes.default.primary,
      normalMap: this.textures.normalMap,
      roughnessMap: this.textures.roughnessMap,
      emissiveMap: this.textures.emissiveMap,
      emissive: this.colorSchemes.default.emissive,
      emissiveIntensity: 0.5,
      metalness: this.colorSchemes.default.metallic,
      roughness: this.colorSchemes.default.roughness,
    });
    
    // Create body parts
    
    // Body/Torso
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.6, 4, 8);
    const body = new THREE.Mesh(bodyGeometry, material.clone());
    body.position.y = 1.2;
    this.parts.body = body;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeometry, material.clone());
    head.position.y = 1.9;
    this.parts.head = head;
    group.add(head);
    
    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.08, 0.7, 4, 8);
    
    const leftArm = new THREE.Mesh(armGeometry, material.clone());
    leftArm.position.set(-0.4, 1.2, 0);
    leftArm.rotation.z = -0.2;
    this.parts.leftArm = leftArm;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, material.clone());
    rightArm.position.set(0.4, 1.2, 0);
    rightArm.rotation.z = 0.2;
    this.parts.rightArm = rightArm;
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.1, 0.9, 4, 8);
    
    const leftLeg = new THREE.Mesh(legGeometry, material.clone());
    leftLeg.position.set(-0.15, 0.5, 0);
    this.parts.leftLeg = leftLeg;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, material.clone());
    rightLeg.position.set(0.15, 0.5, 0);
    this.parts.rightLeg = rightLeg;
    group.add(rightLeg);
    
    // Add helmet
    this._createHelmet('standard', group);
    
    // Add backpack
    this._createBackpack('standard', group);
    
    // Store original materials
    for (const [partName, part] of Object.entries(this.parts)) {
      if (part && part.material) {
        this.originalMaterials.set(part, part.material.clone());
      }
    }
    
    // Set the loaded model
    this.characterModel = group;
    this.modelLoaded = true;
    
    return group;
  }
  
  // Create a helmet based on the type
  _createHelmet(type, parentGroup) {
    // Remove existing helmet if there is one
    if (this.parts.helmet && this.parts.helmet.parent) {
      this.parts.helmet.parent.remove(this.parts.helmet);
      this.parts.helmet = null;
    }
    
    // If type is 'none', don't create a helmet
    if (type === 'none') return;
    
    // Get the current color scheme
    const colorScheme = this.colorSchemes[this.currentOptions.colorScheme];
    
    // Create base material for helmet
    const material = new THREE.MeshStandardMaterial({
      color: colorScheme.secondary,
      normalMap: this.textures.normalMap,
      roughnessMap: this.textures.roughnessMap,
      emissiveMap: this.textures.emissiveMap,
      emissive: colorScheme.emissive,
      emissiveIntensity: 0.7,
      metalness: colorScheme.metallic + 0.1,
      roughness: colorScheme.roughness - 0.1,
    });
    
    let helmet = null;
    
    // Create helmet based on type
    switch (type) {
      case 'standard':
        // Simple rounded helmet
        const geometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        helmet = new THREE.Mesh(geometry, material);
        helmet.scale.z = 1.2; // Make it slightly longer
        helmet.position.y = 1.9;
        break;
        
      case 'enhanced':
        // More detailed helmet with visor
        const helmetGroup = new THREE.Group();
        
        // Main helmet shape
        const mainGeometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const main = new THREE.Mesh(mainGeometry, material);
        main.scale.z = 1.2;
        helmetGroup.add(main);
        
        // Visor
        const visorMaterial = new THREE.MeshStandardMaterial({
          color: colorScheme.accent,
          emissive: colorScheme.emissive,
          emissiveIntensity: 1.0,
          metalness: 1.0,
          roughness: 0.0,
          transparent: true,
          opacity: 0.8,
        });
        
        const visorGeometry = new THREE.SphereGeometry(0.25, 16, 8, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.1, Math.PI * 0.3);
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.z = 0.03;
        helmetGroup.add(visor);
        
        helmetGroup.position.y = 1.9;
        helmet = helmetGroup;
        break;
        
      case 'advanced':
        // Advanced helmet with multiple parts
        const advancedGroup = new THREE.Group();
        
        // Main helmet
        const advMainGeometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const advMain = new THREE.Mesh(advMainGeometry, material);
        advMain.scale.z = 1.2;
        advancedGroup.add(advMain);
        
        // Top crest
        const crestGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.4);
        const crest = new THREE.Mesh(crestGeometry, material);
        crest.position.y = 0.15;
        crest.position.z = -0.1;
        advancedGroup.add(crest);
        
        // Side panels
        const leftPanelGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.25);
        const leftPanel = new THREE.Mesh(leftPanelGeometry, material);
        leftPanel.position.set(-0.25, -0.05, 0);
        advancedGroup.add(leftPanel);
        
        const rightPanelGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.25);
        const rightPanel = new THREE.Mesh(rightPanelGeometry, material);
        rightPanel.position.set(0.25, -0.05, 0);
        advancedGroup.add(rightPanel);
        
        // Visor
        const advVisorMaterial = new THREE.MeshStandardMaterial({
          color: colorScheme.accent,
          emissive: colorScheme.emissive,
          emissiveIntensity: 1.0,
          metalness: 1.0,
          roughness: 0.0,
          transparent: true,
          opacity: 0.8,
        });
        
        const advVisorGeometry = new THREE.SphereGeometry(0.25, 16, 8, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.1, Math.PI * 0.3);
        const advVisor = new THREE.Mesh(advVisorGeometry, advVisorMaterial);
        advVisor.position.z = 0.05;
        advancedGroup.add(advVisor);
        
        advancedGroup.position.y = 1.9;
        helmet = advancedGroup;
        break;
        
      case 'prototype':
        // Futuristic prototype helmet
        const protoGroup = new THREE.Group();
        
        // Main helmet - more angular
        const protoMainGeometry = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const protoMain = new THREE.Mesh(protoMainGeometry, material);
        protoMain.scale.z = 1.3;
        protoMain.scale.x = 1.1;
        protoGroup.add(protoMain);
        
        // Extra armor plates
        const topPlateGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.5);
        const topPlate = new THREE.Mesh(topPlateGeometry, material);
        topPlate.position.y = 0.15;
        protoGroup.add(topPlate);
        
        // Glowing elements
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: colorScheme.emissive,
          transparent: true,
          opacity: 0.9,
        });
        
        // Add glowing strips
        const leftStripGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.3);
        const leftStrip = new THREE.Mesh(leftStripGeometry, glowMaterial);
        leftStrip.position.set(-0.2, 0, 0);
        protoGroup.add(leftStrip);
        
        const rightStripGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.3);
        const rightStrip = new THREE.Mesh(rightStripGeometry, glowMaterial);
        rightStrip.position.set(0.2, 0, 0);
        protoGroup.add(rightStrip);
        
        // Full-face visor
        const protoVisorMaterial = new THREE.MeshStandardMaterial({
          color: colorScheme.accent,
          emissive: colorScheme.emissive,
          emissiveIntensity: 1.5,
          metalness: 1.0,
          roughness: 0.0,
          transparent: true,
          opacity: 0.8,
        });
        
        const protoVisorGeometry = new THREE.SphereGeometry(0.25, 16, 8, Math.PI * 0.1, Math.PI * 0.8, Math.PI * 0.1, Math.PI * 0.3);
        const protoVisor = new THREE.Mesh(protoVisorGeometry, protoVisorMaterial);
        protoVisor.position.z = 0.1;
        protoGroup.add(protoVisor);
        
        protoGroup.position.y = 1.9;
        helmet = protoGroup;
        break;
    }
    
    if (helmet) {
      parentGroup.add(helmet);
      this.parts.helmet = helmet;
    }
    
    return helmet;
  }
  
  // Create a backpack based on the type
  _createBackpack(type, parentGroup) {
    // Remove existing backpack if there is one
    if (this.parts.backpack && this.parts.backpack.parent) {
      this.parts.backpack.parent.remove(this.parts.backpack);
      this.parts.backpack = null;
    }
    
    // If type is 'none', don't create a backpack
    if (type === 'none') return;
    
    // Get the current color scheme
    const colorScheme = this.colorSchemes[this.currentOptions.colorScheme];
    
    // Create base material for backpack
    const material = new THREE.MeshStandardMaterial({
      color: colorScheme.secondary,
      normalMap: this.textures.normalMap,
      roughnessMap: this.textures.roughnessMap,
      emissiveMap: this.textures.emissiveMap,
      emissive: colorScheme.emissive,
      emissiveIntensity: 0.5,
      metalness: colorScheme.metallic,
      roughness: colorScheme.roughness,
    });
    
    let backpack = null;
    
    // Create backpack based on type
    switch (type) {
      case 'standard':
        // Simple box backpack
        const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.2);
        backpack = new THREE.Mesh(geometry, material);
        backpack.position.set(0, 1.2, -0.25);
        break;
        
      case 'utility':
        // Utility backpack with pouches
        const utilityGroup = new THREE.Group();
        
        // Main backpack
        const mainGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.2);
        const main = new THREE.Mesh(mainGeometry, material);
        utilityGroup.add(main);
        
        // Top pouch
        const topPouchGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.15);
        const topPouch = new THREE.Mesh(topPouchGeometry, material);
        topPouch.position.y = 0.25;
        utilityGroup.add(topPouch);
        
        // Side pouches
        const leftPouchGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.15);
        const leftPouch = new THREE.Mesh(leftPouchGeometry, material);
        leftPouch.position.x = -0.25;
        utilityGroup.add(leftPouch);
        
        const rightPouchGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.15);
        const rightPouch = new THREE.Mesh(rightPouchGeometry, material);
        rightPouch.position.x = 0.25;
        utilityGroup.add(rightPouch);
        
        utilityGroup.position.set(0, 1.2, -0.25);
        backpack = utilityGroup;
        break;
        
      case 'advanced':
        // Advanced backpack with tech elements
        const advancedGroup = new THREE.Group();
        
        // Main backpack
        const advMainGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.2);
        const advMain = new THREE.Mesh(advMainGeometry, material);
        advancedGroup.add(advMain);
        
        // Tech details
        const detailMaterial = new THREE.MeshStandardMaterial({
          color: colorScheme.accent,
          emissive: colorScheme.emissive,
          emissiveIntensity: 0.8,
          metalness: 0.9,
          roughness: 0.2,
        });
        
        const detailGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        const leftDetail = new THREE.Mesh(detailGeometry, detailMaterial);
        leftDetail.position.x = -0.15;
        leftDetail.rotation.x = Math.PI / 2;
        advancedGroup.add(leftDetail);
        
        const rightDetail = new THREE.Mesh(detailGeometry, detailMaterial);
        rightDetail.position.x = 0.15;
        rightDetail.rotation.x = Math.PI / 2;
        advancedGroup.add(rightDetail);
        
        // Center console
        const consoleGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.05);
        const console = new THREE.Mesh(consoleGeometry, detailMaterial);
        console.position.z = 0.125;
        advancedGroup.add(console);
        
        advancedGroup.position.set(0, 1.2, -0.25);
        backpack = advancedGroup;
        break;
        
      case 'quantum':
        // Quantum backpack with energy effects
        const quantumGroup = new THREE.Group();
        
        // Main backpack - rounded shape
        const quantumMainGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        quantumMainGeometry.scale(1.0, 1.2, 0.6); // Flatten a bit
        const quantumMain = new THREE.Mesh(quantumMainGeometry, material);
        quantumGroup.add(quantumMain);
        
        // Energy core
        const coreMaterial = new THREE.MeshBasicMaterial({
          color: colorScheme.emissive,
          transparent: true,
          opacity: 0.9,
        });
        
        const coreGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.z = -0.05;
        quantumGroup.add(core);
        
        // Energy tubes
        const tubeMaterial = new THREE.MeshBasicMaterial({
          color: colorScheme.emissive,
          transparent: true,
          opacity: 0.6,
        });
        
        // Add tubes connecting to shoulders
        const leftTubeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const leftTube = new THREE.Mesh(leftTubeGeometry, tubeMaterial);
        leftTube.position.set(-0.2, 0.15, -0.05);
        leftTube.rotation.z = Math.PI / 4;
        quantumGroup.add(leftTube);
        
        const rightTubeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const rightTube = new THREE.Mesh(rightTubeGeometry, tubeMaterial);
        rightTube.position.set(0.2, 0.15, -0.05);
        rightTube.rotation.z = -Math.PI / 4;
        quantumGroup.add(rightTube);
        
        quantumGroup.position.set(0, 1.2, -0.25);
        
        // Store reference to core for animation
        quantumGroup.userData.core = core;
        
        backpack = quantumGroup;
        break;
    }
    
    if (backpack) {
      parentGroup.add(backpack);
      this.parts.backpack = backpack;
    }
    
    return backpack;
  }
  
  // Apply a color scheme to the character
  applyColorScheme(schemeName) {
    if (!this.colorSchemes[schemeName]) {
      console.warn(`Color scheme ${schemeName} not found`);
      return false;
    }
    
    if (!this.modelLoaded) {
      console.warn('Cannot apply color scheme - no model loaded');
      return false;
    }
    
    const scheme = this.colorSchemes[schemeName];
    
    // Update current options
    this.currentOptions.colorScheme = schemeName;
    
    // Apply to each part
    for (const [partName, part] of Object.entries(this.parts)) {
      if (!part || !part.material) continue;
      
      // Skip parts that should use their own material (like visors)
      if (part.userData && part.userData.preserveMaterial) continue;
      
      // If the part is a group, apply to all child meshes
      if (part.type === 'Group') {
        part.traverse(child => {
          if (child.isMesh && child.material) {
            this._applySchemeToMaterial(child.material, scheme, partName);
          }
        });
      } else {
        // Apply to the part's material
        this._applySchemeToMaterial(part.material, scheme, partName);
      }
    }
    
    // Recreate accessories with new color scheme
    this._createHelmet(this.currentOptions.helmet, this.characterModel);
    this._createBackpack(this.currentOptions.backpack, this.characterModel);
    
    return true;
  }
  
  // Apply a color scheme to a specific material
  _applySchemeToMaterial(material, scheme, partName) {
    // Determine which color to use based on part
    let mainColor = scheme.primary;
    let emissiveColor = scheme.emissive;
    
    // Customize colors for different parts
    switch (partName) {
      case 'helmet':
      case 'backpack':
        mainColor = scheme.secondary;
        emissiveColor = scheme.emissive;
        break;
      case 'head':
        mainColor = scheme.primary;
        emissiveColor = scheme.emissive;
        break;
      case 'leftArm':
      case 'rightArm':
        mainColor = scheme.secondary;
        emissiveColor = scheme.emissive;
        break;
      case 'leftLeg':
      case 'rightLeg':
        mainColor = scheme.primary;
        emissiveColor = scheme.emissive;
        break;
    }
    
    // Apply colors and properties
    if (material.color) material.color.copy(mainColor);
    if (material.emissive) material.emissive.copy(emissiveColor);
    
    material.metalness = scheme.metallic;
    material.roughness = scheme.roughness;
    
    // Apply maps if available
    if (this.textures.normalMap) material.normalMap = this.textures.normalMap;
    if (this.textures.roughnessMap) material.roughnessMap = this.textures.roughnessMap;
    if (this.textures.emissiveMap) material.emissiveMap = this.textures.emissiveMap;
    
    material.needsUpdate = true;
  }
  
  // Set the helmet type
  setHelmet(type) {
    if (!this.accessories.helmetTypes.includes(type)) {
      console.warn(`Helmet type ${type} not found`);
      return false;
    }
    
    if (!this.modelLoaded) {
      console.warn('Cannot change helmet - no model loaded');
      return false;
    }
    
    // Update current options
    this.currentOptions.helmet = type;
    
    // Create the new helmet
    this._createHelmet(type, this.characterModel);
    
    return true;
  }
  
  // Set the backpack type
  setBackpack(type) {
    if (!this.accessories.backpackTypes.includes(type)) {
      console.warn(`Backpack type ${type} not found`);
      return false;
    }
    
    if (!this.modelLoaded) {
      console.warn('Cannot change backpack - no model loaded');
      return false;
    }
    
    // Update current options
    this.currentOptions.backpack = type;
    
    // Create the new backpack
    this._createBackpack(type, this.characterModel);
    
    return true;
  }
  
  // Set the glow intensity
  setGlowIntensity(intensity) {
    intensity = Math.max(0, Math.min(intensity, 2.0)); // Clamp between 0 and 2
    
    this.effects.glowIntensity = intensity;
    this.currentOptions.glowIntensity = intensity;
    
    // Apply to all parts
    for (const part of Object.values(this.parts)) {
      if (!part) continue;
      
      // Apply to the part and all its children
      part.traverse(child => {
        if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = intensity;
          child.material.needsUpdate = true;
        }
      });
    }
    
    return true;
  }
  
  // Set the pulse speed
  setPulseSpeed(speed) {
    speed = Math.max(0, Math.min(speed, 3.0)); // Clamp between 0 and 3
    
    this.effects.pulseSpeed = speed;
    this.currentOptions.pulseSpeed = speed;
    
    return true;
  }
  
  // Toggle shoulder pads
  toggleShoulderPads(enabled) {
    this.currentOptions.shoulderPads = enabled;
    // Implementation would add/remove shoulder pad meshes
    return true;
  }
  
  // Toggle knee pads
  toggleKneePads(enabled) {
    this.currentOptions.kneePads = enabled;
    // Implementation would add/remove knee pad meshes
    return true;
  }
  
  // Update the character appearance
  update(deltaTime) {
    if (!this.modelLoaded) return;
    
    // Update pulse effect
    if (this.effects.pulseSpeed > 0) {
      this.effects.pulseTime += deltaTime * this.effects.pulseSpeed;
      
      // Calculate pulse intensity (0.7 to 1.3 range)
      const pulseIntensity = 0.7 + (Math.sin(this.effects.pulseTime * 2) * 0.3 + 0.3);
      
      // Apply pulse to emissive intensity
      for (const part of Object.values(this.parts)) {
        if (!part) continue;
        
        // Apply to the part and all its children
        part.traverse(child => {
          if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = this.effects.glowIntensity * pulseIntensity;
            child.material.needsUpdate = true;
          }
        });
      }
      
      // Pulse the quantum backpack core if it exists
      if (this.parts.backpack && 
          this.parts.backpack.userData && 
          this.parts.backpack.userData.core) {
        
        const core = this.parts.backpack.userData.core;
        
        // Pulse the size
        const baseScale = 1.0;
        const scaleVariation = 0.2;
        const scale = baseScale + Math.sin(this.effects.pulseTime * 3) * scaleVariation;
        
        core.scale.set(scale, scale, scale);
      }
    }
  }
  
  // Reset appearance to default
  resetAppearance() {
    // Reset options
    this.currentOptions = {
      colorScheme: 'default',
      helmet: 'standard',
      backpack: 'standard',
      shoulderPads: false,
      kneePads: false,
      gloves: true,
      boots: true,
      glowIntensity: 1.0,
      pulseSpeed: 1.0,
    };
    
    // Apply default options
    this.applyColorScheme('default');
    this.setHelmet('standard');
    this.setBackpack('standard');
    this.setGlowIntensity(1.0);
    this.setPulseSpeed(1.0);
    
    return true;
  }
  
  // Get all customization options
  getCustomizationOptions() {
    return {
      colorSchemes: Object.keys(this.colorSchemes),
      helmetTypes: this.accessories.helmetTypes,
      backpackTypes: this.accessories.backpackTypes,
      accessories: {
        shoulderPads: this.currentOptions.shoulderPads,
        kneePads: this.currentOptions.kneePads,
        gloves: this.currentOptions.gloves,
        boots: this.currentOptions.boots,
      },
      effects: {
        glowIntensity: this.currentOptions.glowIntensity,
        pulseSpeed: this.currentOptions.pulseSpeed,
      },
      current: { ...this.currentOptions },
    };
  }
  
  // Dispose resources
  dispose() {
    // Dispose textures
    for (const texture of Object.values(this.textures)) {
      if (texture) texture.dispose();
    }
    
    // Clear original materials
    this.originalMaterials.clear();
  }
}

export default CharacterAppearance;