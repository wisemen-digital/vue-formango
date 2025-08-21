import { defineConfig } from 'vitepress'

const bestPractices = [
  {
    link: '/best-practices/i18n',
    text: 'I18n',
  },
  {
    link: '/best-practices/custom-input',
    text: 'Custom input',
  },
]

const guide = [
  {
    link: '/guide/getting-started',
    text: 'Getting started',
  },
  {
    link: '/guide/devtools',
    text: 'Devtools',
  },
]

const api = [
  {
    link: '/api/useForm',
    text: 'useForm',
  },
  {
    link: '/api/field',
    text: 'Field',
  },
  {
    link: '/api/field-array',
    text: 'Field array',
  },
]

const examples = [
  {
    link: '/examples/subforms',
    text: 'Subforms',
  },
  {
    link: '/examples/external-errors',
    text: 'External errors',
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Formango',
  base: '/vue-formango/',
  description: 'A lightweight, zod-based Vue form library',
  head: [
    [
      'link',
      {
        href: '/forms/apple-touch-icon.png',
        rel: 'apple-touch-icon',
        sizes: '180x180',
      },
    ],
    [
      'link',
      {
        href: '/forms/favicon-32x32.png',
        rel: 'icon',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    [
      'link',
      {
        href: '/forms/favicon-16x16.png',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    [
      'link',
      {
        href: '/forms/site.webmanifest',
        rel: 'manifest',
      },
    ],
    [
      'link',
      {
        color: '#da532c',
        href: '/forms/safari-pinned-tab.svg',
        rel: 'mask-icon',
      },
    ],
    [
      'link',
      {
        href: '/forms/favicon.ico',
        rel: 'shortcut icon',
      },
    ],
    [
      'meta',
      {
        name: 'msapplication-TileColor',
        content: '#da532c',
      },
    ],
    [
      'meta',
      {
        name: 'msapplication-config',
        content: '/forms/browserconfig.xml',
      },
    ],
    [
      'meta',
      {
        name: 'theme-color',
        content: '#ffffff',
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        link: '/guide/getting-started',
        text: 'Guide',
      },
      {
        link: '/api/useForm',
        text: 'API docs',
      },

    ],
    search: { provider: 'local' },

    sidebar: [
      {
        items: guide,
        text: 'Guide',
      },
      {
        items: bestPractices,
        text: 'Best practices',
      },
      {
        items: api,
        text: 'API',
      },
      {
        items: examples,
        text: 'Examples',
      },
      {
        link: '/CHANGELOG',
        text: 'Changelog',
      },
      {
        link: '/playground',
        text: 'Playground',
      },

    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/wouterlms/forms',
      },
    ],
  },
})
