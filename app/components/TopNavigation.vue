<script setup lang="ts">
import type { Top } from '~/types'

defineProps<{
  prev: Top | null
  next: Top | null
}>()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <NuxtLink
      v-if="prev"
      :to="`/tops/${prev.slug}`"
      class="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2
             text-sm transition-colors hover:border-primary-500/50"
    >
      <span class="text-[var(--color-text-soft)]">&larr;</span>
      <span class="line-clamp-1">{{ prev.title }}</span>
    </NuxtLink>
    <div v-else />

    <button
      class="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2
             text-sm text-[var(--color-text-soft)] transition-colors hover:border-primary-500/50 hover:text-primary-500"
      @click="scrollToTop"
    >
      &uarr; Haut de page
    </button>

    <NuxtLink
      v-if="next"
      :to="`/tops/${next.slug}`"
      class="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2
             text-sm text-right transition-colors hover:border-primary-500/50"
    >
      <span class="line-clamp-1">{{ next.title }}</span>
      <span class="text-[var(--color-text-soft)]">&rarr;</span>
    </NuxtLink>
    <div v-else />
  </div>
</template>
