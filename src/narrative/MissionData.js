/**
 * MissionData - Contains all mission data, objectives, and narrative content
 * 
 * Mission structure:
 * - id: Unique identifier for the mission
 * - title: Mission title
 * - subtitle: Secondary title or tagline
 * - description: Full mission description
 * - background: Background information about the mission
 * - location: Where the mission takes place
 * - timeframe: Time constraints (if any)
 * - risk: Risk assessment
 * - timeLimit: Time limit in minutes (optional)
 * - autoCompleteOnAllObjectives: Whether mission auto-completes when all objectives are done
 * - triggerFlags: Flags that trigger this mission when set
 * - rewards: Rewards for completing the mission
 * - imageUrl: Path to mission image
 * - objectives: Array of mission objectives
 * - clues: Array of discoverable clues
 */

const MissionData = {
  // Mission 1: Quantum Crisis - Patient Zero
  "m001": {
    id: "m001",
    title: "Quantum Crisis: Patient Zero",
    subtitle: "Identify the source of the quantum entanglement pandemic",
    description: "The pandemic caused by quantum entanglement is spreading rapidly. We've traced the first case, 'Patient Zero', to Research Sector B. Your mission is to investigate the laboratory and collect samples to analyze the origin of the quantum anomaly before it becomes unstoppable.",
    background: "Three days ago, our quantum sensors detected an unusual pattern of entanglement spreading from the research sector. Scientists who were exposed reported experiencing multiple quantum states simultaneously, leading to cognitive disruption and eventually complete quantum dissociation.",
    location: "Quantum Salvation Labs - Research Sector B",
    timeframe: "Critical - 48 hours until quantum collapse",
    risk: "High - Exposure to unstable quantum particles",
    timeLimit: null, // No time limit for this mission
    autoCompleteOnAllObjectives: false,
    triggerFlags: {
      "intro_complete": true
    },
    rewards: {
      "sector_b_cleared": true,
      "quantum_analyzer_unlocked": true
    },
    imageUrl: "sector_b.jpg",
    objectives: [
      {
        id: "obj1",
        title: "Secure the Research Sector B entrance",
        description: "Use your quantum keycard to access the sealed laboratory area",
        completeOnLocation: "research_sector_b_entrance",
        completeOnFlag: null,
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj2",
        title: "Locate Patient Zero's research station",
        description: "Find Dr. Sakata's workstation where the anomaly was first detected",
        completeOnLocation: "dr_sakata_workstation",
        completeOnFlag: null,
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj3",
        title: "Collect quantum samples",
        description: "Obtain at least 3 samples from the contaminated equipment using the containment device",
        completeOnLocation: null,
        completeOnFlag: {
          flag: "samples_collected",
          value: 3
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj4",
        title: "Analyze the quantum signature",
        description: "Use the quantum analyzer to identify the unique resonance pattern of the contamination",
        completeOnLocation: "quantum_analyzer_station",
        completeOnFlag: {
          flag: "analysis_complete",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj5",
        title: "Secure experimental logs",
        description: "Download Dr. Sakata's research logs from the central terminal",
        completeOnLocation: "central_terminal",
        completeOnFlag: null,
        completeOnItem: "sakata_logs",
        completeOnResearch: null,
        completeOnClue: null
      }
    ],
    clues: [
      {
        id: "clue1",
        title: "Quantum Resonance Pattern",
        description: "A unique resonance pattern showing signs of deliberate quantum entanglement manipulation",
        content: "The resonance pattern shows precise oscillations that cannot be naturally occurring. Someone has deliberately manipulated the quantum entanglement properties to create a cascading effect.",
        image: "resonance_pattern.jpg"
      },
      {
        id: "clue2",
        title: "Dr. Sakata's Notes",
        description: "Handwritten notes about a breakthrough in quantum entanglement",
        content: "Day 67: We've finally achieved stable quantum entanglement across macroscopic distances. The implications are staggering. With this method, we could potentially entangle consciousness itself across multiple subjects. The board won't approve such tests, but I've prepared a private experiment for tonight.",
        image: "sakata_notes.jpg"
      },
      {
        id: "clue3",
        title: "Security Footage",
        description: "Corrupted security footage showing unusual activity in the lab",
        content: "The footage shows Dr. Sakata working late at night, connecting himself to the quantum entanglement device. At 2:37 AM, there's a flash of blue light, and the footage becomes corrupted. The timestamp shows this occurred three days ago, exactly when the anomaly was first detected.",
        image: "security_footage.jpg"
      }
    ]
  },
  
  // Mission 2: Quantum Web - Tracing the Spread
  "m002": {
    id: "m002",
    title: "Quantum Web: Tracing the Spread",
    subtitle: "Map the pandemic's quantum entanglement network",
    description: "The quantum entanglement pandemic is spreading according to a pattern we don't yet understand. Your mission is to deploy specialized sensors throughout the city to map how the quantum web is propagating and identify potential nodes that could be disrupted to slow the spread.",
    background: "After analyzing Patient Zero's data, we've discovered that the quantum entanglement is spreading faster in some areas than others. This suggests the existence of a quantum network with specific nodes that amplify the effect. If we can map this network, we might be able to develop a targeted approach to containing the pandemic.",
    location: "New Quantum City - Various Districts",
    timeframe: "Urgent - Spread accelerating by 15% daily",
    risk: "Medium - Urban exposure to quantum-affected individuals",
    timeLimit: 60, // 60 minute time limit for this mission
    autoCompleteOnAllObjectives: true,
    triggerFlags: {
      "sector_b_cleared": true
    },
    rewards: {
      "quantum_web_mapped": true,
      "city_sensor_network": true
    },
    imageUrl: "quantum_city.jpg",
    objectives: [
      {
        id: "obj1",
        title: "Deploy sensor in Financial District",
        description: "Place a quantum entanglement sensor on the Central Bank building rooftop",
        completeOnLocation: "central_bank_rooftop",
        completeOnFlag: {
          flag: "sensor_financial_placed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj2",
        title: "Deploy sensor in Research Park",
        description: "Place a quantum entanglement sensor at University Research Center",
        completeOnLocation: "university_research_center",
        completeOnFlag: {
          flag: "sensor_research_placed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj3",
        title: "Deploy sensor in Residential Zone",
        description: "Place a quantum entanglement sensor at Oakwood Apartments",
        completeOnLocation: "oakwood_apartments",
        completeOnFlag: {
          flag: "sensor_residential_placed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj4",
        title: "Deploy sensor in Industrial Area",
        description: "Place a quantum entanglement sensor at Nexus Manufacturing Plant",
        completeOnLocation: "nexus_manufacturing",
        completeOnFlag: {
          flag: "sensor_industrial_placed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj5",
        title: "Activate sensor network",
        description: "Return to command center and activate the quantum sensor network",
        completeOnLocation: "command_center",
        completeOnFlag: {
          flag: "sensor_network_activated",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      }
    ],
    clues: [
      {
        id: "clue1",
        title: "Entanglement Hotspot",
        description: "Sensor readings showing an unusually strong quantum entanglement node",
        content: "The sensor in the Industrial Area is showing quantum entanglement 300% stronger than other locations. The Nexus Manufacturing Plant appears to be a major node in the quantum web. Records show they've been experimenting with quantum computing for telecommunication purposes.",
        image: "entanglement_hotspot.jpg"
      },
      {
        id: "clue2",
        title: "Propagation Pattern",
        description: "Data visualizing how the quantum entanglement spreads throughout the city",
        content: "The spread follows city transit lines almost perfectly. This suggests the entanglement is being carried by people as they commute, with the pandemic hitchhiking on human consciousness through the city's transportation network.",
        image: "propagation_pattern.jpg"
      },
      {
        id: "clue3",
        title: "Quantum Resonance Anomaly",
        description: "Readings showing unusual quantum resonance patterns in the Research Park",
        content: "The University Research Center shows quantum signatures nearly identical to Patient Zero, but with a distinct modification. Someone there might be deliberately amplifying or modifying the original quantum entanglement pattern.",
        image: "resonance_anomaly.jpg"
      }
    ]
  },
  
  // Mission 3: Quantum Barrier - Creating the Firewall
  "m003": {
    id: "m003",
    title: "Quantum Barrier: Creating the Firewall",
    subtitle: "Develop a quantum firewall to isolate the pandemic",
    description: "With the quantum web mapped, we now know how the pandemic is spreading. Your mission is to establish quantum resonance barriers at key points in the city to isolate the entanglement and prevent further contamination of unaffected areas.",
    background: "The quantum entanglement pandemic operates similarly to a virus, but instead of biological transmission, it uses quantum fields to spread. By creating quantum barriers with inverse resonance patterns, we can establish 'firewalls' that prevent the quantum fields from propagating further.",
    location: "New Quantum City - Strategic Chokepoints",
    timeframe: "Critical - 24 hours before total entanglement",
    risk: "High - Direct manipulation of quantum fields",
    timeLimit: null, // No time limit
    autoCompleteOnAllObjectives: false,
    triggerFlags: {
      "quantum_web_mapped": true
    },
    rewards: {
      "quantum_barrier_established": true,
      "containment_phase_complete": true
    },
    imageUrl: "quantum_barrier.jpg",
    objectives: [
      {
        id: "obj1",
        title: "Set up quantum barrier generator",
        description: "Assemble the quantum barrier generator at the command center",
        completeOnLocation: "command_center",
        completeOnFlag: {
          flag: "barrier_generator_assembled",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj2",
        title: "Calibrate resonance patterns",
        description: "Configure the quantum barrier to counter the pandemic's specific resonance",
        completeOnLocation: "calibration_lab",
        completeOnFlag: {
          flag: "resonance_calibrated",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj3",
        title: "Deploy barrier node at Industrial Zone",
        description: "Install a quantum barrier node at Nexus Manufacturing Plant",
        completeOnLocation: "nexus_manufacturing",
        completeOnFlag: {
          flag: "barrier_industrial_deployed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj4",
        title: "Deploy barrier node at Research Park",
        description: "Install a quantum barrier node at University Research Center",
        completeOnLocation: "university_research_center",
        completeOnFlag: {
          flag: "barrier_research_deployed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj5",
        title: "Activate the quantum firewall",
        description: "Return to command center and initialize the quantum barrier network",
        completeOnLocation: "command_center",
        completeOnFlag: {
          flag: "quantum_firewall_activated",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      }
    ],
    clues: [
      {
        id: "clue1",
        title: "Modified Barrier Specs",
        description: "Engineering plans showing unauthorized modifications to the barrier design",
        content: "These plans show someone has modified the quantum barrier specifications to include a 'backdoor' frequency. This would allow certain quantum patterns to pass through the firewall unimpeded. The modifications are subtle and would have gone unnoticed if not carefully examined.",
        image: "modified_specs.jpg"
      },
      {
        id: "clue2",
        title: "Research Center Access Logs",
        description: "Security logs showing unauthorized access to the barrier research",
        content: "Dr. Eliza Chen from the University Research Center accessed the quantum barrier specifications at 2:17 AM, three days after Patient Zero's incident. Her security clearance shouldn't have allowed access to these files.",
        image: "access_logs.jpg"
      },
      {
        id: "clue3",
        title: "Strange Communications",
        description: "Encrypted communications between unknown parties discussing the quantum pandemic",
        content: "Decrypted message: 'The quantum seed has been planted. Once the barriers go up, we'll have complete control over who experiences entanglement. The Phase 2 consciousness merger can begin as scheduled.' Sender and recipient information has been scrubbed.",
        image: "encrypted_comms.jpg"
      }
    ]
  },
  
  // Mission 4: Quantum Salvation - The Cure
  "m004": {
    id: "m004",
    title: "Quantum Salvation: The Cure",
    subtitle: "Develop and distribute the quantum entanglement remedy",
    description: "With the quantum pandemic contained behind our firewalls, we need to develop a cure for those already affected. Your mission is to gather research components, develop a quantum disentanglement serum, and distribute it to the affected population.",
    background: "The quantum entanglement affects human consciousness by creating overlapping quantum states in neural pathways. A properly designed disentanglement serum should be able to collapse these quantum states back to normal, restoring affected individuals to a single consciousness state.",
    location: "Quantum Salvation Labs - Medical Wing",
    timeframe: "Urgent - Affected individuals deteriorating rapidly",
    risk: "Medium - Working with untested quantum technologies",
    timeLimit: 120, // 2 hour time limit
    autoCompleteOnAllObjectives: true,
    triggerFlags: {
      "containment_phase_complete": true
    },
    rewards: {
      "cure_developed": true,
      "salvation_phase_initiated": true
    },
    imageUrl: "quantum_cure.jpg",
    objectives: [
      {
        id: "obj1",
        title: "Gather quantum stabilization crystals",
        description: "Retrieve rare stabilization crystals from the Quantum Physics department",
        completeOnLocation: "physics_department",
        completeOnFlag: null,
        completeOnItem: "stabilization_crystals",
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj2",
        title: "Extract neural pattern samples",
        description: "Obtain neural pattern samples from three affected individuals",
        completeOnLocation: "medical_wing",
        completeOnFlag: {
          flag: "neural_samples_collected",
          value: 3
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj3",
        title: "Develop disentanglement formula",
        description: "Work with Dr. Lin in the Quantum Medical lab to develop the formula",
        completeOnLocation: "quantum_medical_lab",
        completeOnFlag: {
          flag: "formula_developed",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj4",
        title: "Test the formula",
        description: "Administer the formula to a volunteer patient and monitor results",
        completeOnLocation: "testing_chamber",
        completeOnFlag: {
          flag: "formula_tested",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj5",
        title: "Initialize mass production",
        description: "Configure the medical fabrication system to mass-produce the cure",
        completeOnLocation: "fabrication_center",
        completeOnFlag: {
          flag: "mass_production_started",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      }
    ],
    clues: [
      {
        id: "clue1",
        title: "Previous Research",
        description: "Records of previous experiments with quantum disentanglement",
        content: "Dr. Sakata actually worked on quantum disentanglement before the pandemic started. His research shows he successfully disentangled quantum particles in the lab, but his notes indicate he deliberately didn't publish the full methodology. The last entry reads: 'Some knowledge is too dangerous to share freely.'",
        image: "previous_research.jpg"
      },
      {
        id: "clue2",
        title: "Patient Anomaly",
        description: "Medical scans showing an unusual pattern in affected patients' brains",
        content: "All affected patients show the same unusual neural activity in their prefrontal cortex, but there's a secondary pattern in the limbic system that doesn't match the primary quantum entanglement. It appears to be artificially induced—almost like a signature or a backdoor to their consciousness.",
        image: "patient_anomaly.jpg"
      },
      {
        id: "clue3",
        title: "Corporate Interference",
        description: "Evidence of corporate sabotage in the cure development",
        content: "Multiple attempts to develop the cure have been subtly sabotaged. Security footage shows Dr. Eliza Chen accessing the lab at night and modifying the formulas. Her employee file shows she also works as a consultant for NeuroSync Corporation, a company specializing in 'consciousness enhancement technologies.'",
        image: "corporate_interference.jpg"
      }
    ]
  },
  
  // Mission 5: Quantum Conspiracy - Unveiling the Truth
  "m005": {
    id: "m005",
    title: "Quantum Conspiracy: Unveiling the Truth",
    subtitle: "Discover who's really behind the quantum pandemic",
    description: "Evidence suggests the quantum pandemic wasn't an accident but a deliberate action. Your mission is to investigate NeuroSync Corporation, gather evidence of their involvement, and expose the truth behind their quantum consciousness experiment.",
    background: "As the cure is being distributed, disturbing evidence has emerged linking the pandemic to NeuroSync Corporation. Their 'Hivemind Project' has been researching ways to connect human consciousness through quantum entanglement, and the pandemic appears to have been an unauthorized field test of their technology.",
    location: "NeuroSync Corporate Headquarters",
    timeframe: "Standard - Avoid detection during infiltration",
    risk: "Very High - Corporate security and quantum defenses",
    timeLimit: null, // No time limit
    autoCompleteOnAllObjectives: false,
    triggerFlags: {
      "salvation_phase_initiated": true,
      "corporate_connection_discovered": true
    },
    rewards: {
      "conspiracy_exposed": true,
      "game_complete": true
    },
    imageUrl: "neurosync_hq.jpg",
    objectives: [
      {
        id: "obj1",
        title: "Infiltrate NeuroSync HQ",
        description: "Gain access to NeuroSync headquarters using a disguise or alternate entry",
        completeOnLocation: "neurosync_lobby",
        completeOnFlag: null,
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj2",
        title: "Access the Hivemind Project database",
        description: "Hack into the secure server room and download project files",
        completeOnLocation: "server_room",
        completeOnFlag: {
          flag: "hivemind_data_acquired",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj3",
        title: "Find executive authorization codes",
        description: "Locate evidence linking NeuroSync executives to the pandemic",
        completeOnLocation: "executive_suite",
        completeOnFlag: null,
        completeOnItem: "executive_codes",
        completeOnResearch: null,
        completeOnClue: null
      },
      {
        id: "obj4",
        title: "Discover the true purpose",
        description: "Access the hidden laboratory and learn the pandemic's true purpose",
        completeOnLocation: "hidden_lab",
        completeOnFlag: null,
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: "true_purpose"
      },
      {
        id: "obj5",
        title: "Broadcast the evidence",
        description: "Use the corporate broadcast system to expose the truth to the world",
        completeOnLocation: "broadcast_center",
        completeOnFlag: {
          flag: "evidence_broadcast",
          value: true
        },
        completeOnItem: null,
        completeOnResearch: null,
        completeOnClue: null
      }
    ],
    clues: [
      {
        id: "clue1",
        title: "Project Hivemind Proposal",
        description: "Confidential document outlining the goals of Project Hivemind",
        content: "Executive Summary: Project Hivemind will revolutionize human consciousness by creating a quantum entanglement network linking multiple minds. Phase 1 involves creating the entanglement pathways. Phase 2 involves establishing a central consciousness to direct the network. Estimated market value: $3.7 trillion. Note: Initial field testing must appear accidental to avoid regulatory scrutiny.",
        image: "project_proposal.jpg"
      },
      {
        id: "clue2",
        title: "CEO's Private Messages",
        description: "Encrypted communications between NeuroSync's CEO and unknown partners",
        content: "From: A.Mercer@neurosync-secure.com\nTo: [REDACTED]\nSubject: Phase 1 Success\n\nThe 'accident' in Research Sector B went exactly as planned. Initial entanglement spread exceeds projections by 23%. Dr. Sakata was unfortunately aware of the true nature of the experiment and had to be fully integrated into the network. Phase 2 preparations are underway. The chosen consciousness is ready to assume control once critical mass is achieved.",
        image: "ceo_messages.jpg"
      },
      {
        id: "clue3",
        title: "True Purpose",
        description: "Video recording revealing the actual purpose of the quantum pandemic",
        content: "The recording shows NeuroSync CEO Alexander Mercer speaking to a small group of executives: 'The quantum pandemic isn't a disaster—it's the next step in human evolution. By entangling consciousness across the population, we create the foundation for a unified mind. Dr. Chen's consciousness has been selected as the central node. Once the entanglement reaches critical mass, her mind will assume control of the network, creating humanity's first hive mind. Those who receive the so-called 'cure' will be permanently excluded from this evolutionary leap.'",
        image: "true_purpose.jpg"
      }
    ]
  }
};

export default MissionData;