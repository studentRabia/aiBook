/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Module 1: ROS 2 Fundamentals',
      items: [
        'module-1-ros2/intro',
        // Chapters will be added here by content generation
        // 'module-1-ros2/1.1-nodes-topics-services',
        // 'module-1-ros2/1.2-python-ros-bridge',
        // 'module-1-ros2/1.3-urdf-humanoids',
        // 'module-1-ros2/1.4-hands-on-controller',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Digital Twin (Gazebo & Unity)',
      items: [
        'module-2-digital-twin/intro',
        // Chapters will be added here
      ],
    },
    {
      type: 'category',
      label: 'Module 3: NVIDIA Isaac',
      items: [
        'module-3-nvidia-isaac/intro',
        // Chapters will be added here
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: [
        'module-4-vla/intro',
        // Chapters will be added here
      ],
    },
    {
      type: 'category',
      label: 'Module 5: Capstone Project',
      items: [
        'module-5-capstone/intro',
        // Chapters will be added here
      ],
    },
  ],
};

module.exports = sidebars;
