<!--
Sync Impact Report:
- Version change: 0.1.0 → 1.0.0
- Modified principles: All principles newly defined for Physical AI & Humanoid Robotics textbook
- Added sections: Core Principles (6), Additional Constraints, Development Workflow, Governance
- Removed sections: None
- Templates requiring updates: ✅ updated
- Follow-up TODOs: None
-->

# Physical AI & Humanoid Robotics Constitution

## Core Principles

### I. Complete Educational Coverage
Every chapter must comprehensively cover the specified topics in the sequence: Introduction → ROS 2 → Gazebo → NVIDIA Isaac → VLA → Conversational Robotics → Capstone Autonomous Humanoid. Each chapter must include Mermaid diagrams, ROS2/Python code examples, Key Takeaways, Practice Exercises, 5 MCQs quiz, and Further Reading sections. This ensures consistent educational quality across all 13 chapters.

### II. Multilingual Accessibility
The textbook must support high-quality English and natural human-level Urdu translations. Every chapter must include a "اردو میں پڑھیں / Show in Urdu" button at the top, enabling seamless language switching. Translation quality must reach native speaker level for both languages.

### III. Hardware Personalization
Each chapter must include a "Personalize to my hardware" button that adapts content based on user's hardware specifications (GPU model, Jetson availability, real robot type). The system must dynamically adjust examples, code snippets, and recommendations based on the user's hardware profile.

### IV. Integrated RAG Chatbot
A sophisticated RAG (Retrieval-Augmented Generation) chatbot must be built into the textbook that can answer questions from the entire book or from selected text only. The chatbot must provide accurate, context-aware responses and cite specific sources within the textbook.

### V. User Authentication with Hardware Profiling
The signup/login system must collect essential hardware information including GPU model, Jetson usage (yes/no), and real robot type. This information powers the personalization features and enables targeted content delivery based on the user's actual setup and capabilities.

### VI. Technical Excellence in Implementation
The textbook must be built with Docusaurus + Spec-Kit Plus template and deployed on GitHub Pages. All code examples must be verified, executable, and follow best practices for ROS2 and Python development. The system must be scalable, maintainable, and accessible.

## Additional Constraints
Technology stack: Docusaurus framework, GitHub Pages hosting, Node.js/JavaScript for frontend, Python for backend services including RAG implementation. The system must support responsive design for mobile and desktop. All content must be properly licensed and comply with accessibility standards (WCAG 2.1 AA).

## Development Workflow
All features must follow the red-green-refactor cycle with appropriate testing. Chapter content must be peer-reviewed before publication. Code examples must include unit tests. The RAG system must undergo accuracy validation. User authentication must implement secure practices. Internationalization must be tested with native speakers for both languages.

## Governance
This constitution governs all development decisions for the Physical AI & Humanoid Robotics textbook. All PRs must verify compliance with these principles. Any deviation requires explicit approval and documentation. Updates to this constitution require team consensus and must maintain the educational mission. The constitution will be reviewed quarterly for continued relevance.

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07
