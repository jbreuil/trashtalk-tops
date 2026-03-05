<script setup lang="ts">
import type { Top } from '~/types'

defineProps<{
  versions: Top[]
  currentVersion: number
}>()

const emit = defineEmits<{
  change: [version: number]
}>()
</script>

<template>
  <div v-if="versions.length > 1" class="flex items-center gap-2">
    <span class="text-sm text-[var(--color-text-soft)]">Version :</span>
    <div class="flex gap-1">
      <button
        v-for="v in versions"
        :key="v.version"
        class="rounded-lg px-3 py-1 text-sm font-medium transition-colors"
        :class="v.version === currentVersion
          ? 'bg-primary-500 text-white'
          : 'bg-[var(--color-bg-mute)] hover:bg-surface-200 dark:hover:bg-surface-700'"
        @click="emit('change', v.version)"
      >
        V{{ v.version }}
        <span class="ml-1 text-xs opacity-75">{{ v.publishedAt }}</span>
      </button>
    </div>
  </div>
</template>
