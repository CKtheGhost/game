/**
 * StateSynchronizer service
 * Handles synchronization between game state and visual components
 */

class StateSynchronizer {
  constructor() {
    this.subscribers = new Map();
    this.previousState = null;
    this.updateCallbacks = new Map();
  }

  /**
   * Initialize the synchronizer with the game state
   * @param {Function} getStateFunc - Function to get current game state
   */
  init(getStateFunc) {
    this.getState = getStateFunc;
    this.previousState = getStateFunc();
    this.setupEventListeners();
    return this;
  }

  /**
   * Set up event listeners for state changes
   */
  setupEventListeners() {
    // Setup interval to check for state changes
    this.intervalId = setInterval(() => {
      this.checkForStateChanges();
    }, 100); // Check every 100ms
  }

  /**
   * Check for changes in state and notify subscribers
   */
  checkForStateChanges() {
    if (!this.getState) return;
    
    const currentState = this.getState();
    
    if (!this.previousState) {
      this.previousState = currentState;
      return;
    }
    
    // Check for changes in each property that has subscribers
    for (const [property, callbacks] of this.subscribers.entries()) {
      const currentValue = this.getNestedProperty(currentState, property);
      const previousValue = this.getNestedProperty(this.previousState, property);
      
      // Check if values are different (simple equality check)
      const hasChanged = !this.areEqual(currentValue, previousValue);
      
      if (hasChanged) {
        // Notify all subscribers for this property
        callbacks.forEach(callback => {
          try {
            callback(currentValue, previousValue);
          } catch (error) {
            console.error(`Error in subscriber callback for ${property}:`, error);
          }
        });
      }
    }
    
    // Update previous state
    this.previousState = { ...currentState };
  }

  /**
   * Compare two values for equality
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} - Whether the values are equal
   */
  areEqual(a, b) {
    // Handle null and undefined
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;
    
    // Handle primitive types
    if (typeof a !== 'object' && typeof b !== 'object') {
      return a === b;
    }
    
    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      
      for (let i = 0; i < a.length; i++) {
        if (!this.areEqual(a[i], b[i])) return false;
      }
      
      return true;
    }
    
    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!this.areEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Get a nested property from an object using a dot notation path
   * @param {Object} obj - Object to get property from
   * @param {string} path - Path to property using dot notation (e.g., 'player.stats.health')
   * @returns {*} - Property value
   */
  getNestedProperty(obj, path) {
    if (!obj) return undefined;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      current = current[part];
    }
    
    return current;
  }

  /**
   * Subscribe to changes in a specific state property
   * @param {string} property - Property path using dot notation (e.g., 'playerStats.health')
   * @param {Function} callback - Function to call when property changes
   * @returns {Function} - Unsubscribe function
   */
  subscribe(property, callback) {
    if (!this.subscribers.has(property)) {
      this.subscribers.set(property, new Set());
    }
    
    const callbacks = this.subscribers.get(property);
    callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      
      if (callbacks.size === 0) {
        this.subscribers.delete(property);
      }
    };
  }

  /**
   * Subscribe to multiple properties at once
   * @param {Object} subscriptions - Object mapping property paths to callbacks
   * @returns {Function} - Unsubscribe function for all subscriptions
   */
  subscribeMultiple(subscriptions) {
    const unsubscribeFunctions = [];
    
    for (const [property, callback] of Object.entries(subscriptions)) {
      unsubscribeFunctions.push(this.subscribe(property, callback));
    }
    
    // Return function to unsubscribe from all
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Register a component update callback for synchronization
   * @param {string} componentId - Unique ID for the component
   * @param {Function} updateCallback - Function to call to update the component
   */
  registerComponent(componentId, updateCallback) {
    this.updateCallbacks.set(componentId, updateCallback);
    
    // Return unregister function
    return () => {
      this.updateCallbacks.delete(componentId);
    };
  }

  /**
   * Trigger an update for a specific component
   * @param {string} componentId - ID of the component to update
   * @param {Object} data - Data to pass to the update callback
   */
  updateComponent(componentId, data = {}) {
    const callback = this.updateCallbacks.get(componentId);
    
    if (callback) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error updating component ${componentId}:`, error);
      }
    }
  }

  /**
   * Trigger an update for all registered components
   * @param {Object} data - Data to pass to all update callbacks
   */
  updateAllComponents(data = {}) {
    for (const [componentId, callback] of this.updateCallbacks.entries()) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error updating component ${componentId}:`, error);
      }
    }
  }

  /**
   * Clean up resources when no longer needed
   */
  cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.subscribers.clear();
    this.updateCallbacks.clear();
  }
}

// Create and export singleton instance
const stateSynchronizer = new StateSynchronizer();
export default stateSynchronizer;