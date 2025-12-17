import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import TypewriterText from '../components/TypewriterText';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* Animated typewriter title with gradient effect */}
        <h1 className={clsx('hero__title', styles.heroTitle)}>
          <TypewriterText
            text={siteConfig.title}
            speed={70}
            initialDelay={300}
            showCursor={true}
          />
        </h1>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Learning →
          </Link>
        </div>
      </div>
    </header>
  );
}

function ModuleOverview() {
  const modules = [
    {
      title: 'Module 1: ROS 2 Fundamentals',
      description: 'Learn ROS 2 nodes, topics, services, Python-ROS bridge, URDF, and controllers',
      link: '/docs/module-1-ros2/intro',
    },
    {
      title: 'Module 2: Digital Twin',
      description: 'Build digital twins with Gazebo physics, Unity rendering, and sensor simulation',
      link: '/docs/module-2-digital-twin/intro',
    },
    {
      title: 'Module 3: NVIDIA Isaac',
      description: 'Generate synthetic data, deploy Isaac ROS perception, and configure Nav2',
      link: '/docs/module-3-nvidia-isaac/intro',
    },
    {
      title: 'Module 4: VLA Integration',
      description: 'Master Vision-Language-Action models for multimodal robot control',
      link: '/docs/module-4-vla/intro',
    },
    {
      title: 'Module 5: Capstone Project',
      description: 'Build a complete humanoid system with pickup-and-place using VLA',
      link: '/docs/module-5-capstone/intro',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {modules.map((module, idx) => (
            <div key={idx} className={clsx('col col--4', styles.feature)}>
              <div className="text--center padding-horiz--md">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <Link to={module.link}>
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Interactive textbook for Physical AI and Humanoid Robotics">
      <HomepageHeader />
      <main>
        <ModuleOverview />
      </main>
    </Layout>
  );
}
