/**
 * Performance utility for managing rendering quality and effects
 * based on device capabilities and performance metrics
 */

// Performance measurement and management
class PerformanceManager {
  constructor() {
    this.fpsHistory = [];
    this.fpsUpdateInterval = 1000; // ms
    this.lastFpsUpdate = 0;
    this.frameCount = 0;
    this.detailLevel = null;
    this.isHighEndDevice = false;
    this.hasDedicatedGPU = false;
    this.isWebGLSupported = false;
    this.maxParticleCount = 10000;
    this.objectPool = {};
  }

  // Initialize performance detection
  init() {
    this.detectDeviceCapabilities();
    this.setInitialDetailLevel();
    this.startPerformanceMonitoring();
    return this;
  }

  // Detect device capabilities to determine performance settings
  detectDeviceCapabilities() {
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      this.isWebGLSupported = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      this.isWebGLSupported = false;
    }

    // Try to determine if device has dedicated GPU
    // This is a best-effort approximation
    const gl = document.createElement('canvas').getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        this.hasDedicatedGPU = /(nvidia|amd|radeon|geforce|intel iris)/i.test(renderer);
      }
    }

    // Use navigator info to make educated guesses about device capability
    this.isHighEndDevice = 
      /iPhone|iPad/.test(navigator.userAgent) ? 
        (navigator.deviceMemory > 2 || navigator.hardwareConcurrency > 4) : 
        (navigator.deviceMemory > 4 || navigator.hardwareConcurrency > 4);

    console.log('Device capabilities:', {
      isWebGLSupported: this.isWebGLSupported,
      hasDedicatedGPU: this.hasDedicatedGPU,
      isHighEndDevice: this.isHighEndDevice
    });
  }

  // Set initial detail level based on detected capabilities
  setInitialDetailLevel() {
    if (!this.isWebGLSupported) {
      this.detailLevel = 'minimal';
    } else if (this.hasDedicatedGPU || this.isHighEndDevice) {
      this.detailLevel = 'high';
    } else {
      this.detailLevel = 'medium';
    }
    
    this.adjustMaxParticles();
  }

  // Start monitoring FPS to dynamically adjust detail
  startPerformanceMonitoring() {
    let lastFrameTime = performance.now();
    
    const updateFps = (time) => {
      this.frameCount++;
      const elapsed = time - this.lastFpsUpdate;
      
      if (elapsed >= this.fpsUpdateInterval) {
        const fps = (this.frameCount / elapsed) * 1000;
        this.fpsHistory.push(fps);
        
        // Keep recent history only
        if (this.fpsHistory.length > 10) {
          this.fpsHistory.shift();
        }
        
        this.frameCount = 0;
        this.lastFpsUpdate = time;
        
        // Adjust detail level if necessary
        this.adjustDetailLevel();
      }
      
      requestAnimationFrame(updateFps);
    };
    
    requestAnimationFrame(updateFps);
  }

  // Calculate average FPS from recent history
  getAverageFps() {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }

  // Adjust detail level based on performance
  adjustDetailLevel() {
    const avgFps = this.getAverageFps();
    const currentLevel = this.detailLevel;
    
    if (avgFps < 30 && currentLevel !== 'minimal') {
      // If FPS is too low, decrease detail level
      if (currentLevel === 'high') {
        this.detailLevel = 'medium';
      } else if (currentLevel === 'medium') {
        this.detailLevel = 'low';
      } else if (currentLevel === 'low') {
        this.detailLevel = 'minimal';
      }
    } else if (avgFps > 55 && currentLevel !== 'high') {
      // If FPS is very good, consider increasing detail
      if (currentLevel === 'minimal') {
        this.detailLevel = 'low';
      } else if (currentLevel === 'low') {
        this.detailLevel = 'medium';
      } else if (currentLevel === 'medium' && (this.hasDedicatedGPU || this.isHighEndDevice)) {
        this.detailLevel = 'high';
      }
    }
    
    // If detail level changed, adjust particle count
    if (currentLevel !== this.detailLevel) {
      console.log(`Adjusting detail level: ${currentLevel} -> ${this.detailLevel} (FPS: ${avgFps.toFixed(1)})`);
      this.adjustMaxParticles();
    }
  }

  // Adjust max particle count based on detail level
  adjustMaxParticles() {
    switch (this.detailLevel) {
      case 'high':
        this.maxParticleCount = 10000;
        break;
      case 'medium':
        this.maxParticleCount = 5000;
        break;
      case 'low':
        this.maxParticleCount = 2000;
        break;
      case 'minimal':
        this.maxParticleCount = 500;
        break;
      default:
        this.maxParticleCount = 5000;
    }
  }

  // Get current detail level
  getDetailLevel() {
    return this.detailLevel;
  }

  // Get maximum particle count based on current detail level
  getMaxParticleCount() {
    return this.maxParticleCount;
  }

  // Check if WebGL is supported
  hasWebGLSupport() {
    return this.isWebGLSupported;
  }

  // Object pooling for frequently created objects
  getFromPool(type, createFn) {
    if (!this.objectPool[type]) {
      this.objectPool[type] = [];
    }
    
    if (this.objectPool[type].length > 0) {
      return this.objectPool[type].pop();
    }
    
    return createFn();
  }

  returnToPool(type, object) {
    if (!this.objectPool[type]) {
      this.objectPool[type] = [];
    }
    
    this.objectPool[type].push(object);
  }
}

// Create and export singleton instance
export const performanceSettings = new PerformanceManager().init();