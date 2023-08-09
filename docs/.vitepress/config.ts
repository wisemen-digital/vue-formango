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
  title: 'Appwise Forms',
  description: 'A lightweight, zod-based Vue form library',
  themeConfig: {
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
