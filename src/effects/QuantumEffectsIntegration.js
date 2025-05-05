import * as THREE from 'three';
import { Vector3, Color } from 'three';
import CosmicQuantumEffects from './CosmicQuantumEffects';
import QuantumTunnelingPassages from './QuantumTunnelingPassages';

/**
 * QuantumEffectsIntegration - Integrates all quantum effects systems
 * 
 * This class connects all the quantum effects systems:
 * - Character particle effects (from ParticleEffects)
 * - Cosmic quantum effects (CosmicQuantumEffects)
 * - Quantum tunneling passages (QuantumTunnelingPassages)
 * - Interactive quantum elements (QuantumInteractiveElements)
 */
class QuantumEffectsIntegration {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // References to the effect systems
    this.characterParticleEffects = null;
    this.cosmicEffects = null;
    this.tunnelingPassages = null;
    this.interactiveElements = null;
    
    // Callback system for handling events between systems
    this.callbacks = {
      onRadiationExposureChange: null,
      onTimeDilation: null,
      onQuantumTunnelTravel: null,
      onEntanglementStateChange: null,
      onInteractionStart: null,
      onInteractionComplete: null
    };
    
    // Player state tracking
    this.playerState = {
      radiationExposure: 0, // 0-1 range
      timeDilationFactor: 1.0, // 1.0 is normal time
      isEntangled: false,
      entangledWithId: null,
      inSuperposition: false,
      quantumEnergy: 0, // 0-100 range
      nearTunnelId: null,
      nearPortalId: null,
      activeInteractions: {}
    };
    
