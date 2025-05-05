import { EventEmitter } from 'events';

class CharacterStats extends EventEmitter {
  constructor(initialStats = {}) {
    super();
    
    // Core stats with defaults
    this.stats = {
      // Primary stats
      health: initialStats.health || 100,
      maxHealth: initialStats.maxHealth || 100,
      
      quantumEnergy: initialStats.quantumEnergy || 100,
      maxQuantumEnergy: initialStats.maxQuantumEnergy || 100,
      quantumEnergyRegenRate: initialStats.quantumEnergyRegenRate || 5, // per second
      
      scientificKnowledge: initialStats.scientificKnowledge || 0,
      maxScientificKnowledge: initialStats.maxScientificKnowledge || 1000,
      
      // Secondary stats
      quantumStability: initialStats.quantumStability || 100,
      maxQuantumStability: initialStats.maxQuantumStability || 100,
      quantumStabilityRegenRate: initialStats.quantumStabilityRegenRate || 2, // per second
      
      dimensionalSynchronicity: initialStats.dimensionalSynchronicity || 100, // affects phase shifting
      temporalCoherence: initialStats.temporalCoherence || 100, // affects time dilation
      molecularControl: initialStats.molecularControl || 50, // affects reconstruction abilities
      entanglementAccuracy: initialStats.entanglementAccuracy || 50, // affects teleportation
      
      // Resistances
      radiationResistance: initialStats.radiationResistance || 0,
      temporalDisruptionResistance: initialStats.temporalDisruptionResistance || 0,
      quantumDecayResistance: initialStats.quantumDecayResistance || 0,
      
      // Experience and level
      experience: initialStats.experience || 0,
      level: initialStats.level || 1,
      levelThresholds: initialStats.levelThresholds || [
        0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, // Levels 1-10
        3250, 3850, 4500, 5200, 6000, 6900, 7900, 9000, 10200, 11500, // Levels 11-20
      ],
      
      // Skill points
      availableSkillPoints: initialStats.availableSkillPoints || 0,
      spentSkillPoints: initialStats.spentSkillPoints || 0,
      
      // Status effects (with durations)
      statusEffects: initialStats.statusEffects || {},
    };
    
    // Stat modifiers from equipment, abilities, etc.
    this.modifiers = {
      health: 0,
      maxHealth: 0,
      quantumEnergy: 0,
      maxQuantumEnergy: 0,
      quantumEnergyRegenRate: 0,
      scientificKnowledge: 0,
      maxScientificKnowledge: 0,
      quantumStability: 0,
      maxQuantumStability: 0,
      quantumStabilityRegenRate: 0,
      dimensionalSynchronicity: 0,
      temporalCoherence: 0,
      molecularControl: 0,
      entanglementAccuracy: 0,
      radiationResistance: 0,
      temporalDisruptionResistance: 0,
      quantumDecayResistance: 0,
    };
    
    // Ability costs
    this.abilityCosts = {
      phaseShift: 25,
      timeDilation: 35,
      molecularReconstruction: 40,
      quantumTeleportation: 50,
    };
    
    // Cooldowns for abilities (in seconds)
    this.cooldowns = {
      phaseShift: 0,
      timeDilation: 0,
      molecularReconstruction: 0,
      quantumTeleportation: 0,
    };
    
    // Default cooldown times (in seconds)
    this.defaultCooldownTimes = {
      phaseShift: 10,
      timeDilation: 15,
      molecularReconstruction: 20,
      quantumTeleportation: 30,
    };
    
    // Timer for regeneration
    this.lastUpdateTime = Date.now();
  }
  
  // Update method to be called regularly
  update() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;
    
    // Regenerate quantum energy over time
    this._regenerateQuantumEnergy(deltaTime);
    
    // Regenerate quantum stability over time
    this._regenerateQuantumStability(deltaTime);
    
    // Update cooldowns
    this._updateCooldowns(deltaTime);
    
