<script setup lang="ts">
import type { RankerRanking, RankingEntry, Top100Segment } from '~/types'
import { computed, ref, watch } from 'vue'
import { useRankingOrder } from '~/composables/useRankingOrder'
import { useSpoiler } from '~/composables/useSpoiler'
import { useTops } from '~/composables/useTops'

const { getAllTop100 } = useTops()
const { spoilerOn } = useSpoiler()
const { ascending, toggle: toggleOrder } = useRankingOrder()

const top100List = getAllTop100()

// Sort by version ascending
const sortedVersions = [...top100List].sort((a, b) => a.version - b.version)

// Current version from query param, defaults to latest
const route = useRoute()
const currentVersionNumber = ref(
  Number(route.query.v) || (sortedVersions[sortedVersions.length - 1]?.version ?? 1),
)

const currentTop100 = computed(() => {
  return sortedVersions.find(v => v.version === currentVersionNumber.value)
    ?? sortedVersions[sortedVersions.length - 1]
    ?? null
})

// Previous version for diff badges
const previousTop100 = computed(() => {
  const idx = sortedVersions.findIndex(v => v.version === currentVersionNumber.value)
  return idx > 0 ? sortedVersions[idx - 1] : null
})

// Sort rankings by side: left first, right second
const sortedRankings = computed<RankerRanking[]>(() => {
  if (!currentTop100.value)
    return []
  return [...currentTop100.value.rankings].sort((a, b) => {
    if (a.side === 'left' && b.side === 'right')
      return -1
    if (a.side === 'right' && b.side === 'left')
      return 1
    return 0
  })
})

// Granular spoiler: track revealed cells per ranker
const revealedCells = ref<Map<string, Set<number>>>(new Map())

function isBlurred(rank: number, rankerName: string): boolean {
  if (!spoilerOn.value)
    return false
  return !(revealedCells.value.get(rankerName)?.has(rank) ?? false)
}

function revealCell(rank: number, rankerName: string) {
  if (spoilerOn.value) {
    const current = revealedCells.value.get(rankerName) ?? new Set()
    const updated = new Map(revealedCells.value)
    updated.set(rankerName, new Set([...current, rank]))
    revealedCells.value = updated
  }
}

watch(spoilerOn, () => {
  revealedCells.value = new Map()
})

// Sorted entries per ranker
function sortedEntries(ranking: RankerRanking): RankingEntry[] {
  const sorted = [...ranking.entries]
  return ascending.value ? sorted.sort((a, b) => a.rank - b.rank) : sorted.sort((a, b) => b.rank - a.rank)
}

/** Find the video segment that contains a given rank */
function findSegment(rank: number): Top100Segment | undefined {
  if (!currentTop100.value)
    return undefined
  return currentTop100.value.segments.find(s => s.ranks.includes(rank))
}

function videoLinkForRank(entry: RankingEntry): string | undefined {
  const segment = findSegment(entry.rank)
  if (!segment)
    return undefined
  if (entry.timestamp)
    return `https://www.youtube.com/watch?v=${segment.videoId}&t=${entry.timestamp}`
  return `https://www.youtube.com/watch?v=${segment.videoId}`
}

/** Build a map of entityId -> rank for diff computation */
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

function getPreviousRank(entry: RankingEntry, rankerName: string): number | undefined {
  if (!previousTop100.value || !entry.entities?.length)
    return undefined
  const prevRanking = previousTop100.value.rankings.find(r => r.ranker.toLowerCase() === rankerName.toLowerCase())
  if (!prevRanking)
    return undefined
  const rankMap = buildRankMap(prevRanking.entries)
  return rankMap.get(entry.entities[0].entityId)
}

function onVersionChange(version: number) {
  currentVersionNumber.value = version
  navigateTo({ query: { v: version } }, { replace: true })
}

useHead({
  title: 'Top 100 All-Time — TrashTalk TOPs',
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <button class="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-soft)] hover:text-primary-500 transition-colors" @click="$router.back()">
      &larr; Retour
    </button>

    <h1 class="mb-2 text-3xl font-bold">
      Top 100 All-Time
    </h1>

    <template v-if="currentTop100">
      <p class="mb-6 text-sm text-[var(--color-text-soft)]">
        Version {{ currentTop100.version }} — {{ currentTop100.publishedYear }}
      </p>

      <!-- Version Switcher -->
      <VersionSwitcher
        :versions="sortedVersions"
        :current-version="currentVersionNumber"
        class="mb-6"
        @change="onVersionChange"
      />

      <!-- Video segments -->
      <div class="mb-6">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
          Segments vidéo
        </h2>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="segment in currentTop100.segments"
            :key="segment.ranks.join('-')"
            :href="`https://www.youtube.com/watch?v=${segment.videoId}`"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm
                   transition-colors hover:border-primary-500/50 hover:text-primary-500"
          >
            #{{ segment.ranks[segment.ranks.length - 1] }}–#{{ segment.ranks[0] }}
          </a>
        </div>
      </div>

      <!-- Order toggle -->
      <div class="mb-4 flex justify-center">
        <button
          class="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5
                 text-xs font-medium text-[var(--color-text-soft)] transition-colors
                 hover:border-primary-500/50 hover:text-primary-500"
          @click="toggleOrder"
        >
          {{ ascending ? '1 → 100' : '100 → 1' }}
        </button>
      </div>

      <!-- Rankings — two columns based on side -->
      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="ranking in sortedRankings"
          :key="ranking.ranker"
          class="overflow-hidden rounded-xl border border-[var(--color-border)]"
        >
          <div class="bg-[var(--color-bg-mute)] px-4 py-2">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              {{ ranking.ranker }}
            </h3>
          </div>
          <table class="w-full">
            <tbody>
              <tr
                v-for="entry in sortedEntries(ranking)"
                :key="entry.rank"
                class="border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg-soft)]"
              >
                <td class="w-12 py-2 text-center text-sm font-bold text-primary-500">
                  <a
                    v-if="videoLinkForRank(entry)"
                    :href="videoLinkForRank(entry)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:underline"
                  >{{ entry.rank }}</a>
                  <template v-else>
                    {{ entry.rank }}
                  </template>
                </td>
                <td class="py-2 pr-4 cursor-pointer" @click="revealCell(entry.rank, ranking.ranker)">
                  <div class="flex items-center gap-2">
                    <NuxtLink
                      v-if="entry.entities?.length === 1"
                      :to="`/entity/${entry.entities[0].entityId}`"
                      class="text-sm font-medium transition-colors hover:text-primary-500"
                      :class="{ 'blur-md select-none pointer-events-none': isBlurred(entry.rank, ranking.ranker) }"
                    >
                      {{ entry.name }}
                    </NuxtLink>
                    <span
                      v-else
                      class="text-sm font-medium"
                      :class="{ 'blur-md select-none': isBlurred(entry.rank, ranking.ranker) }"
                    >{{ entry.name }}</span>
                    <VersionDiffBadge
                      v-if="previousTop100"
                      :previous-rank="getPreviousRank(entry, ranking.ranker)"
                      :current-rank="entry.rank"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scroll to top -->
      <div class="mt-8 flex justify-center">
        <button
          class="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2
                 text-sm text-[var(--color-text-soft)] transition-colors hover:border-primary-500/50 hover:text-primary-500"
          @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
        >
          &uarr; Haut de page
        </button>
      </div>
    </template>

    <div v-else class="py-12 text-center text-[var(--color-text-soft)]">
      Aucun Top 100 disponible.
    </div>
  </div>
</template>
