/**
 * Progressive Enhancement Utility
 * Provides fallback mechanisms for different device capabilities
 */

import { performanceSettings } from './performance';

/**
 * Feature detection and capabilities object
 */
class FeatureDetector {
  constructor() {
    this.features = {
      webgl: false,
      webgl2: false,
      webAudio: false,
      webWorkers: false,
      touchscreen: false,
      gyroscope: false,
      localStorage: false,
      sessionStorage: false,
      screenSize: { width: 0, height: 0 },
      devicePixelRatio: 1,
      pointerEvents: false,
      batteryAPI: false,
      networkInfo: false
    };
    
    this.supportLevels = {
      rendering: 'none',
      audio: 'none',
      storage: 'none',
      input: 'none'
    };
  }

  /**
   * Initialize feature detection
   */
  detect() {
    this.detectWebGL();
    this.detectAudio();
    this.detectStorage();
    this.detectInput();
    this.detectScreenProperties();
    this.detectMiscFeatures();
    this.calculateSupportLevels();
    
    return this;
  }

  /**
   * Detect WebGL support
   */
  detectWebGL() {
    try {
      const canvas = document.createElement('canvas');
      
      // Detect WebGL 1
      this.features.webgl = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      
      // Detect WebGL 2
      this.features.webgl2 = !!(
        window.WebGL2RenderingContext && 
        canvas.getContext('webgl2')
      );
    } catch (e) {
      this.features.webgl = false;
      this.features.webgl2 = false;
    }
  }

  /**
   * Detect audio capabilities
   */
  detectAudio() {
    this.features.webAudio = !!(window.AudioContext || window.webkitAudioContext);
  }

  /**
   * Detect storage capabilities
   */
  detectStorage() {
    try {
      const testKey = '__test_storage__';
      
      // Test localStorage
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      this.features.localStorage = true;
      
      // Test sessionStorage
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      this.features.sessionStorage = true;
    } catch (e) {
      this.features.localStorage = false;
      this.features.sessionStorage = false;
    }
  }

  /**
   * Detect input capabilities
   */
  detectInput() {
    // Detect touch support
    this.features.touchscreen = !!(
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0
    );
    
    // Detect gyroscope
    this.features.gyroscope = !!(
      window.DeviceOrientationEvent !== undefined && 
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    );
    
    // Detect pointer events
    this.features.pointerEvents = !!(window.PointerEvent);
  }

  /**
   * Detect screen properties
   */
  detectScreenProperties() {
    this.features.screenSize = {
      width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    };
    
    this.features.devicePixelRatio = window.devicePixelRatio || 1;
  }

  /**
   * Detect miscellaneous features
   */
  detectMiscFeatures() {
    // Web Workers
    this.features.webWorkers = !!window.Worker;
    
    // Battery API
    this.features.batteryAPI = !!(navigator.getBattery);
    
    // Network Information API
    this.features.networkInfo = !!(navigator.connection);
  }

  /**
   * Calculate overall support levels based on detected features
   */
  calculateSupportLevels() {
    // Rendering support level
    if (this.features.webgl2) {
      this.supportLevels.rendering = 'high';
    } else if (this.features.webgl) {
      this.supportLevels.rendering = 'medium';
    } else {
      this.supportLevels.rendering = 'low';
    }
    
    // Audio support level
    if (this.features.webAudio) {
      this.supportLevels.audio = 'high';
    } else {
      this.supportLevels.audio = 'low';
    }
    
    // Storage support level
    if (this.features.localStorage && this.features.sessionStorage) {
      this.supportLevels.storage = 'high';
    } else if (this.features.localStorage || this.features.sessionStorage) {
      this.supportLevels.storage = 'medium';
    } else {
      this.supportLevels.storage = 'low';
    }
    
    // Input support level
    if (this.features.pointerEvents && this.features.gyroscope) {
      this.supportLevels.input = 'high';
    } else if (this.features.touchscreen) {
      this.supportLevels.input = 'medium';
    } else {
      this.supportLevels.input = 'low';
    }
  }

  /**
   * Get all detected features
   */
  getFeatures() {
    return this.features;
  }

  /**
   * Get support levels
   */
  getSupportLevels() {
    return this.supportLevels;
  }
}

/**
 * Progressive Enhancement Manager
 * Provides appropriate fallbacks based on device capabilities
 */
