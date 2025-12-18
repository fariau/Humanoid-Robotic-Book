---
id: 1
title: Create Physical AI Humanoid Constitution
stage: constitution
date: 2025-12-07
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: master
user: windows 10
command: /sp.constitution
labels: [constitution, textbook, physical-ai, humanoid-robotics]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Create the constitution for a complete AI-native textbook titled "Physical AI & Humanoid Robotics".

The book must be built with Docusaurus + Spec-Kit Plus template, deployed on GitHub Pages, and include all these features:
- 13 full chapters exactly covering: Introduction → ROS 2 → Gazebo → NVIDIA Isaac → VLA → Conversational Robotics → Capstone Autonomous Humanoid
- Built-in RAG chatbot that answers from the entire book and from selected text only
- Signup/login with extra questions about user hardware (GPU model, Jetson yes/no, real robot type)
- Every chapter must have two buttons at the top:
   → "Personalize to my hardware"
   → "اردو میں پڑھیں / Show in Urdu"
- Every chapter must contain Mermaid diagrams, ROS2/Python code examples, Key Takeaways, Practice Exercises, 5 MCQs quiz, and Further Reading
- Maximum possible bonus features implemented beautifully
- High-quality English + natural human-level Urdu versions

## Response snapshot

Created the constitution file for the Physical AI & Humanoid Robotics textbook project. The constitution includes 6 core principles covering educational coverage, multilingual accessibility, hardware personalization, integrated RAG chatbot, user authentication with hardware profiling, and technical excellence. It also includes additional constraints, development workflow, and governance sections. The constitution is version 1.0.0 and follows all specified requirements for the textbook project.

## Outcome

- ✅ Impact: Created complete constitution file at .specify/memory/constitution.md with all required principles and sections
- 🧪 Tests: none
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: Could proceed with creating spec, plan, or tasks for the textbook project
- 🧠 Reflection: Constitution properly captures all requirements from user input with appropriate principles and governance structure

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A