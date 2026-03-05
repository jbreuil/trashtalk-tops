<script setup lang="ts">
import type { Entity, SearchResultGroup, Top } from '~/types'
import { ref } from 'vue'

defineProps<{
  groups: SearchResultGroup[]
}>()

const expandedCategories = ref<Set<string>>(new Set())

function toggleExpand(category: string) {
  if (expandedCategories.value.has(category))
    expandedCategories.value.delete(category)
  else
    expandedCategories.value.add(category)
}

function isTop(item: Top | Entity): item is Top {
  return 'videoId' in item
}
</script>

<template>
  <div v-if="groups.length > 0" class="space-y-6">
    <div v-for="group in groups" :key="group.category">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
        {{ group.label }}
        <span class="ml-1 text-xs font-normal">({{ group.total }})</span>
      </h2>

      <div class="space-y-2">
        <template v-for="result in group.results" :key="isTop(result.item) ? (result.item as Top).slug : (result.item as Entity).entityId">
          <TopCard v-if="isTop(result.item)" :top="(result.item as Top)" />
          <EntityCard v-else :entity="(result.item as Entity)" />
        </template>
      </div>

      <button
        v-if="group.total > group.results.length && !expandedCategories.has(group.category)"
        class="mt-2 text-sm text-primary-500 hover:text-primary-600 transition-colors"
        @click="toggleExpand(group.category)"
      >
        Voir les {{ group.total }} résultats
      </button>
    </div>
  </div>

  <div v-else class="py-12 text-center text-[var(--color-text-soft)]">
    <p class="text-lg">
      Aucun résultat
    </p>
    <p class="mt-1 text-sm">
      Essayez un autre terme de recherche
    </p>
  </div>
</template>