    // Create the subsystems
    this._initializeSubsystems();
  }
  
  /**
   * Initialize quantum effect subsystems
   * @private
   */
  _initializeSubsystems() {
    // Initialize cosmic quantum effects
    this.cosmicEffects = new CosmicQuantumEffects(this.scene, this.camera, this.renderer);
    
    // Initialize quantum tunneling passages
    this.tunnelingPassages = new QuantumTunnelingPassages(this.scene, this.camera, this.renderer);
    
    // Connect systems
    this.tunnelingPassages.setCosmicEffects(this.cosmicEffects);
  }
  
  /**
   * Set a reference to the character's particle effects system
   * @param {ParticleEffects} particleEffects - The character's particle effects system
   */
  setCharacterParticleEffects(particleEffects) {
    this.characterParticleEffects = particleEffects;
  }
  
  /**
   * Set a reference to the quantum interactive elements system
   * @param {QuantumInteractiveElements} interactiveElements - The interactive elements system
   */
  setInteractiveElements(interactiveElements) {
    this.interactiveElements = interactiveElements;
  }
  
  /**
   * Set a callback function for an event
   * @param {string} callbackName - Name of the callback
   * @param {Function} callbackFn - Callback function
   */
  setCallback(callbackName, callbackFn) {
    if (this.callbacks.hasOwnProperty(callbackName)) {
      this.callbacks[callbackName] = callbackFn;
    } else {
      console.warn(`Unknown callback: ${callbackName}`);
    }
  }
  
  /**
   * Create a time dilation zone at the given position
   * @param {Vector3} position - Center position for the time dilation zone
   * @param {Object} options - Configuration options
   * @returns {Object} The created time dilation zone
   */
  createTimeDilationZone(position, radius = 5, options = {}) {
    if (!this.cosmicEffects) return null;
    
    // Create the zone with CosmicQuantumEffects
    const zone = this.cosmicEffects.createTimeDilationZone(position, radius, options);
    
    // Trigger callback
    if (this.callbacks.onTimeDilation) {
      this.callbacks.onTimeDilation({
        position: position,
        radius: radius,
        intensity: options.intensity || 1.0
      });
    }
    
    return zone;
  }
  
  /**
   * Create an entanglement bridge between two points
   * @param {Vector3} startPosition - Start position of the bridge
   * @param {Vector3} endPosition - End position of the bridge
   * @param {Object} options - Configuration options
   * @returns {Object} The created entanglement bridge
   */
  createEntanglementBridge(startPosition, endPosition, options = {}) {
    if (!this.cosmicEffects) return null;
    
    // Create the bridge with CosmicQuantumEffects
    const bridge = this.cosmicEffects.createEntanglementBridge(
      startPosition, endPosition, options
    );
    
    // Trigger callback
    if (this.callbacks.onEntanglementStateChange) {
      this.callbacks.onEntanglementStateChange({
        isEntangled: true,
        startPosition: startPosition,
        endPosition: endPosition,
        bridgeId: bridge.id
      });
    }
    
    return bridge;
  }
  
  /**
   * Create a quantum tunnel between two points/dimensions
   * @param {Vector3} startPosition - Start position of the tunnel
   * @param {Vector3} endPosition - End position of the tunnel
   * @param {Object} options - Configuration options
   * @returns {Object} The created quantum tunnel
   */
  createQuantumTunnel(startPosition, endPosition, options = {}) {
    if (!this.tunnelingPassages) return null;
    
    // Create the tunnel with QuantumTunnelingPassages
    const tunnel = this.tunnelingPassages.createTunnel(
      startPosition, endPosition, options
    );
    
    return tunnel;
  }
  
  /**
   * Create a portal pair for quick travel between points
   * @param {Vector3} position1 - Position of the first portal
   * @param {Vector3} position2 - Position of the second portal
   * @param {Object} options - Configuration options
   * @returns {Object} The created portal pair
   */
  createPortalPair(position1, position2, options = {}) {
    if (!this.tunnelingPassages) return null;
    
    // Create the portal pair with QuantumTunnelingPassages
    const portalPair = this.tunnelingPassages.createPortalPair(
      position1, position2, options
    );
    
    return portalPair;
  }
  
  /**
   * Travel through a quantum tunnel
   * @param {Object} tunnel - The tunnel to travel through
   * @param {Object} traveler - Object that will travel (usually player)
   * @returns {boolean} Success of starting travel
   */
  startTunnelTravel(tunnel, traveler) {
    if (!this.tunnelingPassages) return false;
    
    // Start travel
    const success = this.tunnelingPassages.startTunnelTravel(tunnel, traveler);
    
    // Trigger callback
    if (success && this.callbacks.onQuantumTunnelTravel) {
      this.callbacks.onQuantumTunnelTravel({
        tunnelId: tunnel.id,
        startPosition: tunnel.userData.startPosition,
        endPosition: tunnel.userData.endPosition,
        travelStartTime: Date.now() / 1000
      });
    }
    
    return success;
  }
  
  /**
   * Create a radiation zone that affects gameplay
   * @param {Vector3} position - Center position of the radiation zone
   * @param {number} radius - Radius of the zone
   * @param {Object} options - Configuration options
   */
  createRadiationZone(position, radius = 5, options = {}) {
    // Default options
    const config = {
      intensity: 1.0,
      color: new Color(0xff00ff),
      pulseSpeed: 0.5,
      damageRate: 0.1,
      particleCount: 200,
      ...options
    };
    
    // Create visual effect using CosmicQuantumEffects
    let radiationVisuals = null;
    if (this.cosmicEffects) {
      // Can use a time dilation zone with adjusted parameters
      radiationVisuals = this.cosmicEffects.createTimeDilationZone(
        position, 
        radius,
        {
          color: config.color,
          pulseSpeed: config.pulseSpeed,
          particleCount: config.particleCount,
          intensity: config.intensity
        }
      );
      
      // Add custom userData
      radiationVisuals.userData.isRadiationZone = true;
      radiationVisuals.userData.damageRate = config.damageRate;
    }
    
    return radiationVisuals;
  }
  
  /**
   * Create a superposition effect on a tunnel
   * @param {Object} tunnel - The tunnel to put in superposition
   * @returns {boolean} Success of creating superposition
   */
  createTunnelSuperposition(tunnel) {
    if (!this.tunnelingPassages) return false;
    
    return this.tunnelingPassages.createSuperposition(tunnel);
  }
  
  /**
   * Update radiation exposure based on player position
   * @param {Vector3} playerPosition - Current player position
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateRadiationExposure(playerPosition, deltaTime) {
    if (!this.cosmicEffects || !playerPosition) return;
    
    let totalExposure = 0;
    let inRadiationZone = false;
    
    // Check all time dilation zones for radiation zones
    for (const zone of this.cosmicEffects.effects.timeDilationZones) {
      if (zone.userData.isRadiationZone) {
        const distToZone = playerPosition.distanceTo(zone.userData.position);
        const radius = zone.userData.radius;
        
        if (distToZone < radius) {
          inRadiationZone = true;
          
          // Calculate exposure based on distance (more exposure closer to center)
          const normalizedDist = distToZone / radius;
          const exposure = (1 - normalizedDist) * zone.userData.damageRate * deltaTime;
          
          totalExposure += exposure;
        }
      }
    }
    
    // Update player state
    if (inRadiationZone) {
      // Increase radiation exposure
      this.playerState.radiationExposure = Math.min(
        1.0,
        this.playerState.radiationExposure + totalExposure
      );
      
      // Trigger callback
      if (this.callbacks.onRadiationExposureChange) {
        this.callbacks.onRadiationExposureChange({
          level: this.playerState.radiationExposure,
          change: totalExposure,
          inRadiationZone: true
        });
      }
    } else if (this.playerState.radiationExposure > 0) {
      // Slowly decrease radiation exposure when outside radiation zones
      const recovery = deltaTime * 0.05; // Slow recovery rate
      
      this.playerState.radiationExposure = Math.max(
        0,
        this.playerState.radiationExposure - recovery
      );
      
      // Trigger callback
      if (this.callbacks.onRadiationExposureChange) {
        this.callbacks.onRadiationExposureChange({
          level: this.playerState.radiationExposure,
          change: -recovery,
          inRadiationZone: false
        });
      }
    }
  }
  
  /**
   * Update time dilation effect based on player position
   * @param {Vector3} playerPosition - Current player position
   * @param {number} deltaTime - Time since last frame
   * @private
   */
  _updateTimeDilation(playerPosition, deltaTime) {
    if (!this.cosmicEffects || !playerPosition) return;
    
    let maxDilation = 0;
    let inDilationZone = false;
    let activeZone = null;
    
    // Check all time dilation zones (except radiation zones)
    for (const zone of this.cosmicEffects.effects.timeDilationZones) {
      if (!zone.userData.isRadiationZone) {
        const distToZone = playerPosition.distanceTo(zone.userData.position);
        const radius = zone.userData.radius;
        
        if (distToZone < radius) {
          inDilationZone = true;
          
          // Calculate dilation factor based on distance (more dilation closer to center)
          const normalizedDist = distToZone / radius;
          const dilationFactor = (1 - normalizedDist) * zone.userData.config.intensity;
          
          if (dilationFactor > maxDilation) {
            maxDilation = dilationFactor;
            activeZone = zone;
          }
        }
      }
    }
    
    // Update player state
    const prevDilation = this.playerState.timeDilationFactor;
    
    if (inDilationZone) {
      // Calculate time dilation factor (1.0 is normal time, lower is slower)
      this.playerState.timeDilationFactor = 1.0 - (maxDilation * 0.5);
      
      // Ensure minimum time speed
      this.playerState.timeDilationFactor = Math.max(0.2, this.playerState.timeDilationFactor);
      
      // Trigger callback if dilation changed significantly
      if (Math.abs(this.playerState.timeDilationFactor - prevDilation) > 0.05 && 
          this.callbacks.onTimeDilation) {
        this.callbacks.onTimeDilation({
          factor: this.playerState.timeDilationFactor,
          position: activeZone.userData.position,
          radius: activeZone.userData.radius,
          intensity: activeZone.userData.config.intensity
        });
      }
    } else if (this.playerState.timeDilationFactor < 1.0) {
      // Return to normal time
      this.playerState.timeDilationFactor = 1.0;
      
      // Trigger callback
      if (Math.abs(this.playerState.timeDilationFactor - prevDilation) > 0.05 && 
          this.callbacks.onTimeDilation) {
        this.callbacks.onTimeDilation({
          factor: 1.0,
          position: null,
          radius: 0,
          intensity: 0
        });
      }
    }
  }
  
  /**
   * Check for player proximity to tunnels and portals
   * @param {Vector3} playerPosition - Current player position
   * @private
   */
  _checkTunnelProximity(playerPosition) {
    if (!this.tunnelingPassages || !playerPosition) return;
    
    // Reset proximity flags
    const prevNearTunnel = this.playerState.nearTunnelId;
    const prevNearPortal = this.playerState.nearPortalId;
    
    this.playerState.nearTunnelId = null;
    this.playerState.nearPortalId = null;
    
    // Check tunnels
    let closestTunnelDist = Infinity;
    let closestTunnel = null;
    
    for (const tunnel of this.tunnelingPassages.tunnels) {
      // Check distance to entrance
      const distToEntrance = playerPosition.distanceTo(tunnel.userData.startPosition);
      
      if (distToEntrance < this.tunnelingPassages.settings.nearPortalDistance && 
          distToEntrance < closestTunnelDist) {
        closestTunnelDist = distToEntrance;
        closestTunnel = tunnel;
      }
    }
    
    // Check portal pairs
    let closestPortalDist = Infinity;
    let closestPortal = null;
    
    for (const portalPair of this.tunnelingPassages.portalPairs) {
      // Check distance to portal 1
      const distToPortal1 = playerPosition.distanceTo(portalPair.position1);
      
      if (distToPortal1 < portalPair.config.interactiveDistance && 
          distToPortal1 < closestPortalDist) {
        closestPortalDist = distToPortal1;
        closestPortal = portalPair;
        closestPortal.activePortalIndex = 1; // Mark that portal 1 is closest
      }
      
      // Check distance to portal 2
      const distToPortal2 = playerPosition.distanceTo(portalPair.position2);
      
      if (distToPortal2 < portalPair.config.interactiveDistance && 
          distToPortal2 < closestPortalDist) {
        closestPortalDist = distToPortal2;
        closestPortal = portalPair;
        closestPortal.activePortalIndex = 2; // Mark that portal 2 is closest
      }
    }
    
    // Update player state
    if (closestTunnel) {
      this.playerState.nearTunnelId = closestTunnel.id;
    }
    
    if (closestPortal) {
      this.playerState.nearPortalId = closestPortal.id;
    }
    
    // If proximity changed, trigger callbacks
    if (prevNearTunnel !== this.playerState.nearTunnelId && this.callbacks.onInteractionStart) {
      if (this.playerState.nearTunnelId) {
        this.callbacks.onInteractionStart({
          type: 'tunnel',
          object: closestTunnel,
          distance: closestTunnelDist,
          message: 'Quantum tunnel detected. Press E to travel.'
        });
      }
    }
    
    if (prevNearPortal !== this.playerState.nearPortalId && this.callbacks.onInteractionStart) {
      if (this.playerState.nearPortalId) {
        this.callbacks.onInteractionStart({
          type: 'portal',
          object: closestPortal,
          distance: closestPortalDist,
          portalIndex: closestPortal.activePortalIndex,
          message: 'Quantum portal detected. Press E to teleport.'
        });
      }
    }
  }
  
  /**
   * Activate the nearest tunnel or portal
   * @param {Vector3} playerPosition - Current player position
   * @returns {boolean} Success of the activation
   */
  activateNearestTunnelOrPortal(playerPosition) {
    if (!playerPosition) return false;
    
    // Check if near a tunnel
    if (this.playerState.nearTunnelId) {
      // Find the tunnel
      const tunnel = this.tunnelingPassages.tunnels.find(
        t => t.id === this.playerState.nearTunnelId
      );
      
      if (tunnel) {
        // Start tunnel travel
        return this.startTunnelTravel(tunnel, { position: playerPosition });
      }
    }
    
    // Check if near a portal
    if (this.playerState.nearPortalId) {
      // Portals auto-activate when the player gets close enough
      // This is handled in the _updatePortalPair method
      return true;
    }
    
    return false;
  }
  
  /**
   * Update all quantum effects
   * @param {number} deltaTime - Time since last frame
   * @param {Vector3} playerPosition - Current player position (optional)
   */
  update(deltaTime, playerPosition) {
    // Update cosmic effects
    if (this.cosmicEffects) {
      this.cosmicEffects.update(deltaTime, playerPosition);
    }
    
    // Update tunneling passages
    if (this.tunnelingPassages) {
      this.tunnelingPassages.update(deltaTime, playerPosition);
    }
    
    // Update interactive elements
    if (this.interactiveElements) {
      this.interactiveElements.update(deltaTime, playerPosition);
    }
    
    // Update player state effects
    if (playerPosition) {
      this._updateRadiationExposure(playerPosition, deltaTime);
      this._updateTimeDilation(playerPosition, deltaTime);
      this._checkTunnelProximity(playerPosition);
    }
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    if (this.cosmicEffects) {
      this.cosmicEffects.onWindowResize();
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Dispose cosmic effects
    if (this.cosmicEffects) {
      this.cosmicEffects.dispose();
      this.cosmicEffects = null;
    }
    
    // Dispose tunneling passages
    if (this.tunnelingPassages) {
      this.tunnelingPassages.dispose();
      this.tunnelingPassages = null;
    }
    
    // Interactive elements disposal is handled separately
  }
}

export default QuantumEffectsIntegration;