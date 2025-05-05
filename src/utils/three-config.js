import * as THREE from 'three';

export const createScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 10, 50);
  
  return scene;
};

export const createCamera = (aspect = window.innerWidth / window.innerHeight) => {
  const camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 100);
  camera.position.set(0, 0, 5);
  
  return camera;
};

export const createRenderer = (canvas) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  return renderer;
};

export const createParticleSystem = (count = 10000) => {
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 30;
    positions[i3 + 2] = (Math.random() - 0.5) * 30;
    
    scales[i] = Math.random();
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  
  return particlesGeometry;
};

export const handleResize = (camera, renderer) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

export const loadTexture = (path) => {
  const textureLoader = new THREE.TextureLoader();
  return textureLoader.load(path);
};

export const loadModel = async (path) => {
  // Placeholder for future GLTFLoader implementation
  console.log(`Loading model: ${path}`);
  return null;
};

export const getLowPerformanceSettings = () => ({
  particleCount: 2000,
  shadows: false,
  postprocessing: false,
  textureQuality: 'low',
  drawDistance: 25,
});

export const getHighPerformanceSettings = () => ({
  particleCount: 10000,
  shadows: true,
  postprocessing: true,
  textureQuality: 'high',
  drawDistance: 50,
});