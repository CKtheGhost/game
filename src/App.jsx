import React, { useEffect } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import QuantumExplorableWorld from './components/core/QuantumExplorableWorld';
import { performanceSettings } from './utils/performance';
import { progressiveEnhancement } from './utils/progressiveEnhancement';
// Import context directly to avoid initialization issues with StateInitializer
import { GameStateProvider } from './context/GameStateContext';
import stateSynchronizer from './services/StateSynchronizer';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000000;
    color: #ffffff;
    font-family: 'Arial', sans-serif;
  }
  
  #root {
    width: 100%;
    height: 100%;
  }
  
  /* Quantum-themed scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: rgba(100, 70, 255, 0.6);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(120, 90, 255, 0.8);
  }
`;

// Theme configuration
const theme = {
  colors: {
    background: '#000000',
    primary: '#6644ff',
    secondary: '#00aaff',
    accent: '#ff44aa',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff3300'
  },
  fonts: {
    main: "'Arial', sans-serif",
    headings: "'Arial', sans-serif"
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    widescreen: '1200px'
  },
  sizes: {
    headerHeight: '60px',
    footerHeight: '40px'
  },
  animations: {
    fast: '0.2s',
    medium: '0.4s',
    slow: '0.8s'
  }
};

/**
 * Main application component
 */
const App = () => {
  // Initialize systems on mount
  useEffect(() => {
    console.log('Initializing Quantum Salvation Labs...');
    
    // Initialize performance measurement
    console.log(`Performance settings: ${performanceSettings.getDetailLevel()}`);
    
    // Initialize state synchronization directly
    const cleanup = () => {
      // Cleanup function for event listeners
      console.log('Cleaning up state synchronization');
    };
    
    // Register core components with state synchronizer
    stateSynchronizer.registerComponent('app', (data) => {
      console.log('App state updated:', data);
    });
    
    // Initialize feedback API
    window.addEventListener('quantum-feedback-test', (event) => {
      console.log('Feedback system test triggered:', event.detail);
    });
    
    // Cleanup on unmount
    return () => {
      cleanup();
      window.removeEventListener('quantum-feedback-test');
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GameStateProvider>
        <QuantumExplorableWorld />
      </GameStateProvider>
    </ThemeProvider>
  );
};

export default App;