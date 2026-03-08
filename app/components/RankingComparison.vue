<script setup lang="ts">
import type { RankerRanking } from '~/types'

const props = defineProps<{
  rankings: RankerRanking[]
  videoId?: string
}>()

// Sort rankings by side: left first, right second
const sortedRankings = computed(() => {
  return [...props.rankings].sort((a, b) => {
    if (a.side === 'left' && b.side === 'right')
      return -1
    if (a.side === 'right' && b.side === 'left')
      return 1
    return 0
  })
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <RankingTable
      v-for="ranking in sortedRankings"
      :key="ranking.ranker"
      :ranker="ranking.ranker"
      :entries="ranking.entries"
      :video-id="videoId"
    >
      <template #badge="{ entry }">
        <slot name="badge" :entry="entry" :ranker="ranking.ranker" />
      </template>
    </RankingTable>
  </div>
</template>
