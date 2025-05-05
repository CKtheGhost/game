import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useGameState } from '../contexts/GameStateContext';
import * as THREE from 'three';
import { useInView } from 'react-use';

// Styled components for the loader UI
const LoaderContainer = styled.div`
  position: fixed;
  top: ${props => props.isVisible ? '0' : '-100px'};
  left: 0;
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 9999;
  transition: top 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 500px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0.5rem 0;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress || 0}%;
    background: linear-gradient(to right, #00ffff, #ff00ff);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

const LoadingText = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  text-align: center;
`;

// Mock asset data (in a real app, this would come from an API or config file)
const levelAssets = {
  0: { // INTRO
    models: [],
    textures: ['quantum_logo.jpg'],
    sounds: ['ambient_intro.mp3'],
    totalSize: 2.5, // MB
  },
  1: { // DISCOVERY
    models: ['quantum_crystal.glb'],
    textures: ['particles_discovery.jpg'],
    sounds: ['discovery_soundtrack.mp3'],
    totalSize: 8.2,
  },
  2: { // CHALLENGE
    models: ['puzzle_pieces.glb'],
    textures: ['entanglement_texture.jpg'],
    sounds: ['puzzle_ambient.mp3', 'success.mp3'],
    totalSize: 12.5,
  },
  3: { // CONFLICT
    models: ['wave_particle.glb'],
    textures: ['duality_normal.jpg', 'duality_roughness.jpg'],
    sounds: ['conflict_theme.mp3'],
    totalSize: 15.8,
  },
  4: { // REVELATION
    models: ['observer_effect.glb'],
    textures: ['revelation_emission.jpg'],
    sounds: ['revelation_ambient.mp3', 'epiphany.mp3'],
    totalSize: 18.3,
  },
  5: { // TRANSFORMATION
    models: ['quantum_self.glb'],
    textures: ['superposition_texture.jpg', 'identity_emission.jpg'],
    sounds: ['transformation_theme.mp3'],
    totalSize: 22.7,
  },
  6: { // ASCENSION
    models: ['dimensional_gateway.glb'],
    textures: ['spacetime_texture.jpg', 'dimensions_normal.jpg'],
    sounds: ['ascension_theme.mp3', 'dimension_shift.mp3'],
    totalSize: 28.5,
  },
  7: { // ENLIGHTENMENT
    models: ['quantum_field.glb'],
    textures: ['enlightenment_hdri.jpg'],
    sounds: ['enlightenment_ambient.mp3'],
    totalSize: 35.2,
  },
  8: { // TRANSCENDENCE
    models: ['consciousness_entity.glb', 'multiverse.glb'],
    textures: ['transcendence_emission.jpg', 'fractal_texture.jpg'],
    sounds: ['transcendence_theme.mp3', 'universal_harmony.mp3'],
    totalSize: 42.8,
  },
};

// Cache to track which assets have been loaded
const loadedAssets = {
  models: {},
  textures: {},
  sounds: {},
};

// Mock loading functions (in a real app, these would actually load assets)
const loadModel = async (modelName) => {
  if (loadedAssets.models[modelName]) {
    return loadedAssets.models[modelName];
  }
  
  // Simulate network delay
  return new Promise((resolve) => {
    const loadTime = Math.random() * 2000 + 1000; // 1-3 seconds
    
    setTimeout(() => {
      // In a real app, this would use GLTFLoader or similar
      const mockModel = {
        name: modelName,
        type: 'model',
        // Mock properties that a real model would have
        scene: new THREE.Group(),
        animations: [],
      };
      
      loadedAssets.models[modelName] = mockModel;
      resolve(mockModel);
    }, loadTime);
  });
};

const loadTexture = async (textureName) => {
  if (loadedAssets.textures[textureName]) {
    return loadedAssets.textures[textureName];
  }
  
  // Simulate network delay
  return new Promise((resolve) => {
    const loadTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    
    setTimeout(() => {
      // In a real app, this would use TextureLoader
      const mockTexture = {
        name: textureName,
        type: 'texture',
        // Mock texture properties
        image: { width: 1024, height: 1024 },
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
      };
      
      loadedAssets.textures[textureName] = mockTexture;
      resolve(mockTexture);
    }, loadTime);
  });
};

