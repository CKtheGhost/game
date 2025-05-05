import * as THREE from 'three';
import { gsap } from 'gsap';
import { EventEmitter } from 'events';

/**
 * CinematicSystem - Handles in-game cinematics, cutscenes, and scripted sequences
 */
class CinematicSystem extends EventEmitter {
  constructor(container, storyEngine) {
    super();
    
    // Core components
    this.container = container;
    this.storyEngine = storyEngine;
    
    // Track active cinematic
    this.activeCinematic = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSceneIndex = 0;
    
    // Cinematic elements
    this.elements = {
      overlay: null,
      videoPlayer: null,
      subtitles: null,
      newsChyron: null,
      skipButton: null,
      imageContainer: null,
      interactiveContainer: null,
    };
    
    // Audio elements
    this.audio = {
      music: null,
      ambience: null,
      voiceover: null,
      effects: null,
    };
    
    // 3D scene for realtime cinematics
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Animation timelines
    this.timeline = null;
    this.sceneTimelines = [];
    
    // Cached assets
    this.cachedAssets = {
      textures: {},
      videos: {},
      audio: {},
      models: {},
    };
    
    // Event listeners
    this.eventListeners = {};
    
    // Initialize system
    this._initialize();
  }
  
  /**
   * Initialize the cinematic system
   * @private
   */
  _initialize() {
    // Create DOM container for cinematic elements
    this._createDOMElements();
    
    // Initialize 3D scene for realtime cinematics
    this._initializeScene();
    
    // Set up event listeners
    this._setupEventListeners();
  }
  
  /**
   * Create necessary DOM elements for cinematics
   * @private
   */
  _createDOMElements() {
    // Create container for cinematic elements if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'cinematic-container';
      document.body.appendChild(this.container);
    }
    
    // Style container
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'none';
    this.container.style.zIndex = '1000';
    this.container.style.backgroundColor = '#000';
    this.container.style.overflow = 'hidden';
    
    // Create cinematic overlay
    this.elements.overlay = document.createElement('div');
    this.elements.overlay.className = 'cinematic-overlay';
    this.elements.overlay.style.position = 'absolute';
    this.elements.overlay.style.top = '0';
    this.elements.overlay.style.left = '0';
    this.elements.overlay.style.width = '100%';
    this.elements.overlay.style.height = '100%';
    this.elements.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.elements.overlay.style.zIndex = '1';
    this.elements.overlay.style.display = 'none';
    this.container.appendChild(this.elements.overlay);
    
    // Create video player
    this.elements.videoPlayer = document.createElement('video');
    this.elements.videoPlayer.className = 'cinematic-video';
    this.elements.videoPlayer.style.position = 'absolute';
    this.elements.videoPlayer.style.width = '100%';
    this.elements.videoPlayer.style.height = '100%';
    this.elements.videoPlayer.style.objectFit = 'cover';
    this.elements.videoPlayer.style.zIndex = '1';
    this.elements.videoPlayer.playsInline = true;
    this.elements.videoPlayer.muted = false;
    this.container.appendChild(this.elements.videoPlayer);
    
    // Create image container
    this.elements.imageContainer = document.createElement('div');
    this.elements.imageContainer.className = 'cinematic-image';
    this.elements.imageContainer.style.position = 'absolute';
    this.elements.imageContainer.style.width = '100%';
    this.elements.imageContainer.style.height = '100%';
    this.elements.imageContainer.style.backgroundSize = 'cover';
    this.elements.imageContainer.style.backgroundPosition = 'center';
    this.elements.imageContainer.style.zIndex = '2';
    this.elements.imageContainer.style.display = 'none';
    this.container.appendChild(this.elements.imageContainer);
    
    // Create subtitles
    this.elements.subtitles = document.createElement('div');
    this.elements.subtitles.className = 'cinematic-subtitles';
    this.elements.subtitles.style.position = 'absolute';
    this.elements.subtitles.style.bottom = '10%';
    this.elements.subtitles.style.left = '50%';
    this.elements.subtitles.style.transform = 'translateX(-50%)';
    this.elements.subtitles.style.width = '80%';
    this.elements.subtitles.style.padding = '20px';
    this.elements.subtitles.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.elements.subtitles.style.color = 'white';
    this.elements.subtitles.style.fontFamily = 'Arial, sans-serif';
    this.elements.subtitles.style.fontSize = '1.2em';
    this.elements.subtitles.style.textAlign = 'center';
    this.elements.subtitles.style.borderRadius = '5px';
    this.elements.subtitles.style.zIndex = '10';
    this.container.appendChild(this.elements.subtitles);
    
    // Create news chyron
    this.elements.newsChyron = document.createElement('div');
    this.elements.newsChyron.className = 'news-chyron';
    this.elements.newsChyron.style.position = 'absolute';
    this.elements.newsChyron.style.bottom = '5%';
    this.elements.newsChyron.style.left = '0';
    this.elements.newsChyron.style.width = '100%';
    this.elements.newsChyron.style.padding = '15px';
    this.elements.newsChyron.style.backgroundColor = 'rgba(200, 0, 0, 0.8)';
    this.elements.newsChyron.style.color = 'white';
    this.elements.newsChyron.style.fontFamily = 'Arial, sans-serif';
    this.elements.newsChyron.style.fontSize = '1em';
    this.elements.newsChyron.style.zIndex = '11';
    this.elements.newsChyron.style.display = 'none';
    this.elements.newsChyron.innerHTML = '<span class="chyron-text">BREAKING NEWS</span>';
    this.container.appendChild(this.elements.newsChyron);
    
