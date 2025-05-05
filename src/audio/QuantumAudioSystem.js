import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuantumGame } from '../state/QuantumGameStateManager';

/**
 * QuantumAudioSystem
 * 
 * Comprehensive audio management system for the Quantum Salvation experience,
 * with ambient audio, quantum effects, adaptive music, and 3D positional sound.
 * 
 * Features:
 * - Dynamic audio mixing based on game state
 * - 3D positional audio for immersive experience
 * - Procedurally generated quantum sound effects
 * - Adaptive music that evolves with exploration
 * - Audio visualization and reactive elements
 * - Volume management and audio settings
 */

// Audio asset paths (these would be real paths in the actual implementation)
const AUDIO_PATHS = {
  // Background ambient tracks
  ambient: {
    surface: '/assets/audio/ambient/surface_ambient.mp3',
    limbo: '/assets/audio/ambient/limbo_ambient.mp3',
    lust: '/assets/audio/ambient/lust_ambient.mp3',
    gluttony: '/assets/audio/ambient/gluttony_ambient.mp3',
    greed: '/assets/audio/ambient/greed_ambient.mp3',
    anger: '/assets/audio/ambient/anger_ambient.mp3',
    heresy: '/assets/audio/ambient/heresy_ambient.mp3',
    violence: '/assets/audio/ambient/violence_ambient.mp3',
    fraud: '/assets/audio/ambient/fraud_ambient.mp3',
    treachery: '/assets/audio/ambient/treachery_ambient.mp3',
  },
  
  // Musical themes
  music: {
    intro: '/assets/audio/music/quantum_intro.mp3',
    exploration: '/assets/audio/music/quantum_exploration.mp3',
    discovery: '/assets/audio/music/quantum_discovery.mp3',
    challenge: '/assets/audio/music/quantum_challenge.mp3',
    tension: '/assets/audio/music/quantum_tension.mp3',
    success: '/assets/audio/music/quantum_success.mp3',
    failure: '/assets/audio/music/quantum_failure.mp3',
  },
  
  // UI sounds
  ui: {
    hover: '/assets/audio/ui/hover.mp3',
    click: '/assets/audio/ui/click.mp3',
    success: '/assets/audio/ui/success.mp3',
    error: '/assets/audio/ui/error.mp3',
    notification: '/assets/audio/ui/notification.mp3',
    achievement: '/assets/audio/ui/achievement.mp3',
    levelUp: '/assets/audio/ui/level_up.mp3',
    transition: '/assets/audio/ui/transition.mp3',
  },
  
  // Quantum ability sounds
  abilities: {
    phaseShift: '/assets/audio/abilities/phase_shift.mp3',
    timeDilation: '/assets/audio/abilities/time_dilation.mp3',
    molecularReconstruction: '/assets/audio/abilities/molecular_reconstruction.mp3',
    quantumTeleportation: '/assets/audio/abilities/quantum_teleportation.mp3',
  },
  
  // Interaction sounds
  interactions: {
    pickup: '/assets/audio/interactions/pickup.mp3',
    drop: '/assets/audio/interactions/drop.mp3',
    open: '/assets/audio/interactions/open.mp3',
    close: '/assets/audio/interactions/close.mp3',
    unlock: '/assets/audio/interactions/unlock.mp3',
    energy: '/assets/audio/interactions/energy.mp3',
    damage: '/assets/audio/interactions/damage.mp3',
    heal: '/assets/audio/interactions/heal.mp3',
  },
  
  // Environment sounds
  environment: {
    portal: '/assets/audio/environment/portal.mp3',
    quantum_fluctuation: '/assets/audio/environment/quantum_fluctuation.mp3',
    gravity_shift: '/assets/audio/environment/gravity_shift.mp3',
    time_rift: '/assets/audio/environment/time_rift.mp3',
    dimensional_tear: '/assets/audio/environment/dimensional_tear.mp3',
    crystallization: '/assets/audio/environment/crystallization.mp3',
  },
};

/**
 * A singleton class to handle all audio in the Quantum Salvation experience
 */
