// https://vitepress.dev/guide/custom-theme
import './style.css'

import Theme from 'vitepress/theme'
import { h } from 'vue'

export default {
  enhanceApp() {
    // ...
  },
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {})
  },
}
