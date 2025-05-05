import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantumGame } from '../state/QuantumGameStateManager';

/**
 * QuantumSocialSharing
 * 
 * Comprehensive sharing system for Quantum Salvation achievements, experiment results,
 * and interesting moments with social media integration and image generation.
 */

// Styled components
const ShareContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
`;

const SharePanel = styled(motion.div)`
  background: rgba(10, 15, 35, 0.95);
  width: 500px;
  max-width: 90vw;
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 150, 255, 0.3);
  overflow: hidden;
`;

const ShareHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 24px;
    background: linear-gradient(120deg, #00ffff, #0088ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }
`;

const SharePreview = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1200 / 630;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ShareText = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: white;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: rgba(0, 200, 255, 0.6);
  }
`;

const ShareActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const ShareButton = styled(motion.button)`
  background: ${props => props.bgColor || 'rgba(0, 150, 255, 0.2)'};
  border: 1px solid ${props => props.borderColor || 'rgba(0, 200, 255, 0.5)'};
  border-radius: 8px;
  padding: 10px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const CustomizerSection = styled.div`
  margin: 20px 0;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #00ddff;
  }
`;

const CustomizerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const ThemeSelector = styled.div`
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
`;

const ThemeOption = styled.button`
  flex: 1;
  padding: 8px;
  background: ${props => props.active ? 'rgba(0, 200, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 200, 255, 0.2);
  }
`;

// Social media SVG icons as components
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

/**
 * The main QuantumSocialSharing component
 */
