<script setup lang="ts">
import {
  VPTeamMembers,
  VPTeamPageTitle,
} from 'vitepress/theme'

const members = [
  {
    title: 'Creator',
    name: 'Wouter Laermans',
    avatar: 'https://avatars.githubusercontent.com/u/47747743',
    links: [
      {
        icon: 'github',
        link: 'https://github.com/wouterlms',
      },
    ],
  },
  {
    title: 'Docs / Devtools / Counsel',
    name: 'Robbe Vaes',
    avatar: 'https://avatars.githubusercontent.com/u/44748019',
    links: [
      {
        icon: 'github',
        link: 'https://github.com/Robbe95',
      },
      {
        icon: 'twitter',
        link: 'https://twitter.com/robbe_vaes',
      },
      {
        icon: 'linkedin',
        link: 'https://www.linkedin.com/in/robbe-vaes-1841b5116/',
      },
    ],
  },

]
</script>

<template>
  <div class="center">
    <div class="vp-doc bg-red-500">
      <VPTeamPageTitle>
        <template #title>
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          <div class="title">
            Our Team
          </div>
        </template>
      </VPTeamPageTitle>
    </div>
    <VPTeamMembers
      :members="members"
      size="small"
    />
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
