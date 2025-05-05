import create from 'zustand';
import { persist } from 'zustand/middleware';
import { GAME_LEVELS } from '../contexts/GameStateContext';

/**
 * Enhanced QuantumGameStateManager using Zustand for state management
 * with persistence, efficient updates, and improved data structure
 */

// Default initial state
const initialState = {
  // Player stats
  player: {
    health: 100,
    maxHealth: 100,
    quantumEnergy: 100,
    maxQuantumEnergy: 100,
    scientificKnowledge: 0,
    maxScientificKnowledge: 100,
    level: 1,
    experience: 0,
    experienceForNextLevel: 1000,
    skillPoints: 0,
  },
  
  // Game progression
  progression: {
    currentLevel: GAME_LEVELS.INTRO,
    completedLevels: {},
    currentCircle: 0, // Dante's circle
    firstVisit: true, // First time visiting the experience
    lastActivityTimestamp: Date.now(),
  },
  
  // Achievements and unlocks
  achievements: {
    unlockedAchievements: {},
    recentAchievements: [],
    totalScore: 0,
  },
  
  // Inventory and collectibles
  inventory: {
    items: [],
    collectibles: {},
    maxCapacity: 10,
  },
  
  // Missions and objectives
  missions: {
    currentMission: null,
    completedMissions: [],
    missionProgress: {},
    objectivesCompleted: {},
  },
  
  // Quantum abilities and upgrades
  abilities: {
    phaseShift: {
      unlocked: true,
      level: 1,
      cooldown: 10,
      duration: 5,
      energyCost: 20,
    },
    timeDilation: {
      unlocked: true,
      level: 1,
      cooldown: 15,
      duration: 8,
      energyCost: 30,
      radius: 5,
    },
    molecularReconstruction: {
      unlocked: true,
      level: 1,
      cooldown: 20,
      energyCost: 40,
      strength: 1,
    },
    quantumTeleportation: {
      unlocked: true,
      level: 1,
      cooldown: 30,
      energyCost: 50,
      range: 10,
    },
  },
  
  // Story and narrative progress
  narrative: {
    discoveredLore: {},
    storyFlags: {},
    characterRelations: {},
    dialogueChoices: {},
  },
  
  // Performance and settings
  settings: {
    audio: {
      masterVolume: 1.0,
      musicVolume: 0.8,
      sfxVolume: 1.0,
      voiceVolume: 1.0,
      ambientVolume: 0.7,
    },
    graphics: {
      quality: 'auto', // auto, low, medium, high, ultra
      particleDensity: 'high', // low, medium, high
      postProcessing: true,
      shadowQuality: 'medium', // off, low, medium, high
      antiAliasing: true,
    },
    gameplay: {
      tutorialEnabled: true,
      subtitlesEnabled: true,
      controlScheme: 'default',
      cameraMode: 'thirdPerson', // firstPerson, thirdPerson
      difficultyLevel: 'normal', // easy, normal, hard, quantum
    },
    ui: {
      hudOpacity: 0.8,
      fontSize: 'medium', // small, medium, large
      colorScheme: 'default',
      showDamageNumbers: true,
      minimapEnabled: true,
      isGlassmorphismEnabled: true,
    },
    accessibility: {
      highContrastMode: false,
      reducedMotion: false,
      colorblindMode: 'off', // off, protanopia, deuteranopia, tritanopia
      textToSpeech: false,
    },
  },
  
  // Analytics and metrics (non-sensitive data)
  metrics: {
    totalPlayTime: 0,
    lastSessionStartTime: Date.now(),
    sessionCount: 1,
    deaths: 0,
    abilitiesUsed: {
      phaseShift: 0,
      timeDilation: 0,
      molecularReconstruction: 0,
      quantumTeleportation: 0,
    },
    itemsCollected: 0,
    distanceTraveled: 0,
    damageDealt: 0,
    damageTaken: 0,
    highestCombo: 0,
  },
  
  // Session-specific data (not persisted)
  session: {
    activeEffects: [],
    tempStats: {},
    combatState: 'none', // none, combat, recovery
    lastCheckpointId: null,
    debugMode: false,
  }
};

