---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Form 'n Go"
  text: "Fastest form development"
  tagline: A juicy, fully typed, standard schema compliant, light weight, Vue form library
  image:
    src: assets/mango_no_shadow.svg
    alt: Formango

  actions:
    - theme: brand
      text: Getting started
      link: /guide/getting-started
    - theme: alt
      text: API documentation
      link: /api/useForm

features:
  - title: Headless
    details: Use together with any component library or your own custom UI.
    icon: 
      src: /assets/headless.png
  - title: Type Safe
    details: Built from the ground up with typescript support.
    icon: 
      src: /assets/ts.svg
  - title: Standard schema
    details: Standard schema spec compliant, supporting Zod, Valibot and ArkType or any other schema library following the spec.
    icon: 
      src: /assets/zod.svg
  - title: I18n
    details: Using the schema library and vue-i18n, the error messages are fully translatable.
    icon: 
      src: /assets/world.svg
  - title: Devtools
    details: Built-in Vue devtool support.
    icon: 
      src: /assets/devtools.svg
  - title: Fast Development
    details: Simple API to develop forms at a never seen before speed.
    icon: 
      src: /assets/rocket.svg

---

<script setup>
import HomeTeam from './.vitepress/theme/components/HomeTeam.vue'
import HomeCredits from './.vitepress/theme/components/HomeCredits.vue'

</script>


<HomeTeam />
<HomeCredits />