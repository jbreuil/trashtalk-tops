<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { mode, cycle } = useTheme()

const labels: Record<string, string> = {
  light: 'Clair',
  dark: 'Sombre',
  auto: 'Auto',
}

const icons: Record<string, string> = {
  light: '☀️',
  dark: '🌙',
  auto: '💻',
}
</script>

<template>
  <button
    class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
           hover:bg-surface-100 dark:hover:bg-surface-800"
    :title="`Thème : ${labels[mode]}`"
    @click="cycle()"
  >
    <span>{{ icons[mode] }}</span>
    <span class="hidden sm:inline">{{ labels[mode] }}</span>
  </button>
</template>