/**
 * Create Zustand store with persistence middleware
 */
export const useQuantumGameState = create(
  persist(
    (set, get) => ({
      // Include initial state
      ...initialState,
      
      // Player actions
      updatePlayerStats: (stats) => set((state) => ({
        player: { ...state.player, ...stats }
      })),
      
      addExperience: (amount) => {
        const state = get();
        let { experience, level, skillPoints } = state.player;
        
        experience += amount;
        let experienceForNextLevel = Math.round(1000 * Math.pow(1.5, level - 1));
        let newLevel = level;
        let newSkillPoints = skillPoints;
        
        // Level up if enough experience
        while (experience >= experienceForNextLevel) {
          experience -= experienceForNextLevel;
          newLevel++;
          newSkillPoints++;
          experienceForNextLevel = Math.round(1000 * Math.pow(1.5, newLevel - 1));
        }
        
        // Update state if leveled up
        if (newLevel !== level) {
          set((state) => ({
            player: {
              ...state.player,
              level: newLevel,
              experience,
              experienceForNextLevel,
              skillPoints: newSkillPoints,
              // Increase max stats on level up
              maxHealth: Math.min(state.player.maxHealth + 10, 200),
              maxQuantumEnergy: Math.min(state.player.maxQuantumEnergy + 5, 150),
              maxScientificKnowledge: Math.min(state.player.maxScientificKnowledge + 5, 150),
            }
          }));
          
          return { levelUp: true, newLevel };
        } else {
          set((state) => ({
            player: {
              ...state.player,
              experience,
              experienceForNextLevel,
            }
          }));
          
          return { levelUp: false };
        }
      },
      
      spendSkillPoint: (statName, amount = 1) => {
        const state = get();
        const { skillPoints } = state.player;
        
        if (skillPoints >= amount) {
          const updates = {};
          
          switch (statName) {
            case 'health':
              updates.maxHealth = Math.min(state.player.maxHealth + 20, 300);
              updates.health = Math.min(state.player.health + 20, updates.maxHealth);
              break;
            case 'quantumEnergy':
              updates.maxQuantumEnergy = Math.min(state.player.maxQuantumEnergy + 15, 200);
              updates.quantumEnergy = Math.min(state.player.quantumEnergy + 15, updates.maxQuantumEnergy);
              break;
            case 'scientificKnowledge':
              updates.maxScientificKnowledge = Math.min(state.player.maxScientificKnowledge + 15, 200);
              updates.scientificKnowledge = Math.min(state.player.scientificKnowledge + 15, updates.maxScientificKnowledge);
              break;
            default:
              return false;
          }
          
          set((state) => ({
            player: {
              ...state.player,
              ...updates,
              skillPoints: state.player.skillPoints - amount,
            }
          }));
          
          return true;
        }
        
        return false;
      },
      
      takeDamage: (amount, damageType = 'physical') => {
        const state = get();
        const { health } = state.player;
        
        // Apply damage reduction based on type
        let finalDamage = amount;
        
        if (damageType === 'quantum' && state.abilities.phaseShift.level > 2) {
          finalDamage *= 0.8; // 20% reduction to quantum damage at level 3+
        }
        
        const newHealth = Math.max(0, health - finalDamage);
        
        set((state) => ({
          player: {
            ...state.player,
            health: newHealth,
          },
          metrics: {
            ...state.metrics,
            damageTaken: state.metrics.damageTaken + finalDamage,
          }
        }));
        
        // Check for death
        if (newHealth <= 0) {
          set((state) => ({
            metrics: {
              ...state.metrics,
              deaths: state.metrics.deaths + 1,
            }
          }));
          
          return { died: true, damage: finalDamage };
        }
        
        return { died: false, damage: finalDamage };
      },
      
      heal: (amount, healType = 'standard') => {
        const state = get();
        const { health, maxHealth } = state.player;
        
        // Apply heal bonuses based on type
        let finalHeal = amount;
        
        if (healType === 'quantum' && state.abilities.molecularReconstruction.level > 2) {
          finalHeal *= 1.2; // 20% bonus to quantum healing at level 3+
        }
        
        const newHealth = Math.min(maxHealth, health + finalHeal);
        
        set((state) => ({
          player: {
            ...state.player,
            health: newHealth,
          }
        }));
        
        return { healedAmount: newHealth - health };
      },
      
      // Ability management
      useAbility: (abilityName) => {
        const state = get();
        
        if (!state.abilities[abilityName]?.unlocked) {
          return { success: false, reason: 'not_unlocked' };
        }
        
        const ability = state.abilities[abilityName];
        const { quantumEnergy } = state.player;
        
        if (quantumEnergy < ability.energyCost) {
          return { success: false, reason: 'insufficient_energy' };
        }
        
        set((state) => ({
          player: {
            ...state.player,
            quantumEnergy: state.player.quantumEnergy - ability.energyCost,
          },
          metrics: {
            ...state.metrics,
            abilitiesUsed: {
              ...state.metrics.abilitiesUsed,
              [abilityName]: state.metrics.abilitiesUsed[abilityName] + 1,
            }
          }
        }));
        
        return { 
          success: true, 
          ability: { ...ability },
          remainingEnergy: state.player.quantumEnergy - ability.energyCost
        };
      },
      
      upgradeAbility: (abilityName) => {
        const state = get();
        
        if (!state.abilities[abilityName]?.unlocked) {
          return { success: false, reason: 'not_unlocked' };
        }
        
        const ability = state.abilities[abilityName];
        
        if (ability.level >= 5) {
          return { success: false, reason: 'max_level' };
        }
        
        if (state.player.skillPoints < 1) {
          return { success: false, reason: 'insufficient_points' };
        }
        
        const upgrades = {
          phaseShift: {
            cooldown: [10, 9, 8, 7, 6],
            duration: [5, 6, 7, 8, 10],
            energyCost: [20, 18, 16, 14, 12],
          },
          timeDilation: {
            cooldown: [15, 14, 13, 12, 10],
            duration: [8, 10, 12, 14, 16],
            energyCost: [30, 28, 26, 24, 20],
            radius: [5, 6, 7, 9, 12],
          },
          molecularReconstruction: {
            cooldown: [20, 18, 16, 14, 12],
            energyCost: [40, 36, 32, 28, 25],
            strength: [1, 1.2, 1.5, 1.8, 2.2],
          },
          quantumTeleportation: {
            cooldown: [30, 25, 20, 15, 10],
            energyCost: [50, 45, 40, 35, 30],
            range: [10, 12, 15, 18, 25],
          },
        };
        
        const newLevel = ability.level + 1;
        const abilityUpgrades = upgrades[abilityName];
        
        const updatedAbility = {
          ...ability,
          level: newLevel,
        };
        
        // Apply upgrades
        for (const [key, values] of Object.entries(abilityUpgrades)) {
          if (Array.isArray(values) && values.length >= newLevel) {
            updatedAbility[key] = values[newLevel - 1];
          }
        }
        
        set((state) => ({
          abilities: {
            ...state.abilities,
            [abilityName]: updatedAbility,
          },
          player: {
            ...state.player,
            skillPoints: state.player.skillPoints - 1,
          }
        }));
        
        return { 
          success: true, 
          newLevel,
          ability: { ...updatedAbility },
        };
      },
      
      // Progression management
      advanceToLevel: (level) => {
        const state = get();
        const { currentLevel } = state.progression;
        
        if (level <= currentLevel) {
          return false;
        }
        
        set((state) => ({
          progression: {
            ...state.progression,
            currentLevel: level,
            completedLevels: {
              ...state.progression.completedLevels,
              [currentLevel]: {
                completed: true,
                completedAt: Date.now(),
              }
            },
            lastActivityTimestamp: Date.now(),
          }
        }));
        
        return true;
      },
      
      setDanteCircle: (circle) => set((state) => ({
        progression: {
          ...state.progression,
          currentCircle: circle,
          lastActivityTimestamp: Date.now(),
        }
      })),
      
      // Inventory management
      addItem: (item) => {
        const state = get();
        const { items, maxCapacity } = state.inventory;
        
        if (items.length >= maxCapacity) {
          return { success: false, reason: 'inventory_full' };
        }
        
        const newItem = {
          ...item,
          id: Date.now(),
          obtainedAt: Date.now(),
        };
        
        set((state) => ({
          inventory: {
            ...state.inventory,
            items: [...state.inventory.items, newItem],
          },
          metrics: {
            ...state.metrics,
            itemsCollected: state.metrics.itemsCollected + 1,
          }
        }));
        
        return { success: true, item: newItem };
      },
      
      removeItem: (itemId) => {
        const state = get();
        const { items } = state.inventory;
        const itemIndex = items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
          return { success: false, reason: 'item_not_found' };
        }
        
        set((state) => ({
          inventory: {
            ...state.inventory,
            items: [
              ...state.inventory.items.slice(0, itemIndex),
              ...state.inventory.items.slice(itemIndex + 1),
            ],
          }
        }));
        
        return { success: true };
      },
      
      addCollectible: (collectibleId, collectibleData = {}) => set((state) => ({
        inventory: {
          ...state.inventory,
          collectibles: {
            ...state.inventory.collectibles,
            [collectibleId]: {
              ...collectibleData,
              collected: true,
              collectedAt: Date.now(),
            }
          }
        }
      })),
      
      // Mission management
      startMission: (missionId, missionData = {}) => set((state) => ({
        missions: {
          ...state.missions,
          currentMission: missionId,
          missionProgress: {
            ...state.missions.missionProgress,
            [missionId]: {
              ...missionData,
              started: true,
              startedAt: Date.now(),
              progress: 0,
            }
          }
        }
      })),
      
      updateMissionProgress: (missionId, progress) => set((state) => ({
        missions: {
          ...state.missions,
          missionProgress: {
            ...state.missions.missionProgress,
            [missionId]: {
              ...state.missions.missionProgress[missionId],
              progress,
              lastUpdated: Date.now(),
            }
          }
        }
      })),
      
      completeMission: (missionId, success = true) => {
        const state = get();
        
        if (state.missions.currentMission !== missionId) {
          return { success: false, reason: 'mission_not_active' };
        }
        
        set((state) => ({
          missions: {
            ...state.missions,
            currentMission: null,
            completedMissions: [...state.missions.completedMissions, missionId],
            missionProgress: {
              ...state.missions.missionProgress,
              [missionId]: {
                ...state.missions.missionProgress[missionId],
                completed: true,
                successful: success,
                completedAt: Date.now(),
                progress: 100,
              }
            }
          }
        }));
        
        return { success: true };
      },
      
      completeObjective: (objectiveId, missionId = null) => set((state) => ({
        missions: {
          ...state.missions,
          objectivesCompleted: {
            ...state.missions.objectivesCompleted,
            [objectiveId]: {
              completed: true,
              completedAt: Date.now(),
              missionId,
            }
          }
        }
      })),
      
      // Achievement management
      unlockAchievement: (achievementId, achievementData = {}) => {
        const state = get();
        
        // Don't duplicate achievements
        if (state.achievements.unlockedAchievements[achievementId]) {
          return { success: false, reason: 'already_unlocked' };
        }
        
        const newAchievement = {
          id: achievementId,
          ...achievementData,
          unlockedAt: Date.now(),
        };
        
        set((state) => ({
          achievements: {
            ...state.achievements,
            unlockedAchievements: {
              ...state.achievements.unlockedAchievements,
              [achievementId]: newAchievement,
            },
            recentAchievements: [
              newAchievement,
              ...state.achievements.recentAchievements.slice(0, 9) // Keep last 10 achievements
            ],
            totalScore: state.achievements.totalScore + (achievementData.points || 0),
          }
        }));
        
        return { success: true, achievement: newAchievement };
      },
      
      // Narrative management
      setStoryFlag: (flag, value) => set((state) => ({
        narrative: {
          ...state.narrative,
          storyFlags: {
            ...state.narrative.storyFlags,
            [flag]: value,
          }
        }
      })),
      
      addLoreItem: (loreId, loreData) => set((state) => ({
        narrative: {
          ...state.narrative,
          discoveredLore: {
            ...state.narrative.discoveredLore,
            [loreId]: {
              ...loreData,
              discovered: true,
              discoveredAt: Date.now(),
            }
          }
        }
      })),
      
      recordDialogueChoice: (dialogueId, choiceId, effects = {}) => set((state) => ({
        narrative: {
          ...state.narrative,
          dialogueChoices: {
            ...state.narrative.dialogueChoices,
            [dialogueId]: {
              choice: choiceId,
              effects,
              madeAt: Date.now(),
            }
          }
        }
      })),
      
      // Settings management
      updateSettings: (settingsPath, value) => {
        const state = get();
        const pathParts = settingsPath.split('.');
        
        if (pathParts.length !== 2 || !state.settings[pathParts[0]]) {
          return false;
        }
        
        set((state) => {
          const category = pathParts[0];
          const setting = pathParts[1];
          
          return {
            settings: {
              ...state.settings,
              [category]: {
                ...state.settings[category],
                [setting]: value,
              }
            }
          };
        });
        
        return true;
      },
      
      // Metrics tracking
      updateMetrics: (metrics) => set((state) => ({
        metrics: {
          ...state.metrics,
          ...metrics,
        }
      })),
      
      // Session management
      resetSessionData: () => set((state) => ({
        session: {
          ...initialState.session,
        }
      })),
      
      // Game state management
      resetGame: () => set((state) => ({
        ...initialState,
        // Preserve settings and metrics
        settings: state.settings,
        metrics: {
          ...state.metrics,
          sessionCount: state.metrics.sessionCount + 1,
          lastSessionStartTime: Date.now(),
        },
      })),
      
      updateLastActivity: () => set((state) => ({
        progression: {
          ...state.progression,
          lastActivityTimestamp: Date.now(),
          firstVisit: false,
        }
      })),
      
      // Combat tracking
      setInCombat: (inCombat) => set((state) => ({
        session: {
          ...state.session,
          combatState: inCombat ? 'combat' : 'recovery',
        }
      })),
      
      updateCombo: (combo) => {
        const state = get();
        
        if (combo > state.metrics.highestCombo) {
          set((state) => ({
            metrics: {
              ...state.metrics,
              highestCombo: combo,
            }
          }));
        }
      },
      
      // Debug helpers
      toggleDebugMode: () => set((state) => ({
        session: {
          ...state.session,
          debugMode: !state.session.debugMode,
        }
      })),
      
      // Utility functions for getting computed/derived state
      getDerivedStats: () => {
        const state = get();
        
        // Calculate derived stats here
        const abilityPower = (state.player.scientificKnowledge / 100) * 0.5 + 1;
        
        return {
          abilityPower, // 1.0 at base, scales with knowledge
          movementSpeed: 1.0 + (state.player.level - 1) * 0.05, // 5% per level
          jumpHeight: 1.0 + (state.player.level - 1) * 0.02, // 2% per level
          teleportAccuracy: 0.7 + (state.abilities.quantumTeleportation.level * 0.05), // 75% to 95%
          phaseShiftOpacity: 0.3 - (state.abilities.phaseShift.level * 0.05), // 25% to 5%
          timeDilationFactor: 0.5 - (state.abilities.timeDilation.level * 0.05), // 45% to 25%
        };
      },
      
      getAchievementProgress: () => {
        const state = get();
        
        // Achievement tracking
        const unlockedCount = Object.keys(state.achievements.unlockedAchievements).length;
        const totalAchievements = 50; // Example number, replace with actual count
        
        return {
          unlockedCount,
          totalAchievements,
          percentComplete: Math.floor((unlockedCount / totalAchievements) * 100),
        };
      },
      
      // Player status checks
      isPlayerAtFullHealth: () => {
        const state = get();
        return state.player.health >= state.player.maxHealth;
      },
      
      getAbilityCooldownStatus: () => {
        const state = get();
        const now = Date.now();
        
        // Check cooldowns in session data
        const cooldowns = {};
        
        for (const [ability, data] of Object.entries(state.abilities)) {
          if (data.unlocked) {
            const lastUsed = state.session.activeEffects.find(
              effect => effect.type === `${ability}:cooldown`
            );
            
            cooldowns[ability] = {
              ready: !lastUsed,
              remainingCooldown: lastUsed 
                ? Math.max(0, data.cooldown * 1000 - (now - lastUsed.startTime))
                : 0,
              cooldownPercent: lastUsed 
                ? Math.max(0, 100 * (1 - (now - lastUsed.startTime) / (data.cooldown * 1000)))
                : 0
            };
          }
        }
        
        return cooldowns;
      },
      
      // Time tracking
      updatePlayTime: () => {
        const state = get();
        const now = Date.now();
        const sessionDuration = (now - state.metrics.lastSessionStartTime) / 1000; // in seconds
        
        set((state) => ({
          metrics: {
            ...state.metrics,
            totalPlayTime: state.metrics.totalPlayTime + sessionDuration,
            lastSessionStartTime: now,
          }
        }));
        
        return { sessionDuration };
      },
    }),
    {
      name: 'quantum-salvation-state',
      partialize: (state) => {
        // Don't persist session-specific data
        const { session, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);

/**
 * Hook to access game state context with additional utilities
 */
export const useQuantumGame = () => {
  const gameState = useQuantumGameState();
  
  // Add derived state and utility functions
  return {
    ...gameState,
    
    // Additional utilities and computed properties
    isFirstVisit: gameState.progression.firstVisit,
    
    isAbilityReady: (abilityName) => {
      const cooldowns = gameState.getAbilityCooldownStatus();
      return cooldowns[abilityName]?.ready || false;
    },
    
    getAbilityInfo: (abilityName) => {
      const ability = gameState.abilities[abilityName];
      if (!ability) return null;
      
      const cooldowns = gameState.getAbilityCooldownStatus();
      return {
        ...ability,
        ...(cooldowns[abilityName] || { ready: true, remainingCooldown: 0, cooldownPercent: 0 }),
      };
    },
    
    getPlayerStatus: () => {
      const { health, maxHealth, quantumEnergy, maxQuantumEnergy } = gameState.player;
      return {
        healthPercent: Math.floor((health / maxHealth) * 100),
        energyPercent: Math.floor((quantumEnergy / maxQuantumEnergy) * 100),
        isLowHealth: health < maxHealth * 0.3,
        isLowEnergy: quantumEnergy < maxQuantumEnergy * 0.3,
      };
    },
    
    getPlayTimeFormatted: () => {
      const totalSeconds = gameState.metrics.totalPlayTime;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    getDevicePerformanceProfile: () => {
      // Return appropriate settings based on device capability
      const performanceEnv = window.quantumSalvationEnv || {};
      
      if (performanceEnv.isLowPerformance || !performanceEnv.hasWebGL) {
        return 'low';
      }
      
      // Simple heuristic based on memory and processor cores
      if (navigator.deviceMemory && navigator.hardwareConcurrency) {
        if (navigator.deviceMemory >= 8 && navigator.hardwareConcurrency >= 8) {
          return 'high';
        } else if (navigator.deviceMemory >= 4 && navigator.hardwareConcurrency >= 4) {
          return 'medium';
        }
      }
      
      return 'medium'; // Default fallback
    },
    
    optimizeForDevice: () => {
      const profile = useQuantumGame().getDevicePerformanceProfile();
      
      // Apply optimized settings based on profile
      const optimizedSettings = {
        low: {
          'graphics.quality': 'low',
          'graphics.particleDensity': 'low',
          'graphics.postProcessing': false,
          'graphics.shadowQuality': 'off',
          'graphics.antiAliasing': false,
        },
        medium: {
          'graphics.quality': 'medium',
          'graphics.particleDensity': 'medium',
          'graphics.postProcessing': true,
          'graphics.shadowQuality': 'medium',
          'graphics.antiAliasing': true,
        },
        high: {
          'graphics.quality': 'high',
          'graphics.particleDensity': 'high',
          'graphics.postProcessing': true,
          'graphics.shadowQuality': 'high',
          'graphics.antiAliasing': true,
        }
      }[profile];
      
      // Apply settings
      Object.entries(optimizedSettings).forEach(([path, value]) => {
        gameState.updateSettings(path, value);
      });
      
      return { profile, settings: optimizedSettings };
    }
  };
};

export default useQuantumGame;