class ProgressiveEnhancementManager {
  constructor() {
    this.featureDetector = new FeatureDetector().detect();
    this.features = this.featureDetector.getFeatures();
    this.supportLevels = this.featureDetector.getSupportLevels();
    
    // Register fallback components
    this.fallbacks = {
      rendering: {
        high: () => this.highFidelityRendering(),
        medium: () => this.mediumFidelityRendering(),
        low: () => this.lowFidelityRendering()
      },
      audio: {
        high: () => this.fullAudioExperience(),
        low: () => this.basicAudioExperience()
      },
      storage: {
        high: () => this.persistentStorage(),
        medium: () => this.sessionOnlyStorage(),
        low: () => this.noStorageFallback()
      },
      input: {
        high: () => this.advancedInputControls(),
        medium: () => this.touchInputControls(),
        low: () => this.basicInputControls()
      }
    };
  }

  /**
   * Initialize the progressive enhancement system
   */
  init() {
    console.log('Initializing Progressive Enhancement System');
    console.log('Detected Features:', this.features);
    console.log('Support Levels:', this.supportLevels);
    
    // Apply fallbacks based on detected capabilities
    this.applyFallbacks();
    
    return this;
  }

  /**
   * Apply appropriate fallbacks for all subsystems
   */
  applyFallbacks() {
    // Apply rendering fallbacks
    this.applyRenderingFallbacks();
    
    // Apply audio fallbacks
    this.applyAudioFallbacks();
    
    // Apply storage fallbacks
    this.applyStorageFallbacks();
    
    // Apply input fallbacks
    this.applyInputFallbacks();
  }

  /**
   * Apply rendering fallbacks based on detected capabilities
   */
  applyRenderingFallbacks() {
    const renderingLevel = this.supportLevels.rendering;
    
    // Apply appropriate fallback
    if (this.fallbacks.rendering[renderingLevel]) {
      this.fallbacks.rendering[renderingLevel]();
    } else {
      // Default to lowest level if not found
      this.fallbacks.rendering.low();
    }
  }

  /**
   * Apply audio fallbacks based on detected capabilities
   */
  applyAudioFallbacks() {
    const audioLevel = this.supportLevels.audio;
    
    // Apply appropriate fallback
    if (this.fallbacks.audio[audioLevel]) {
      this.fallbacks.audio[audioLevel]();
    } else {
      // Default to lowest level if not found
      this.fallbacks.audio.low();
    }
  }

  /**
   * Apply storage fallbacks based on detected capabilities
   */
  applyStorageFallbacks() {
    const storageLevel = this.supportLevels.storage;
    
    // Apply appropriate fallback
    if (this.fallbacks.storage[storageLevel]) {
      this.fallbacks.storage[storageLevel]();
    } else {
      // Default to lowest level if not found
      this.fallbacks.storage.low();
    }
  }

  /**
   * Apply input fallbacks based on detected capabilities
   */
  applyInputFallbacks() {
    const inputLevel = this.supportLevels.input;
    
    // Apply appropriate fallback
    if (this.fallbacks.input[inputLevel]) {
      this.fallbacks.input[inputLevel]();
    } else {
      // Default to lowest level if not found
      this.fallbacks.input.low();
    }
  }

  /**
   * High fidelity rendering implementation
   */
  highFidelityRendering() {
    console.log('Applying high fidelity rendering');
    // Enable all visual effects
    // Use high-detail models
    // Enable post-processing effects
    window.__QUANTUM_RENDERING_MODE = 'high';
  }

  /**
   * Medium fidelity rendering implementation
   */
  mediumFidelityRendering() {
    console.log('Applying medium fidelity rendering');
    // Reduce particle count
    // Use medium-detail models
    // Disable complex shaders
    window.__QUANTUM_RENDERING_MODE = 'medium';
  }

  /**
   * Low fidelity rendering implementation
   */
  lowFidelityRendering() {
    console.log('Applying low fidelity rendering');
    // Fallback to CSS-based animations
    // Use minimal particle effects
    // Disable 3D rendering and use 2D alternatives
    window.__QUANTUM_RENDERING_MODE = 'low';
  }

  /**
   * Full audio experience implementation
   */
  fullAudioExperience() {
    console.log('Applying full audio experience');
    // Enable 3D positional audio
    // Use high-quality sound effects
    // Enable dynamic audio mixing
    window.__QUANTUM_AUDIO_MODE = 'high';
  }

  /**
   * Basic audio experience implementation
   */
  basicAudioExperience() {
    console.log('Applying basic audio experience');
    // Use basic audio playback
    // Reduce sound effect variety
    // Disable positional audio
    window.__QUANTUM_AUDIO_MODE = 'low';
  }