const loadSound = async (soundName) => {
  if (loadedAssets.sounds[soundName]) {
    return loadedAssets.sounds[soundName];
  }
  
  // Simulate network delay
  return new Promise((resolve) => {
    const loadTime = Math.random() * 1500 + 500; // 0.5-2 seconds
    
    setTimeout(() => {
      // In a real app, this would use an audio library or the Web Audio API
      const mockSound = {
        name: soundName,
        type: 'sound',
        // Mock audio properties
        play: () => console.log(`Playing sound: ${soundName}`),
        stop: () => console.log(`Stopping sound: ${soundName}`),
        volume: 1.0,
      };
      
      loadedAssets.sounds[soundName] = mockSound;
      resolve(mockSound);
    }, loadTime);
  });
};

// Preload assets for the current and next level
const preloadAssetsForLevel = async (level, onProgress) => {
  // Get assets for current level
  const assets = levelAssets[level];
  if (!assets) return [];
  
  const totalAssets = [
    ...assets.models,
    ...assets.textures,
    ...assets.sounds
  ].length;
  
  let loadedCount = 0;
  const loadingPromises = [];
  
  // Load models
  for (const model of assets.models) {
    const promise = loadModel(model).then(result => {
      loadedCount++;
      onProgress(loadedCount / totalAssets * 100);
      return result;
    });
    loadingPromises.push(promise);
  }
  
  // Load textures
  for (const texture of assets.textures) {
    const promise = loadTexture(texture).then(result => {
      loadedCount++;
      onProgress(loadedCount / totalAssets * 100);
      return result;
    });
    loadingPromises.push(promise);
  }
  
  // Load sounds
  for (const sound of assets.sounds) {
    const promise = loadSound(sound).then(result => {
      loadedCount++;
      onProgress(loadedCount / totalAssets * 100);
      return result;
    });
    loadingPromises.push(promise);
  }
  
  return Promise.all(loadingPromises);
};

// Dynamic asset loader component
const AssetLoader = () => {
  const { currentLevel, isLowPerformanceMode } = useGameState();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState(null);
  const [loadingRef, inView] = useInView({
    threshold: 0.1,
  });
  
  // Function to load assets for a specific level
  const loadAssetsForLevel = useCallback(async (level) => {
    // If already loading this level or assets are already loaded, skip
    if (loadingLevel === level) return;
    
    // Get the level and next level's assets
    const nextLevel = Math.min(level + 1, 8); // Ensure we don't exceed max level
    
    setIsLoading(true);
    setIsVisible(true);
    setLoadingLevel(level);
    setLoadingProgress(0);
    
    try {
      // Load current level's assets
      await preloadAssetsForLevel(level, (progress) => {
        setLoadingProgress(progress * 0.7); // Current level gets 70% of the progress bar
      });
      
      // Start preloading next level's assets if not in low performance mode
      if (!isLowPerformanceMode) {
        await preloadAssetsForLevel(nextLevel, (progress) => {
          // Next level gets 30% of the progress bar, starting from 70%
          setLoadingProgress(70 + (progress * 0.3));
        });
      } else {
        // In low performance mode, we'll skip preloading and just complete the progress bar
        setLoadingProgress(100);
      }
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      // Complete the progress bar animation
      setLoadingProgress(100);
      
      // Hide the loader after a delay
      setTimeout(() => {
        setIsVisible(false);
        setIsLoading(false);
      }, 1000);
    }
  }, [isLowPerformanceMode, loadingLevel]);
  
  // Monitor level changes to trigger asset loading
  useEffect(() => {
    if (inView) {
      loadAssetsForLevel(currentLevel);
    }
  }, [currentLevel, inView, loadAssetsForLevel]);
  
  // Expose the asset loading status and progress to the global window object
  // for debugging and external integration
  useEffect(() => {
    window.quantumAssetLoader = {
      isLoading,
      loadingProgress,
      currentLevel,
      loadedAssets,
      forceLoad: (level) => loadAssetsForLevel(level),
    };
    
    return () => {
      delete window.quantumAssetLoader;
    };
  }, [isLoading, loadingProgress, currentLevel, loadAssetsForLevel]);
  
  // Add a ref to the first section of each level to trigger loading when in view
  useEffect(() => {
    const sections = document.querySelectorAll('section[data-level]');
    
    sections.forEach(section => {
      const levelId = parseInt(section.dataset.level, 10);
      if (levelId === currentLevel) {
        section.ref = loadingRef;
      }
    });
  }, [currentLevel, loadingRef]);
  
  return (
    <LoaderContainer isVisible={isVisible}>
      <LoadingText>
        {isLoading ? (
          `Loading quantum assets for level ${loadingLevel + 1}... ${Math.floor(loadingProgress)}%`
        ) : (
          'All assets loaded'
        )}
      </LoadingText>
      <ProgressBar progress={loadingProgress} />
    </LoaderContainer>
  );
};

export default AssetLoader;