import * as THREE from 'three';
import { Vector3, Color, MathUtils } from 'three';

/**
 * QuantumRadar - Advanced radar system for detecting quantum anomalies
 * 
 * Features:
 * 1. Real-time detection of quantum anomalies
 * 2. Visualization of different anomaly types
 * 3. Range and intensity filtering
 * 4. Interactive markers with detailed information
 * 5. Integration with other quantum systems
 */
class QuantumRadar {
  constructor(container) {
    this.container = container || document.body;
    
    // Radar DOM elements
    this.radarElement = null;
    this.radarCanvas = null;
    this.radarContext = null;
    this.detailPanel = null;
    
    // Radar data
    this.anomalies = [];
    this.selectedAnomaly = null;
    
    // Scan properties
    this.scanRadius = 50; // Maximum detection radius in meters
    this.scanAngle = 0;   // Current scan angle in radians
    this.scanSpeed = 2.0; // Rotations per second
    this.detectionStrength = 1.0; // 0-1 range
    
    // Player reference
    this.playerPosition = new Vector3(0, 0, 0);
    this.playerRotation = 0; // radians
    
    // Visual settings
    this.settings = {
      colors: {
        background: 'rgba(0, 10, 20, 0.7)',
        grid: 'rgba(0, 120, 180, 0.5)',
        sweep: 'rgba(0, 255, 255, 0.3)',
        player: 'rgba(0, 255, 255, 1.0)',
        text: 'rgba(0, 255, 255, 0.9)',
        anomalyTypes: {
          temporal: 'rgba(0, 255, 128, 1.0)',
          spatial: 'rgba(255, 128, 0, 1.0)',
          dimensional: 'rgba(255, 0, 255, 1.0)',
          quantum: 'rgba(64, 128, 255, 1.0)',
          unknown: 'rgba(200, 200, 200, 1.0)'
        }
      },
      blurAmount: '10px',
      gridRings: 3,
      pulseSpeed: 1.5,
      glowIntensity: 0.7,
      scanFov: 120, // Field of view in degrees
      showLabels: true,
      showIntensity: true,
      showRangeRings: true
    };
    
    // Animation properties
    this.animationFrame = null;
    this.lastTimestamp = 0;
    
    // Initialize radar
    this._initialize();
  }
  
  /**
   * Initialize the radar system
   * @private
   */
  _initialize() {
    // Create the radar interface
    this._createRadarInterface();
    
    // Start scanning
    this._startScan();
  }
  
