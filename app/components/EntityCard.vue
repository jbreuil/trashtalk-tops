<script setup lang="ts">
import type { Entity } from '~/types'

defineProps<{
  entity: Entity
}>()

const typeLabels: Record<string, string> = {
  player: 'Joueur',
  coach: 'Coach',
  team: 'Équipe',
}
</script>

<template>
  <NuxtLink
    :to="`/entity/${entity.entityId}`"
    class="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3 transition-all
           hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
             bg-primary-500/10 text-sm font-bold text-primary-600 dark:text-primary-400"
    >
      {{ entity.name.charAt(0) }}
    </div>
    <div class="min-w-0">
      <h3 class="truncate font-semibold leading-tight">
        {{ entity.name }}
      </h3>
      <p class="text-xs text-[var(--color-text-soft)]">
        {{ typeLabels[entity.type] ?? entity.type }}
      </p>
    </div>
  </NuxtLink>
</template>
