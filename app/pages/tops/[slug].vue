<script setup lang="ts">
import type { RankingEntry } from '~/types'
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

/** Build a map of entityId -> rank for a given ranking */
function buildRankMap(entries: RankingEntry[]): Map<string, number> {
  return new Map(
    entries
      .filter(e => e.entityId)
      .map(e => [e.entityId!, e.rank]),
  )
}

function getPreviousRankAlex(entry: RankingEntry): number | undefined {
  if (!previousTop.value || !entry.entityId)
    return undefined
  return buildRankMap(previousTop.value.rankingAlex).get(entry.entityId)
}

function getPreviousRankBastien(entry: RankingEntry): number | undefined {
  if (!previousTop.value || !entry.entityId)
    return undefined
  return buildRankMap(previousTop.value.rankingBastien).get(entry.entityId)
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
    <div class="mb-8 grid gap-4 md:grid-cols-2">
      <RankingTable
        ranker="Alex"
        :entries="currentTop.rankingAlex"
        :video-id="currentTop.videoId"
      >
        <template #badge="{ entry }">
          <VersionDiffBadge
            v-if="previousTop"
            :previous-rank="getPreviousRankAlex(entry)"
            :current-rank="entry.rank"
          />
        </template>
      </RankingTable>

      <RankingTable
        ranker="Bastien"
        :entries="currentTop.rankingBastien"
        :video-id="currentTop.videoId"
      >
        <template #badge="{ entry }">
          <VersionDiffBadge
            v-if="previousTop"
            :previous-rank="getPreviousRankBastien(entry)"
            :current-rank="entry.rank"
          />
        </template>
      </RankingTable>
    </div>

    <!-- Navigation -->
    <TopNavigation :prev="prev" :next="next" class="mb-8" />

    <!-- Related -->
    <RelatedTops :tops="related" />
  </div>
</template>