  /**
   * Persistent storage implementation
   */
  persistentStorage() {
    console.log('Applying persistent storage');
    // Use localStorage for game state
    // Enable auto-save functionality
    // Store detailed game progress
    window.__QUANTUM_STORAGE_MODE = 'persistent';
    
    // Create storage adapter
    window.__QUANTUM_STORAGE = {
      save: (key, data) => {
        try {
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      },
      load: (key) => {
        try {
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        } catch (e) {
          console.error('Storage error:', e);
          return null;
        }
      },
      remove: (key) => {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      },
      clear: () => {
        try {
          localStorage.clear();
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      }
    };
  }

  /**
   * Session-only storage implementation
   */
  sessionOnlyStorage() {
    console.log('Applying session-only storage');
    // Use sessionStorage for temporary data
    // Warn user about data loss on exit
    // Limit stored data to essential information
    window.__QUANTUM_STORAGE_MODE = 'session';
    
    // Create storage adapter
    window.__QUANTUM_STORAGE = {
      save: (key, data) => {
        try {
          sessionStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      },
      load: (key) => {
        try {
          const data = sessionStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        } catch (e) {
          console.error('Storage error:', e);
          return null;
        }
      },
      remove: (key) => {
        try {
          sessionStorage.removeItem(key);
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      },
      clear: () => {
        try {
          sessionStorage.clear();
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      }
    };
  }

  /**
   * No storage fallback implementation
   */
  noStorageFallback() {
    console.log('Applying no-storage fallback');
    // Use in-memory storage only
    // Disable save functionality
    // Warn user about data loss
    window.__QUANTUM_STORAGE_MODE = 'memory';
    
    // Create in-memory storage adapter
    const memoryStorage = {};
    window.__QUANTUM_STORAGE = {
      save: (key, data) => {
        try {
          memoryStorage[key] = JSON.parse(JSON.stringify(data));
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      },
      load: (key) => {
        try {
          return memoryStorage[key] || null;
        } catch (e) {
          console.error('Storage error:', e);
          return null;
        }
      },
      remove: (key) => {
        try {
          delete memoryStorage[key];
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      },
      clear: () => {
        try {
          Object.keys(memoryStorage).forEach(key => {
            delete memoryStorage[key];
          });
          return true;
        } catch (e) {
          console.error('Storage error:', e);
          return false;
        }
      }
    };
  }

  /**
   * Advanced input controls implementation
   */
  advancedInputControls() {
    console.log('Applying advanced input controls');
    // Enable gyroscope controls
    // Use full touch and pointer event system
    // Enable gesture recognition
    window.__QUANTUM_INPUT_MODE = 'advanced';
  }

  /**
   * Touch input controls implementation
   */
  touchInputControls() {
    console.log('Applying touch input controls');
    // Optimize for touch interactions
    // Provide touch-specific UI elements
    // Simplify control scheme for touch
    window.__QUANTUM_INPUT_MODE = 'touch';
  }

  /**
   * Basic input controls implementation
   */
  basicInputControls() {
    console.log('Applying basic input controls');
    // Fall back to keyboard/mouse only
    // Simplify control scheme
    // Provide additional assistance in UI
    window.__QUANTUM_INPUT_MODE = 'basic';
  }

  /**
   * Get component fallback for specified system and capability level
   * @param {string} system - System name ('rendering', 'audio', 'storage', 'input')
   * @param {string} level - Capability level ('high', 'medium', 'low')
   * @param {Function} defaultFallback - Default fallback function if not found
   * @returns {Function} - Fallback function
   */
  getFallback(system, level, defaultFallback) {
    if (this.fallbacks[system] && this.fallbacks[system][level]) {
      return this.fallbacks[system][level];
    }
    
    return defaultFallback || (() => console.log(`No fallback found for ${system}:${level}`));
  }

  /**
   * Register a custom fallback function
   * @param {string} system - System name
   * @param {string} level - Capability level
   * @param {Function} fallbackFn - Fallback function to register
   */
  registerFallback(system, level, fallbackFn) {
    if (!this.fallbacks[system]) {
      this.fallbacks[system] = {};
    }
    
    this.fallbacks[system][level] = fallbackFn;
  }

  /**
   * Get the rendering component appropriate for the current device capabilities
   * @param {Object} components - Object containing components for different capability levels
   * @returns {React.Component} - The appropriate component
   */
  getAppropriateComponent(components) {
    const { high, medium, low } = components;
    
    // Use performance settings to determine which component to use
    const detailLevel = performanceSettings.getDetailLevel();
    
    if (detailLevel === 'high' && high) {
      return high;
    } else if ((detailLevel === 'medium' || detailLevel === 'low') && medium) {
      return medium;
    } else {
      return low;
    }
  }
}

// Create and export singleton instance
export const progressiveEnhancement = new ProgressiveEnhancementManager().init();

/**
 * React hook for progressive enhancement
 * @param {Object} components - Object containing components for different capability levels
 * @returns {React.Component} - The appropriate component for current device
 */
export const useProgressiveEnhancement = (components) => {
  return progressiveEnhancement.getAppropriateComponent(components);
};

export default progressiveEnhancement;