    // Update status effects
    this._updateStatusEffects(deltaTime);
  }
  
  // Regenerate quantum energy over time
  _regenerateQuantumEnergy(deltaTime) {
    const regenAmount = (this.getStatValue('quantumEnergyRegenRate') * deltaTime);
    this.modifyStat('quantumEnergy', regenAmount);
  }
  
  // Regenerate quantum stability over time
  _regenerateQuantumStability(deltaTime) {
    const regenAmount = (this.getStatValue('quantumStabilityRegenRate') * deltaTime);
    this.modifyStat('quantumStability', regenAmount);
  }
  
  // Update ability cooldowns
  _updateCooldowns(deltaTime) {
    for (const ability in this.cooldowns) {
      if (this.cooldowns[ability] > 0) {
        this.cooldowns[ability] -= deltaTime;
        
        // Ensure cooldowns don't go below zero
        if (this.cooldowns[ability] < 0) {
          this.cooldowns[ability] = 0;
          // Emit event when an ability comes off cooldown
          this.emit('cooldownComplete', ability);
        }
      }
    }
  }
  
  // Update status effects and remove expired ones
  _updateStatusEffects(deltaTime) {
    const effectsToRemove = [];
    
    // Update each status effect
    for (const effectName in this.stats.statusEffects) {
      const effect = this.stats.statusEffects[effectName];
      
      // If the effect has a duration, decrease it
      if (effect.duration !== undefined) {
        effect.duration -= deltaTime;
        
        // If duration is expired, mark for removal
        if (effect.duration <= 0) {
          effectsToRemove.push(effectName);
        }
      }
      
      // Apply periodic effects
      if (effect.periodicEffect && effect.period) {
        effect.timeToNextTick -= deltaTime;
        
        if (effect.timeToNextTick <= 0) {
          // Apply periodic effect
          effect.periodicEffect(this);
          
          // Reset tick timer
          effect.timeToNextTick = effect.period;
        }
      }
    }
    
    // Remove expired effects
    for (const effectName of effectsToRemove) {
      this.removeStatusEffect(effectName);
    }
  }
  
  // Get the raw base value of a stat
  getBaseStat(statName) {
    return this.stats[statName] !== undefined ? this.stats[statName] : 0;
  }
  
  // Get the modified value of a stat (base + modifiers)
  getStatValue(statName) {
    const baseStat = this.getBaseStat(statName);
    const modifier = this.modifiers[statName] || 0;
    
    // Special handling for calculated stats
    if (statName === 'health' || 
        statName === 'quantumEnergy' || 
        statName === 'quantumStability') {
      // These stats are capped by their max values
      const maxStat = this.getStatValue(`max${statName.charAt(0).toUpperCase() + statName.slice(1)}`);
      return Math.min(baseStat + modifier, maxStat);
    }
    
    return baseStat + modifier;
  }
  
  // Modify a stat by a given amount (can be positive or negative)
  modifyStat(statName, amount) {
    if (this.stats[statName] === undefined) {
      console.warn(`Attempted to modify unknown stat: ${statName}`);
      return false;
    }
    
    const oldValue = this.getStatValue(statName);
    
    // Update the stat
    this.stats[statName] += amount;
    
    // Ensure stat doesn't go below zero (for most stats)
    if (this.stats[statName] < 0 && 
        statName !== 'temporalCoherence' && // Allow some stats to go negative
        statName !== 'dimensionalSynchronicity') {
      this.stats[statName] = 0;
    }
    
    // Ensure capped stats don't exceed their maximum
    if (statName === 'health' && this.stats[statName] > this.getStatValue('maxHealth')) {
      this.stats[statName] = this.getStatValue('maxHealth');
    }
    
    if (statName === 'quantumEnergy' && this.stats[statName] > this.getStatValue('maxQuantumEnergy')) {
      this.stats[statName] = this.getStatValue('maxQuantumEnergy');
    }
    
    if (statName === 'quantumStability' && this.stats[statName] > this.getStatValue('maxQuantumStability')) {
      this.stats[statName] = this.getStatValue('maxQuantumStability');
    }
    
    if (statName === 'scientificKnowledge' && this.stats[statName] > this.getStatValue('maxScientificKnowledge')) {
      this.stats[statName] = this.getStatValue('maxScientificKnowledge');
    }
    
    const newValue = this.getStatValue(statName);
    
    // Check for level up when experience is gained
    if (statName === 'experience' && amount > 0) {
      this._checkForLevelUp();
    }
    
    // Emit event for stat changes
    this.emit('statChanged', {
      stat: statName,
      oldValue,
      newValue,
      change: amount
    });
    
    return true;
  }
  
  // Add a modifier to a stat
  addModifier(statName, amount, source = 'unknown') {
    if (this.modifiers[statName] === undefined) {
      console.warn(`Attempted to add modifier to unknown stat: ${statName}`);
      return false;
    }
    
    const oldValue = this.getStatValue(statName);
    this.modifiers[statName] += amount;
    const newValue = this.getStatValue(statName);
    
    // Emit event for modifier changes
    this.emit('modifierAdded', {
      stat: statName,
      oldValue,
      newValue,
      modifierAmount: amount,
      source
    });
    
    return true;
  }
  
  // Remove a modifier from a stat
  removeModifier(statName, amount, source = 'unknown') {
    if (this.modifiers[statName] === undefined) {
      console.warn(`Attempted to remove modifier from unknown stat: ${statName}`);
      return false;
    }
    
    const oldValue = this.getStatValue(statName);
    this.modifiers[statName] -= amount;
    const newValue = this.getStatValue(statName);
    
    // Emit event for modifier changes
    this.emit('modifierRemoved', {
      stat: statName,
      oldValue,
      newValue,
      modifierAmount: amount,
      source
    });
    
    return true;
  }
  
  // Take damage (reduces health)
  takeDamage(amount, damageType = 'physical') {
    let actualDamage = amount;
    
    // Apply damage type resistances
    if (damageType === 'radiation' && this.getStatValue('radiationResistance') > 0) {
      const resistancePercent = this.getStatValue('radiationResistance') / 100;
      actualDamage *= (1 - resistancePercent);
    } else if (damageType === 'temporal' && this.getStatValue('temporalDisruptionResistance') > 0) {
      const resistancePercent = this.getStatValue('temporalDisruptionResistance') / 100;
      actualDamage *= (1 - resistancePercent);
    } else if (damageType === 'quantum' && this.getStatValue('quantumDecayResistance') > 0) {
      const resistancePercent = this.getStatValue('quantumDecayResistance') / 100;
      actualDamage *= (1 - resistancePercent);
    }
    
    // Round damage to nearest tenth
    actualDamage = Math.round(actualDamage * 10) / 10;
    
    // Apply damage to health
    this.modifyStat('health', -actualDamage);
    
    // Emit damage event
    this.emit('damageTaken', {
      amount: actualDamage,
      originalAmount: amount,
      damageType,
      currentHealth: this.getStatValue('health')
    });
    
    // Check if health reached zero
    if (this.getStatValue('health') <= 0) {
      this.emit('died');
    }
    
    return actualDamage;
  }
  
  // Heal the character
  heal(amount, healType = 'standard') {
    const oldHealth = this.getStatValue('health');
    
    // Apply heal amount modifiers based on type
    let actualHeal = amount;
    if (healType === 'quantum') {
      // Quantum healing is affected by quantum stability
      const stabilityFactor = this.getStatValue('quantumStability') / 100;
      actualHeal *= stabilityFactor;
    }
    
    // Round healing to nearest tenth
    actualHeal = Math.round(actualHeal * 10) / 10;
    
    // Apply healing
    this.modifyStat('health', actualHeal);
    
    // Emit healing event
    this.emit('healed', {
      amount: actualHeal,
      originalAmount: amount,
      healType,
      currentHealth: this.getStatValue('health')
    });
    
    return this.getStatValue('health') - oldHealth;
  }
  
  // Spend quantum energy for an ability
  spendQuantumEnergy(amount, ability = 'unknown') {
    if (this.getStatValue('quantumEnergy') < amount) {
      // Not enough energy
      this.emit('insufficientEnergy', {
        ability,
        required: amount,
        available: this.getStatValue('quantumEnergy')
      });
      return false;
    }
    
    // Spend the energy
    this.modifyStat('quantumEnergy', -amount);
    
    // Emit energy spent event
    this.emit('energySpent', {
      amount,
      ability,
      remaining: this.getStatValue('quantumEnergy')
    });
    
    return true;
  }
  
  // Use an ability, checking cost and applying cooldown
  useAbility(abilityName) {
    // Check if ability exists
    if (!this.abilityCosts[abilityName]) {
      console.warn(`Attempted to use unknown ability: ${abilityName}`);
      return false;
    }
    
    // Check if ability is on cooldown
    if (this.cooldowns[abilityName] > 0) {
      this.emit('abilityCooldown', {
        ability: abilityName,
        remainingCooldown: this.cooldowns[abilityName]
      });
      return false;
    }
    
    // Get energy cost
    const cost = this.abilityCosts[abilityName];
    
    // Try to spend the energy
    if (!this.spendQuantumEnergy(cost, abilityName)) {
      return false;
    }
    
    // Start cooldown
    this.cooldowns[abilityName] = this.defaultCooldownTimes[abilityName];
    
    // Apply quantum stability reduction based on ability
    let stabilityReduction = 0;
    
    switch (abilityName) {
      case 'phaseShift':
        stabilityReduction = 10 / (1 + this.getStatValue('dimensionalSynchronicity') / 100);
        break;
      case 'timeDilation':
        stabilityReduction = 15 / (1 + this.getStatValue('temporalCoherence') / 100);
        break;
      case 'molecularReconstruction':
        stabilityReduction = 20 / (1 + this.getStatValue('molecularControl') / 100);
        break;
      case 'quantumTeleportation':
        stabilityReduction = 25 / (1 + this.getStatValue('entanglementAccuracy') / 100);
        break;
    }
    
    // Apply rounded stability reduction
    stabilityReduction = Math.round(stabilityReduction * 10) / 10;
    this.modifyStat('quantumStability', -stabilityReduction);
    
    // Emit ability used event
    this.emit('abilityUsed', {
      ability: abilityName,
      energyCost: cost,
      stabilityReduction,
      remainingEnergy: this.getStatValue('quantumEnergy'),
      remainingStability: this.getStatValue('quantumStability')
    });
    
    return true;
  }
  
  // Check if an ability can be used
  canUseAbility(abilityName) {
    // Check if ability exists
    if (!this.abilityCosts[abilityName]) {
      return false;
    }
    
    // Check if ability is on cooldown
    if (this.cooldowns[abilityName] > 0) {
      return false;
    }
    
    // Check if enough energy
    const cost = this.abilityCosts[abilityName];
    return this.getStatValue('quantumEnergy') >= cost;
  }
  
  // Get remaining cooldown for an ability
  getAbilityCooldown(abilityName) {
    return this.cooldowns[abilityName] || 0;
  }
  
  // Add a status effect
  addStatusEffect(effectName, effect) {
    // Structure a new effect object
    const newEffect = {
      name: effectName,
      duration: effect.duration, // in seconds, undefined for permanent
      timeToNextTick: effect.period || 0, // for periodic effects
      period: effect.period, // how often the effect triggers
      periodicEffect: effect.periodicEffect, // function to call on period
      onApply: effect.onApply, // function to call when applied
      onRemove: effect.onRemove, // function to call when removed
      ...effect.data // any additional data
    };
    
    // If this is replacing an existing effect, call its onRemove
    if (this.stats.statusEffects[effectName] && this.stats.statusEffects[effectName].onRemove) {
      this.stats.statusEffects[effectName].onRemove(this);
    }
    
    // Store the effect
    this.stats.statusEffects[effectName] = newEffect;
    
    // Call onApply if provided
    if (newEffect.onApply) {
      newEffect.onApply(this);
    }
    
    // Emit status effect added event
    this.emit('statusEffectAdded', {
      effect: effectName,
      duration: effect.duration
    });
    
    return true;
  }
  
  // Remove a status effect
  removeStatusEffect(effectName) {
    // Check if effect exists
    if (!this.stats.statusEffects[effectName]) {
      return false;
    }
    
    // Call onRemove if provided
    if (this.stats.statusEffects[effectName].onRemove) {
      this.stats.statusEffects[effectName].onRemove(this);
    }
    
    // Remove the effect
    delete this.stats.statusEffects[effectName];
    
    // Emit status effect removed event
    this.emit('statusEffectRemoved', {
      effect: effectName
    });
    
    return true;
  }
  
  // Check if a status effect is active
  hasStatusEffect(effectName) {
    return !!this.stats.statusEffects[effectName];
  }
  
  // Get all active status effects
  getStatusEffects() {
    return { ...this.stats.statusEffects };
  }
  
  // Add experience and check for level up
  addExperience(amount) {
    this.modifyStat('experience', amount);
    return this._checkForLevelUp();
  }
  
  // Check if character should level up
  _checkForLevelUp() {
    const currentLevel = this.stats.level;
    const currentExp = this.stats.experience;
    const nextLevelThreshold = this.stats.levelThresholds[currentLevel];
    
    if (nextLevelThreshold && currentExp >= nextLevelThreshold) {
      // Level up!
      this.stats.level += 1;
      
      // Award skill points
      this.stats.availableSkillPoints += 3;
      
      // Scale up max stats
      this.stats.maxHealth += 10;
      this.stats.health = this.stats.maxHealth; // Fill health on level up
      
      this.stats.maxQuantumEnergy += 15;
      this.stats.quantumEnergy = this.stats.maxQuantumEnergy; // Fill energy on level up
      
      this.stats.maxQuantumStability += 5;
      this.stats.quantumStability = this.stats.maxQuantumStability; // Restore stability on level up
      
      // Emit level up event
      this.emit('levelUp', {
        oldLevel: currentLevel,
        newLevel: this.stats.level,
        experienceForNextLevel: this.getExperienceForNextLevel()
      });
      
      // Recursively check for multiple level ups
      return true;
    }
    
    return false;
  }
  
  // Get the experience required for the next level
  getExperienceForNextLevel() {
    const nextLevelThreshold = this.stats.levelThresholds[this.stats.level];
    
    if (!nextLevelThreshold) {
      // Max level reached
      return Infinity;
    }
    
    return nextLevelThreshold - this.stats.experience;
  }
  
  // Spend a skill point to improve a stat
  spendSkillPoint(statName, amount = 1) {
    // Check if we have enough skill points
    if (this.stats.availableSkillPoints < amount) {
      this.emit('insufficientSkillPoints', {
        required: amount,
        available: this.stats.availableSkillPoints
      });
      return false;
    }
    
    // Check if the stat can be improved with skill points
    const improvableStats = [
      'maxHealth',
      'maxQuantumEnergy',
      'quantumEnergyRegenRate',
      'maxQuantumStability',
      'quantumStabilityRegenRate',
      'dimensionalSynchronicity',
      'temporalCoherence',
      'molecularControl',
      'entanglementAccuracy',
      'radiationResistance',
      'temporalDisruptionResistance',
      'quantumDecayResistance'
    ];
    
    if (!improvableStats.includes(statName)) {
      console.warn(`Stat ${statName} cannot be improved with skill points`);
      return false;
    }
    
    // Apply the improvement
    let improvement = 0;
    
    // Different stats get different amounts of improvement per point
    switch (statName) {
      case 'maxHealth':
        improvement = 10 * amount;
        break;
      case 'maxQuantumEnergy':
        improvement = 15 * amount;
        break;
      case 'quantumEnergyRegenRate':
        improvement = 0.5 * amount;
        break;
      case 'maxQuantumStability':
        improvement = 5 * amount;
        break;
      case 'quantumStabilityRegenRate':
        improvement = 0.2 * amount;
        break;
      case 'dimensionalSynchronicity':
      case 'temporalCoherence':
      case 'molecularControl':
      case 'entanglementAccuracy':
        improvement = 5 * amount;
        break;
      case 'radiationResistance':
      case 'temporalDisruptionResistance':
      case 'quantumDecayResistance':
        improvement = 2 * amount;
        break;
    }
    
    // Apply the improvement to the base stat
    this.stats[statName] += improvement;
    
    // Deduct skill points
    this.stats.availableSkillPoints -= amount;
    this.stats.spentSkillPoints += amount;
    
    // If improving max health or energy, also restore that amount
    if (statName === 'maxHealth') {
      this.modifyStat('health', improvement);
    } else if (statName === 'maxQuantumEnergy') {
      this.modifyStat('quantumEnergy', improvement);
    } else if (statName === 'maxQuantumStability') {
      this.modifyStat('quantumStability', improvement);
    }
    
    // Emit skill point spent event
    this.emit('skillPointSpent', {
      stat: statName,
      pointsSpent: amount,
      improvement,
      remainingPoints: this.stats.availableSkillPoints
    });
    
    return true;
  }
  
  // Save stats to an object (for serialization)
  save() {
    return {
      stats: { ...this.stats },
      modifiers: { ...this.modifiers },
      cooldowns: { ...this.cooldowns }
    };
  }
  
  // Load stats from a saved object
  load(savedData) {
    if (savedData.stats) this.stats = { ...savedData.stats };
    if (savedData.modifiers) this.modifiers = { ...savedData.modifiers };
    if (savedData.cooldowns) this.cooldowns = { ...savedData.cooldowns };
    
    // Reset update timer
    this.lastUpdateTime = Date.now();
    
    // Emit stats loaded event
    this.emit('statsLoaded');
    
    return true;
  }
}

export default CharacterStats;