    // Create skip button
    this.elements.skipButton = document.createElement('button');
    this.elements.skipButton.className = 'cinematic-skip';
    this.elements.skipButton.textContent = 'Skip';
    this.elements.skipButton.style.position = 'absolute';
    this.elements.skipButton.style.top = '20px';
    this.elements.skipButton.style.right = '20px';
    this.elements.skipButton.style.padding = '10px 20px';
    this.elements.skipButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.elements.skipButton.style.color = 'white';
    this.elements.skipButton.style.border = '1px solid white';
    this.elements.skipButton.style.borderRadius = '5px';
    this.elements.skipButton.style.cursor = 'pointer';
    this.elements.skipButton.style.zIndex = '20';
    this.elements.skipButton.style.display = 'none';
    this.container.appendChild(this.elements.skipButton);
    
    // Create interactive container
    this.elements.interactiveContainer = document.createElement('div');
    this.elements.interactiveContainer.className = 'interactive-container';
    this.elements.interactiveContainer.style.position = 'absolute';
    this.elements.interactiveContainer.style.bottom = '20%';
    this.elements.interactiveContainer.style.left = '50%';
    this.elements.interactiveContainer.style.transform = 'translateX(-50%)';
    this.elements.interactiveContainer.style.width = '60%';
    this.elements.interactiveContainer.style.padding = '20px';
    this.elements.interactiveContainer.style.backgroundColor = 'rgba(0, 50, 100, 0.8)';
    this.elements.interactiveContainer.style.color = 'white';
    this.elements.interactiveContainer.style.fontFamily = 'Arial, sans-serif';
    this.elements.interactiveContainer.style.borderRadius = '10px';
    this.elements.interactiveContainer.style.zIndex = '15';
    this.elements.interactiveContainer.style.display = 'none';
    this.container.appendChild(this.elements.interactiveContainer);
    
    // Create audio elements
    this.audio.music = new Audio();
    this.audio.music.loop = true;
    this.audio.music.volume = 0.4;
    
    this.audio.ambience = new Audio();
    this.audio.ambience.loop = true;
    this.audio.ambience.volume = 0.2;
    
    this.audio.voiceover = new Audio();
    this.audio.voiceover.volume = 1.0;
    
