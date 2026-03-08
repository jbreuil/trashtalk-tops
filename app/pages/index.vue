<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'
import { useTops } from '~/composables/useTops'

const { query, results } = useSearch()
const { getAllTops } = useTops()

const recentTops = getAllTops()
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, 10)

function onSearch(q: string) {
  query.value = q
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-8 text-center">
      <h1 class="mb-2 text-4xl font-bold text-primary-500">
        TrashTalk TOPs
      </h1>
      <p class="text-[var(--color-text-soft)]">
        Tous les classements TOP des vidéos TrashTalk NBA
      </p>
    </div>

    <SearchBar class="mb-8" @search="onSearch" />

    <template v-if="query.length >= 2">
      <SearchResults :groups="results" />
    </template>

    <template v-else>
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
        Derniers TOPs
      </h2>
      <div class="space-y-3">
        <TopCard v-for="top in recentTops" :key="top.slug" :top="top" />
      </div>
    </template>
  </div>
</template>
