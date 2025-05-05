import CharacterDemo from './demo/CharacterDemo';

// Create and initialize the character demo
document.addEventListener('DOMContentLoaded', () => {
  // Create container
  const container = document.createElement('div');
  container.id = 'character-demo';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.margin = '0';
  container.style.padding = '0';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);
  
  // Create demo
  const demo = new CharacterDemo(container);
  
  // Store demo reference in window for debugging
  window.characterDemo = demo;
  
  // Show welcome message
  const welcome = document.createElement('div');
  welcome.id = 'welcome-message';
  welcome.style.position = 'absolute';
  welcome.style.top = '50%';
  welcome.style.left = '50%';
  welcome.style.transform = 'translate(-50%, -50%)';
  welcome.style.color = 'white';
  welcome.style.fontFamily = 'sans-serif';
  welcome.style.textAlign = 'center';
  welcome.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  welcome.style.padding = '20px';
  welcome.style.borderRadius = '10px';
  welcome.style.maxWidth = '600px';
  welcome.style.zIndex = '9999';
  
  welcome.innerHTML = `
    <h1>Quantum Scientist Demo</h1>
    <p>You control a futuristic quantum scientist with advanced abilities.</p>
    <h2>Controls:</h2>
    <ul style="text-align: left;">
      <li><strong>WASD</strong>: Move</li>
      <li><strong>Space</strong>: Jump</li>
      <li><strong>Shift</strong>: Sprint</li>
      <li><strong>E</strong>: Interact with objects</li>
      <li><strong>F</strong>: Grab/Drop objects</li>
      <li><strong>V</strong>: Toggle first/third person view</li>
      <li><strong>Q</strong>: Phase Shift ability</li>
      <li><strong>R</strong>: Time Dilation ability</li>
      <li><strong>T</strong>: Molecular Reconstruction ability</li>
      <li><strong>Y</strong>: Quantum Teleportation ability</li>
      <li><strong>\`</strong> (backtick): Toggle debug information</li>
    </ul>
    <p>Look for interactive objects and experiment with your quantum abilities!</p>
    <button id="start-demo" style="padding: 10px 20px; background: #00aaff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Enter the Quantum Realm</button>
  `;
  
  container.appendChild(welcome);
  
  // Add start button handler
  document.getElementById('start-demo').addEventListener('click', () => {
    welcome.style.display = 'none';
    
    // Lock pointer for first person controls
    container.requestPointerLock = container.requestPointerLock || 
                                   container.mozRequestPointerLock || 
                                   container.webkitRequestPointerLock;
    container.requestPointerLock();
  });
  
  // Handle clean-up on unload
  window.addEventListener('beforeunload', () => {
    demo.dispose();
  });
});