  /**
   * Create the radar user interface
   * @private
   */
  _createRadarInterface() {
    // Create styles
    this._createStyles();
    
    // Create main radar container
    this.radarElement = document.createElement('div');
    this.radarElement.className = 'quantum-radar';
    
    // Create radar display
    const radarDisplay = document.createElement('div');
    radarDisplay.className = 'radar-display';
    
    // Create canvas for radar visualization
    this.radarCanvas = document.createElement('canvas');
    this.radarCanvas.width = 300;
    this.radarCanvas.height = 300;
    this.radarContext = this.radarCanvas.getContext('2d');
    radarDisplay.appendChild(this.radarCanvas);
    
    // Create radar title
    const radarTitle = document.createElement('div');
    radarTitle.className = 'radar-title';
    radarTitle.textContent = 'QUANTUM RADAR';
    radarDisplay.appendChild(radarTitle);
    
    // Create radar controls
    const radarControls = document.createElement('div');
    radarControls.className = 'radar-controls';
    
    // Range control
    const rangeControl = document.createElement('div');
    rangeControl.className = 'radar-control';
    
    const rangeLabel = document.createElement('div');
    rangeLabel.className = 'control-label';
    rangeLabel.textContent = 'RANGE';
    
    const rangeValue = document.createElement('div');
    rangeValue.className = 'control-value';
    rangeValue.textContent = `${this.scanRadius}m`;
    
    const rangeSlider = document.createElement('input');
    rangeSlider.type = 'range';
    rangeSlider.min = '10';
    rangeSlider.max = '100';
    rangeSlider.value = this.scanRadius;
    rangeSlider.className = 'radar-slider';
    rangeSlider.addEventListener('input', (e) => {
      this.scanRadius = parseInt(e.target.value);
      rangeValue.textContent = `${this.scanRadius}m`;
    });
    
    rangeControl.appendChild(rangeLabel);
    rangeControl.appendChild(rangeValue);
    rangeControl.appendChild(rangeSlider);
    
    // Sensitivity control
    const sensitivityControl = document.createElement('div');
    sensitivityControl.className = 'radar-control';
    
    const sensitivityLabel = document.createElement('div');
    sensitivityLabel.className = 'control-label';
    sensitivityLabel.textContent = 'SENSITIVITY';
    
    const sensitivityValue = document.createElement('div');
    sensitivityValue.className = 'control-value';
    sensitivityValue.textContent = `${Math.round(this.detectionStrength * 100)}%`;
    
    const sensitivitySlider = document.createElement('input');
    sensitivitySlider.type = 'range';
    sensitivitySlider.min = '1';
    sensitivitySlider.max = '100';
    sensitivitySlider.value = this.detectionStrength * 100;
    sensitivitySlider.className = 'radar-slider';
    sensitivitySlider.addEventListener('input', (e) => {
      this.detectionStrength = parseInt(e.target.value) / 100;
      sensitivityValue.textContent = `${Math.round(this.detectionStrength * 100)}%`;
    });
    
    sensitivityControl.appendChild(sensitivityLabel);
    sensitivityControl.appendChild(sensitivityValue);
    sensitivityControl.appendChild(sensitivitySlider);
    
    // Add controls
    radarControls.appendChild(rangeControl);
    radarControls.appendChild(sensitivityControl);
    
    // Create anomaly detail panel
    this.detailPanel = document.createElement('div');
    this.detailPanel.className = 'anomaly-details';
    this.detailPanel.innerHTML = `
      <div class="detail-title">SELECT ANOMALY</div>
      <div class="detail-content">
        <div class="detail-text">No anomaly selected</div>
      </div>
    `;
    
    // Assemble radar interface
    this.radarElement.appendChild(radarDisplay);
    this.radarElement.appendChild(radarControls);
    this.radarElement.appendChild(this.detailPanel);
    
    // Add to container
    this.container.appendChild(this.radarElement);
    
    // Add click handler for selecting anomalies
    this.radarCanvas.addEventListener('click', this._handleClick.bind(this));
  }
  
  /**
   * Create CSS styles for radar
   * @private
   */
  _createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .quantum-radar {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        user-select: none;
        font-family: 'Rajdhani', 'Arial', sans-serif;
        color: ${this.settings.colors.text};
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: auto;
      }
      
      .radar-display {
        position: relative;
        width: 300px;
        height: 300px;
        background: ${this.settings.colors.background};
        backdrop-filter: blur(${this.settings.blurAmount});
        border: 1px solid rgba(0, 255, 255, 0.5);
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
      }
      
      .radar-title {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 2px;
        text-transform: uppercase;
        pointer-events: none;
      }
      
      .radar-controls {
        background: ${this.settings.colors.background};
        backdrop-filter: blur(${this.settings.blurAmount});
        border: 1px solid rgba(0, 255, 255, 0.5);
        border-radius: 5px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .radar-control {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }
      
      .control-label {
        width: 100px;
        font-size: 12px;
        letter-spacing: 1px;
      }
      
      .control-value {
        width: 50px;
        text-align: right;
        font-size: 14px;
      }
      
      .radar-slider {
        width: 100%;
        margin-top: 5px;
        -webkit-appearance: none;
        height: 4px;
        background: rgba(0, 255, 255, 0.3);
        border-radius: 2px;
        outline: none;
      }
      
      .radar-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: rgba(0, 255, 255, 0.8);
        border-radius: 50%;
        cursor: pointer;
      }
      
      .radar-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: rgba(0, 255, 255, 0.8);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
      
