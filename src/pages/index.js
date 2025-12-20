import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', 'hero-banner')}>
      <div className="container">
        <div className="row">
          <div className="col col--6 col--offset-3">
            {/* Logo */}
            <div className="text--center">
              <img
                src="img/logo.svg"
                alt="Physical AI & Humanoid Robotics Logo"
                className="hero-logo"
                style={{width: '150px', height: '150px', marginBottom: '2rem'}}
              />
            </div>

            {/* Title and Description */}
            <Heading as="h1" className="hero__title">
              {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">
              Comprehensive textbook on Physical AI and Humanoid Robotics
            </p>

            {/* Call to Action Button */}
            <div className="margin-top--lg">
              <Link
                className="button button--secondary button--lg"
                to="/docs/intro">
                Start Reading →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Comprehensive textbook on Physical AI and Humanoid Robotics">
      <HomepageHeader />

      {/* Additional content sections */}
      <main className="container padding-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className="text--center padding-horiz--md">
              <h2>Learn Advanced Robotics Concepts</h2>
              <p>
                This comprehensive textbook covers the fundamentals and advanced topics in Physical AI and Humanoid Robotics,
                from basic motion planning to sophisticated learning and adaptation techniques.
              </p>
            </div>
          </div>
        </div>

        <div className="row padding-vert--lg">
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Motion Planning</h3>
              <p>Understand how robots navigate and plan movements in complex environments.</p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Learning & Adaptation</h3>
              <p>Explore how robots learn from experience and adapt to new situations.</p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>Hardware Integration</h3>
              <p>Learn about sensors, actuators, and control systems for humanoid robots.</p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}