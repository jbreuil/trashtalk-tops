<script setup lang="ts">
import type { Entity, SearchResultGroup, Top } from '~/types'
import { ref, watch } from 'vue'

const props = defineProps<{
  groups: SearchResultGroup[]
}>()

const expandedCategories = ref<Set<string>>(new Set())

// Reset expanded state when groups change (new search query)
watch(() => props.groups, () => {
  expandedCategories.value = new Set()
})

function expand(category: string) {
  expandedCategories.value = new Set([...expandedCategories.value, category])
}

function isTop(item: Top | Entity): item is Top {
  return 'videoId' in item
}

function visibleResults(group: SearchResultGroup) {
  if (expandedCategories.value.has(group.category))
    return group.results
  return group.results.slice(0, group.defaultCount)
}
</script>

<template>
  <div v-if="groups.length > 0" class="space-y-6">
    <div v-for="group in groups" :key="group.category">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
        {{ group.label }}
        <span class="ml-1 text-xs font-normal">({{ group.results.length }})</span>
      </h2>

      <div class="space-y-2">
        <template v-for="result in visibleResults(group)" :key="isTop(result.item) ? (result.item as Top).slug : (result.item as Entity).entityId">
          <TopCard v-if="isTop(result.item)" :top="(result.item as Top)" />
          <EntityCard v-else :entity="(result.item as Entity)" />
        </template>
      </div>

      <button
        v-if="group.results.length > group.defaultCount && !expandedCategories.has(group.category)"
        class="mt-2 text-sm text-primary-500 hover:text-primary-600 transition-colors"
        @click="expand(group.category)"
      >
        Voir les {{ group.results.length }} résultats
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