      .anomaly-details {
        background: ${this.settings.colors.background};
        backdrop-filter: blur(${this.settings.blurAmount});
        border: 1px solid rgba(0, 255, 255, 0.5);
        border-radius: 5px;
        padding: 10px;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      
      .anomaly-details.active {
        max-height: 200px;
      }
      
      .detail-title {
        font-size: 14px;
        letter-spacing: 1px;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      
      .detail-content {
        font-size: 12px;
        line-height: 1.4;
      }
      
      .detail-label {
        color: rgba(0, 255, 255, 0.7);
      }
      
      .intensity-bar {
        width: 100%;
        height: 6px;
        background: rgba(0, 0, 0, 0.3);
        margin-top: 4px;
        margin-bottom: 8px;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .intensity-fill {
        height: 100%;
        background: linear-gradient(to right, rgba(0, 255, 255, 0.5), rgba(0, 255, 255, 1.0));
        transition: width 0.3s ease;
      }
      
      @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
      
      @keyframes glow {
        0% { filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.7)); }
        50% { filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.7)); }
        100% { filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.7)); }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Start the radar scanning
   * @private
   */
  _startScan() {
    const animate = (timestamp) => {
      // Calculate delta time
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const deltaTime = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;
      
      // Update scan angle
      this.scanAngle += deltaTime * this.scanSpeed * Math.PI * 2;
      if (this.scanAngle > Math.PI * 2) {
        this.scanAngle -= Math.PI * 2;
      }
      
      // Render radar
      this._renderRadar();
      
      // Continue animation
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * Render the radar display
   * @private
   */
  _renderRadar() {
    const ctx = this.radarContext;
    const width = this.radarCanvas.width;
    const height = this.radarCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 5;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.settings.colors.background;
    ctx.fill();
    
    // Draw grid rings
    if (this.settings.showRangeRings) {
      for (let i = 1; i <= this.settings.gridRings; i++) {
        const ringRadius = (radius * i) / this.settings.gridRings;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = this.settings.colors.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw range labels
        if (this.settings.showLabels) {
          const rangeValue = Math.round((this.scanRadius * i) / this.settings.gridRings);
          ctx.fillStyle = this.settings.colors.text;
          ctx.font = '10px Rajdhani, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${rangeValue}m`, centerX, centerY - ringRadius + 12);
        }
      }
    }
    
    // Draw crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.strokeStyle = this.settings.colors.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw scan sweep
    const sweepAngle = this.scanAngle;
    const sweepWidth = (this.settings.scanFov / 360) * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, sweepAngle - sweepWidth / 2, sweepAngle + sweepWidth / 2);
    ctx.closePath();
    
    // Create gradient for sweep
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw scan line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(sweepAngle) * radius,
      centerY + Math.sin(sweepAngle) * radius
    );
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw player marker at center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = this.settings.colors.player;
    ctx.fill();
    
    // Draw player direction indicator
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(this.playerRotation) * 15,
      centerY + Math.sin(this.playerRotation) * 15
    );
    ctx.strokeStyle = this.settings.colors.player;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw anomalies
    this._renderAnomalies(ctx, centerX, centerY, radius);
  }
  
  /**
   * Render anomalies on the radar
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} radius - Radar radius in pixels
   * @private
   */
  _renderAnomalies(ctx, centerX, centerY, radius) {
    // Calculate scanning area for detection
    const scanStartAngle = this.scanAngle - (this.settings.scanFov / 360) * Math.PI;
    const scanEndAngle = this.scanAngle + (this.settings.scanFov / 360) * Math.PI;
    
    // Process each anomaly
    for (const anomaly of this.anomalies) {
      // Skip inactive anomalies
      if (!anomaly.active) continue;
      
      // Calculate relative position to player
      const relX = anomaly.position.x - this.playerPosition.x;
      const relZ = anomaly.position.z - this.playerPosition.z;
      
      // Calculate distance and angle
      const distance = Math.sqrt(relX * relX + relZ * relZ);
      const angle = Math.atan2(relZ, relX);
      
      // Skip if out of range
      if (distance > this.scanRadius) continue;
      
      // Calculate if in scanning area
      let inScanArea = false;
      
      // Check if angle is within scan area
      if (scanStartAngle < scanEndAngle) {
        inScanArea = angle >= scanStartAngle && angle <= scanEndAngle;
      } else {
        // Handle scan area crossing the 0/2π boundary
        inScanArea = angle >= scanStartAngle || angle <= scanEndAngle;
      }
      
      // Only show anomalies that have been detected
      if (anomaly.detected || inScanArea) {
        // If in scan area and not yet detected, mark as detected
        if (inScanArea && !anomaly.detected) {
          // Detection chance based on intensity, distance, and detection strength
          const detectionChance = (anomaly.intensity / distance) * this.detectionStrength;
          if (Math.random() < detectionChance) {
            anomaly.detected = true;
            
            // Trigger detection callback
            if (this.onAnomalyDetected) {
              this.onAnomalyDetected(anomaly);
            }
          }
        }
        
        // Calculate radar position
        const posScale = radius / this.scanRadius;
        const blipX = centerX + relX * posScale;
        const blipY = centerY + relZ * posScale;
        
        // Calculate blip size based on intensity
        const baseSize = 4 + anomaly.intensity * 4;
        let blipSize = baseSize;
        
        // Pulse if in active scan area
        if (inScanArea) {
          const pulseAmount = Math.sin(performance.now() / 200) * 0.2 + 1.0;
          blipSize *= pulseAmount;
        }
        
        // Get color based on anomaly type
        let blipColor = this.settings.colors.anomalyTypes[anomaly.type] || 
                        this.settings.colors.anomalyTypes.unknown;
        
        // Make undetected anomalies more transparent
        if (!anomaly.detected) {
          blipColor = this._adjustAlpha(blipColor, 0.5);
        }
        
        // Draw the blip
        ctx.beginPath();
        ctx.arc(blipX, blipY, blipSize, 0, Math.PI * 2);
        ctx.fillStyle = blipColor;
        ctx.fill();
        
        // Draw glow
        if (anomaly.detected) {
          ctx.beginPath();
          ctx.arc(blipX, blipY, blipSize * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = this._adjustAlpha(blipColor, 0.3);
          ctx.fill();
        }
        
        // Add label if enabled
        if (this.settings.showLabels && anomaly.detected) {
          ctx.fillStyle = this.settings.colors.text;
          ctx.font = '10px Rajdhani, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(anomaly.name, blipX, blipY - blipSize - 5);
          
          // Show distance
          ctx.fillText(`${Math.round(distance)}m`, blipX, blipY + blipSize + 12);
        }
        
        // Draw intensity indicator
        if (this.settings.showIntensity && anomaly.detected) {
          const intensityWidth = 20;
          const intensityHeight = 3;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(
            blipX - intensityWidth / 2,
            blipY + blipSize + 3,
            intensityWidth,
            intensityHeight
          );
          
          ctx.fillStyle = blipColor;
          ctx.fillRect(
            blipX - intensityWidth / 2,
            blipY + blipSize + 3,
            intensityWidth * anomaly.intensity,
            intensityHeight
          );
        }
        
        // Highlight selected anomaly
        if (this.selectedAnomaly && anomaly.id === this.selectedAnomaly.id) {
          ctx.beginPath();
          ctx.arc(blipX, blipY, blipSize * 2, 0, Math.PI * 2);
          ctx.strokeStyle = this.settings.colors.text;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }
  
  /**
   * Adjust alpha value of a color
   * @param {string} color - CSS color string
   * @param {number} alpha - New alpha value (0-1)
   * @returns {string} New color with adjusted alpha
   * @private
   */
  _adjustAlpha(color, alpha) {
    if (color.startsWith('rgba')) {
      // Replace existing alpha in rgba()
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, 
        (_, r, g, b) => `rgba(${r},${g},${b},${alpha})`);
    } else if (color.startsWith('rgb')) {
      // Convert rgb() to rgba()
      return color.replace(/rgb\(([^,]+),([^,]+),([^)]+)\)/, 
        (_, r, g, b) => `rgba(${r},${g},${b},${alpha})`);
    }
    return color;
  }
  
  /**
   * Handle click on radar to select anomalies
   * @param {Event} event - Mouse event
   * @private
   */
  _handleClick(event) {
    const rect = this.radarCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = this.radarCanvas.width / 2;
    const centerY = this.radarCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;
    
    // Check if click is within radar circle
    const clickDistance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    if (clickDistance > radius) return;
    
    // Calculate real-world coordinates from click position
    const posScale = this.scanRadius / radius;
    const worldX = (x - centerX) * posScale + this.playerPosition.x;
    const worldZ = (y - centerY) * posScale + this.playerPosition.z;
    
    // Find closest detected anomaly
    let closestAnomaly = null;
    let closestDistance = Infinity;
    
    for (const anomaly of this.anomalies) {
      if (!anomaly.detected || !anomaly.active) continue;
      
      const dx = anomaly.position.x - worldX;
      const dz = anomaly.position.z - worldZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Check if within selection radius (scaled by intensity)
      const selectionRadius = 5 + anomaly.intensity * 3;
      if (distance < selectionRadius && distance < closestDistance) {
        closestDistance = distance;
        closestAnomaly = anomaly;
      }
    }
    
    this.selectAnomaly(closestAnomaly);
  }
  
  /**
   * Select an anomaly and show details
   * @param {Object} anomaly - Anomaly data
   */
  selectAnomaly(anomaly) {
    this.selectedAnomaly = anomaly;
    
    // Update detail panel
    if (!anomaly) {
      this.detailPanel.classList.remove('active');
      this.detailPanel.innerHTML = `
        <div class="detail-title">SELECT ANOMALY</div>
        <div class="detail-content">
          <div class="detail-text">No anomaly selected</div>
        </div>
      `;
      return;
    }
    
    // Show and populate detail panel
    this.detailPanel.classList.add('active');
    
    // Format content based on anomaly type
    let detailContent = '';
    
    switch (anomaly.type) {
      case 'temporal':
        detailContent = `
          <div><span class="detail-label">Type:</span> Temporal Distortion</div>
          <div><span class="detail-label">Effect:</span> ${anomaly.effect || 'Time dilation'}</div>
          <div><span class="detail-label">Intensity:</span></div>
          <div class="intensity-bar">
            <div class="intensity-fill" style="width: ${anomaly.intensity * 100}%"></div>
          </div>
          <div><span class="detail-label">Distance:</span> ${Math.round(this._getDistanceToPlayer(anomaly))}m</div>
          <div><span class="detail-label">Warning:</span> Temporal exposure may cause desynchronization</div>
        `;
        break;
        
      case 'spatial':
        detailContent = `
          <div><span class="detail-label">Type:</span> Spatial Anomaly</div>
          <div><span class="detail-label">Effect:</span> ${anomaly.effect || 'Space distortion'}</div>
          <div><span class="detail-label">Intensity:</span></div>
          <div class="intensity-bar">
            <div class="intensity-fill" style="width: ${anomaly.intensity * 100}%"></div>
          </div>
          <div><span class="detail-label">Distance:</span> ${Math.round(this._getDistanceToPlayer(anomaly))}m</div>
          <div><span class="detail-label">Warning:</span> May cause spatial disorientation</div>
        `;
        break;
        
      case 'dimensional':
        detailContent = `
          <div><span class="detail-label">Type:</span> Dimensional Breach</div>
          <div><span class="detail-label">Effect:</span> ${anomaly.effect || 'Reality instability'}</div>
          <div><span class="detail-label">Intensity:</span></div>
          <div class="intensity-bar">
            <div class="intensity-fill" style="width: ${anomaly.intensity * 100}%"></div>
          </div>
          <div><span class="detail-label">Distance:</span> ${Math.round(this._getDistanceToPlayer(anomaly))}m</div>
          <div><span class="detail-label">Warning:</span> Potential cross-dimensional entities</div>
        `;
        break;
        
      case 'quantum':
        detailContent = `
          <div><span class="detail-label">Type:</span> Quantum Fluctuation</div>
          <div><span class="detail-label">Effect:</span> ${anomaly.effect || 'Probability disruption'}</div>
          <div><span class="detail-label">Intensity:</span></div>
          <div class="intensity-bar">
            <div class="intensity-fill" style="width: ${anomaly.intensity * 100}%"></div>
          </div>
          <div><span class="detail-label">Distance:</span> ${Math.round(this._getDistanceToPlayer(anomaly))}m</div>
          <div><span class="detail-label">Warning:</span> Quantum uncertainty effects active</div>
        `;
        break;
        
      default:
        detailContent = `
          <div><span class="detail-label">Type:</span> Unknown Anomaly</div>
          <div><span class="detail-label">Effect:</span> ${anomaly.effect || 'Undetermined'}</div>
          <div><span class="detail-label">Intensity:</span></div>
          <div class="intensity-bar">
            <div class="intensity-fill" style="width: ${anomaly.intensity * 100}%"></div>
          </div>
          <div><span class="detail-label">Distance:</span> ${Math.round(this._getDistanceToPlayer(anomaly))}m</div>
          <div><span class="detail-label">Warning:</span> Approach with caution</div>
        `;
    }
    
    this.detailPanel.innerHTML = `
      <div class="detail-title">ANOMALY DETAILS</div>
      <div class="detail-content">
        <div><span class="detail-label">ID:</span> ${anomaly.name}</div>
        ${detailContent}
      </div>
    `;
    
    // Trigger callback
    if (this.onAnomalySelected) {
      this.onAnomalySelected(anomaly);
    }
  }
  
  /**
   * Get distance from anomaly to player
   * @param {Object} anomaly - Anomaly data
   * @returns {number} Distance in meters
   * @private
   */
  _getDistanceToPlayer(anomaly) {
    const dx = anomaly.position.x - this.playerPosition.x;
    const dy = anomaly.position.y - this.playerPosition.y;
    const dz = anomaly.position.z - this.playerPosition.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Add an anomaly to the radar
   * @param {Object} anomalyData - Anomaly data
   */
  addAnomaly(anomalyData) {
    if (!anomalyData.id || !anomalyData.position) {
      console.error('Anomaly data must include id and position.');
      return;
    }
    
    // Ensure position is a Vector3
    const position = anomalyData.position instanceof Vector3 ? 
      anomalyData.position.clone() : 
      new Vector3(
        anomalyData.position.x,
        anomalyData.position.y,
        anomalyData.position.z
      );
    
    // Create anomaly object
    const anomaly = {
      id: anomalyData.id,
      name: anomalyData.name || `Anomaly ${anomalyData.id}`,
      position: position,
      type: anomalyData.type || 'unknown',
      intensity: anomalyData.intensity || 0.5,
      detected: anomalyData.detected || false,
      active: anomalyData.active !== undefined ? anomalyData.active : true,
      effect: anomalyData.effect || '',
      data: anomalyData.data || {}
    };
    
    // Add to anomalies array
    this.anomalies.push(anomaly);
    
    return anomaly;
  }
  
  /**
   * Update an existing anomaly
   * @param {string} anomalyId - Anomaly ID
   * @param {Object} updates - Properties to update
   */
  updateAnomaly(anomalyId, updates) {
    // Find anomaly
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (!anomaly) return;
    
    // Update position if provided
    if (updates.position) {
      anomaly.position = updates.position instanceof Vector3 ? 
        updates.position.clone() : 
        new Vector3(
          updates.position.x,
          updates.position.y,
          updates.position.z
        );
    }
    
    // Update other properties
    if (updates.intensity !== undefined) anomaly.intensity = updates.intensity;
    if (updates.type !== undefined) anomaly.type = updates.type;
    if (updates.active !== undefined) anomaly.active = updates.active;
    if (updates.detected !== undefined) anomaly.detected = updates.detected;
    if (updates.effect !== undefined) anomaly.effect = updates.effect;
    
    // Update data object
    if (updates.data) {
      anomaly.data = { ...anomaly.data, ...updates.data };
    }
    
    // Update detail panel if this is the selected anomaly
    if (this.selectedAnomaly && this.selectedAnomaly.id === anomalyId) {
      this.selectAnomaly(anomaly);
    }
    
    return anomaly;
  }
  
  /**
   * Remove an anomaly from the radar
   * @param {string} anomalyId - Anomaly ID
   */
  removeAnomaly(anomalyId) {
    const index = this.anomalies.findIndex(a => a.id === anomalyId);
    if (index >= 0) {
      this.anomalies.splice(index, 1);
      
      // Clear selection if this was the selected anomaly
      if (this.selectedAnomaly && this.selectedAnomaly.id === anomalyId) {
        this.selectAnomaly(null);
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * Update player position and rotation
   * @param {Vector3} position - Player position
   * @param {number} rotation - Player rotation in radians
   */
  updatePlayerPosition(position, rotation = 0) {
    this.playerPosition = position.clone();
    this.playerRotation = rotation;
  }
  
  /**
   * Set a callback for anomaly detection
   * @param {Function} callback - Callback function
   */
  setAnomalyDetectedCallback(callback) {
    this.onAnomalyDetected = callback;
  }
  
  /**
   * Set a callback for anomaly selection
   * @param {Function} callback - Callback function
   */
  setAnomalySelectedCallback(callback) {
    this.onAnomalySelected = callback;
  }
  
  /**
   * Show the radar
   */
  show() {
    this.radarElement.style.display = 'flex';
  }
  
  /**
   * Hide the radar
   */
  hide() {
    this.radarElement.style.display = 'none';
  }
  
  /**
   * Toggle radar visibility
   */
  toggle() {
    if (this.radarElement.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Stop animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Remove event listeners
    this.radarCanvas.removeEventListener('click', this._handleClick);
    
    // Remove radar elements
    if (this.radarElement && this.radarElement.parentNode) {
      this.radarElement.parentNode.removeChild(this.radarElement);
    }
    
    // Clear anomalies
    this.anomalies = [];
    this.selectedAnomaly = null;
  }
}

export default QuantumRadar;