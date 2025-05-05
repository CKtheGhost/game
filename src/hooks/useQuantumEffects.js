import { useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { performanceSettings } from '../utils/performance';

/**
 * Hook for managing quantum visual effects and abilities
 */
export const useQuantumEffects = () => {
  const { scene, camera, gl } = useThree();
  
  // Effect definitions - these would be implemented with various Three.js effects
  const effectDefinitions = useMemo(() => ({
    // Phase Shifting - allows player to pass through certain barriers
    phaseShift: {
      apply: (targetObject) => {
        // Apply phase shift visual effect
        const applyToMesh = (object) => {
          if (object.isMesh && object.material) {
            // Store original opacity for restoration
            if (!object.userData.originalOpacity) {
              object.userData.originalOpacity = object.material.opacity || 1;
            }
            
            // Make material semi-transparent
            object.material.transparent = true;
            object.material.opacity = 0.4;
            object.material.needsUpdate = true;
          }
        };
        
        // Apply to target object and its children
        if (targetObject) {
          applyToMesh(targetObject);
          targetObject.traverse(applyToMesh);
        }
      },
      
      remove: (targetObject) => {
        // Remove phase shift effect
        const removeFromMesh = (object) => {
          if (object.isMesh && object.material && object.userData.originalOpacity !== undefined) {
            // Restore original opacity
            object.material.opacity = object.userData.originalOpacity;
            object.material.transparent = object.userData.originalOpacity < 1;
            object.material.needsUpdate = true;
          }
        };
        
        if (targetObject) {
          removeFromMesh(targetObject);
          targetObject.traverse(removeFromMesh);
        }
      }
    },
    
    // Time Dilation - slows down or speeds up elements in a field
    timeDilation: {
      apply: (targetObject) => {
        // Apply time dilation visual effect - a spherical distortion field
        const dilationField = new THREE.Mesh(
          new THREE.SphereGeometry(5, 32, 32),
          new THREE.ShaderMaterial({
            uniforms: {
              time: { value: 0 },
              radius: { value: 5 },
              strength: { value: 1.0 }
            },
            vertexShader: `
              varying vec3 vPosition;
              void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float time;
              uniform float radius;
              uniform float strength;
              varying vec3 vPosition;
              
              void main() {
                float dist = length(vPosition);
                float alpha = 1.0 - (dist / radius);
                
                // Pulsing effect
                alpha *= 0.6 + 0.4 * sin(time * 2.0);
                
                // Edge glow
                alpha = pow(alpha, 2.0);
                
                vec3 color = vec3(0.2, 0.6, 1.0); // Blue-teal color
                
                // Color shift based on time
                color.r += 0.1 * sin(time * 3.0);
                color.g += 0.1 * sin(time * 2.0);
                
                gl_FragColor = vec4(color, alpha * strength);
              }
            `,
            transparent: true,
            side: THREE.DoubleSide
          })
        );
        
        dilationField.name = 'timeDilationField';
        dilationField.userData.isEffect = true;
        dilationField.userData.creationTime = Date.now();
        
        // Add to scene or target object
        if (targetObject) {
          targetObject.add(dilationField);
        } else {
          scene.add(dilationField);
        }
        
        // Add update function for the effect
        dilationField.userData.update = (delta) => {
          dilationField.material.uniforms.time.value += delta;
        };
      },
      
      remove: (targetObject) => {
        // Find and remove dilation field
        const findAndRemove = (parent) => {
          const field = parent.getObjectByName('timeDilationField');
          if (field) {
            parent.remove(field);
            field.geometry.dispose();
            field.material.dispose();
          }
        };
        
        if (targetObject) {
          findAndRemove(targetObject);
        } else {
          findAndRemove(scene);
        }
      }
    },
    
    // Molecular Reconstruction - transforms or reconstructs matter
    molecularReconstruction: {
      apply: (targetObject) => {
        if (!targetObject) return;
        
        // Store original geometry for restoration
        if (!targetObject.userData.originalGeometry && targetObject.geometry) {
          targetObject.userData.originalGeometry = targetObject.geometry.clone();
        }
        
        // Apply distortion effect to geometry
        if (targetObject.geometry) {
          const geometry = targetObject.geometry;
          const detailLevel = performanceSettings.getDetailLevel();
          
          // Different complexity based on detail level
          let strength = 0.2;
          if (detailLevel === 'high') {
            strength = 0.3;
          } else if (detailLevel === 'low' || detailLevel === 'minimal') {
            strength = 0.1;
          }
          
          // Apply distortion to vertices
          if (geometry.attributes && geometry.attributes.position) {
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
              positions[i] += (Math.random() - 0.5) * strength;
              positions[i + 1] += (Math.random() - 0.5) * strength;
              positions[i + 2] += (Math.random() - 0.5) * strength;
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals();
          }
        }
      },
      
      remove: (targetObject) => {
        // Restore original geometry
        if (targetObject && targetObject.userData.originalGeometry) {
          const oldGeometry = targetObject.geometry;
          targetObject.geometry = targetObject.userData.originalGeometry;
          targetObject.userData.originalGeometry = null;
          
          if (oldGeometry) {
            oldGeometry.dispose();
          }
        }
      }
    },
    
    // Quantum Entanglement - links objects across space
    quantumEntanglement: {
      apply: (targetObject) => {
        // Visual effect for quantum entanglement - a linking beam
        if (!targetObject) return;
        
        const startPosition = new THREE.Vector3(0, 0, 0);
        const endPosition = targetObject.position.clone();
        
        // Create line geometry
        const points = [];
        points.push(startPosition);
        points.push(endPosition);
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create line material
        const material = new THREE.LineBasicMaterial({
          color: 0xff00ff,
          linewidth: 2,
          opacity: 0.8,
          transparent: true
        });
        
        // Create line
        const line = new THREE.Line(geometry, material);
        line.name = 'entanglementBeam';
        line.userData.isEffect = true;
        line.userData.startObject = camera;
        line.userData.endObject = targetObject;
        
        // Add update function
        line.userData.update = () => {
          if (line.userData.startObject && line.userData.endObject) {
            // Get world positions
            const startPos = new THREE.Vector3();
            line.userData.startObject.getWorldPosition(startPos);
            
            const endPos = new THREE.Vector3();
            line.userData.endObject.getWorldPosition(endPos);
            
            // Update geometry
            const points = [startPos, endPos];
            line.geometry.setFromPoints(points);
          }
        };
        
        scene.add(line);
      },
      
      remove: (targetObject) => {
        // Remove entanglement beam
        const beam = scene.getObjectByName('entanglementBeam');
        if (beam) {
          scene.remove(beam);
          beam.geometry.dispose();
          beam.material.dispose();
        }
      }
    }
  }), [scene, camera]);
  
  // Apply a quantum effect to a target
  const applyQuantumEffect = useCallback((effectName, target = null) => {
    const effect = effectDefinitions[effectName];
    if (effect && effect.apply) {
      effect.apply(target);
      return true;
    }
    return false;
  }, [effectDefinitions]);
  
  // Remove a quantum effect from a target
  const removeQuantumEffect = useCallback((effectName, target = null) => {
    const effect = effectDefinitions[effectName];
    if (effect && effect.remove) {
      effect.remove(target);
      return true;
    }
    return false;
  }, [effectDefinitions]);
  
  // Update all active quantum effects
  const updateQuantumEffects = useCallback((delta) => {
    // Find all objects with effects and update them
    scene.traverse((object) => {
      if (object.userData.isEffect && object.userData.update) {
        object.userData.update(delta);
      }
    });
  }, [scene]);
  
  return {
    applyQuantumEffect,
    removeQuantumEffect,
    updateQuantumEffects,
    availableEffects: Object.keys(effectDefinitions)
  };
};

export default useQuantumEffects;