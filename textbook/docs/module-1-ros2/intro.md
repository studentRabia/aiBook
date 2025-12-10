---
id: intro
title: "Module 1: ROS 2 Fundamentals"
sidebar_position: 1
---

# Module 1: ROS 2 Fundamentals

## Overview

This module introduces Robot Operating System 2 (ROS 2), the middleware foundation for modern robotics. You'll learn core ROS 2 concepts, build functional packages, and create a simple humanoid controller.

## Learning Objectives

By the end of this module, you will be able to:

- Install and configure ROS 2 Humble on Ubuntu 22.04
- Create ROS 2 nodes that communicate via topics and services
- Bridge Python AI agents to ROS 2 controllers
- Understand URDF for humanoid robot modeling
- Build a simple ROS 2 controller for humanoid arm manipulation

## Prerequisites

- **Ubuntu 22.04 LTS**: Clean installation recommended
- **Python 3.10+**: Intermediate programming skills
- **Command Line**: Familiarity with bash, package managers (apt)
- **Time**: 6-8 hours

## Chapter Structure

### [1.1 Introduction to ROS 2 Nodes, Topics, and Services](1.1-nodes-topics-services)

Learn the fundamental communication patterns in ROS 2 through hands-on talker-listener examples.

**Topics**: Nodes, topics, services, pub/sub pattern, request/response

**Code Example**: Talker-listener nodes with Python

### [1.2 Bridging Python Agents to ROS Controllers](1.2-python-ros-bridge)

Connect AI agents (reinforcement learning, LLMs) to ROS 2 control systems.

**Topics**: rclpy API, action servers, integration patterns

**Code Example**: Python agent controlling ROS 2 arm joint

### [1.3 Understanding URDF for Humanoid Robots](1.3-urdf-humanoids)

Model humanoid robots using Unified Robot Description Format (URDF).

**Topics**: Links, joints, kinematics, sensors, visualization in RViz

**Code Example**: Humanoid URDF with arms, legs, IMU, camera

### [1.4 Hands-On: Building a Simple ROS 2 Humanoid Controller](1.4-hands-on-controller)

Integrate all concepts to build a functional humanoid arm controller.

**Topics**: Joint trajectory controllers, position/velocity commands, testing

**Code Example**: Complete ROS 2 package for humanoid arm control

## Hands-On Project

**Goal**: Create a ROS 2 package that controls a humanoid arm to wave (left-right motion).

**Deliverables**:
1. ROS 2 workspace with functional package
2. URDF for humanoid upper body
3. Controller node that publishes joint commands
4. Launch file to start simulation in RViz

## Resources

- [ROS 2 Humble Documentation](https://docs.ros.org/en/humble/)
- [rclpy API Reference](https://docs.ros2.org/latest/api/rclpy/)
- [URDF Tutorials](http://wiki.ros.org/urdf/Tutorials)

## Next Steps

After completing this module, proceed to [Module 2: Digital Twin](../module-2-digital-twin/intro) to build photorealistic simulations.