    this.audio.effects = new Audio();
    this.audio.effects.volume = 0.7;
  }
  
  /**
   * Initialize 3D scene for realtime cinematics
   * @private
   */
  _initializeScene() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 5;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.zIndex = '0';
    this.renderer.domElement.style.display = 'none';
    this.container.appendChild(this.renderer.domElement);
    
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Skip button click
    this.elements.skipButton.addEventListener('click', () => {
      this.skipCinematic();
    });
    
    // Video ended
    this.elements.videoPlayer.addEventListener('ended', () => {
      this._advanceToNextScene();
    });
    
    // Escape key to skip
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isPlaying) {
        this.skipCinematic();
      } else if (event.key === ' ' && this.isPlaying) {
        // Space to pause/resume
        this.togglePause();
      }
    });
  }
  
  /**
   * Play a cinematic by ID
   * @param {string} cinematicId ID of the cinematic to play
   * @param {Object} options Optional configuration
   * @returns {Promise} Resolves when cinematic completes or is skipped
   */
  async playCinematic(cinematicId, options = {}) {
    // Check if another cinematic is already playing
    if (this.isPlaying) {
      console.warn('Another cinematic is already playing.');
      return false;
    }
    
    // Get cinematic data from story engine
    const cinematicData = this.storyEngine?.StoryData?.cinematics?.[cinematicId];
    
    if (!cinematicData) {
      console.error(`Cinematic with ID "${cinematicId}" not found.`);
      return false;
    }
    
    // Store active cinematic
    this.activeCinematic = cinematicData;
    this.currentSceneIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    
    // Create a promise to resolve when cinematic completes
    return new Promise((resolve) => {
      // Store resolve function to call when cinematic ends
      this._completionCallback = resolve;
      
      // Show cinematic container
      this.container.style.display = 'block';
      
      // Show skip button if cinematic is skippable
      if (cinematicData.skippable) {
        this.elements.skipButton.style.display = 'block';
      } else {
        this.elements.skipButton.style.display = 'none';
      }
      
      // Start playing the first scene
      this._playCurrentScene();
      
      // Emit event
      this.emit('cinematicStarted', { id: cinematicId, data: cinematicData });
    });
  }
  
  /**
   * Skip the current cinematic
   */
  skipCinematic() {
    if (!this.isPlaying || !this.activeCinematic) return;
    
    // Check if cinematic is skippable
    if (!this.activeCinematic.skippable) {
      console.warn('This cinematic cannot be skipped.');
      return;
    }
    
    // Clean up current scene
    this._cleanupCurrentScene();
    
    // Reset state
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSceneIndex = 0;
    
    // Hide cinematic elements
    this._hideAllElements();
    
    // Emit event
    this.emit('cinematicSkipped', { id: this.activeCinematic.id });
    
    // Resolve promise if it exists
    if (this._completionCallback) {
      this._completionCallback({ skipped: true, cinematicId: this.activeCinematic.id });
      this._completionCallback = null;
    }
    
    // Clear active cinematic
    this.activeCinematic = null;
  }
  
  /**
   * Pause or resume the current cinematic
   */
  togglePause() {
    if (!this.isPlaying || !this.activeCinematic) return;
    
    if (this.isPaused) {
      // Resume
      this.isPaused = false;
      
      // Resume video if playing
      if (this.elements.videoPlayer.src) {
        this.elements.videoPlayer.play();
      }
      
      // Resume audio
      Object.values(this.audio).forEach(audio => {
        if (!audio.paused && audio.src) {
          audio.play();
        }
      });
      
      // Resume timelines
      if (this.timeline) {
        this.timeline.play();
      }
      
      // Emit event
      this.emit('cinematicResumed', { id: this.activeCinematic.id });
    } else {
      // Pause
      this.isPaused = true;
      
      // Pause video if playing
      if (this.elements.videoPlayer.src) {
        this.elements.videoPlayer.pause();
      }
      
      // Pause audio
      Object.values(this.audio).forEach(audio => {
        if (!audio.paused && audio.src) {
          audio.pause();
        }
      });
      
      // Pause timelines
      if (this.timeline) {
        this.timeline.pause();
      }
      
      // Emit event
      this.emit('cinematicPaused', { id: this.activeCinematic.id });
    }
  }
  
  /**
   * Play the current scene
   * @private
   */
  _playCurrentScene() {
    if (!this.activeCinematic || !this.isPlaying) return;
    
    // Get current scene
    const scene = this.activeCinematic.scenes[this.currentSceneIndex];
    
    if (!scene) {
      // No more scenes, end cinematic
      this._completeCinematic();
      return;
    }
    
    // Reset any previous scene elements
    this._resetSceneElements();
    
    // Create new timeline for this scene
    this.timeline = gsap.timeline({
      onComplete: () => this._advanceToNextScene(),
    });
    
    // Handle different scene types
    switch (scene.type) {
      case 'news_broadcast':
        this._playNewsBroadcastScene(scene);
        break;
        
      case 'footage':
        this._playFootageScene(scene);
        break;
        
      case 'interview':
        this._playInterviewScene(scene);
        break;
        
      case 'lab_scene':
        this._playLabScene(scene);
        break;
        
      case 'closeup':
        this._playCloseupScene(scene);
        break;
        
      case 'scene':
        this._playGenericScene(scene);
        break;
        
      case 'montage':
        this._playMontageScene(scene);
        break;
        
      case 'briefing_room':
        this._playBriefingRoomScene(scene);
        break;
        
      case 'hologram_presentation':
        this._playHologramScene(scene);
        break;
        
      case 'character_focus':
        this._playCharacterFocusScene(scene);
        break;
        
      case 'epilogue':
        this._playEpilogueScene(scene);
        break;
        
      default:
        this._playGenericScene(scene);
        break;
    }
    
    // Emit event
    this.emit('sceneStarted', { 
      cinematicId: this.activeCinematic.id, 
      sceneIndex: this.currentSceneIndex,
      sceneType: scene.type
    });
  }
  
  /**
   * Advance to the next scene
   * @private
   */
  _advanceToNextScene() {
    if (!this.isPlaying || !this.activeCinematic) return;
    
    // Clean up current scene
    this._cleanupCurrentScene();
    
    // Advance scene index
    this.currentSceneIndex++;
    
    // Check if we've reached the end
    if (this.currentSceneIndex >= this.activeCinematic.scenes.length) {
      this._completeCinematic();
      return;
    }
    
    // Play next scene
    this._playCurrentScene();
  }
  
  /**
   * Complete the cinematic
   * @private
   */
  _completeCinematic() {
    if (!this.isPlaying || !this.activeCinematic) return;
    
    // Reset state
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSceneIndex = 0;
    
    // Hide cinematic elements
    this._hideAllElements();
    
    // Emit event
    this.emit('cinematicCompleted', { id: this.activeCinematic.id });
    
    // Resolve promise if it exists
    if (this._completionCallback) {
      this._completionCallback({ completed: true, cinematicId: this.activeCinematic.id });
      this._completionCallback = null;
    }
    
    // Store completed cinematic ID
    const completedId = this.activeCinematic.id;
    
    // Clear active cinematic
    this.activeCinematic = null;
    
    // Notify story engine
    if (this.storyEngine) {
      this.storyEngine.triggerEvent(`cinematic_complete_${completedId}`);
    }
  }
  
  /**
   * Clean up the current scene
   * @private
   */
  _cleanupCurrentScene() {
    // Clear timelines
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    
    // Stop audio
    Object.values(this.audio).forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    
    // Clear video
    this.elements.videoPlayer.pause();
    this.elements.videoPlayer.src = '';
    
    // Reset scene-specific elements
    this._resetSceneElements();
  }
  
  /**
   * Reset scene elements to default state
   * @private
   */
  _resetSceneElements() {
    // Hide all elements first
    this._hideAllElements();
    
    // Clear text content
    this.elements.subtitles.textContent = '';
    this.elements.newsChyron.innerHTML = '<span class="chyron-text">BREAKING NEWS</span>';
    this.elements.interactiveContainer.innerHTML = '';
    
    // Reset styles
    this.elements.imageContainer.style.backgroundImage = '';
    
    // Reset 3D scene
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      if (object.material) object.material.dispose();
      if (object.geometry) object.geometry.dispose();
      this.scene.remove(object);
    }
    
    // Add back basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }
  
  /**
   * Hide all cinematic elements
   * @private
   */
  _hideAllElements() {
    this.elements.overlay.style.display = 'none';
    this.elements.videoPlayer.style.display = 'none';
    this.elements.subtitles.style.display = 'none';
    this.elements.newsChyron.style.display = 'none';
    this.elements.skipButton.style.display = 'none';
    this.elements.imageContainer.style.display = 'none';
    this.elements.interactiveContainer.style.display = 'none';
    this.renderer.domElement.style.display = 'none';
    this.container.style.display = 'none';
  }
  
  // Scene-specific playback methods
  
  /**
   * Play a news broadcast scene
   * @param {Object} scene Scene data
   * @private
   */
  _playNewsBroadcastScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    this.elements.newsChyron.style.display = 'block';
    
    // Set background
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
    }
    
    // Animate subtitle text
    if (scene.text) {
      this.elements.subtitles.textContent = '';
      
      // Type writer effect for text
      const words = scene.text.split(' ');
      let currentIndex = 0;
      
      const intervalId = setInterval(() => {
        if (currentIndex < words.length) {
          this.elements.subtitles.textContent += words[currentIndex] + ' ';
          currentIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 100);
      
      // Clear interval if scene is skipped
      this.timeline.call(() => clearInterval(intervalId), null, scene.duration - 0.5);
    }
    
    // Animate news chyron
    gsap.to('.chyron-text', {
      duration: scene.duration,
      xPercent: -100,
      ease: 'linear',
      repeat: 1,
    });
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a footage scene
   * @param {Object} scene Scene data
   * @private
   */
  _playFootageScene(scene) {
    // Show necessary elements
    this.elements.videoPlayer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set video source
    this.elements.videoPlayer.src = `assets/videos/cinematics/${scene.background}.mp4`;
    this.elements.videoPlayer.play();
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.ambience.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.ambience.play();
    }
    
    // Animate subtitle text
    if (scene.text) {
      this.elements.subtitles.textContent = '';
      
      // Fade in text
      this.timeline.to(this.elements.subtitles, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.elements.subtitles.textContent = scene.text;
        }
      });
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 1,
        duration: 0.5,
      });
    }
    
    // Set duration based on video or provided duration
    if (this.elements.videoPlayer.duration) {
      this.timeline.to({}, { duration: this.elements.videoPlayer.duration });
    } else {
      this.timeline.to({}, { duration: scene.duration });
    }
  }
  
  /**
   * Play an interview scene
   * @param {Object} scene Scene data
   * @private
   */
  _playInterviewScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.voiceover.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.voiceover.play();
    }
    
    // Animate subtitle text - interview style with quotation
    if (scene.text) {
      this.elements.subtitles.innerHTML = '';
      
      // Split text into speaker and content
      const parts = scene.text.split(': ');
      if (parts.length === 2) {
        const speaker = parts[0];
        const content = parts[1];
        
        // Create speaker element
        const speakerEl = document.createElement('div');
        speakerEl.className = 'speaker';
        speakerEl.textContent = speaker + ':';
        speakerEl.style.fontWeight = 'bold';
        speakerEl.style.marginBottom = '5px';
        speakerEl.style.color = '#88ccff';
        
        // Create content element
        const contentEl = document.createElement('div');
        contentEl.className = 'content';
        contentEl.textContent = '';
        
        // Add to subtitles
        this.elements.subtitles.appendChild(speakerEl);
        this.elements.subtitles.appendChild(contentEl);
        
        // Type writer effect for content
        const words = content.split(' ');
        let currentIndex = 0;
        
        const intervalId = setInterval(() => {
          if (currentIndex < words.length) {
            contentEl.textContent += words[currentIndex] + ' ';
            currentIndex++;
          } else {
            clearInterval(intervalId);
          }
        }, 100);
        
        // Clear interval if scene is skipped
        this.timeline.call(() => clearInterval(intervalId), null, scene.duration - 0.5);
      } else {
        // Just show the whole text if not in expected format
        this.elements.subtitles.textContent = scene.text;
      }
    }
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a lab scene
   * @param {Object} scene Scene data
   * @private
   */
  _playLabScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
      
      // Add lab ambience
      this.audio.ambience.src = 'assets/audio/cinematics/lab_ambience.mp3';
      this.audio.ambience.play();
    }
    
    // Animate subtitle text
    if (scene.text) {
      this.elements.subtitles.textContent = '';
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.elements.subtitles.textContent = scene.text;
        }
      });
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 1,
        duration: 0.5,
      });
    }
    
    // Add some dynamic element animations to simulate lab activity
    const labOverlay = document.createElement('div');
    labOverlay.className = 'lab-overlay';
    labOverlay.style.position = 'absolute';
    labOverlay.style.top = '0';
    labOverlay.style.left = '0';
    labOverlay.style.width = '100%';
    labOverlay.style.height = '100%';
    labOverlay.style.zIndex = '5';
    labOverlay.style.pointerEvents = 'none';
    this.container.appendChild(labOverlay);
    
    // Add holographic elements
    for (let i = 0; i < 5; i++) {
      const holo = document.createElement('div');
      holo.className = 'hologram';
      holo.style.position = 'absolute';
      holo.style.width = `${20 + Math.random() * 30}px`;
      holo.style.height = `${20 + Math.random() * 30}px`;
      holo.style.borderRadius = '50%';
      holo.style.background = 'radial-gradient(circle, rgba(0,255,255,0.7) 0%, rgba(0,200,255,0.3) 70%, rgba(0,100,255,0) 100%)';
      holo.style.boxShadow = '0 0 10px rgba(0,255,255,0.7)';
      holo.style.left = `${Math.random() * 80 + 10}%`;
      holo.style.top = `${Math.random() * 80 + 10}%`;
      labOverlay.appendChild(holo);
      
      // Animate hologram
      gsap.to(holo, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        scale: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 5 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
    
    // Clean up on scene end
    this.timeline.call(() => {
      if (labOverlay.parentNode) {
        labOverlay.parentNode.removeChild(labOverlay);
      }
    }, null, scene.duration - 0.1);
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a closeup scene
   * @param {Object} scene Scene data
   * @private
   */
  _playCloseupScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background with zoom effect
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    this.elements.imageContainer.style.backgroundSize = '120%';
    this.elements.imageContainer.style.backgroundPosition = 'center 30%';
    
    // Animate zoom
    gsap.to(this.elements.imageContainer, {
      backgroundSize: '140%',
      duration: scene.duration,
      ease: 'power1.inOut',
    });
    
    // Play audio track if provided
    if (scene.audioTrack) {
      // Add a dramatic sound effect
      this.audio.effects.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.effects.play();
    }
    
    // Animate subtitle text
    if (scene.text) {
      this.elements.subtitles.textContent = '';
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.elements.subtitles.textContent = scene.text;
        }
      });
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 1,
        duration: 0.5,
      });
    }
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a generic scene
   * @param {Object} scene Scene data
   * @private
   */
  _playGenericScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
    }
    
    // Animate subtitle text - dialogue style
    if (scene.text) {
      this.elements.subtitles.innerHTML = '';
      
      // Check if this is dialogue (contains character name and colon)
      if (scene.text.includes(':')) {
        // Split text into speaker and content
        const parts = scene.text.split(': ');
        if (parts.length >= 2) {
          const speaker = parts[0];
          const content = parts.slice(1).join(': '); // In case there are other colons
          
          // Create speaker element
          const speakerEl = document.createElement('div');
          speakerEl.className = 'speaker';
          speakerEl.textContent = speaker + ':';
          speakerEl.style.fontWeight = 'bold';
          speakerEl.style.marginBottom = '5px';
          speakerEl.style.color = '#ffcc00';
          
          // Create content element
          const contentEl = document.createElement('div');
          contentEl.className = 'content';
          contentEl.textContent = '';
          
          // Add to subtitles
          this.elements.subtitles.appendChild(speakerEl);
          this.elements.subtitles.appendChild(contentEl);
          
          // Type writer effect for content
          const words = content.split(' ');
          let currentIndex = 0;
          
          const intervalId = setInterval(() => {
            if (currentIndex < words.length) {
              contentEl.textContent += words[currentIndex] + ' ';
              currentIndex++;
            } else {
              clearInterval(intervalId);
            }
          }, 100);
          
          // Clear interval if scene is skipped
          this.timeline.call(() => clearInterval(intervalId), null, scene.duration - 0.5);
        }
      } else {
        // Regular text, no speaker
        this.elements.subtitles.textContent = scene.text;
      }
    }
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a montage scene
   * @param {Object} scene Scene data
   * @private
   */
  _playMontageScene(scene) {
    // Show necessary elements
    this.renderer.domElement.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Create a montage of images in 3D space
    const imageCount = 5;
    const images = [];
    
    // Create image planes
    for (let i = 0; i < imageCount; i++) {
      const texture = new THREE.TextureLoader().load(
        `assets/images/cinematics/${scene.background}_${i + 1}.jpg`
      );
      
      const geometry = new THREE.PlaneGeometry(5, 3);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      
      const plane = new THREE.Mesh(geometry, material);
      plane.position.z = -10;
      plane.position.x = (Math.random() - 0.5) * 20;
      plane.position.y = (Math.random() - 0.5) * 10;
      plane.rotation.z = (Math.random() - 0.5) * 0.2;
      
      this.scene.add(plane);
      images.push(plane);
      
      // Cache texture for cleanup
      this.cachedAssets.textures[`${scene.background}_${i + 1}`] = texture;
    }
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
    }
    
    // Animate subtitle text
    if (scene.text) {
      this.elements.subtitles.textContent = '';
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.elements.subtitles.textContent = scene.text;
        }
      });
      
      this.timeline.to(this.elements.subtitles, {
        opacity: 1,
        duration: 0.5,
      });
    }
    
    // Animate each image in sequence
    const imageDuration = scene.duration / imageCount;
    
    for (let i = 0; i < imageCount; i++) {
      const plane = images[i];
      
      // Fade in
      this.timeline.to(plane.material, {
        opacity: 1,
        duration: 0.5,
      }, i * imageDuration);
      
      // Move forward
      this.timeline.to(plane.position, {
        z: 2,
        duration: imageDuration - 0.5,
        ease: 'power1.in',
      }, i * imageDuration);
      
      // Fade out
      this.timeline.to(plane.material, {
        opacity: 0,
        duration: 0.5,
      }, (i + 0.8) * imageDuration);
    }
    
    // Animation loop for the scene
    const animate = () => {
      if (!this.isPlaying || this.currentSceneIndex !== this.activeCinematic.scenes.indexOf(scene)) {
        return;
      }
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
      
      // Request next frame
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a briefing room scene
   * @param {Object} scene Scene data
   * @private
   */
  _playBriefingRoomScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
      
      // Add briefing room ambience
      this.audio.ambience.src = 'assets/audio/cinematics/briefing_ambience.mp3';
      this.audio.ambience.play();
    }
    
    // Animate subtitle text - dialogue style
    if (scene.text) {
      this.elements.subtitles.innerHTML = '';
      
      // Check if this is dialogue (contains character name and colon)
      if (scene.text.includes(':')) {
        // Split text into speaker and content
        const parts = scene.text.split(': ');
        if (parts.length >= 2) {
          const speaker = parts[0];
          const content = parts.slice(1).join(': '); // In case there are other colons
          
          // Create speaker element
          const speakerEl = document.createElement('div');
          speakerEl.className = 'speaker';
          speakerEl.textContent = speaker + ':';
          speakerEl.style.fontWeight = 'bold';
          speakerEl.style.marginBottom = '5px';
          speakerEl.style.color = '#ffcc00';
          
          // Create content element
          const contentEl = document.createElement('div');
          contentEl.className = 'content';
          contentEl.textContent = '';
          
          // Add to subtitles
          this.elements.subtitles.appendChild(speakerEl);
          this.elements.subtitles.appendChild(contentEl);
          
          // Type writer effect for content
          const words = content.split(' ');
          let currentIndex = 0;
          
          const intervalId = setInterval(() => {
            if (currentIndex < words.length) {
              contentEl.textContent += words[currentIndex] + ' ';
              currentIndex++;
            } else {
              clearInterval(intervalId);
            }
          }, 100);
          
          // Clear interval if scene is skipped
          this.timeline.call(() => clearInterval(intervalId), null, scene.duration - 0.5);
        }
      } else {
        // Regular text, no speaker
        this.elements.subtitles.textContent = scene.text;
      }
    }
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a hologram presentation scene
   * @param {Object} scene Scene data
   * @private
   */
  _playHologramScene(scene) {
    // Show necessary elements
    this.renderer.domElement.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Create holographic display in 3D
    // Create a circular platform
    const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 32);
    const platformMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      emissive: 0x111111,
      shininess: 100
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -2;
    platform.position.z = -5;
    this.scene.add(platform);
    
    // Create holographic projection
    const holoGeometry = new THREE.SphereGeometry(2, 32, 32);
    const holoMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00aaaa,
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });
    const hologram = new THREE.Mesh(holoGeometry, holoMaterial);
    hologram.position.y = 0;
    hologram.position.z = -5;
    this.scene.add(hologram);
    
    // Create particle system for hologram
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Create particles in a spherical shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2 * Math.pow(Math.random(), 1/3);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.position.y = 0;
    particleSystem.position.z = -5;
    this.scene.add(particleSystem);
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
      
      // Add hologram hum
      this.audio.ambience.src = 'assets/audio/cinematics/hologram_hum.mp3';
      this.audio.ambience.play();
    }
    
    // Animate subtitle text - dialogue style
    if (scene.text) {
      this.elements.subtitles.innerHTML = '';
      
      // Check if this is dialogue (contains character name and colon)
      if (scene.text.includes(':')) {
        // Split text into speaker and content
        const parts = scene.text.split(': ');
        if (parts.length >= 2) {
          const speaker = parts[0];
          const content = parts.slice(1).join(': '); // In case there are other colons
          
          // Create speaker element
          const speakerEl = document.createElement('div');
          speakerEl.className = 'speaker';
          speakerEl.textContent = speaker + ':';
          speakerEl.style.fontWeight = 'bold';
          speakerEl.style.marginBottom = '5px';
          speakerEl.style.color = '#00ffff';
          
          // Create content element
          const contentEl = document.createElement('div');
          contentEl.className = 'content';
          contentEl.textContent = '';
          
          // Add to subtitles
          this.elements.subtitles.appendChild(speakerEl);
          this.elements.subtitles.appendChild(contentEl);
          
          // Type writer effect for content
          const words = content.split(' ');
          let currentIndex = 0;
          
          const intervalId = setInterval(() => {
            if (currentIndex < words.length) {
              contentEl.textContent += words[currentIndex] + ' ';
              currentIndex++;
            } else {
              clearInterval(intervalId);
            }
          }, 100);
          
          // Clear interval if scene is skipped
          this.timeline.call(() => clearInterval(intervalId), null, scene.duration - 0.5);
        }
      } else {
        // Regular text, no speaker
        this.elements.subtitles.textContent = scene.text;
      }
    }
    
    // Animation loop for the scene
    const animate = () => {
      if (!this.isPlaying || this.currentSceneIndex !== this.activeCinematic.scenes.indexOf(scene)) {
        return;
      }
      
      // Rotate hologram
      hologram.rotation.y += 0.005;
      particleSystem.rotation.y -= 0.002;
      
      // Pulsate hologram
      const scale = 1 + 0.05 * Math.sin(Date.now() * 0.002);
      hologram.scale.set(scale, scale, scale);
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
      
      // Request next frame
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Play a character focus scene
   * @param {Object} scene Scene data
   * @private
   */
  _playCharacterFocusScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background with focus effect
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Add a vignette overlay for focus effect
    const focusOverlay = document.createElement('div');
    focusOverlay.className = 'focus-overlay';
    focusOverlay.style.position = 'absolute';
    focusOverlay.style.top = '0';
    focusOverlay.style.left = '0';
    focusOverlay.style.width = '100%';
    focusOverlay.style.height = '100%';
    focusOverlay.style.background = 'radial-gradient(circle at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.8) 100%)';
    focusOverlay.style.zIndex = '4';
    this.container.appendChild(focusOverlay);
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.play();
    }
    
    // Animate subtitle text - dialogue style
    if (scene.text) {
      this.elements.subtitles.innerHTML = '';
      
      // Check if this is dialogue (contains character name and colon)
      if (scene.text.includes(':')) {
        // Split text into speaker and content
        const parts = scene.text.split(': ');
        if (parts.length >= 2) {
          const speaker = parts[0];
          const content = parts.slice(1).join(': '); // In case there are other colons
          
          // Create speaker element
          const speakerEl = document.createElement('div');
          speakerEl.className = 'speaker';
          speakerEl.textContent = speaker + ':';
          speakerEl.style.fontWeight = 'bold';
          speakerEl.style.marginBottom = '5px';
          speakerEl.style.color = '#ffcc00';
          
          // Create content element
          const contentEl = document.createElement('div');
          contentEl.className = 'content';
          contentEl.textContent = '';
          
          // Add to subtitles
          this.elements.subtitles.appendChild(speakerEl);
          this.elements.subtitles.appendChild(contentEl);
          
          // Type writer effect for content
          const words = content.split(' ');
          let currentIndex = 0;
          
          const intervalId = setInterval(() => {
            if (currentIndex < words.length) {
              contentEl.textContent += words[currentIndex] + ' ';
              currentIndex++;
            } else {
              clearInterval(intervalId);
            }
          }, 100);
          
          // Clear interval if scene is skipped
          this.timeline.call(() => clearInterval(intervalId), null, scene.duration - 0.5);
        }
      } else {
        // Regular text, no speaker
        this.elements.subtitles.textContent = scene.text;
      }
    }
    
    // If this scene has a decision point, show interactive options
    if (scene.decisionPoint) {
      // Show interactive container after text has been displayed
      this.timeline.to(this.elements.interactiveContainer, {
        display: 'block',
        opacity: 0,
        duration: 0
      }, scene.duration * 0.6);
      
      this.timeline.to(this.elements.interactiveContainer, {
        opacity: 1,
        duration: 0.5
      }, scene.duration * 0.6);
      
      // Get decision data from story engine
      const decisionData = this.storyEngine?.StoryData?.decisions?.[scene.decisionPoint];
      
      if (decisionData) {
        // Create decision UI
        this.elements.interactiveContainer.innerHTML = `
          <h3>${decisionData.title}</h3>
          <p>${decisionData.description}</p>
          <div class="decision-choices"></div>
        `;
        
        const choicesContainer = this.elements.interactiveContainer.querySelector('.decision-choices');
        
        // Add choice buttons
        decisionData.choices.forEach(choice => {
          const button = document.createElement('button');
          button.className = 'decision-choice';
          button.textContent = choice.text;
          button.style.display = 'block';
          button.style.width = '100%';
          button.style.padding = '10px';
          button.style.margin = '10px 0';
          button.style.background = 'rgba(0, 100, 200, 0.5)';
          button.style.border = '1px solid rgba(0, 200, 255, 0.5)';
          button.style.borderRadius = '5px';
          button.style.color = 'white';
          button.style.cursor = 'pointer';
          button.style.transition = 'background 0.3s';
          
          // Hover effect
          button.addEventListener('mouseover', () => {
            button.style.background = 'rgba(0, 150, 255, 0.7)';
          });
          
          button.addEventListener('mouseout', () => {
            button.style.background = 'rgba(0, 100, 200, 0.5)';
          });
          
          // Add click handler
          button.addEventListener('click', () => {
            // Record decision in story engine
            if (this.storyEngine) {
              this.storyEngine.recordDecision(
                scene.decisionPoint,
                choice.id,
                {
                  type: choice.type || 'neutral',
                  text: choice.text,
                  outcome: choice.outcome,
                }
              );
              
              // Set any flags
              if (choice.flags) {
                Object.entries(choice.flags).forEach(([flag, value]) => {
                  this.storyEngine.setFlag(flag, value);
                });
              }
            }
            
            // Show outcome
            choicesContainer.innerHTML = `
              <div class="decision-outcome" style="padding: 15px; background: rgba(0, 150, 255, 0.3); border-radius: 5px;">
                <p>${choice.outcome}</p>
              </div>
            `;
            
            // End scene after a short delay
            setTimeout(() => {
              this._advanceToNextScene();
            }, 3000);
          });
          
          choicesContainer.appendChild(button);
        });
        
        // Pause the timeline since we're waiting for user input
        this.timeline.pause();
      }
    } else {
      // Normal scene without decision, use the full duration
      this.timeline.to({}, { duration: scene.duration });
    }
    
    // Clean up on scene end
    this.timeline.call(() => {
      if (focusOverlay.parentNode) {
        focusOverlay.parentNode.removeChild(focusOverlay);
      }
    }, null, scene.duration - 0.1);
  }
  
  /**
   * Play an epilogue scene
   * @param {Object} scene Scene data
   * @private
   */
  _playEpilogueScene(scene) {
    // Show necessary elements
    this.elements.imageContainer.style.display = 'block';
    this.elements.subtitles.style.display = 'block';
    
    // Set background with slow fade transition
    this.elements.imageContainer.style.opacity = 0;
    this.elements.imageContainer.style.backgroundImage = `url(assets/images/cinematics/${scene.background}.jpg)`;
    
    // Fade in background
    gsap.to(this.elements.imageContainer, {
      opacity: 1,
      duration: 2,
      ease: 'power1.inOut',
    });
    
    // Add a cinematic letterbox effect
    const letterboxTop = document.createElement('div');
    letterboxTop.className = 'letterbox-top';
    letterboxTop.style.position = 'absolute';
    letterboxTop.style.top = '0';
    letterboxTop.style.left = '0';
    letterboxTop.style.width = '100%';
    letterboxTop.style.height = '15%';
    letterboxTop.style.backgroundColor = '#000';
    letterboxTop.style.zIndex = '5';
    this.container.appendChild(letterboxTop);
    
    const letterboxBottom = document.createElement('div');
    letterboxBottom.className = 'letterbox-bottom';
    letterboxBottom.style.position = 'absolute';
    letterboxBottom.style.bottom = '0';
    letterboxBottom.style.left = '0';
    letterboxBottom.style.width = '100%';
    letterboxBottom.style.height = '15%';
    letterboxBottom.style.backgroundColor = '#000';
    letterboxBottom.style.zIndex = '5';
    this.container.appendChild(letterboxBottom);
    
    // Play audio track if provided
    if (scene.audioTrack) {
      this.audio.music.src = `assets/audio/cinematics/${scene.audioTrack}.mp3`;
      this.audio.music.volume = 0.7; // Slightly louder for epilogue
      this.audio.music.play();
    }
    
    // Animate subtitle text with a fade-in effect
    if (scene.text) {
      this.elements.subtitles.style.opacity = 0;
      this.elements.subtitles.textContent = scene.text;
      
      // Fade in text
      gsap.to(this.elements.subtitles, {
        opacity: 1,
        duration: 2,
        delay: 1,
        ease: 'power1.inOut',
      });
    }
    
    // Add a slow pan/zoom to the background for dramatic effect
    gsap.to(this.elements.imageContainer, {
      backgroundSize: '120%',
      backgroundPosition: 'center 40%',
      duration: scene.duration,
      ease: 'power1.inOut',
    });
    
    // Add an "The End" or similar text at the very end if this is the final scene
    if (this.currentSceneIndex === this.activeCinematic.scenes.length - 1) {
      const endText = document.createElement('div');
      endText.className = 'end-text';
      endText.textContent = 'The End';
      endText.style.position = 'absolute';
      endText.style.top = '50%';
      endText.style.left = '50%';
      endText.style.transform = 'translate(-50%, -50%)';
      endText.style.color = 'white';
      endText.style.fontFamily = 'serif';
      endText.style.fontSize = '4em';
      endText.style.opacity = '0';
      endText.style.zIndex = '25';
      this.container.appendChild(endText);
      
      // Fade in the end text near the end of the scene
      gsap.to(endText, {
        opacity: 1,
        duration: 2,
        delay: scene.duration - 3,
        ease: 'power1.inOut',
      });
      
      // Clean up on scene end
      this.timeline.call(() => {
        if (endText.parentNode) {
          endText.parentNode.removeChild(endText);
        }
      }, null, scene.duration - 0.1);
    }
    
    // Clean up on scene end
    this.timeline.call(() => {
      if (letterboxTop.parentNode) {
        letterboxTop.parentNode.removeChild(letterboxTop);
      }
      if (letterboxBottom.parentNode) {
        letterboxBottom.parentNode.removeChild(letterboxBottom);
      }
    }, null, scene.duration - 0.1);
    
    // Set duration
    this.timeline.to({}, { duration: scene.duration });
  }
  
  /**
   * Clean up and dispose resources
   */
  dispose() {
    // Clean up current scene if any
    this._cleanupCurrentScene();
    
    // Clean up cached assets
    for (const category in this.cachedAssets) {
      for (const key in this.cachedAssets[category]) {
        const asset = this.cachedAssets[category][key];
        if (asset.dispose) {
          asset.dispose();
        }
      }
    }
    
    // Clean up renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Clean up DOM elements
    for (const key in this.elements) {
      const element = this.elements[key];
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
    
    // Remove container if we created it
    if (this.container && this.container.parentNode && this.container.id === 'cinematic-container') {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Remove event listeners
    this.removeAllListeners();
    
    // Clear references
    this.activeCinematic = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSceneIndex = 0;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.timeline = null;
    this.elements = {};
    this.audio = {};
    this.cachedAssets = {
      textures: {},
      videos: {},
      audio: {},
      models: {},
    };
  }
}

export default CinematicSystem;