const QuantumSocialSharing = ({ isOpen, onClose, shareType = 'achievement', shareData = {} }) => {
  const quantumGame = useQuantumGame();
  
  // State for the share panel
  const [shareText, setShareText] = useState('');
  const [shareImage, setShareImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('quantum');
  
  // Themes for image generation
  const themes = {
    quantum: {
      background: 'linear-gradient(135deg, #050b2e, #0c0424)',
      textColor: '#ffffff',
      accentColor: '#00ddff',
      secondaryColor: '#ff00ff',
      fontFamily: "'Orbitron', sans-serif",
    },
    cosmos: {
      background: 'linear-gradient(135deg, #0a0a10, #16073a)',
      textColor: '#e0f0ff',
      accentColor: '#8844ff',
      secondaryColor: '#ff4466',
      fontFamily: "'Exo 2', sans-serif",
    },
    matrix: {
      background: 'linear-gradient(135deg, #001000, #002000)',
      textColor: '#00ff66',
      accentColor: '#00cc44',
      secondaryColor: '#88ff00',
      fontFamily: "'Courier New', monospace",
    },
  };
  
  // Generate default share text based on shareType and data
  useEffect(() => {
    if (isOpen) {
      let text = '';
      
      switch (shareType) {
        case 'achievement':
          text = `I unlocked "${shareData.title}" in Quantum Salvation! ${shareData.description} #QuantumSalvation`;
          break;
        case 'levelComplete':
          text = `I reached ${shareData.levelName} in Quantum Salvation! ${shareData.message} #QuantumSalvation`;
          break;
        case 'experimentResult':
          text = `My Quantum Salvation experiment yielded fascinating results: ${shareData.summary} #QuantumSalvation`;
          break;
        default:
          text = 'Check out my progress in Quantum Salvation! #QuantumSalvation';
      }
      
      setShareText(text);
      
      // Generate the share image
      setTimeout(() => {
        generateShareImage();
      }, 100);
    }
  }, [isOpen, shareType, shareData, selectedTheme]);
  
  /**
   * Generate a shareable image based on the share data
   */
  const generateShareImage = () => {
    if (!canvasRef) return;
    
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions for social sharing (Twitter card size)
    canvas.width = 1200;
    canvas.height = 630;
    
    // Get selected theme
    const theme = themes[selectedTheme];
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedTheme === 'quantum') {
      gradient.addColorStop(0, '#050b2e');
      gradient.addColorStop(0.7, '#0c0424');
      gradient.addColorStop(1, '#120338');
    } else if (selectedTheme === 'cosmos') {
      gradient.addColorStop(0, '#0a0a10');
      gradient.addColorStop(0.5, '#16073a');
      gradient.addColorStop(1, '#290042');
    } else if (selectedTheme === 'matrix') {
      gradient.addColorStop(0, '#001000');
      gradient.addColorStop(0.8, '#002000');
      gradient.addColorStop(1, '#003000');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    drawParticleEffect(ctx, canvas.width, canvas.height, theme);
    
    // Draw logo
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold 48px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM SALVATION', canvas.width / 2, 100);
    
    // Draw divider
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 130);
    ctx.lineTo(canvas.width / 2 + 200, 130);
    ctx.stroke();
    
    // Draw content based on share type
    switch (shareType) {
      case 'achievement':
        drawAchievementContent(ctx, canvas, theme, shareData);
        break;
      case 'levelComplete':
        drawLevelContent(ctx, canvas, theme, shareData);
        break;
      case 'experimentResult':
        drawExperimentContent(ctx, canvas, theme, shareData);
        break;
      default:
        drawDefaultContent(ctx, canvas, theme);
    }
    
    // Draw footer with website
    ctx.fillStyle = theme.textColor;
    ctx.font = `24px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('quantumsalvation.com', canvas.width / 2, canvas.height - 40);
    
    // Convert canvas to blob for sharing
    canvas.toBlob((blob) => {
      setImageBlob(blob);
      setShareImage(URL.createObjectURL(blob));
    }, 'image/png');
  };
  
  /**
   * Draw a particle effect background
   */
  const drawParticleEffect = (ctx, width, height, theme) => {
    // Create particles
    const particleCount = 200;
    ctx.fillStyle = theme.accentColor;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.5 + 0.1;
      
      ctx.globalAlpha = opacity;
      
      // Alternate particle colors
      if (i % 3 === 0) {
        ctx.fillStyle = theme.secondaryColor;
      } else {
        ctx.fillStyle = theme.accentColor;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
  };
  
  /**
   * Draw achievement content
   */
  const drawAchievementContent = (ctx, canvas, theme, data) => {
    // Draw achievement icon/badge
    ctx.fillStyle = theme.secondaryColor;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 250, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 250, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // Achievement symbol (star)
    ctx.fillStyle = theme.textColor;
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', canvas.width / 2, 250);
    
    // Achievement title
    ctx.fillStyle = theme.textColor;
    ctx.font = `bold 48px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(data.title || 'Achievement Unlocked', canvas.width / 2, 370);
    
    // Achievement description
    ctx.font = `28px ${theme.fontFamily}`;
    wrapText(ctx, data.description || 'Quantum feat accomplished', canvas.width / 2, 430, canvas.width - 200, 40);
    
    // Draw points
    if (data.points) {
      ctx.fillStyle = theme.accentColor;
      ctx.font = `bold 36px ${theme.fontFamily}`;
      ctx.fillText(`+${data.points} POINTS`, canvas.width / 2, 530);
    }
  };
  
  /**
   * Draw level completion content
   */
  const drawLevelContent = (ctx, canvas, theme, data) => {
    // Level title
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold 36px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE', canvas.width / 2, 200);
    
    // Level name
    ctx.fillStyle = theme.textColor;
    ctx.font = `bold 56px ${theme.fontFamily}`;
    ctx.fillText(data.levelName || 'Unknown Level', canvas.width / 2, 280);
    
    // Level message
    ctx.font = `28px ${theme.fontFamily}`;
    wrapText(ctx, data.message || 'A step closer to quantum enlightenment', canvas.width / 2, 340, canvas.width - 200, 40);
    
    // Stats (if available)
    if (data.stats) {
      ctx.fillStyle = theme.secondaryColor;
      ctx.font = `bold 32px ${theme.fontFamily}`;
      ctx.fillText('STATISTICS', canvas.width / 2, 430);
      
      ctx.fillStyle = theme.textColor;
      ctx.font = `24px ${theme.fontFamily}`;
      
      const statsText = [
        `Time: ${data.stats.time || '00:00:00'}`,
        `Accuracy: ${data.stats.accuracy || '0%'}`,
        `Score: ${data.stats.score || '0'}`,
      ];
      
      statsText.forEach((text, index) => {
        ctx.fillText(text, canvas.width / 2, 470 + (index * 40));
      });
    }
  };
  
  /**
   * Draw experiment results content
   */
  const drawExperimentContent = (ctx, canvas, theme, data) => {
    // Experiment title
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold 36px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('EXPERIMENT RESULTS', canvas.width / 2, 200);
    
    // Summary
    ctx.fillStyle = theme.textColor;
    ctx.font = `28px ${theme.fontFamily}`;
    wrapText(ctx, data.summary || 'Quantum experimentation led to fascinating discoveries', canvas.width / 2, 260, canvas.width - 200, 40);
    
    // Draw a graph or visualization if data is available
    if (data.results) {
      drawResultsGraph(ctx, canvas, theme, data.results);
    } else {
      // Default decoration
      drawQuantumVisualization(ctx, canvas, theme);
    }
    
    // Findings
    if (data.findings && data.findings.length) {
      ctx.fillStyle = theme.secondaryColor;
      ctx.font = `bold 32px ${theme.fontFamily}`;
      ctx.fillText('KEY FINDINGS', canvas.width / 2, 450);
      
      ctx.fillStyle = theme.textColor;
      ctx.font = `24px ${theme.fontFamily}`;
      
      data.findings.slice(0, 3).forEach((finding, index) => {
        ctx.fillText(`• ${finding}`, canvas.width / 2, 490 + (index * 40));
      });
    }
  };
  
  /**
   * Draw default content
   */
  const drawDefaultContent = (ctx, canvas, theme) => {
    // Title
    ctx.fillStyle = theme.textColor;
    ctx.font = `bold 48px ${theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM JOURNEY', canvas.width / 2, 260);
    
    // Subtitle
    ctx.fillStyle = theme.accentColor;
    ctx.font = `32px ${theme.fontFamily}`;
    ctx.fillText('Exploring the depths of reality', canvas.width / 2, 320);
    
    // Decoration
    drawQuantumVisualization(ctx, canvas, theme);
    
    // Stats
    const stats = [
      `Level: ${quantumGame.player.level}`,
      `Consciousness: ${quantumGame.player.consciousness}`,
      `Quantum Energy: ${quantumGame.player.quantumEnergy}/${quantumGame.player.maxQuantumEnergy}`,
    ];
    
    ctx.fillStyle = theme.textColor;
    ctx.font = `24px ${theme.fontFamily}`;
    
    stats.forEach((stat, index) => {
      ctx.fillText(stat, canvas.width / 2, 450 + (index * 40));
    });
  };
  
  /**
   * Draw a quantum visualization
   */
  const drawQuantumVisualization = (ctx, canvas, theme) => {
    // Draw quantum entanglement visualization
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
      const centerX = canvas.width / 2;
      const centerY = 380;
      const radius = 100 + (i * 20);
      
      ctx.globalAlpha = 0.3 - (i * 0.05);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw quantum particles
    ctx.globalAlpha = 1;
    
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 150;
      const x = (canvas.width / 2) + Math.cos(angle) * dist;
      const y = 380 + Math.sin(angle) * dist;
      const size = Math.random() * 6 + 4;
      
      ctx.fillStyle = i % 2 === 0 ? theme.accentColor : theme.secondaryColor;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw connecting lines between some particles
      if (i > 0 && i < 7) {
        const prevAngle = Math.random() * Math.PI * 2;
        const prevDist = Math.random() * 150;
        const prevX = (canvas.width / 2) + Math.cos(prevAngle) * prevDist;
        const prevY = 380 + Math.sin(prevAngle) * prevDist;
        
        ctx.strokeStyle = i % 2 === 0 ? theme.accentColor : theme.secondaryColor;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(prevX, prevY);
        ctx.stroke();
      }
    }
    
    ctx.globalAlpha = 1;
  };
  
  /**
   * Draw a results graph
   */
  const drawResultsGraph = (ctx, canvas, theme, results) => {
    const graphX = canvas.width / 2 - 150;
    const graphY = 320;
    const graphWidth = 300;
    const graphHeight = 120;
    
    // Draw axes
    ctx.strokeStyle = theme.textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(graphX, graphY);
    ctx.lineTo(graphX, graphY + graphHeight);
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
    ctx.stroke();
    
    // Draw data points
    const dataPoints = results.dataPoints || [
      { x: 0, y: 0.2 },
      { x: 0.1, y: 0.5 },
      { x: 0.2, y: 0.3 },
      { x: 0.3, y: 0.7 },
      { x: 0.4, y: 0.6 },
      { x: 0.5, y: 0.8 },
      { x: 0.6, y: 0.5 },
      { x: 0.7, y: 0.9 },
      { x: 0.8, y: 0.7 },
      { x: 0.9, y: 1.0 },
      { x: 1.0, y: 0.8 },
    ];
    
    // Draw line graph
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    dataPoints.forEach((point, index) => {
      const x = graphX + (point.x * graphWidth);
      const y = graphY + graphHeight - (point.y * graphHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points
    dataPoints.forEach((point) => {
      const x = graphX + (point.x * graphWidth);
      const y = graphY + graphHeight - (point.y * graphHeight);
      
      ctx.fillStyle = theme.secondaryColor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  
  /**
   * Helper to wrap text within a maximum width
   */
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 0;
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y + (lineCount * lineHeight));
        line = words[n] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, x, y + (lineCount * lineHeight));
  };
  
  /**
   * Share to Twitter
   */
  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };
  
  /**
   * Share to Facebook
   */
  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };
  
  /**
   * Share to Reddit
   */
  const shareToReddit = () => {
    const title = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.reddit.com/submit?title=${title}&url=${url}`, '_blank');
  };
  
  /**
   * Share to LinkedIn
   */
  const shareToLinkedIn = () => {
    const title = encodeURIComponent(`Quantum Salvation - ${shareData.title || 'Interactive Experience'}`);
    const summary = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`, '_blank');
  };
  
  /**
   * Share to WhatsApp
   */
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  /**
   * Share via Email
   */
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Quantum Salvation - ${shareData.title || 'Interactive Experience'}`);
    const body = encodeURIComponent(`${shareText}\n\nCheck it out here: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };
  
  /**
   * Download the share image
   */
  const downloadImage = () => {
    if (!shareImage) return;
    
    const link = document.createElement('a');
    link.href = shareImage;
    link.download = `quantum-salvation-${shareType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * Copy share text to clipboard
   */
  const copyText = () => {
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert('Share text copied to clipboard!');
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <ShareContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SharePanel
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <ShareHeader>
            <h2>Share Your Experience</h2>
            <button onClick={onClose}>×</button>
          </ShareHeader>
          
          <SharePreview>
            <canvas 
              ref={(ref) => setCanvasRef(ref)}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
            {shareImage && <img src={shareImage} alt="Share preview" />}
          </SharePreview>
          
          <CustomizerSection>
            <h3>Theme</h3>
            <ThemeSelector>
              <ThemeOption 
                active={selectedTheme === 'quantum'} 
                onClick={() => setSelectedTheme('quantum')}
              >
                Quantum
              </ThemeOption>
              <ThemeOption 
                active={selectedTheme === 'cosmos'} 
                onClick={() => setSelectedTheme('cosmos')}
              >
                Cosmos
              </ThemeOption>
              <ThemeOption 
                active={selectedTheme === 'matrix'} 
                onClick={() => setSelectedTheme('matrix')}
              >
                Matrix
              </ThemeOption>
            </ThemeSelector>
            
            <h3>Customize Message</h3>
          </CustomizerSection>
          
          <ShareText
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            placeholder="Share your quantum journey..."
          />
          
          <ShareActions>
            <ShareButton 
              bgColor="rgba(29, 161, 242, 0.2)" 
              borderColor="rgba(29, 161, 242, 0.5)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToTwitter}
            >
              <TwitterIcon />
              Twitter
            </ShareButton>
            
            <ShareButton 
              bgColor="rgba(59, 89, 152, 0.2)" 
              borderColor="rgba(59, 89, 152, 0.5)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToFacebook}
            >
              <FacebookIcon />
              Facebook
            </ShareButton>
            
            <ShareButton 
              bgColor="rgba(255, 69, 0, 0.2)" 
              borderColor="rgba(255, 69, 0, 0.5)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToReddit}
            >
              <RedditIcon />
              Reddit
            </ShareButton>
            
            <ShareButton 
              bgColor="rgba(0, 119, 181, 0.2)" 
              borderColor="rgba(0, 119, 181, 0.5)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToLinkedIn}
            >
              <LinkedInIcon />
              LinkedIn
            </ShareButton>
            
            <ShareButton 
              bgColor="rgba(37, 211, 102, 0.2)" 
              borderColor="rgba(37, 211, 102, 0.5)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToWhatsApp}
            >
              <WhatsAppIcon />
              WhatsApp
            </ShareButton>
            
            <ShareButton 
              bgColor="rgba(200, 200, 200, 0.2)" 
              borderColor="rgba(200, 200, 200, 0.5)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareViaEmail}
            >
              <EmailIcon />
              Email
            </ShareButton>
          </ShareActions>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <ShareButton
              style={{ flex: 1, marginRight: '10px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadImage}
            >
              Download Image
            </ShareButton>
            
            <ShareButton
              style={{ flex: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyText}
            >
              Copy Text
            </ShareButton>
          </div>
        </SharePanel>
      </ShareContainer>
    </AnimatePresence>
  );
};

export default QuantumSocialSharing;