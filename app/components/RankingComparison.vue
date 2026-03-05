<script setup lang="ts">
import type { RankingEntry } from '~/types'

defineProps<{
  rankingAlex: RankingEntry[]
  rankingBastien: RankingEntry[]
  videoId?: string
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <RankingTable ranker="Alex" :entries="rankingAlex" :video-id="videoId" />
    <RankingTable ranker="Bastien" :entries="rankingBastien" :video-id="videoId" />
  </div>
</template>
