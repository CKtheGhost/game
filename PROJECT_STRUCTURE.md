# Quantum Salvation Labs - Project Structure

This document provides an overview of the project's directory structure and the purpose of each component.

```
Vibecoding/
├── package.json          # Project dependencies and scripts
├── README.md             # Project overview and documentation
├── IMPLEMENTATION_GUIDE.md # Detailed implementation instructions
├── PROJECT_STRUCTURE.md  # This file - directory structure overview
├── src/                  # Source code directory
│   ├── index.js          # Application entry point
│   ├── App.jsx           # Main application component
│   ├── components/       # React components
│   │   ├── core/         # Core visualization layer
│   │   │   ├── QuantumVisualization.jsx      # Main 3D visualization component
│   │   │   └── QuantumExplorableWorld.jsx    # Container for all visualization
│   │   ├── interaction/  # Interaction layer components
│   │   │   ├── InteractiveQuantumCircle.jsx  # Individual quantum circle component
│   │   │   ├── QuantumCollectible.jsx        # Collectible items component
│   │   │   └── ChallengePortal.jsx           # Challenge portal component
│   │   └── effects/      # Visual and audio effect components
│   │       └── FeedbackSystem.jsx            # Feedback system component
│   ├── context/          # React Context API implementations
│   │   └── GameStateContext.jsx              # Game state management
│   ├── hooks/            # Custom React hooks
│   │   └── useQuantumEffects.js              # Hook for quantum visual effects
│   ├── utils/            # Utility functions and helpers
│   │   ├── performance.js                    # Performance management utilities
│   │   └── progressiveEnhancement.js         # Feature detection and fallbacks
│   └── services/         # Business logic and services
│       ├── StateSynchronizer.js              # State synchronization service
│       └── StateInitializer.js               # System initialization service
└── public/               # Public assets
    └── index.html        # HTML entry point
```

## Key Directories

### components/

Contains all React components organized by their layer in the application architecture.

- **core/**: The foundation layer responsible for the main 3D visualization.
- **interaction/**: Components that handle user interactions and game mechanics.
- **effects/**: Components for visual and audio feedback.

### context/

Contains the Context API implementation for global state management.

### hooks/

Custom React hooks that encapsulate reusable logic.

### utils/

Utility functions for performance optimization and progressive enhancement.

### services/

Business logic services like state synchronization and initialization.

## Main Components

- **QuantumExplorableWorld**: The main container component that brings together all layers.
- **QuantumVisualization**: Handles the core 3D visualization of the quantum reality.
- **InteractiveQuantumCircle**: Represents one of Dante's circles reimagined as quantum realms.
- **FeedbackSystem**: Provides visual and audio feedback for player actions.
- **GameStateContext**: Manages the overall game state using React Context API.

## Architecture Overview

The project follows a four-layer architecture:

1. **Core Visualization Layer**: Foundation for 3D rendering
2. **Interaction Layer**: Handles user interactions and game mechanics
3. **Game State Layer**: Manages application state
4. **Effect Layer**: Provides feedback and enhances user experience

Each layer has clearly defined responsibilities and interfaces, making the system modular and maintainable.