import { defineConfig } from 'vitepress'

const guide = [
  { text: 'Getting started', link: '/guide/' },
  { text: 'Best Practice', link: '/guide/best-practice' },
  { text: 'Devtools', link: '/guide/devtools' },
]

const api = [
  { text: 'useForm', link: '/api/useForm' },
  { text: 'Field', link: '/api/field' },
  { text: 'Array field', link: '/api/array-field' },
  { text: 'Types', link: '/api/types' },
]
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/forms/',
  title: 'Formango',
  head: [
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/forms/apple-touch-icon.png"}],
    ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/forms/favicon-32x32.png"}],
    ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/forms/favicon-16x16.png"}],
    ['link', { rel: "manifest", href: "/forms/site.webmanifest"}],
    ['link', { rel: "mask-icon", href: "/forms/safari-pinned-tab.svg", color: "#da532c"}],
    ['link', { rel: "shortcut icon", href: "/forms/favicon.ico"}],
    ['meta', { name: "msapplication-TileColor", content: "#da532c"}],
    ['meta', { name: "msapplication-config", content: "/forms/browserconfig.xml"}],
    ['meta', { name: "theme-color", content: "#ffffff"}],
  ],
  description: 'A lightweight, zod-based Vue form library',
  themeConfig: {
    search: {
      provider: 'local'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API docs', link: '/api/useForm' },

    ],

    sidebar: [
      {
        text: 'Guide',
        items: guide,
      },
      {
        text: 'API',
        items: api,
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wouterlms/forms' },
    ],
  },
})