class AudioManager {
  constructor() {
    // Single instance
    if (AudioManager.instance) {
      return AudioManager.instance;
    }
    
    this.initialized = false;
    this.audioContext = null;
    this.masterGain = null;
    
    // Gain nodes for different channels
    this.channels = {
      master: null,
      music: null,
      ambient: null,
      sfx: null,
      ui: null,
      voice: null,
    };
    
    // Track currently playing sounds
    this.activeSounds = {
      music: null,
      ambient: null,
      loop: {},
      oneShot: new Set(),
    };
    
    // Preloaded audio buffers
    this.audioBuffers = {
      ambient: {},
      music: {},
      ui: {},
      abilities: {},
      interactions: {},
      environment: {},
    };
    
    // Sound positions for 3D audio
    this.soundPositions = new Map();
    
    // Listener position and orientation
    this.listener = {
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: -1 },
    };
    
    // Volume settings
    this.volumeSettings = {
      master: 1.0,
      music: 0.7,
      ambient: 0.8,
      sfx: 1.0,
      ui: 0.7,
      voice: 1.0,
    };
    
    // Mute state
    this.muteState = {
      master: false,
      music: false,
      ambient: false,
      sfx: false,
      ui: false,
      voice: false,
    };
    
    // Store oscillators for procedural sound generation
    this.oscillators = new Map();
    
    // Analyzer for audio visualization
    this.analyzer = null;
    
    // Current state
    this.currentCircle = 0;
    this.currentMusicState = 'exploration';
    
    // Track loading progress
    this.loadingProgress = {
      total: 0,
      loaded: 0,
      completed: false,
    };
    
