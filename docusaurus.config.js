// @ts-check
// `@type` JSDoc annotations allow IDEs and type checkers to type-check this file
// to check it, add the `// @ts-check` comment at the top of this file

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics Textbook',
  tagline: 'Comprehensive textbook on Physical AI and Humanoid Robotics',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://fariau.github.io',
  baseUrl: '/Humanoid-Robotic-Book/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'fariau', 
  projectName: 'Humanoid-Robotic-Book', 
  deploymentBranch: 'gh-pages', 
  trailingSlash: false, 

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',


  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/docs',
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false, // Disable blog if not needed
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    // Add plugin for custom webpack configuration
    // @ts-ignore
    function () {
      return {
        name: 'webpack-dev-server-config',
        configureWebpack(config, isServer, utils) {
          if (!isServer) { // Only configure for client builds
            return {
              devServer: {
                proxy: {
                  '/api/rag': {
                    target: 'http://localhost:3025',
                    changeOrigin: true,
                    secure: false,
                  },
                  '/api/auth': {
                    target: 'http://localhost:3025',
                    changeOrigin: true,
                    secure: false,
                  },
                  '/api/auth': {
                    target: 'http://localhost:3021',
                    changeOrigin: true,
                    secure: false,
                  },
                },
              },
            };
          }
          return {};
        }
      };
    },
  ],

  themes: [
    // ... your other themes
  ],

  staticDirectories: ['static'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI Textbook',
        logo: {
          alt: 'Physical AI & Humanoid Robotics Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'http://localhost:3021/auth',
            label: 'Login / Signup',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Textbook',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Motion Planning',
                to: '/docs/motion-planning',
              },
              {
                label: 'Learning & Adaptation',
                to: '/docs/learning-adaptation',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'GitHub Repository',
                href: 'https://github.com/fariau/Humanoid-Robotic-Book',
              },
              {
                label: 'ROS2 Documentation',
                href: 'https://docs.ros.org/en/humble/',
              },
              {
                label: 'Gazebo Simulation',
                href: 'https://gazebosim.org/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'NVIDIA Isaac',
                href: 'https://developer.nvidia.com/isaac-ros',
              },
              {
                label: 'Safety & Ethics',
                to: '/docs/safety-ethics',
              },
              {
                label: 'Capstone Project',
                to: '/docs/capstone',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;