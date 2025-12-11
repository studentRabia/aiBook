---
id: intro
title: "Module 4: Vision-Language-Action (VLA)"
sidebar_position: 1
---

# Module 4: Vision-Language-Action (VLA)

## Overview

This module covers Vision-Language-Action models that enable robots to understand natural language commands and execute appropriate actions. You'll learn to ground language in visual perception, train action policies, and transfer learned behaviors from simulation to real robots.

## Learning Objectives

By the end of this module, you will be able to:

- Ground natural language instructions in visual observations
- Train imitation learning and diffusion policies
- Fine-tune VLA models for robot control
- Implement domain randomization for sim-to-real transfer
- Deploy language-conditioned policies on real hardware

## Prerequisites

- **Completed Module 3**: NVIDIA Isaac and perception
- **PyTorch proficiency**: Deep learning implementation
- **GPU with 16GB+ VRAM**: For VLA model training
- **Time**: 12-15 hours

## Chapter Structure

### [4.1 Vision-Language Grounding for Robotics](4.1-vision-language-grounding)

Connect natural language instructions to visual scene understanding.

**Topics**: CLIP, GroundingDINO, SAM, spatial language, 3D grounding

**Code Example**: ROS 2 grounding service for referring expressions

### [4.2 Action Policy Learning for Robot Control](4.2-action-policy)

Train neural networks to map observations to robot actions.

**Topics**: Behavior cloning, diffusion policies, VLA models, action chunking

**Code Example**: OpenVLA fine-tuning and deployment

### [4.3 Sim-to-Real Transfer](4.3-sim2real)

Bridge the gap between simulated and real-world robot deployment.

**Topics**: Domain randomization, system identification, domain adaptation, safety

**Code Example**: Safe real robot deployment with online fine-tuning

## Hands-On Project

**Goal**: Build a language-conditioned manipulation system that can execute natural language commands.

**Deliverables**:
1. Vision-language grounding pipeline
2. Trained action policy from demonstrations
3. Domain randomization for robust transfer
4. Working deployment on simulated/real robot

## Resources

- [OpenVLA](https://openvla.github.io/)
- [GroundingDINO](https://github.com/IDEA-Research/GroundingDINO)
- [Diffusion Policy](https://diffusion-policy.cs.columbia.edu/)

## Next Steps

After completing this module, proceed to [Module 5: Capstone Project](../module-5-capstone/intro) to integrate all components into a complete humanoid system.