    // Set singleton instance
    AudioManager.instance = this;
  }
  
  /**
   * Initialize the audio context and channels
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create channel structure
      this.channels.master = this.audioContext.createGain();
      this.channels.master.connect(this.audioContext.destination);
      
      // Create channel gains
      Object.keys(this.channels).forEach(channel => {
        if (channel !== 'master') {
          this.channels[channel] = this.audioContext.createGain();
          this.channels[channel].connect(this.channels.master);
        }
      });
      
      // Create analyzer
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 256;
      this.channels.master.connect(this.analyzer);
      
      // Apply initial volume settings
      this.applyVolumeSettings();
      
      // Preload essential audio
      await this.preloadEssentialAudio();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
      return false;
    }
  }
  
  /**
   * Preload essential audio files to prevent loading delays
   */
  async preloadEssentialAudio() {
    // Count total files for loading progress
    let totalFiles = 0;
    
    // UI sounds are essential
    totalFiles += Object.keys(AUDIO_PATHS.ui).length;
    
    // Add the first level of ambient
    totalFiles += 1;
    
    // Add essential music 
    totalFiles += 2; // Intro and exploration
    
    // Set total
    this.loadingProgress.total = totalFiles;
    this.loadingProgress.loaded = 0;
    
    // Load UI sounds
    const uiPromises = Object.entries(AUDIO_PATHS.ui).map(([key, path]) => 
      this.loadAudioBuffer(path).then(buffer => {
        this.audioBuffers.ui[key] = buffer;
        this.loadingProgress.loaded++;
      })
    );
    
    // Load initial ambient
    const ambientPromise = this.loadAudioBuffer(AUDIO_PATHS.ambient.surface).then(buffer => {
      this.audioBuffers.ambient.surface = buffer;
      this.loadingProgress.loaded++;
    });
    
    // Load essential music
    const musicPromises = [
      this.loadAudioBuffer(AUDIO_PATHS.music.intro).then(buffer => {
        this.audioBuffers.music.intro = buffer;
        this.loadingProgress.loaded++;
      }),
      this.loadAudioBuffer(AUDIO_PATHS.music.exploration).then(buffer => {
        this.audioBuffers.music.exploration = buffer;
        this.loadingProgress.loaded++;
      })
    ];
    
    // Wait for essential audio to load
    await Promise.all([...uiPromises, ambientPromise, ...musicPromises]);
    
    // Mark loading as completed
    this.loadingProgress.completed = true;
    
    // Start preloading non-essential audio
    this.preloadNonEssentialAudio();
  }
  
  /**
   * Preload non-essential audio in the background
   */
  preloadNonEssentialAudio() {
    // Preload the rest of the audio
    const promises = [];
    
    // Preload remaining ambient tracks
    Object.entries(AUDIO_PATHS.ambient).forEach(([key, path]) => {
      if (key !== 'surface') {
        promises.push(
          this.loadAudioBuffer(path).then(buffer => {
            this.audioBuffers.ambient[key] = buffer;
          })
        );
      }
    });
    
    // Preload remaining music tracks
    Object.entries(AUDIO_PATHS.music).forEach(([key, path]) => {
      if (key !== 'intro' && key !== 'exploration') {
        promises.push(
          this.loadAudioBuffer(path).then(buffer => {
            this.audioBuffers.music[key] = buffer;
          })
        );
      }
    });
    
    // Preload ability sounds
    Object.entries(AUDIO_PATHS.abilities).forEach(([key, path]) => {
      promises.push(
        this.loadAudioBuffer(path).then(buffer => {
          this.audioBuffers.abilities[key] = buffer;
        })
      );
    });
    
    // Preload interaction sounds
    Object.entries(AUDIO_PATHS.interactions).forEach(([key, path]) => {
      promises.push(
        this.loadAudioBuffer(path).then(buffer => {
          this.audioBuffers.interactions[key] = buffer;
        })
      );
    });
    
    // Preload environment sounds
    Object.entries(AUDIO_PATHS.environment).forEach(([key, path]) => {
      promises.push(
        this.loadAudioBuffer(path).then(buffer => {
          this.audioBuffers.environment[key] = buffer;
        })
      );
    });
    
    // No need to wait for these - they'll load in the background
    Promise.all(promises).catch(error => {
      console.warn('Error preloading non-essential audio:', error);
    });
  }
  
  /**
   * Load an audio buffer from a path
   * @param {string} path - Path to the audio file
   * @returns {Promise<AudioBuffer>} The audio buffer
   */
  async loadAudioBuffer(path) {
    try {
      // In a real implementation, this would load the actual file
      // For the mock implementation, return a placeholder buffer
      return this._createMockBuffer();
    } catch (error) {
      console.error(`Failed to load audio from ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a mock buffer for development purposes
   * (This would be replaced with actual file loading in production)
   */
  _createMockBuffer() {
    // Create a short buffer with silence
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, sampleRate * 2, sampleRate);
    
    // Return a promise to mimic async loading
    return new Promise(resolve => {
      // Simulate network delay
      setTimeout(() => resolve(buffer), 100);
    });
  }
  
  /**
   * Create a mock oscillator for development purposes
   * (This would generate actual sound in production)
   * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
   * @param {number} frequency - Frequency in Hz
   * @returns {OscillatorNode} The oscillator node
   */
  _createMockOscillator(type = 'sine', frequency = 440) {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Create a gain node to control volume
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.2; // Low volume for development
    
    // Connect oscillator to gain
    oscillator.connect(gain);
    
    // Connect gain to SFX channel
    gain.connect(this.channels.sfx);
    
    return {
      oscillator,
      gain,
      start() {
        oscillator.start();
      },
      stop() {
        // Safe stop with animation
        gain.gain.exponentialRampToValueAtTime(
          0.001, this.audioContext.currentTime + 0.1
        );
        setTimeout(() => oscillator.stop(), 100);
      }
    };
  }
  
  /**
   * Apply volume settings to all channels
   */
  applyVolumeSettings() {
    if (!this.initialized) return;
    
    // Apply master volume
    this.channels.master.gain.value = this.muteState.master ? 
      0 : this.volumeSettings.master;
    
    // Apply channel volumes
    Object.keys(this.channels).forEach(channel => {
      if (channel !== 'master' && this.channels[channel]) {
        this.channels[channel].gain.value = this.muteState[channel] ? 
          0 : this.volumeSettings[channel];
      }
    });
  }
  
  /**
   * Set volume for a specific channel
   * @param {string} channel - Channel name (master, music, ambient, sfx, ui, voice)
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(channel, volume) {
    if (!this.channels[channel]) return;
    
    // Clamp volume between 0 and 1
    volume = Math.max(0, Math.min(1, volume));
    
    // Store setting
    this.volumeSettings[channel] = volume;
    
    // Apply if not muted
    if (!this.muteState[channel]) {
      this.channels[channel].gain.value = volume;
    }
  }
  
  /**
   * Mute or unmute a channel
   * @param {string} channel - Channel name
   * @param {boolean} mute - Whether to mute the channel
   */
  setMute(channel, mute) {
    if (!this.channels[channel]) return;
    
    // Store mute state
    this.muteState[channel] = mute;
    
    // Apply mute
    if (mute) {
      this.channels[channel].gain.value = 0;
    } else {
      this.channels[channel].gain.value = this.volumeSettings[channel];
    }
  }
  
  /**
   * Update listener position and orientation
   * @param {Object} position - {x, y, z} position
   * @param {Object} orientation - {x, y, z} forward direction
   */
  updateListener(position, orientation) {
    if (!this.initialized) return;
    
    // Store values
    this.listener.position = position || this.listener.position;
    this.listener.orientation = orientation || this.listener.orientation;
    
    // Set audio listener position and orientation
    const { x, y, z } = this.listener.position;
    const { x: fx, y: fy, z: fz } = this.listener.orientation;
    
    // positionX/Y/Z and forwardX/Y/Z are part of the Web Audio API spec
    if (this.audioContext.listener.positionX) {
      // Modern API
      this.audioContext.listener.positionX.value = x;
      this.audioContext.listener.positionY.value = y;
      this.audioContext.listener.positionZ.value = z;
      
      this.audioContext.listener.forwardX.value = fx;
      this.audioContext.listener.forwardY.value = fy;
      this.audioContext.listener.forwardZ.value = fz;
      
      // Up vector (default to standard up)
      this.audioContext.listener.upX.value = 0;
      this.audioContext.listener.upY.value = 1;
      this.audioContext.listener.upZ.value = 0;
    } else {
      // Legacy API
      this.audioContext.listener.setPosition(x, y, z);
      this.audioContext.listener.setOrientation(fx, fy, fz, 0, 1, 0);
    }
    
    // Update active 3D sounds
    this._update3DSounds();
  }
  
  /**
   * Play an ambient sound track
   * @param {string} circleKey - Key for the circle/level
   * @param {Object} options - Playback options
   */
  playAmbient(circleKey, options = {}) {
    if (!this.initialized) return null;
    
    // Default options
    const defaultOptions = {
      loop: true,
      fadeIn: 3.0, // seconds
      fadeOut: 1.5, // seconds
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Get circle key based on index if needed
    if (typeof circleKey === 'number') {
      const circleKeys = Object.keys(AUDIO_PATHS.ambient);
      circleKey = circleKeys[Math.min(circleKey, circleKeys.length - 1)];
    }
    
    // If we already have this ambient track playing, just return it
    if (this.activeSounds.ambient?.key === circleKey) {
      return this.activeSounds.ambient.source;
    }
    
    // Get the buffer
    const buffer = this.audioBuffers.ambient[circleKey];
    
    // If buffer not loaded, try to load it
    if (!buffer) {
      const path = AUDIO_PATHS.ambient[circleKey];
      if (path) {
        this.loadAudioBuffer(path).then(loadedBuffer => {
          this.audioBuffers.ambient[circleKey] = loadedBuffer;
          this.playAmbient(circleKey, options);
        });
      }
      return null;
    }
    
    // Fade out previous ambient if exists
    if (this.activeSounds.ambient) {
      this._fadeSoundOut(
        this.activeSounds.ambient.gain, 
        mergedOptions.fadeOut, 
        () => {
          this.activeSounds.ambient.source.stop();
          this.activeSounds.ambient = null;
        }
      );
    }
    
    // Create new ambient source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = mergedOptions.loop;
    
    // Create gain node for this source
    const gain = this.audioContext.createGain();
    
    // If fading in, start at 0
    if (mergedOptions.fadeIn > 0) {
      gain.gain.value = 0;
    }
    
    // Connect source to gain, then to ambient channel
    source.connect(gain);
    gain.connect(this.channels.ambient);
    
    // Start playback
    source.start();
    
    // If fading in, animate gain
    if (mergedOptions.fadeIn > 0) {
      this._fadeSoundIn(gain, mergedOptions.fadeIn);
    }
    
    // Store reference
    this.activeSounds.ambient = {
      source,
      gain,
      key: circleKey,
    };
    
    // Store current circle
    this.currentCircle = typeof circleKey === 'number' ? 
      circleKey : Object.keys(AUDIO_PATHS.ambient).indexOf(circleKey);
    
    return source;
  }
  
  /**
   * Play music track
   * @param {string} musicKey - Key for the music track
   * @param {Object} options - Playback options
   */
  playMusic(musicKey, options = {}) {
    if (!this.initialized) return null;
    
    // Default options
    const defaultOptions = {
      loop: true,
      fadeIn: 2.0,
      fadeOut: 1.0,
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // If we already have this music track playing, just return it
    if (this.activeSounds.music?.key === musicKey) {
      return this.activeSounds.music.source;
    }
    
    // Get the buffer
    const buffer = this.audioBuffers.music[musicKey];
    
    // If buffer not loaded, try to load it
    if (!buffer) {
      const path = AUDIO_PATHS.music[musicKey];
      if (path) {
        this.loadAudioBuffer(path).then(loadedBuffer => {
          this.audioBuffers.music[musicKey] = loadedBuffer;
          this.playMusic(musicKey, options);
        });
      }
      return null;
    }
    
    // Fade out previous music if exists
    if (this.activeSounds.music) {
      this._fadeSoundOut(
        this.activeSounds.music.gain, 
        mergedOptions.fadeOut, 
        () => {
          this.activeSounds.music.source.stop();
          this.activeSounds.music = null;
        }
      );
    }
    
    // Create new music source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = mergedOptions.loop;
    
    // Create gain node for this source
    const gain = this.audioContext.createGain();
    
    // If fading in, start at 0
    if (mergedOptions.fadeIn > 0) {
      gain.gain.value = 0;
    }
    
    // Connect source to gain, then to music channel
    source.connect(gain);
    gain.connect(this.channels.music);
    
    // Start playback
    source.start();
    
    // If fading in, animate gain
    if (mergedOptions.fadeIn > 0) {
      this._fadeSoundIn(gain, mergedOptions.fadeIn);
    }
    
    // Store reference
    this.activeSounds.music = {
      source,
      gain,
      key: musicKey,
    };
    
    // Store current music state
    this.currentMusicState = musicKey;
    
    return source;
  }
  
  /**
   * Update music based on game state
   * @param {Object} gameState - Current game state
   */
  updateMusicState(gameState) {
    if (!this.initialized) return;
    
    let targetState = 'exploration';
    
    // Determine appropriate music based on state
    if (gameState.inCombat) {
      targetState = 'challenge';
    } else if (gameState.inDiscovery) {
      targetState = 'discovery';
    } else if (gameState.inTension) {
      targetState = 'tension';
    }
    
    // If state has changed, update music
    if (targetState !== this.currentMusicState) {
      this.playMusic(targetState);
    }
  }
  
  /**
   * Play a one-shot sound effect
   * @param {string} category - Category (ui, abilities, interactions, environment)
   * @param {string} key - Sound key within category
   * @param {Object} options - Playback options
   */
  playSfx(category, key, options = {}) {
    if (!this.initialized) return null;
    
    // Default options
    const defaultOptions = {
      volume: 1.0,
      pitch: 1.0,
      position: null, // Position for 3D sound
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Get the buffer
    const buffer = this.audioBuffers[category]?.[key];
    
    // If buffer not loaded, try to load it
    if (!buffer) {
      const path = AUDIO_PATHS[category]?.[key];
      if (path) {
        this.loadAudioBuffer(path).then(loadedBuffer => {
          this.audioBuffers[category][key] = loadedBuffer;
          this.playSfx(category, key, options);
        });
      }
      
      // For development, create a procedural sound
      return this.playProceduralSound(category, key, options);
    }
    
    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Apply pitch adjustment
    source.playbackRate.value = mergedOptions.pitch;
    
    // Create gain node for volume
    const gain = this.audioContext.createGain();
    gain.gain.value = mergedOptions.volume;
    
    // Connect source to gain
    source.connect(gain);
    
    // Determine target channel
    let targetChannel;
    switch (category) {
      case 'ui':
        targetChannel = this.channels.ui;
        break;
      case 'voice':
        targetChannel = this.channels.voice;
        break;
      default:
        targetChannel = this.channels.sfx;
    }
    
    // Create panner if position provided
    if (mergedOptions.position) {
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 360;
      panner.coneOuterGain = 0;
      
      // Set position
      const { x, y, z } = mergedOptions.position;
      
      if (panner.positionX) {
        // Modern API
        panner.positionX.value = x || 0;
        panner.positionY.value = y || 0;
        panner.positionZ.value = z || 0;
      } else {
        // Legacy API
        panner.setPosition(x || 0, y || 0, z || 0);
      }
      
      // Connect through panner
      gain.connect(panner);
      panner.connect(targetChannel);
      
      // Track this sound position if looping
      if (mergedOptions.loop) {
        this.soundPositions.set(source, mergedOptions.position);
      }
    } else {
      // Connect directly to channel
      gain.connect(targetChannel);
    }
    
    // Start playback
    source.start();
    
    // If looping, store reference
    if (mergedOptions.loop) {
      const id = `${category}_${key}_${Date.now()}`;
      this.activeSounds.loop[id] = {
        source,
        gain,
        category,
        key,
      };
      
      // Set up cleanup on end
      source.onended = () => {
        delete this.activeSounds.loop[id];
        this.soundPositions.delete(source);
      };
    } else {
      // Add to one-shot set and remove when finished
      this.activeSounds.oneShot.add(source);
      
      source.onended = () => {
        this.activeSounds.oneShot.delete(source);
      };
    }
    
    return source;
  }
  
  /**
   * Play a procedurally generated sound for development/placeholder purposes
   * @param {string} category - Sound category
   * @param {string} key - Sound key
   * @param {Object} options - Sound options
   */
  playProceduralSound(category, key, options = {}) {
    if (!this.initialized) return null;
    
    // Generate parameters based on category and key
    let type, frequency, modulationType, modulationFreq;
    
    switch (category) {
      case 'ui':
        type = 'sine';
        frequency = 660 + Math.random() * 220;
        
        switch (key) {
          case 'hover':
            frequency = 440;
            break;
          case 'click':
            frequency = 550;
            break;
          case 'success':
            frequency = 880;
            break;
          case 'error':
            frequency = 220;
            break;
          case 'notification':
            frequency = 660;
            break;
          case 'achievement':
            frequency = 990;
            break;
        }
        break;
        
      case 'abilities':
        type = 'sawtooth';
        frequency = 330 + Math.random() * 110;
        
        switch (key) {
          case 'phaseShift':
            type = 'sine';
            frequency = 880;
            break;
          case 'timeDilation':
            type = 'sawtooth';
            frequency = 220;
            break;
          case 'molecularReconstruction':
            type = 'square';
            frequency = 440;
            break;
          case 'quantumTeleportation':
            type = 'triangle';
            frequency = 660;
            break;
        }
        break;
        
      case 'interactions':
        type = 'triangle';
        frequency = 220 + Math.random() * 220;
        break;
        
      case 'environment':
        type = 'sawtooth';
        frequency = 110 + Math.random() * 110;
        break;
        
      default:
        type = 'sine';
        frequency = 440;
    }
    
    // Apply pitch adjustment
    frequency *= options.pitch || 1.0;
    
    // Create oscillator
    const oscillator = this._createMockOscillator(type, frequency);
    
    // Configure volume
    oscillator.gain.gain.value = (options.volume || 1.0) * 0.2;
    
    // Start oscillator
    oscillator.start();
    
    // Stop after appropriate duration
    let duration = 0.3; // Default
    
    switch (category) {
      case 'ui':
        duration = 0.15;
        break;
      case 'abilities':
        duration = 0.8;
        break;
      case 'interactions':
        duration = 0.4;
        break;
      case 'environment':
        duration = 1.2;
        break;
    }
    
    // Schedule stop
    setTimeout(() => {
      oscillator.stop();
    }, duration * 1000);
    
    return {
      stop: () => oscillator.stop()
    };
  }
  
  /**
   * Play a UI sound
   * @param {string} key - UI sound key
   * @param {Object} options - Playback options
   */
  playUiSound(key, options = {}) {
    return this.playSfx('ui', key, { ...options, category: 'ui' });
  }
  
  /**
   * Play an ability sound
   * @param {string} ability - Ability name
   * @param {Object} options - Playback options
   */
  playAbilitySound(ability, options = {}) {
    return this.playSfx('abilities', ability, { ...options, category: 'abilities' });
  }
  
  /**
   * Play an interaction sound
   * @param {string} interaction - Interaction type
   * @param {Object} options - Playback options
   */
  playInteractionSound(interaction, options = {}) {
    return this.playSfx('interactions', interaction, { ...options, category: 'interactions' });
  }
  
  /**
   * Play an environmental sound
   * @param {string} soundKey - Environment sound key
   * @param {Object} options - Playback options
   */
  playEnvironmentSound(soundKey, options = {}) {
    return this.playSfx('environment', soundKey, { ...options, category: 'environment' });
  }
  
  /**
   * Update all 3D sound positions
   */
  _update3DSounds() {
    // Update positions of all tracked sounds
    this.soundPositions.forEach((position, source) => {
      if (source.panner) {
        const { x, y, z } = position;
        
        if (source.panner.positionX) {
          // Modern API
          source.panner.positionX.value = x || 0;
          source.panner.positionY.value = y || 0;
          source.panner.positionZ.value = z || 0;
        } else {
          // Legacy API
          source.panner.setPosition(x || 0, y || 0, z || 0);
        }
      }
    });
  }
  
  /**
   * Update sound position
   * @param {AudioBufferSourceNode} source - The audio source
   * @param {Object} position - New position {x, y, z}
   */
  updateSoundPosition(source, position) {
    if (!source || !position) return;
    
    // Update tracked position
    this.soundPositions.set(source, position);
    
    // Apply to panner if it exists
    if (source.panner) {
      const { x, y, z } = position;
      
      if (source.panner.positionX) {
        // Modern API
        source.panner.positionX.value = x || 0;
        source.panner.positionY.value = y || 0;
        source.panner.positionZ.value = z || 0;
      } else {
        // Legacy API
        source.panner.setPosition(x || 0, y || 0, z || 0);
      }
    }
  }
  
  /**
   * Fade in a sound by animating its gain
   * @param {GainNode} gainNode - The gain node to animate
   * @param {number} duration - Fade duration in seconds
   */
  _fadeSoundIn(gainNode, duration) {
    const now = this.audioContext.currentTime;
    
    // Start from 0
    gainNode.gain.setValueAtTime(0, now);
    
    // Animate to 1
    gainNode.gain.linearRampToValueAtTime(1, now + duration);
  }
  
  /**
   * Fade out a sound by animating its gain
   * @param {GainNode} gainNode - The gain node to animate
   * @param {number} duration - Fade duration in seconds
   * @param {Function} onComplete - Callback when fade completes
   */
  _fadeSoundOut(gainNode, duration, onComplete) {
    const now = this.audioContext.currentTime;
    
    // Get current value
    const currentValue = gainNode.gain.value;
    
    // Start from current value
    gainNode.gain.setValueAtTime(currentValue, now);
    
    // Animate to 0
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    // Call onComplete after duration
    if (onComplete) {
      setTimeout(onComplete, duration * 1000);
    }
  }
  
  /**
   * Stop a sound with optional fade out
   * @param {AudioBufferSourceNode} source - The sound source to stop
   * @param {number} fadeOut - Fade out duration in seconds
   */
  stopSound(source, fadeOut = 0) {
    if (!source) return;
    
    // Find the associated gain node
    let gainNode = null;
    
    // Check active sounds
    if (this.activeSounds.ambient?.source === source) {
      gainNode = this.activeSounds.ambient.gain;
    } else if (this.activeSounds.music?.source === source) {
      gainNode = this.activeSounds.music.gain;
    } else {
      // Check looping sounds
      Object.values(this.activeSounds.loop).forEach(sound => {
        if (sound.source === source) {
          gainNode = sound.gain;
        }
      });
    }
    
    if (fadeOut > 0 && gainNode) {
      // Fade out then stop
      this._fadeSoundOut(gainNode, fadeOut, () => {
        try {
          source.stop();
        } catch (e) {
          // Ignore errors if already stopped
        }
      });
    } else {
      // Stop immediately
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }
  }
  
  /**
   * Get audio visualization data
   * @returns {Uint8Array} Frequency data array
   */
  getVisualizationData() {
    if (!this.initialized || !this.analyzer) return new Uint8Array(0);
    
    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
    this.analyzer.getByteFrequencyData(dataArray);
    
    return dataArray;
  }
  
  /**
   * Get audio loading progress
   * @returns {Object} Progress info { loaded, total, percent, completed }
   */
  getLoadingProgress() {
    const percent = this.loadingProgress.total > 0 ? 
      (this.loadingProgress.loaded / this.loadingProgress.total) * 100 : 100;
    
    return {
      loaded: this.loadingProgress.loaded,
      total: this.loadingProgress.total,
      percent,
      completed: this.loadingProgress.completed,
    };
  }
  
  /**
   * Resume audio context if suspended
   * (Browsers require user interaction to start audio)
   */
  resumeAudioContext() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
      return true;
    }
    return false;
  }
  
  /**
   * Clean up all audio resources
   */
  dispose() {
    if (!this.initialized) return;
    
    // Stop all sounds
    if (this.activeSounds.ambient) {
      this.activeSounds.ambient.source.stop();
    }
    
    if (this.activeSounds.music) {
      this.activeSounds.music.source.stop();
    }
    
    Object.values(this.activeSounds.loop).forEach(sound => {
      sound.source.stop();
    });
    
    this.activeSounds.oneShot.forEach(source => {
      source.stop();
    });
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Reset state
    this.initialized = false;
    this.audioContext = null;
    this.channels = {};
    this.activeSounds = {
      music: null,
      ambient: null,
      loop: {},
      oneShot: new Set(),
    };
    this.audioBuffers = {};
    this.soundPositions.clear();
  }
}

/**
 * Hook to use the audio system
 */
export const useQuantumAudio = () => {
  const quantumGame = useQuantumGame();
  const [audioManager] = useState(() => new AudioManager());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [visualizationData, setVisualizationData] = useState(new Uint8Array(0));
  const animationFrameRef = useRef(null);
  
  // Initialize audio system
  useEffect(() => {
    let isMounted = true;
    
    const initAudio = async () => {
      const success = await audioManager.initialize();
      
      if (isMounted && success) {
        setIsInitialized(true);
        
        // Auto-start ambient if active
        if (isActive) {
          audioManager.playAmbient('surface');
          audioManager.playMusic('exploration');
        }
      }
    };
    
    if (!isInitialized) {
      initAudio();
    }
    
    return () => {
      isMounted = false;
    };
  }, [isInitialized]);
  
  // Handle visualization updates
  useEffect(() => {
    if (!isInitialized || !isActive) return;
    
    const updateVisualization = () => {
      setVisualizationData(audioManager.getVisualizationData());
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };
    
    updateVisualization();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, isActive]);
  
  // Handle game state changes
  useEffect(() => {
    if (!isInitialized || !isActive) return;
    
    // Update based on game state
    const handleGameStateChange = () => {
      const currentCircle = quantumGame.progression.currentCircle || 0;
      
      // Update ambient sound based on circle
      audioManager.playAmbient(currentCircle);
      
      // Update music based on game state
      audioManager.updateMusicState({
        inCombat: quantumGame.session.combatState === 'combat',
        inDiscovery: Boolean(quantumGame.currentMission),
        inTension: quantumGame.session.combatState === 'tension',
      });
    };
    
    // Initial update
    handleGameStateChange();
    
    // Could set up subscription to game state changes here
    // For now, we'll assume the hook will be re-rendered when game state changes
  }, [isInitialized, isActive, quantumGame]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  /**
   * Start the audio system
   */
  const startAudio = useCallback(() => {
    if (!isInitialized) return false;
    
    // Resume audio context (needed for autoplay policies)
    audioManager.resumeAudioContext();
    
    // Start ambient and music
    audioManager.playAmbient('surface');
    audioManager.playMusic('exploration');
    
    // Set active
    setIsActive(true);
    
    return true;
  }, [isInitialized]);
  
  /**
   * Stop the audio system
   */
  const stopAudio = useCallback(() => {
    if (!isInitialized) return false;
    
    // Stop ambient and music
    if (audioManager.activeSounds.ambient) {
      audioManager.stopSound(audioManager.activeSounds.ambient.source, 1.0);
    }
    
    if (audioManager.activeSounds.music) {
      audioManager.stopSound(audioManager.activeSounds.music.source, 1.0);
    }
    
    // Set inactive
    setIsActive(false);
    
    return true;
  }, [isInitialized]);
  
  /**
   * Set volume for a channel
   */
  const setVolume = useCallback((channel, volume) => {
    if (!isInitialized) return false;
    
    audioManager.setVolume(channel, volume);
    return true;
  }, [isInitialized]);
  
  /**
   * Set mute state for a channel
   */
  const setMute = useCallback((channel, mute) => {
    if (!isInitialized) return false;
    
    audioManager.setMute(channel, mute);
    return true;
  }, [isInitialized]);
  
  /**
   * Play a UI sound
   */
  const playUiSound = useCallback((soundKey, options = {}) => {
    if (!isInitialized || !isActive) return null;
    
    return audioManager.playUiSound(soundKey, options);
  }, [isInitialized, isActive]);
  
  /**
   * Play an ability sound
   */
  const playAbilitySound = useCallback((ability, options = {}) => {
    if (!isInitialized || !isActive) return null;
    
    return audioManager.playAbilitySound(ability, options);
  }, [isInitialized, isActive]);
  
  /**
   * Play an interaction sound
   */
  const playInteractionSound = useCallback((interaction, options = {}) => {
    if (!isInitialized || !isActive) return null;
    
    return audioManager.playInteractionSound(interaction, options);
  }, [isInitialized, isActive]);
  
  /**
   * Update listener position (for 3D audio)
   */
  const updateListenerPosition = useCallback((position, orientation) => {
    if (!isInitialized || !isActive) return false;
    
    audioManager.updateListener(position, orientation);
    return true;
  }, [isInitialized, isActive]);
  
  return {
    isInitialized,
    isActive,
    startAudio,
    stopAudio,
    setVolume,
    setMute,
    playUiSound,
    playAbilitySound,
    playInteractionSound,
    updateListenerPosition,
    visualizationData,
  };
};

export default useQuantumAudio;