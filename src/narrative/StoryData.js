/**
 * StoryData - Contains all narrative content for the game
 * This file defines chapters, dialogue, audio logs, data entries, and cinematics
 */

const StoryData = {
  // Game title and metadata
  meta: {
    title: "Quantum Entanglement: Pandemic Zero",
    version: "1.0",
    description: "A race against time to develop a quantum cure for a devastating pandemic",
    author: "Vibe Coding Labs",
  },
  
  // Story chapters
  chapters: {
    // Introduction chapter
    intro: {
      id: "intro",
      title: "Quantum Outbreak",
      description: "The first reports of a mysterious pandemic emerge as quantum anomalies are detected",
      objectives: [
        "Watch opening cinematic",
        "Complete initial briefing",
        "Reach the research facility"
      ],
      nextChapter: "alpha_wing",
      locations: ["city_overview", "command_center"],
    },
    
    // Alpha Wing chapter
    alpha_wing: {
      id: "alpha_wing",
      title: "First Steps",
      description: "Navigate the damaged Alpha Wing to recover initial research data",
      objectives: [
        "Locate Dr. Chen's research terminal",
        "Recover quantum formula components",
        "Establish quantum stabilization field"
      ],
      nextChapter: "beta_wing",
      locations: ["alpha_lab", "alpha_corridor", "containment_room_a"],
      requiredEvidence: ["partial_formula", "stabilizer_notes"],
    },
    
    // Beta Wing chapter
    beta_wing: {
      id: "beta_wing",
      title: "Patient Zero",
      description: "Investigate the Beta Wing to locate patient zero data and blood samples",
      objectives: [
        "Find security override for Beta Wing",
        "Locate patient zero records",
        "Retrieve biological samples from cold storage"
      ],
      nextChapter: "quantum_lab",
      locations: ["beta_corridor", "medical_bay", "cold_storage"],
      requiredEvidence: ["patient_zero_data", "biological_samples"],
    },
    
    // Quantum Lab chapter
    quantum_lab: {
      id: "quantum_lab",
      title: "Quantum Core",
      description: "Access the main quantum research lab to develop a cure formula",
      objectives: [
        "Activate quantum containment systems",
        "Calibrate entanglement analyzer",
        "Synthesize initial cure compound"
      ],
      nextChapter: "crisis",
      locations: ["quantum_core", "synthesis_lab", "analysis_chamber"],
      requiredEvidence: ["quantum_formula", "entanglement_data"],
    },
    
    // Crisis chapter
    crisis: {
      id: "crisis",
      title: "Quantum Breach",
      description: "Deal with a critical quantum breach threatening the facility and the cure",
      objectives: [
        "Contain the quantum breach",
        "Rescue trapped researchers",
        "Preserve research data"
      ],
      nextChapter: "final",
      locations: ["breach_containment", "emergency_shelters", "data_center"],
    },
    
    // Final chapter
    final: {
      id: "final",
      title: "Race Against Time",
      description: "Complete the cure synthesis and deploy it before time runs out",
      objectives: [
        "Complete the cure formula",
        "Synthesize the quantum cure",
        "Deploy the cure to containment zones"
      ],
      nextChapter: null, // End of game
      locations: ["synthesis_lab", "distribution_center", "command_center"],
      finalChapter: true,
    },
  },
  
  // Cinematics
  cinematics: {
    // Opening cinematic
    opening_news: {
      id: "opening_news",
      title: "Breaking News: Global Emergency",
      type: "cutscene",
      duration: 60, // seconds
      skippable: true,
      scenes: [
        {
          type: "news_broadcast",
          duration: 15,
          text: "Breaking news: The World Health Organization has declared a global emergency as cases of a mysterious illness spread rapidly across major cities.",
          background: "news_studio",
          audioTrack: "tense_news_theme",
        },
        {
          type: "footage",
          duration: 10,
          text: "Footage shows overwhelmed hospitals in New York, London, and Tokyo as patients flood emergency rooms with symptoms unlike anything seen before.",
          background: "hospital_exterior",
          audioTrack: "emergency_ambience",
        },
        {
          type: "news_broadcast",
          duration: 15,
          text: "Scientists are baffled by the pathogen's behavior, which seems to defy conventional understanding of disease transmission. Some experts suggest a potential link to recent quantum physics experiments.",
          background: "news_studio",
          audioTrack: "tense_news_theme",
        },
        {
          type: "footage",
          duration: 10,
          text: "Military and emergency response teams establish quarantine zones in major population centers as governments worldwide implement travel restrictions.",
          background: "quarantine_zone",
          audioTrack: "military_operations",
        },
        {
          type: "interview",
          duration: 10,
          text: "Dr. Sarah Chen, lead quantum physicist: 'The behavior of this pathogen exhibits properties consistent with quantum entanglement. If confirmed, this would represent an unprecedented breach of quantum effects into biological systems.'",
          background: "lab_interview",
          audioTrack: "interview_background",
        },
      ],
    },
    
    // Quantum solution discovery
    quantum_discovery: {
      id: "quantum_discovery",
      title: "Quantum Solution Discovered",
      type: "cutscene",
      duration: 30,
      skippable: true,
      scenes: [
        {
          type: "lab_scene",
          duration: 10,
          text: "Dr. Chen's team works frantically in the Quantum Research Lab, surrounded by holographic models of molecular structures.",
          background: "quantum_lab",
          audioTrack: "science_tension",
        },
        {
          type: "closeup",
          duration: 5,
          text: "A simulation completes, highlighting a unique molecular structure that pulses with quantum energy.",
          background: "hologram_closeup",
          audioTrack: "discovery_moment",
        },
        {
          type: "scene",
          duration: 15,
          text: "Dr. Chen: 'This is it! The quantum entanglement signature matches the pathogen perfectly. With this, we can develop a targeted cure that operates on quantum principles, but we'll need advanced facilities and expertise to synthesize it.'",
          background: "quantum_lab",
          audioTrack: "revelation_theme",
        },
      ],
    },
    
    // Emergency briefing
    emergency_briefing: {
      id: "emergency_briefing",
      title: "Emergency Briefing",
      type: "interactive",
      duration: 45,
      skippable: false,
      scenes: [
        {
          type: "briefing_room",
          duration: 10,
          text: "Director Hammond: 'As you've been made aware, we're facing an unprecedented crisis. This pathogen operates on quantum principles, affecting its victims in ways that defy conventional medicine.'",
          background: "briefing_room",
          audioTrack: "tense_briefing",
        },
        {
          type: "hologram_presentation",
          duration: 15,
          text: "Dr. Chen: 'Our analysis confirms that the pandemic is caused by particles exhibiting quantum entanglement. Simply put, it's connecting people at a quantum level, causing simultaneous system failures across the body.'",
          background: "hologram_display",
          audioTrack: "scientific_explanation",
        },
        {
          type: "briefing_room",
          duration: 10,
          text: "Director Hammond: 'Dr. Chen's team has identified a potential solution, but the research facility has been compromised. Communication was lost after a quantum surge 12 hours ago.'",
          background: "briefing_room",
          audioTrack: "mission_details",
        },
        {
          type: "character_focus",
          duration: 10,
          text: "Hammond: 'That's where you come in. As our leading quantum field operative, you need to enter the facility, recover the research, and help complete the cure before time runs out.'",
          background: "briefing_room_focus",
          audioTrack: "mission_assignment",
          decisionPoint: "accept_mission",
        },
      ],
    },
    
    // Multiple ending cinematics
    endings: {
      true_cure: {
        id: "ending_true_cure",
        title: "A Quantum Solution",
        type: "cutscene",
        duration: 60,
        skippable: false,
        scenes: [
          {
            type: "lab_scene",
            duration: 15,
            text: "The quantum cure formula is completed and synthesized, glowing with stable quantum energy as it's loaded into distribution mechanisms.",
            background: "synthesis_lab",
            audioTrack: "triumph_theme",
          },
          {
            type: "montage",
            duration: 15,
            text: "Worldwide, treatment centers begin administering the cure, with patients showing immediate response as the quantum entanglement is safely broken.",
            background: "treatment_centers",
            audioTrack: "hopeful_theme",
          },
          {
            type: "news_broadcast",
            duration: 15,
            text: "Three weeks later: 'In what scientists are calling a medical miracle, the quantum pandemic has been fully contained with minimal lasting effects. The international science community hails this as a breakthrough in quantum medicine.'",
            background: "news_positive",
            audioTrack: "resolution_theme",
          },
          {
            type: "epilogue",
            duration: 15,
            text: "Dr. Chen and your character establish the Quantum Medical Research Foundation, pioneering a new field that merges quantum physics with medical science, opening possibilities never before imagined.",
            background: "foundation_ceremony",
            audioTrack: "epilogue_theme",
          },
        ],
      },
      
      partial_cure: {
        id: "ending_partial_cure",
        title: "Imperfect Solution",
        type: "cutscene",
        duration: 60,
        skippable: false,
        scenes: [
          {
            type: "lab_scene",
            duration: 15,
            text: "The cure is synthesized, exhibiting some quantum instability but still viable for emergency deployment.",
            background: "synthesis_lab",
            audioTrack: "uncertain_victory",
          },
          {
            type: "montage",
            duration: 15,
            text: "Treatment centers administer the cure globally, with patients recovering but showing lingering effects of quantum exposure.",
            background: "treatment_centers",
            audioTrack: "mixed_outcome",
          },
          {
            type: "news_broadcast",
            duration: 15,
            text: "One month later: 'While the quantum pandemic has been contained, health officials report that approximately 30% of treated patients exhibit unusual quantum sensitivity, requiring ongoing monitoring.'",
            background: "news_mixed",
            audioTrack: "concerned_theme",
          },
          {
            type: "epilogue",
            duration: 15,
            text: "Your character joins an international task force dedicated to studying and treating the lingering quantum effects, knowing that while a crisis was averted, the work is far from over.",
            background: "research_continuing",
            audioTrack: "bittersweet_epilogue",
          },
        ],
      },
      
      emergency_solution: {
        id: "ending_emergency",
        title: "Against the Clock",
        type: "cutscene",
        duration: 60,
        skippable: false,
        scenes: [
          {
            type: "lab_scene",
            duration: 15,
            text: "With time nearly exhausted, you implement an emergency version of the cure, knowing its quantum stability is compromised but having no alternative.",
            background: "synthesis_lab",
            audioTrack: "last_minute_tension",
          },
          {
            type: "montage",
            duration: 15,
            text: "The cure is deployed to critical areas first, slowing the pandemic but with significant side effects as quantum instability affects patients in unpredictable ways.",
            background: "emergency_deployment",
            audioTrack: "chaotic_response",
          },
          {
            type: "news_broadcast",
            duration: 15,
            text: "Two months later: 'The quantum pandemic has been contained, but at significant cost. Millions experience quantum-related conditions that medical science is still struggling to understand.'",
            background: "news_serious",
            audioTrack: "somber_reporting",
          },
          {
            type: "epilogue",
            duration: 15,
            text: "Your character works alongside researchers in a world forever changed by quantum exposure, dedicated to finding better treatments for those affected and preventing future quantum breaches.",
            background: "changed_world",
            audioTrack: "determined_epilogue",
          },
        ],
      },
      
      failure: {
        id: "ending_failure",
        title: "Quantum Cascade",
        type: "cutscene",
        duration: 60,
        skippable: false,
        scenes: [
          {
            type: "lab_scene",
            duration: 15,
            text: "Despite your best efforts, the cure formula remains incomplete as time expires. The quantum stabilization systems begin to fail throughout the facility.",
            background: "lab_collapsing",
            audioTrack: "failure_theme",
          },
          {
            type: "montage",
            duration: 15,
            text: "The pandemic accelerates, with quantum entanglement effects spreading faster than containment measures can respond.",
            background: "global_crisis",
            audioTrack: "disaster_unfolds",
          },
          {
            type: "news_broadcast",
            duration: 15,
            text: "Final broadcast: 'Quarantine zones have failed in multiple regions as the quantum effect spreads. Authorities advise remaining in secure locations as emergency protocols... [transmission cuts out]'",
            background: "final_broadcast",
            audioTrack: "final_warning",
          },
          {
            type: "epilogue",
            duration: 15,
            text: "Your character leads a small group of survivors with partial quantum immunity, searching for a safe haven in a world transformed by quantum chaos, carrying the incomplete research in hopes of one day finding a solution.",
            background: "wasteland_journey",
            audioTrack: "post_apocalypse",
          },
        ],
      },
      
      quantum_collapse: {
        id: "ending_collapse",
        title: "Beyond the Veil",
        type: "cutscene",
        duration: 60,
        skippable: false,
        scenes: [
          {
            type: "lab_scene",
            duration: 15,
            text: "The quantum breach expands uncontrollably, creating a cascading reaction throughout the facility as reality itself begins to warp.",
            background: "quantum_breach",
            audioTrack: "reality_distortion",
          },
          {
            type: "abstract",
            duration: 15,
            text: "As conventional physics break down around you, you witness multiple realities converging, glimpsing countless versions of Earth, some devastated by the pandemic, others where it never occurred.",
            background: "multiple_realities",
            audioTrack: "beyond_comprehension",
          },
          {
            type: "abstract",
            duration: 15,
            text: "The quantum collapse reaches a critical point, and instead of destruction, a transition occurs - the boundaries between quantum states and macroscopic reality permanently blur.",
            background: "quantum_transition",
            audioTrack: "transcendence_theme",
          },
          {
            type: "epilogue",
            duration: 15,
            text: "You emerge into a transformed world where quantum principles are now visible and manipulable at the macroscopic level. Humanity begins adapting to a new existence where the lines between possibility and reality have fundamentally changed.",
            background: "new_existence",
            audioTrack: "new_dawn",
          },
        ],
      },
    },
  },
  
  // Audio logs
  audioLogs: {
    // Dr. Chen's research logs
    dr_chen_log_1: {
      id: "dr_chen_log_1",
      title: "Initial Observations",
      character: "dr_chen",
      location: "alpha_lab",
      duration: 45, // seconds
      transcript: "Research Log 1, Dr. Sarah Chen. Our initial observations of the pathogen are... troubling. The particles exhibit quantum properties that should be impossible in biological systems. They appear to maintain coherence at room temperature and show signs of entanglement across separate samples. If my hypothesis is correct, this could explain the simultaneous onset of symptoms in patients separated by vast distances. We need more data to confirm.",
      researchValue: 5,
      audioFile: "dr_chen_log_1.mp3",
      dateRecorded: "Three weeks before incident",
    },
    
    dr_chen_log_2: {
      id: "dr_chen_log_2",
      title: "Quantum Signature Confirmed",
      character: "dr_chen",
      location: "quantum_core",
      duration: 60,
      transcript: "Research Log 8, Dr. Sarah Chen. We've confirmed it. The pathogen maintains quantum coherence through a previously unknown mechanism. More concerning, we've detected traces of artificial manipulation in its structure. This was engineered, not naturally occurring. The entanglement properties allow it to effectively bypass conventional quarantine measures - when one particle changes state, all entangled particles change simultaneously, regardless of distance. The implications are staggering... and terrifying. We need to inform the WHO immediately.",
      researchValue: 10,
      audioFile: "dr_chen_log_2.mp3",
      dateRecorded: "Two weeks before incident",
    },
    
    dr_chen_log_3: {
      id: "dr_chen_log_3",
      title: "Cure Hypothesis",
      character: "dr_chen",
      location: "synthesis_lab",
      duration: 75,
      transcript: "Research Log 12, Dr. Sarah Chen. We've identified a potential approach for a cure. By creating a quantum-entangled counter-agent, we could theoretically induce a controlled collapse of the pathogen's wave function, rendering it inert. The challenge is creating a delivery mechanism that maintains quantum coherence long enough to reach all affected cells. Dr. Park's work on quantum stabilization fields could be the key. I've requested access to the quantum containment chamber to begin testing. This is our most promising direction, but the risks... Manipulating quantum states at this scale could have unpredictable effects. We'll proceed with extreme caution.",
      researchValue: 15,
      audioFile: "dr_chen_log_3.mp3",
      dateRecorded: "One week before incident",
    },
    
    dr_chen_final_log: {
      id: "dr_chen_final_log",
      title: "Emergency Protocol",
      character: "dr_chen",
      location: "emergency_shelter",
      duration: 90,
      transcript: "[Alarms and distortion in background] Emergency log, Dr. Sarah Chen. The quantum stabilization field has failed. We have a level 5 quantum breach in progress. I've evacuated the team, but... the data, it's still in the lab. Without it, any hope of developing the cure will be lost. I'm implementing emergency containment protocols to preserve the quantum formula components. To whoever finds this - you need three elements to complete the cure: the quantum formula in my lab terminal, the patient zero biological samples in cold storage, and the stabilizer compound notes in Dr. Park's office. The formula is incomplete, but with these components... [crash sounds] The breach is spreading. I don't have much time. The entanglement signature is the key to everything. Remember: quantum entanglement is both the cause and the solution. Find a way to use that paradox... [transmission ends]",
      researchValue: 20,
      audioFile: "dr_chen_final_log.mp3",
      dateRecorded: "Day of incident",
      criticalEvidence: true,
    },
    
    // Security logs
    security_log_1: {
      id: "security_log_1",
      title: "Security Concerns",
      character: "head_of_security",
      location: "security_office",
      duration: 40,
      transcript: "Security Director's Log. Dr. Chen's team has requested increased clearance for their quantum experiments. I've approved it but logged my concerns about the containment protocols. These quantum readings are off the charts, and the energy signatures are unlike anything in our safety guidelines. I've stationed additional personnel near the quantum core and implemented hourly monitoring of the stabilization fields. Better safe than sorry.",
      researchValue: 0,
      audioFile: "security_log_1.mp3",
      dateRecorded: "Two weeks before incident",
    },
    
    security_log_2: {
      id: "security_log_2",
      title: "Evacuation Protocol",
      character: "head_of_security",
      location: "emergency_exit",
      duration: 30,
      transcript: "[Alarms in background] This is Security Director Marquez implementing full facility evacuation. The quantum breach has compromised main containment and is spreading rapidly. All personnel proceed to emergency exits immediately. Quantum protection measures have failed. I repeat, quantum protection measures have failed. Alpha, Beta, and Gamma teams assist with evacuation. This is not a drill.",
      researchValue: 0,
      audioFile: "security_log_2.mp3",
      dateRecorded: "Day of incident",
    },
    
    // Dr. Park's logs
    dr_park_log_1: {
      id: "dr_park_log_1",
      title: "Stabilizer Breakthrough",
      character: "dr_park",
      location: "engineering_lab",
      duration: 55,
      transcript: "Personal log, Dr. Min-ho Park. We've finally achieved stable quantum field containment at room temperature. The new molecular stabilizer compound is the breakthrough we needed. By integrating quantum dot technologies with the organic binding agent, we can maintain coherence for up to 72 hours - more than enough time for Dr. Chen's treatment delivery system. The side effects are minimal in our simulations, though there's still the theoretical risk of quantum bleedthrough if the field collapses unexpectedly. I've documented the formula and production process on my secure terminal and sent a backup to Director Hammond.",
      researchValue: 15,
      audioFile: "dr_park_log_1.mp3",
      dateRecorded: "Three days before incident",
    },
    
    // Patient logs
    patient_zero_log: {
      id: "patient_zero_log",
      title: "Patient Interview",
      character: "dr_rodriguez",
      location: "medical_bay",
      duration: 65,
      transcript: "Patient interview, subject 001. Dr. Rodriguez conducting. [Different voice] 'Can you describe when you first noticed the symptoms?' [Male voice, weak] 'It was after the particle physics conference in Geneva. I was just an attendee, not even a physicist. I was feeling fine, then suddenly, at exactly 3:17 PM, I felt this... resonance. Like every cell in my body was vibrating slightly out of sync with reality. The doctors thought I was describing a panic attack until they saw the readings.' [Dr. Rodriguez] 'And the other attendees?' [Patient] 'That's the strange part. I've been in contact with five other people who were there. They all felt the exact same thing at exactly the same time, down to the minute. How is that possible?' [Dr. Rodriguez] 'That's what we're trying to determine. Did you notice anything unusual at the conference?' [Patient] 'Only that there was some excitement about a quantum computing demonstration. Something about achieving unprecedented entanglement states...' [Dr. Rodriguez] 'Thank you. We'll continue this later. Rest now.'",
      researchValue: 10,
      audioFile: "patient_zero_log.mp3",
      dateRecorded: "One month before incident",
    },
  },
  
  // Research data entries
  dataEntries: {
    // Formula components
    quantum_formula_part1: {
      id: "quantum_formula_part1",
      title: "Quantum Cure Base Structure",
      type: "formula",
      content: "The base structure of the quantum cure relies on a stable quantum dot matrix configured in a precise entanglement pattern that mirrors the pathogen's own quantum signature. Key molecular components include:\n\n- Modified buckminsterfullerene cage (C60) for quantum state preservation\n- Organic binding matrix with quantum-resistant properties\n- Tailored RNA sequence for cellular delivery\n\nThe quantum dots must be arranged in the exact inverse entanglement pattern of the pathogen to create destructive interference at the quantum level. This will effectively collapse the pathogen's wave function without damaging surrounding cellular structures.\n\nNOTE: This is only part 1 of 3 of the complete formula. The quantum resonance frequencies and stabilization protocols are required to complete the cure.",
      location: "alpha_lab_terminal",
      author: "Dr. Sarah Chen",
      dateCreated: "One week before incident",
      requiredEvidence: true,
      researchValue: 15,
    },
    
    quantum_formula_part2: {
      id: "quantum_formula_part2",
      title: "Quantum Resonance Frequencies",
      type: "formula",
      content: "The quantum cure must be tuned to specific resonance frequencies to effectively target the entangled pathogen. Our analysis of patient zero samples has revealed the following critical frequencies:\n\n- Primary resonance: 42.58 THz (matches quantum computing entanglement frequency from Geneva incident)\n- Secondary harmonics: 21.29 THz and 85.16 THz\n- Phase alignment: 0.532π radians\n\nThe cure delivery system must generate these precise frequencies in a phase-locked loop to maintain quantum coherence throughout treatment. Any deviation greater than 0.001 THz will result in treatment failure and potential quantum instability in the patient.\n\nWARNING: Incorrect frequency calibration could intensify quantum entanglement rather than disrupting it, potentially accelerating the pathogen's effects.",
      location: "quantum_core_terminal",
      author: "Dr. Sarah Chen",
      dateCreated: "Five days before incident",
      requiredEvidence: true,
      researchValue: 15,
    },
    
    quantum_formula_part3: {
      id: "quantum_formula_part3",
      title: "Quantum Stabilization Protocol",
      type: "formula",
      content: "The complete quantum cure requires precise stabilization to prevent premature wave function collapse. Dr. Park's molecular stabilizer provides the necessary quantum coherence, but must be integrated as follows:\n\n1. Stabilizer compound must be synthesized at supercritical temperature (42K) to maintain quantum properties\n2. Integration with formula base structure must occur within quantum shielded environment\n3. Final cure must be stored in quantum stabilization field until moment of administration\n\nAdministration Protocol:\n- Delivery via quantum-shielded injection system\n- Simultaneous global deployment recommended for optimal entanglement disruption\n- Monitor for quantum field collapse indicators during first 24 hours post-treatment\n\nWith all three components properly integrated, the quantum cure will effectively target and neutralize the pandemic pathogen by exploiting the same quantum entanglement properties that make it so dangerous.\n\nThis completes the full quantum cure formula. Authorization code: CHEN-QF-FINAL",
      location: "dr_chen_laptop",
      author: "Dr. Sarah Chen",
      dateCreated: "Day of incident",
      requiredEvidence: true,
      researchValue: 20,
    },
    
    // Patient data
    patient_zero_data: {
      id: "patient_zero_data",
      title: "Patient Zero Full Analysis",
      type: "medical",
      content: "Subject: Patient 001 (Identity Classified)\nExposure Location: International Quantum Computing Conference, Geneva\nExposure Date: March 15, 2025\n\nClinical Presentation:\n- Simultaneous onset of symptoms in all exposed individuals (exact timestamp: 15:17:23 GMT)\n- Initial symptoms: cellular resonance, quantum coherence detectable in blood samples\n- Secondary symptoms: immune system disruption, neurological entanglement effects\n\nUnique Characteristics:\n- Quantum signature in blood samples matches exactly with quantum computer demonstration frequency\n- Cellular structures show unprecedented quantum tunneling behavior\n- Patients exhibit synchronized symptom progression despite geographical separation\n\nTransmission Vector Analysis:\n- Transmission occurs through quantum entanglement rather than conventional biological mechanisms\n- No physical contact required between infected individuals\n- New cases appear simultaneously in entangled groups, not following normal contagion patterns\n\nThis data confirms that Patient Zero was the index case for quantum entanglement exposure, and that the quantum computing demonstration inadvertently created the conditions for biological quantum entanglement. The exact mechanism of transfer from machine to biological systems remains under investigation.",
      location: "medical_records",
      author: "Dr. Elena Rodriguez",
      dateCreated: "Three weeks before incident",
      requiredEvidence: true,
      researchValue: 15,
    },
    
    // Research journals
    quantum_entanglement_theory: {
      id: "quantum_entanglement_theory",
      title: "Macroscopic Quantum Entanglement Theory",
      type: "research",
      content: "Recent theoretical work has suggested the possibility of maintaining quantum entanglement effects at the macroscopic level under specific conditions. While conventional quantum effects are typically limited to subatomic particles and extremely cold temperatures, our research indicates that certain molecular structures could preserve quantum coherence at room temperature if properly configured.\n\nThe key breakthrough is the development of a carbon nanomaterial matrix that shields quantum states from environmental decoherence. In laboratory tests, we've successfully maintained quantum entanglement between molecular structures separated by up to 10 meters - orders of magnitude beyond previous achievements.\n\nApplications include quantum computing, instantaneous communications, and potentially revolutionary medical treatments that could operate on quantum principles rather than chemical interactions. However, significant safety concerns remain unaddressed, particularly regarding the theoretical possibility of uncontrolled quantum coherence spreading to surrounding biological systems.\n\nRECOMMENDATION: Proceed with extreme caution in practical applications until comprehensive safety protocols are established. The risk of quantum effects bleeding into macroscopic systems could have unpredictable consequences.",
      location: "research_library",
      author: "Dr. James Walton",
      dateCreated: "Six months before incident",
      researchValue: 10,
    },
    
    stabilizer_compound_notes: {
      id: "stabilizer_compound_notes",
      title: "Quantum Stabilizer Compound Documentation",
      type: "technical",
      content: "The quantum stabilizer compound (QSC-7) represents a breakthrough in maintaining quantum coherence in non-laboratory environments. The compound consists of:\n\n- Quantum dot core (cadmium selenide, precisely arranged in tetragonal formation)\n- Carbon nanotube shield with superconducting properties\n- Organic binding matrix for biological compatibility\n\nSynthesis requires specialized equipment and precise environmental controls:\n- Temperature: 42K ± 0.1K\n- Quantum shielding: Minimum 40dB isolation\n- Magnetic field: <0.5μT\n\nThe QSC-7 has been successfully tested with Dr. Chen's quantum formula base and shows 98.7% coherence preservation over a 72-hour period in simulated biological conditions. This exceeds our requirements for the treatment delivery window.\n\nSafety Note: In the event of quantum containment failure, the compound must be immediately secured in portable quantum isolation containers. Exposure to unshielded QSC-7 could potentially induce quantum effects in biological tissues.",
      location: "engineering_lab",
      author: "Dr. Min-ho Park",
      dateCreated: "One week before incident",
      requiredEvidence: true,
      researchValue: 15,
    },
  },
  
  // Character dialogue
  dialogue: {
    // Dr. Hammond (Mission Director)
    director_hammond: {
      intro: {
        text: "Welcome to the crisis response team. I'm Director Hammond. The situation is critical - we have less than 48 hours before the pandemic reaches a point of no return. Dr. Chen's team discovered a potential quantum cure, but we lost contact with the facility after a quantum breach.",
        responses: [
          {
            text: "What exactly is this quantum pandemic?",
            nextNode: "explain_pandemic",
          },
          {
            text: "Tell me more about the quantum breach.",
            nextNode: "explain_breach",
          },
          {
            text: "What's my specific mission?",
            nextNode: "explain_mission",
          },
        ],
      },
      
      explain_pandemic: {
        text: "This is unlike any pathogen we've encountered. It operates using quantum entanglement principles, allowing it to affect patients simultaneously regardless of distance. It originated at a quantum computing conference in Geneva and has spread exponentially. Conventional treatments are ineffective because the quantum nature of the pathogen allows it to essentially 'teleport' past immune responses.",
        responses: [
          {
            text: "And Dr. Chen found a way to counter this?",
            nextNode: "explain_solution",
          },
          {
            text: "How is this even possible? Quantum effects don't work at this scale.",
            nextNode: "explain_science",
          },
        ],
      },
      
      explain_breach: {
        text: "Approximately 12 hours ago, the quantum containment systems at the research facility failed. We detected a massive surge of quantum energy before communications went dark. Satellite imagery shows the facility intact, but our sensors indicate ongoing quantum instability throughout the complex. We believe Dr. Chen's team was working on the cure when the breach occurred.",
        responses: [
          {
            text: "Any survivors?",
            nextNode: "explain_survivors",
          },
          {
            text: "What caused the containment failure?",
            nextNode: "explain_failure",
          },
        ],
      },
      
      explain_mission: {
        text: "Your mission has three primary objectives: First, locate Dr. Chen's research and recover the quantum cure formula. Second, collect any biological samples needed to synthesize the cure. Third, establish a quantum stabilization field so we can safely extract you and the research. You'll be equipped with our latest quantum protection gear, but time in the facility must be limited due to exposure risks.",
        responses: [
          {
            text: "I'm ready. When do I start?",
            nextNode: "mission_start",
            type: "mission_accept",
          },
          {
            text: "What happens if I'm exposed to the quantum effects?",
            nextNode: "explain_exposure",
          },
        ],
      },
      
      explain_solution: {
        text: "Yes, Dr. Chen theorized that the same quantum principles making the pathogen so dangerous could be used against it. Her team was developing a quantum-entangled counter-agent that would induce a controlled collapse of the pathogen's quantum state. Their last update indicated they were close to completing the formula when the breach occurred.",
        responses: [
          {
            text: "Tell me more about my mission.",
            nextNode: "explain_mission",
          },
          {
            text: "What happens if we don't recover this cure in time?",
            nextNode: "explain_consequences",
          },
        ],
      },
      
      explain_science: {
        text: "Under normal circumstances, you would be correct. Quantum coherence typically breaks down at the macroscopic level due to environmental interactions. Dr. Chen's team was researching methods to maintain quantum effects in biological systems for medical applications when they discovered the pathogen was doing exactly that - through an artificial mechanism. Someone engineered this, and Dr. Chen's breakthroughs may be our only hope of countering it.",
        responses: [
          {
            text: "Someone weaponized quantum physics?",
            nextNode: "explain_origins",
          },
          {
            text: "Let's focus on the mission details.",
            nextNode: "explain_mission",
          },
        ],
      },
      
      explain_survivors: {
        text: "We've received automated emergency beacons from several locations in the facility, suggesting some personnel made it to safety protocols. However, we've been unable to establish direct communication. Be prepared to encounter survivors who may be injured or experiencing quantum exposure symptoms. Extraction of critical personnel is a secondary objective.",
        responses: [
          {
            text: "I'll do what I can to help them.",
            nextNode: "acknowledge_rescue",
            type: "altruistic",
          },
          {
            text: "The research has to be the priority.",
            nextNode: "acknowledge_priority",
            type: "pragmatic",
          },
        ],
      },
      
      mission_start: {
        text: "You'll deploy immediately. Our last communication with Dr. Chen indicated the quantum formula components are spread across three different sections of the facility for security reasons. The quantum protection suit will shield you from the worst effects, but monitor your exposure levels carefully. Remember, we're counting on you - millions of lives depend on recovering this research.",
        responses: [
          {
            text: "I won't let you down.",
            nextNode: "deploy",
            type: "mission_confirm",
          },
        ],
      },
      
      // More dialogue nodes as needed...
    },
    
    // Dr. Chen (Lead Researcher)
    dr_chen: {
      intro: {
        text: "[Via emergency communication system, voice strained] You made it! I'm Dr. Sarah Chen, lead quantum physicist. I'm trapped in the emergency shelter near the quantum core. The breach is worse than we anticipated - it's causing localized reality distortions. I can guide you to the formula components, but you'll need to be careful. The quantum effects are... changing things.",
        responses: [
          {
            text: "Are you injured? What's your status?",
            nextNode: "status_report",
            type: "altruistic",
          },
          {
            text: "Tell me where to find the formula components.",
            nextNode: "formula_locations",
            type: "pragmatic",
          },
          {
            text: "What exactly is happening with these 'reality distortions'?",
            nextNode: "explain_distortions",
          },
        ],
      },
      
      status_report: {
        text: "I'm... stable. Minor injuries during the evacuation. The shelter's quantum shielding is holding for now, but power is limited. Don't worry about me - focus on the formula. Without it, none of us have a chance. The pandemic is accelerating, and we're running out of time.",
        responses: [
          {
            text: "I'll find a way to get you out of there.",
            nextNode: "rescue_response",
            type: "altruistic",
          },
          {
            text: "Where can I find the formula components?",
            nextNode: "formula_locations",
            type: "pragmatic",
          },
        ],
      },
      
      formula_locations: {
        text: "I split the formula into three parts for security. The base structure is in my lab terminal in Alpha Wing - you'll need my authentication code: CHEN-QX-4293. The quantum resonance frequencies are stored in the quantum core's main computer. The stabilization protocol is on my personal laptop in the emergency office. You'll need all three to synthesize a working cure.",
        responses: [
          {
            text: "Got it. What about the biological samples?",
            nextNode: "sample_location",
          },
          {
            text: "Any security measures I should know about?",
            nextNode: "security_info",
          },
        ],
      },
      
      explain_distortions: {
        text: "The quantum breach has created areas where macroscopic quantum effects are manifesting. You might encounter temporal anomalies, spatial inconsistencies, or even probability fluctuations. Your suit has sensors that will warn you of dangerous quantum concentrations. If they trigger, get out of that area immediately. Prolonged exposure could have... unpredictable effects on your molecular stability.",
        responses: [
          {
            text: "That sounds extremely dangerous.",
            nextNode: "danger_acknowledgment",
          },
          {
            text: "Where are the formula components located?",
            nextNode: "formula_locations",
          },
        ],
      },
      
      // More dialogue nodes as needed...
    },
    
    // Additional characters...
  },
  
  // Interactive choices/decision points
  decisions: {
    accept_mission: {
      id: "accept_mission",
      title: "Accept the Mission",
      description: "Do you accept the mission to recover the quantum cure?",
      choices: [
        {
          id: "accept",
          text: "I accept the mission. The world needs this cure.",
          outcome: "You accept the mission, knowing the risks but understanding the importance of the quantum cure.",
          flags: { mission_accepted: true },
          type: "altruistic",
        },
        {
          id: "negotiate",
          text: "I'll do it, but I want full access to the research afterward.",
          outcome: "Director Hammond agrees to your terms, noting your scientific interest in the breakthrough.",
          flags: { mission_accepted: true, negotiated_research_access: true },
          type: "pragmatic",
        },
        {
          id: "cautious",
          text: "What additional protective measures can you provide?",
          outcome: "Hammond authorizes additional quantum shielding for your suit, offering better protection but slightly reduced mobility.",
          flags: { mission_accepted: true, extra_protection: true, mobility_reduced: true },
          type: "careful",
        },
      ],
    },
    
    quantum_breach_response: {
      id: "quantum_breach_response",
      title: "Quantum Breach Crisis",
      description: "A quantum breach is imminent in the facility. How do you respond?",
      choices: [
        {
          id: "evacuate",
          text: "Evacuate all personnel immediately, even if it means leaving some research behind.",
          outcome: "You prioritize human life, ensuring all researchers escape safely, though some critical data is lost.",
          flags: { all_personnel_saved: true, research_partially_lost: true },
          type: "altruistic",
        },
        {
          id: "stabilize",
          text: "Attempt to stabilize the breach while ordering a partial evacuation.",
          outcome: "Your quick action prevents a catastrophic breach. Some personnel are injured but the research is preserved.",
          flags: { breach_contained: true, some_personnel_injured: true, research_preserved: true },
          type: "risky",
        },
        {
          id: "research",
          text: "Secure the critical research data first, then evacuate.",
          outcome: "You secure all research data, but the delay results in more severe injuries among the staff.",
          flags: { all_research_secured: true, personnel_casualties: true },
          type: "pragmatic",
        },
      ],
    },
    
    // More decision points...
  },
  
  // Mission objectives and quest data
  missions: {
    recover_formula: {
      id: "recover_formula",
      title: "Recover the Quantum Formula",
      description: "Locate and secure all three components of Dr. Chen's quantum cure formula.",
      objectives: [
        {
          id: "find_base_structure",
          description: "Recover the formula base structure from Dr. Chen's lab terminal",
          location: "alpha_lab",
          requiredEvidence: ["quantum_formula_part1"],
        },
        {
          id: "find_resonance",
          description: "Recover the quantum resonance frequencies from the quantum core",
          location: "quantum_core",
          requiredEvidence: ["quantum_formula_part2"],
        },
        {
          id: "find_protocol",
          description: "Recover the stabilization protocol from Dr. Chen's laptop",
          location: "emergency_office",
          requiredEvidence: ["quantum_formula_part3"],
        },
      ],
      rewards: {
        researchProgress: 30,
        timeAdded: 600, // 10 minutes
      },
    },
    
    collect_samples: {
      id: "collect_samples",
      title: "Biological Samples Collection",
      description: "Collect the biological samples needed to synthesize the quantum cure.",
      objectives: [
        {
          id: "find_patient_data",
          description: "Locate patient zero data records",
          location: "medical_records",
          requiredEvidence: ["patient_zero_data"],
        },
        {
          id: "collect_blood_samples",
          description: "Retrieve the biological samples from cold storage",
          location: "cold_storage",
          requiredEvidence: ["biological_samples"],
        },
        {
          id: "collect_stabilizer",
          description: "Obtain the quantum stabilizer compound",
          location: "engineering_lab",
          requiredEvidence: ["stabilizer_compound_notes"],
        },
      ],
      rewards: {
        researchProgress: 25,
      },
    },
    
    rescue_researchers: {
      id: "rescue_researchers",
      title: "Locate Survivors",
      description: "Find and rescue trapped research team members.",
      objectives: [
        {
          id: "locate_dr_park",
          description: "Find Dr. Park in the engineering section",
          location: "engineering_lab",
        },
        {
          id: "locate_dr_rodriguez",
          description: "Find Dr. Rodriguez in the medical bay",
          location: "medical_bay",
        },
        {
          id: "locate_dr_chen",
          description: "Reach Dr. Chen in the emergency shelter",
          location: "emergency_shelter",
        },
      ],
      rewards: {
        researchProgress: 15,
        relationship: {
          "dr_chen": 20,
          "dr_park": 20,
          "dr_rodriguez": 20,
        },
      },
      optional: true,
    },
    
    // More missions...
  },
  
  // World locations
  locations: {
    // Facility areas
    alpha_lab: {
      id: "alpha_lab",
      name: "Alpha Wing Research Laboratory",
      description: "The main research lab where Dr. Chen's team conducted their initial quantum studies. Electronic equipment flickers with unstable power, and holographic displays show partial quantum formulas.",
      connections: ["alpha_corridor", "quantum_core"],
      items: ["lab_terminal", "research_notes", "quantum_analyzer"],
      hazards: ["minor_quantum_fluctuations"],
      audioLogs: ["dr_chen_log_1"],
      dataEntries: ["quantum_formula_part1"],
    },
    
    quantum_core: {
      id: "quantum_core",
      name: "Quantum Core",
      description: "The facility's central quantum research chamber. A large containment field generator dominates the center, surrounded by sophisticated equipment. Visible quantum fluctuations distort the air in certain areas.",
      connections: ["alpha_lab", "synthesis_lab"],
      items: ["quantum_core_terminal", "stabilization_controls", "quantum_shielding"],
      hazards: ["major_quantum_fluctuations", "temporal_anomalies"],
      audioLogs: ["dr_chen_log_2"],
      dataEntries: ["quantum_formula_part2"],
      securityLevel: 2,
    },
    
    // More locations...
  },
  
  // Pandemic information
  pandemic: {
    name: "Quantum Entanglement Syndrome (QES)",
    description: "A novel pathogen that operates on quantum principles, affecting victims simultaneously across vast distances through quantum entanglement.",
    progressionStages: [
      {
        stage: 1,
        severity: "15%",
        description: "Initial outbreak in major cities. Isolated containment still possible.",
        worldEffects: ["travel_restrictions", "limited_quarantines"],
      },
      {
        stage: 2,
        severity: "30%",
        description: "Widespread transmission across continents. Conventional containment failing.",
        worldEffects: ["global_quarantines", "medical_system_strain", "economic_disruption"],
      },
      {
        stage: 3,
        severity: "50%",
        description: "Global crisis declared. Simultaneous outbreaks everywhere regardless of containment.",
        worldEffects: ["healthcare_collapse", "social_unrest", "military_deployment"],
      },
      {
        stage: 4,
        severity: "75%",
        description: "Critical threshold reached. Pandemic accelerating exponentially.",
        worldEffects: ["governmental_collapse", "mass_casualties", "infrastructure_failure"],
      },
      {
        stage: 5,
        severity: "95%+",
        description: "Point of no return. Global systems collapse imminent.",
        worldEffects: ["societal_collapse", "irreversible_damage"],
      },
    ],
    cureRequirements: ["quantum_formula", "biological_samples", "quantum_stabilizer", "delivery_system"],
  },
};

export default StoryData;