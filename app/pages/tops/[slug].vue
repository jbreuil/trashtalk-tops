<script setup lang="ts">
import type { RankerRanking, RankingEntry } from '~/types'
import { computed, ref } from 'vue'
import { useRankingOrder } from '~/composables/useRankingOrder'
import { useTops } from '~/composables/useTops'

const route = useRoute()
const slug = route.params.slug as string

const { getTopVersions, getAdjacentTops, getRelatedTops } = useTops()
const { ascending, toggle: toggleOrder } = useRankingOrder()

// All versions of this TOP (sorted by version asc)
const versions = getTopVersions(slug)

if (versions.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'TOP introuvable' })
}

// Current version from query param, defaults to latest
const currentVersionNumber = ref(
  Number(route.query.v) || versions[versions.length - 1].version,
)

const currentTop = computed(() => {
  return versions.find(v => v.version === currentVersionNumber.value)
    ?? versions[versions.length - 1]
})

// Previous version for diff badges
const previousTop = computed(() => {
  const idx = versions.findIndex(v => v.version === currentVersionNumber.value)
  return idx > 0 ? versions[idx - 1] : null
})

// v1 side reference: use v1 rankings to determine consistent left/right sides
const v1Rankings = versions[0].rankings

/** Get the side for a ranker, using v1 as reference */
function getSideForRanker(rankerName: string): 'left' | 'right' {
  const v1Ranking = v1Rankings.find(r => r.ranker.toLowerCase() === rankerName.toLowerCase())
  if (v1Ranking)
    return v1Ranking.side
  // Fallback to the ranker's own declared side
  const own = currentTop.value.rankings.find(r => r.ranker.toLowerCase() === rankerName.toLowerCase())
  return own?.side ?? 'left'
}

/** Rankings with sides resolved from v1 reference */
const resolvedRankings = computed<RankerRanking[]>(() => {
  return currentTop.value.rankings.map(r => ({
    ...r,
    side: getSideForRanker(r.ranker),
  }))
})

/** Build a map of entityId -> rank for a given ranking's entries */
function buildRankMap(entries: RankingEntry[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of entries) {
    if (entry.entities) {
      for (const ref of entry.entities) {
        map.set(ref.entityId, entry.rank)
      }
    }
  }
  return map
}

/** Get the previous rank for an entry in a specific ranker's ranking */
function getPreviousRank(entry: RankingEntry, rankerName: string): number | undefined {
  if (!previousTop.value || !entry.entities?.length)
    return undefined
  const prevRanking = previousTop.value.rankings.find(r => r.ranker.toLowerCase() === rankerName.toLowerCase())
  if (!prevRanking)
    return undefined
  const rankMap = buildRankMap(prevRanking.entries)
  // Use the first entity's ID for lookup
  return rankMap.get(entry.entities[0].entityId)
}

const { prev, next } = getAdjacentTops(slug)
const related = getRelatedTops(slug)

function onVersionChange(version: number) {
  currentVersionNumber.value = version
  navigateTo({ query: { v: version } }, { replace: true })
}

useHead({
  title: `${currentTop.value.title} — TrashTalk TOPs`,
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <!-- Header -->
    <div class="mb-6">
      <button class="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-soft)] hover:text-primary-500 transition-colors" @click="$router.back()">
        &larr; Retour
      </button>
      <h1 class="mb-2 text-3xl font-bold">
        {{ currentTop.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-soft)]">
        <span>{{ currentTop.publishedAt }}</span>
        <span v-if="currentTop.season" class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs">
          {{ currentTop.season }}
        </span>
        <span
          v-for="tag in currentTop.tags"
          :key="tag"
          class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Version Switcher -->
    <VersionSwitcher
      :versions="versions"
      :current-version="currentVersionNumber"
      class="mb-6"
      @change="onVersionChange"
    />

    <!-- YouTube Embed -->
    <div class="mb-8 aspect-video overflow-hidden rounded-xl">
      <iframe
        :src="`https://www.youtube.com/embed/${currentTop.videoId}`"
        class="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      />
    </div>

    <!-- Order toggle -->
    <div class="mb-4 flex justify-center">
      <button
        class="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5
               text-xs font-medium text-[var(--color-text-soft)] transition-colors
               hover:border-primary-500/50 hover:text-primary-500"
        @click="toggleOrder"
      >
        {{ ascending ? `1 → ${currentTop.format}` : `${currentTop.format} → 1` }}
      </button>
    </div>

    <!-- Rankings side by side -->
    <div class="mb-8">
      <RankingComparison
        :rankings="resolvedRankings"
        :video-id="currentTop.videoId"
      >
        <template #badge="{ entry, ranker }">
          <VersionDiffBadge
            v-if="previousTop"
            :previous-rank="getPreviousRank(entry, ranker)"
            :current-rank="entry.rank"
          />
        </template>
      </RankingComparison>
    </div>

    <!-- Navigation -->
    <TopNavigation :prev="prev" :next="next" class="mb-8" />

    <!-- Related -->
    <RelatedTops :tops="related" />
  </div>
</template>
