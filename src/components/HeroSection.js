import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Preload, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGameState } from '../contexts/GameStateContext';
import { createParticleSystem, getLowPerformanceSettings, getHighPerformanceSettings } from '../utils/three-config';
import styled from 'styled-components';

// Particle material with custom shaders
const ParticleMaterial = () => {
  const material = useRef();
  const { clock } = useThree();
  
  // Custom shaders for the particles
  const vertexShader = `
    attribute float scale;
    varying vec3 vColor;
    
    void main() {
      vec3 pos = position;
      
      // Time-based animation
      float time = float(${clock.elapsedTime.toFixed(1)});
      pos.x += sin(pos.y * 0.2 + time * 0.5) * 0.5;
      pos.y += cos(pos.x * 0.1 + time * 0.3) * 0.5;
      pos.z += sin(pos.x * 0.3 + time * 0.2) * 0.5;
      
      // Color based on position
      vColor = vec3(
        abs(sin(pos.x * 0.05 + time * 0.2)),
        abs(cos(pos.y * 0.1 + time * 0.3)),
        abs(sin(pos.z * 0.07 + time * 0.1))
      );
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = scale * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  const fragmentShader = `
    varying vec3 vColor;
    
    void main() {
      // Circular point shape
      float strength = distance(gl_PointCoord, vec2(0.5));
      strength = 1.0 - strength;
      strength = pow(strength, 3.0);
      
      // Combine with color
      vec3 finalColor = vColor * strength;
      gl_FragColor = vec4(finalColor, strength);
    }
  `;
  
  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.time.value = clock.getElapsedTime();
    }
  });
  
  return (
    <shaderMaterial
      ref={material}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      uniforms={{ time: { value: 0 } }}
    />
  );
};

// Particle effect component
const ParticleEffect = () => {
  const { isLowPerformanceMode } = useGameState();
  const points = useRef();
  const particlesGeometry = useRef();
  
  useEffect(() => {
    const settings = isLowPerformanceMode 
      ? getLowPerformanceSettings() 
      : getHighPerformanceSettings();
      
    particlesGeometry.current = createParticleSystem(settings.particleCount);
  }, [isLowPerformanceMode]);
  
  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
      points.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
    }
  });
  
  return (
    <points ref={points}>
      {particlesGeometry.current && <primitive object={particlesGeometry.current} attach="geometry" />}
      <ParticleMaterial />
    </points>
  );
};

// Animated logo component
const QuantumLogo = () => {
  const mesh = useRef();
  
  useEffect(() => {
    // Logo animation with GSAP
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    tl.to(mesh.current.position, {
      y: 0.5,
      duration: 2,
      ease: "power1.inOut"
    });
    
    tl.to(mesh.current.rotation, {
      y: Math.PI * 2,
      duration: 8,
      ease: "power1.inOut"
    }, 0);
  }, []);
  
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial 
        color="#00ffff"
        emissive="#005555"
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
};

// Environment light setup
const LightSetup = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.2} color="#ff00ff" />
      <pointLight position={[5, -5, 5]} intensity={0.2} color="#00ffff" />
    </>
  );
};

// Scene setup with movement animation
const Scene = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 10);
    
    // Animate camera position on load
    gsap.to(camera.position, {
      z: 8,
      duration: 2,
      ease: "power2.out"
    });
  }, [camera]);
  
  return (
    <>
      <LightSetup />
      <ParticleEffect />
      <QuantumLogo />
    </>
  );
};

// Styled components for the UI
const HeroContainer = styled.div\`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
\`;

const CanvasContainer = styled.div\`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
\`;

const ContentOverlay = styled.div\`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  z-index: 10;
  pointer-events: none;
\`;

const Title = styled.h1\`
  font-size: clamp(2rem, 8vw, 6rem);
  text-align: center;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(120deg, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
\`;

const Subtitle = styled.p\`
  font-size: clamp(1rem, 3vw, 1.5rem);
  text-align: center;
  max-width: 800px;
  margin: 2rem 0;
  line-height: 1.5;
\`;

const ScrollPrompt = styled.div\`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  opacity: 0.7;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &::after {
    content: '';
    width: 20px;
    height: 20px;
    border-right: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(45deg);
    margin-top: 0.5rem;
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) rotate(45deg);
    }
    40% {
      transform: translateY(-10px) rotate(45deg);
    }
    60% {
      transform: translateY(-5px) rotate(45deg);
    }
  }
\`;

// Main Hero component
const HeroSection = () => {
  const { isLowPerformanceMode } = useGameState();
  
  return (
    <HeroContainer>
      <CanvasContainer>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 70 }}
          dpr={[1, isLowPerformanceMode ? 1.5 : 2]}
        >
          <Scene />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            rotateSpeed={0.5}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
          <AdaptiveDpr pixelated />
          <Preload all />
        </Canvas>
      </CanvasContainer>
      
      <ContentOverlay>
        <Title>Quantum Salvation Labs</Title>
        <Subtitle>
          Journey through the quantum realm to unlock the secrets of consciousness
          and transcend the limitations of human perception.
        </Subtitle>
        <ScrollPrompt>Scroll to Begin Journey</ScrollPrompt>
      </ContentOverlay>
    </HeroContainer>
  );
};

export default HeroSection;