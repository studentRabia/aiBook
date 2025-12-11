---
id: intro
title: "Module 3: NVIDIA Isaac"
sidebar_position: 1
---

# Module 3: NVIDIA Isaac

## Overview

This module covers NVIDIA's Isaac platform for scalable robotics simulation and hardware-accelerated perception. You'll learn to use Isaac Sim for GPU-accelerated physics, generate synthetic training data with Replicator, and deploy perception models with Isaac ROS.

## Learning Objectives

By the end of this module, you will be able to:

- Set up and use NVIDIA Isaac Sim for humanoid simulation
- Generate large-scale synthetic datasets with domain randomization
- Deploy GPU-accelerated perception pipelines with Isaac ROS
- Run visual SLAM and object detection on NVIDIA hardware
- Optimize inference for real-time robotics applications

## Prerequisites

- **Completed Module 2**: Digital Twin concepts
- **NVIDIA RTX GPU**: RTX 2070 or better recommended
- **Ubuntu 22.04 LTS**: With CUDA 12.0+
- **Time**: 10-12 hours

## Chapter Structure

### [3.1 NVIDIA Isaac Sim Fundamentals](3.1-isaac-sim-basics)

Learn to use Isaac Sim for GPU-accelerated robotics simulation with Omniverse.

**Topics**: USD format, PhysX 5, robot import, ROS 2 bridge, OmniGraph

**Code Example**: Standalone simulation script with humanoid robot

### [3.2 Synthetic Data Generation with Isaac Replicator](3.2-synthetic-data)

Generate diverse, annotated training data at scale using domain randomization.

**Topics**: Replicator API, lighting/material randomization, annotations, COCO export

**Code Example**: Complete data generation pipeline with 10,000 images

### [3.3 Isaac ROS for Hardware-Accelerated Perception](3.3-isaac-ros)

Deploy GPU-accelerated perception on NVIDIA Jetson and workstations.

**Topics**: Isaac ROS packages, DetectNet, DOPE, Visual SLAM, TensorRT

**Code Example**: Real-time object detection and pose estimation pipeline

## Hands-On Project

**Goal**: Build a complete synthetic data generation and perception pipeline for humanoid manipulation.

**Deliverables**:
1. Isaac Sim scene with humanoid and manipulation objects
2. Replicator pipeline generating 10,000+ annotated images
3. Trained object detection model
4. Isaac ROS deployment running at 30+ FPS

## Resources

- [Isaac Sim Documentation](https://docs.omniverse.nvidia.com/isaacsim)
- [Isaac ROS](https://nvidia-isaac-ros.github.io/)
- [Replicator Documentation](https://docs.omniverse.nvidia.com/extensions/latest/ext_replicator.html)

## Next Steps

After completing this module, proceed to [Module 4: Vision-Language-Action](../module-4-vla/intro) to learn multimodal learning for natural language robot control.
