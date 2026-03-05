<script setup lang="ts">
import type { RankingEntry, Top100Segment } from '~/types'
import { computed, ref, watch } from 'vue'
import { useRankingOrder } from '~/composables/useRankingOrder'
import { useSpoiler } from '~/composables/useSpoiler'
import { useTops } from '~/composables/useTops'

const { getAllTop100 } = useTops()
const { spoilerOn } = useSpoiler()
const { ascending, toggle: toggleOrder } = useRankingOrder()

const top100List = getAllTop100()
const top100 = computed(() => top100List[0] ?? null)

// Granular spoiler: track revealed cells per column
const revealedAlex = ref<Set<number>>(new Set())
const revealedBastien = ref<Set<number>>(new Set())

function isBlurred(rank: number, revealed: Set<number>): boolean {
  if (!spoilerOn.value)
    return false
  return !revealed.has(rank)
}

function revealAlexCell(rank: number) {
  if (spoilerOn.value)
    revealedAlex.value = new Set([...revealedAlex.value, rank])
}

function revealBastienCell(rank: number) {
  if (spoilerOn.value)
    revealedBastien.value = new Set([...revealedBastien.value, rank])
}

watch(spoilerOn, () => {
  revealedAlex.value = new Set()
  revealedBastien.value = new Set()
})

// Sorted entries
const sortedAlex = computed(() => {
  if (!top100.value)
    return []
  const sorted = [...top100.value.rankingAlex]
  return ascending.value ? sorted.sort((a, b) => a.rank - b.rank) : sorted.sort((a, b) => b.rank - a.rank)
})

const sortedBastien = computed(() => {
  if (!top100.value)
    return []
  const sorted = [...top100.value.rankingBastien]
  return ascending.value ? sorted.sort((a, b) => a.rank - b.rank) : sorted.sort((a, b) => b.rank - a.rank)
})

/** Find the video segment that contains a given rank */
function findSegment(rank: number): Top100Segment | undefined {
  if (!top100.value)
    return undefined
  return top100.value.segments.find(s => s.ranks.includes(rank))
}

function videoLinkForRank(entry: RankingEntry): string | undefined {
  const segment = findSegment(entry.rank)
  if (!segment)
    return undefined
  if (entry.timestamp)
    return `https://www.youtube.com/watch?v=${segment.videoId}&t=${entry.timestamp}`
  return `https://www.youtube.com/watch?v=${segment.videoId}`
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

    <template v-if="top100">
      <p class="mb-6 text-sm text-[var(--color-text-soft)]">
        Version {{ top100.version }} — {{ top100.publishedYear }}
      </p>

      <!-- Video segments -->
      <div class="mb-6">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
          Segments vidéo
        </h2>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="segment in top100.segments"
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

      <!-- Rankings — two columns (Alex | Bastien) -->
      <div class="grid gap-4 md:grid-cols-2">
        <!-- Alex -->
        <div class="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div class="bg-[var(--color-bg-mute)] px-4 py-2">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              Alex
            </h3>
          </div>
          <table class="w-full">
            <tbody>
              <tr
                v-for="entry in sortedAlex"
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
                <td class="py-2 pr-4 cursor-pointer" @click="revealAlexCell(entry.rank)">
                  <NuxtLink
                    v-if="entry.entityId"
                    :to="`/entity/${entry.entityId}`"
                    class="text-sm font-medium transition-colors hover:text-primary-500"
                    :class="{ 'blur-md select-none pointer-events-none': isBlurred(entry.rank, revealedAlex) }"
                  >
                    {{ entry.name }}
                  </NuxtLink>
                  <span
                    v-else
                    class="text-sm font-medium"
                    :class="{ 'blur-md select-none': isBlurred(entry.rank, revealedAlex) }"
                  >{{ entry.name }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bastien -->
        <div class="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div class="bg-[var(--color-bg-mute)] px-4 py-2">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              Bastien
            </h3>
          </div>
          <table class="w-full">
            <tbody>
              <tr
                v-for="entry in sortedBastien"
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
                <td class="py-2 pr-4 cursor-pointer" @click="revealBastienCell(entry.rank)">
                  <NuxtLink
                    v-if="entry.entityId"
                    :to="`/entity/${entry.entityId}`"
                    class="text-sm font-medium transition-colors hover:text-primary-500"
                    :class="{ 'blur-md select-none pointer-events-none': isBlurred(entry.rank, revealedBastien) }"
                  >
                    {{ entry.name }}
                  </NuxtLink>
                  <span
                    v-else
                    class="text-sm font-medium"
                    :class="{ 'blur-md select-none': isBlurred(entry.rank, revealedBastien) }"
                  >{{ entry.name }}</span>
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
