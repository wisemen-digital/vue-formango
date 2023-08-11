<script setup lang="ts">
import { VPTeamMembers, VPTeamPageTitle } from 'vitepress/theme'
const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/47747743',
    name: 'Wouter Laermans',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/wouterlms' },
    ],
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/44748019',
    name: 'Robbe Vaes',
    title: 'Docs / Devtools / Counsel',
    links: [
      { icon: 'github', link: 'https://github.com/Robbe95' },
      { icon: 'twitter', link: 'https://twitter.com/robbe_vaes' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/robbe-vaes-1841b5116/'}
    ],
  },

]

</script>

<template>
  <div class="center">
    <div class="vp-doc bg-red-500">
      <VPTeamPageTitle>
        <template #title>
          <div class="title">
            Our Team
          </div>
        </template>
      </VPTeamPageTitle>
    </div>
    <VPTeamMembers size="small" :members="members" />
  </div>
</template>

<style scoped>
  .center {
    text-align: center;
  }
  .title {
    opacity: 50%;
    padding-top: 1rem;
  }
</style>
