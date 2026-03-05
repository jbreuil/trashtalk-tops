<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** Previous rank (undefined if new entry) */
  previousRank?: number
  /** Current rank */
  currentRank: number
}>()

const diff = computed(() => {
  if (props.previousRank === undefined)
    return { type: 'new' as const, value: 0 }
  const change = props.previousRank - props.currentRank
  if (change > 0)
    return { type: 'up' as const, value: change }
  if (change < 0)
    return { type: 'down' as const, value: Math.abs(change) }
  return { type: 'equal' as const, value: 0 }
})
</script>

<template>
  <span
    v-if="diff.type !== 'equal'"
    class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium"
    :class="{
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': diff.type === 'up',
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': diff.type === 'down',
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': diff.type === 'new',
    }"
  >
    <template v-if="diff.type === 'up'">↑{{ diff.value }}</template>
    <template v-else-if="diff.type === 'down'">↓{{ diff.value }}</template>
    <template v-else>E</template>
  </span>
  <span
    v-else
    class="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-[var(--color-text-soft)]"
  >
    =
  </span>
</template>
