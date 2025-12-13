/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation
 *
 * The sidebars can be generated from the filesystem, or explicitly defined here.
 *
 * Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Module 1: ROS 2 Fundamentals',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'module-1-ros2/intro',
      },
      items: [
        {
          type: 'doc',
          id: 'module-1-ros2/intro',
          label: '1.0 Introduction',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Digital Twin (Gazebo & Unity)',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'module-2-digital-twin/intro',
      },
      items: [
        {
          type: 'doc',
          id: 'module-2-digital-twin/intro',
          label: '2.0 Introduction',
        },
        {
          type: 'doc',
          id: 'module-2-digital-twin/2.1-gazebo-basics',
          label: '2.1 Gazebo Simulation Fundamentals',
        },
        {
          type: 'doc',
          id: 'module-2-digital-twin/2.2-unity-integration',
          label: '2.2 Unity Integration',
        },
        {
          type: 'doc',
          id: 'module-2-digital-twin/2.3-sensor-simulation',
          label: '2.3 Sensor Simulation',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 3: NVIDIA Isaac',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'module-3-nvidia-isaac/intro',
      },
      items: [
        {
          type: 'doc',
          id: 'module-3-nvidia-isaac/intro',
          label: '3.0 Introduction',
        },
        {
          type: 'doc',
          id: 'module-3-nvidia-isaac/3.1-isaac-sim-basics',
          label: '3.1 Isaac Sim Basics',
        },
        {
          type: 'doc',
          id: 'module-3-nvidia-isaac/3.2-synthetic-data',
          label: '3.2 Synthetic Data Generation',
        },
        {
          type: 'doc',
          id: 'module-3-nvidia-isaac/3.3-isaac-ros',
          label: '3.3 Isaac ROS Integration',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'module-4-vla/intro',
      },
      items: [
        {
          type: 'doc',
          id: 'module-4-vla/intro',
          label: '4.0 Introduction',
        },
        {
          type: 'doc',
          id: 'module-4-vla/4.1-vision-language-grounding',
          label: '4.1 Vision-Language Grounding',
        },
        {
          type: 'doc',
          id: 'module-4-vla/4.2-action-policy',
          label: '4.2 Action Policy Learning',
        },
        {
          type: 'doc',
          id: 'module-4-vla/4.3-sim2real',
          label: '4.3 Sim-to-Real Transfer',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 5: Capstone Project',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'module-5-capstone/intro',
      },
      items: [
        {
          type: 'doc',
          id: 'module-5-capstone/intro',
          label: '5.0 Introduction',
        },
        {
          type: 'doc',
          id: 'module-5-capstone/5.1-system-architecture',
          label: '5.1 System Architecture',
        },
        {
          type: 'doc',
          id: 'module-5-capstone/5.2-sensor-fusion',
          label: '5.2 Sensor Fusion',
        },
        {
          type: 'doc',
          id: 'module-5-capstone/5.3-integration-testing',
          label: '5.3 Integration Testing',
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 6: Reusable Intelligence (Claude Code)',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'module-6-ai-agents/intro',
      },
      items: [
        {
          type: 'doc',
          id: 'module-6-ai-agents/intro',
          label: '6.0 Introduction',
        },
        {
          type: 'doc',
          id: 'module-6-ai-agents/6.1-claude-code-subagents',
          label: '6.1 Claude Code Subagents',
        },
        {
          type: 'doc',
          id: 'module-6-ai-agents/6.2-agent-skills',
          label: '6.2 Agent Skills',
        },
        {
          type: 'doc',
          id: 'module-6-ai-agents/6.3-robotics-integration',
          label: '6.3 Integrating AI Agents with Robotics',
        },
      ],
    },
  ],
};

module.exports = sidebars;
