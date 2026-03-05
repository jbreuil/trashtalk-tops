<script setup lang="ts">
import type { Top } from '~/types'

defineProps<{
  tops: Top[]
}>()
</script>

<template>
  <div v-if="tops.length > 0">
    <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
      TOPs similaires
    </h2>
    <div class="space-y-2">
      <TopCard v-for="top in tops" :key="top.slug" :top="top" />
    </div>
  </div>
</template>
