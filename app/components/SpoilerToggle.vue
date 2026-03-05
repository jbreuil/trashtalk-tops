<script setup lang="ts">
import { useSpoiler } from '~/composables/useSpoiler'

const { spoilerOn, toggle } = useSpoiler()
</script>

<template>
  <button
    class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
           hover:bg-surface-100 dark:hover:bg-surface-800"
    :title="spoilerOn ? 'Spoilers masqués' : 'Spoilers visibles'"
    @click="toggle()"
  >
    <span>{{ spoilerOn ? '🙈' : '👁️' }}</span>
    <span class="hidden sm:inline">{{ spoilerOn ? 'Spoiler' : 'Visible' }}</span>
  </button>
</template>
