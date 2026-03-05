<script setup lang="ts">
import type { Top } from '~/types'

defineProps<{
  top: Top
}>()
</script>

<template>
  <NuxtLink
    :to="`/tops/${top.slug}`"
    class="block rounded-xl border border-[var(--color-border)] p-4 transition-all
           hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-semibold leading-tight">
        {{ top.title }}
      </h3>
      <span class="shrink-0 rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
        TOP {{ top.format }}
      </span>
    </div>
    <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-soft)]">
      <span>{{ top.publishedAt }}</span>
      <span v-if="top.version > 1" class="rounded bg-[var(--color-bg-mute)] px-1.5 py-0.5">
        v{{ top.version }}
      </span>
      <span v-if="top.season" class="rounded bg-[var(--color-bg-mute)] px-1.5 py-0.5">
        {{ top.season }}
      </span>
      <span
        v-for="tag in top.tags"
        :key="tag"
        class="rounded bg-[var(--color-bg-mute)] px-1.5 py-0.5"
      >
        {{ tag }}
      </span>
    </div>
  </NuxtLink>
</template>
