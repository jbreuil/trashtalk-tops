<script setup lang="ts">
import type { Top, Top100 } from '~/types'
import { computed, ref } from 'vue'
import { useEntities } from '~/composables/useEntities'
import { useSpoiler } from '~/composables/useSpoiler'
import { useTops } from '~/composables/useTops'

const route = useRoute()
const entityId = route.params.slug as string

const { getById, getEntityMap } = useEntities()
const { getAllTopFiles, getAllTop100 } = useTops()
const { spoilerOn } = useSpoiler()

const entity = getById(entityId)

if (!entity) {
  throw createError({ statusCode: 404, statusMessage: 'Entité introuvable' })
}

const entityMap = getEntityMap()

// Linked franchise (for teams with linkedTo)
const linkedEntity = computed(() => {
  if (!entity.linkedTo)
    return null
  return entityMap.get(entity.linkedTo) ?? null
})

const typeLabels: Record<string, string> = {
  player: 'Joueur',
  coach: 'Coach',
  team: 'Équipe',
  gm: 'General Manager',
}

// Collect all TOP appearances for this entity across all files (all versions)
interface RankerAppearance {
  ranker: string
  rank: number
  context?: string
}

interface TopAppearance {
  top: Top | Top100
  topTitle: string
  topSlug: string
  topVersion: number
  rankerAppearances: RankerAppearance[]
  publishedAt: string
  isTop100: boolean
  deduplicated: boolean // true only when a single ranker has the entity multiple times
}

function collectAppearances(
  rankings: Top['rankings'],
  targetEntityId: string,
): { rankerAppearances: RankerAppearance[], deduplicated: boolean } {
  const rankerAppearances: RankerAppearance[] = []
  for (const ranking of rankings) {
    for (const entry of ranking.entries) {
      if (entry.entities?.some(e => e.entityId === targetEntityId)) {
        rankerAppearances.push({
          ranker: ranking.ranker,
          rank: entry.rank,
          context: entry.context,
        })
      }
    }
  }
  // Deduplicate only when a single ranker has the entity multiple times
  const countByRanker = new Map<string, number>()
  for (const ra of rankerAppearances) {
    countByRanker.set(ra.ranker, (countByRanker.get(ra.ranker) ?? 0) + 1)
  }
  const deduplicated = [...countByRanker.values()].some(c => c > 1)
  return { rankerAppearances, deduplicated }
}

const allAppearances = computed<TopAppearance[]>(() => {
  const appearances: TopAppearance[] = []

  // Standard TOPs
  for (const top of getAllTopFiles()) {
    const { rankerAppearances, deduplicated } = collectAppearances(top.rankings, entityId)
    if (rankerAppearances.length === 0)
      continue
    appearances.push({
      top,
      topTitle: top.title,
      topSlug: top.slug,
      topVersion: top.version,
      rankerAppearances,
      publishedAt: top.publishedAt,
      isTop100: false,
      deduplicated,
    })
  }

  // Top 100
  for (const top100 of getAllTop100()) {
    const { rankerAppearances, deduplicated } = collectAppearances(top100.rankings, entityId)
    if (rankerAppearances.length === 0)
      continue
    appearances.push({
      top: top100,
      topTitle: `Top 100 All-Time`,
      topSlug: top100.slug,
      topVersion: top100.version,
      rankerAppearances,
      publishedAt: `${top100.publishedYear}-01-01`,
      isTop100: true,
      deduplicated,
    })
  }

  return appearances
})

type SortKey = 'date' | 'rank'
const sortBy = ref<SortKey>('date')

const sortedAppearances = computed(() => {
  const items = [...allAppearances.value]
  if (sortBy.value === 'date') {
    items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }
  else {
    // Sort by best (lowest) rank across all ranker appearances
    const bestRank = (app: TopAppearance) =>
      app.deduplicated ? Infinity : Math.min(...app.rankerAppearances.map(ra => ra.rank))
    items.sort((a, b) => bestRank(a) - bestRank(b))
  }
  return items
})

// NBA stats link (only for entities with nbaId)
const nbaStatsUrl = computed(() => {
  if (!entity.nbaId || entity.type === 'coach' || entity.type === 'gm')
    return null
  return `https://www.nba.com/stats/player/${entity.nbaId}`
})

useHead({
  title: `${entity.name} — TrashTalk TOPs`,
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <button class="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-soft)] hover:text-primary-500 transition-colors" @click="$router.back()">
      &larr; Retour
    </button>

    <!-- Entity Header -->
    <div class="mb-8 flex items-center gap-4">
      <div
        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full
               bg-primary-500/10 text-xl font-bold text-primary-600 dark:text-primary-400"
      >
        {{ entity.name.charAt(0) }}
      </div>
      <div>
        <h1 class="text-3xl font-bold">
          {{ entity.name }}
        </h1>
        <div class="flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
          <span>{{ typeLabels[entity.type] ?? entity.type }}</span>
          <a
            v-if="nbaStatsUrl"
            :href="nbaStatsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 underline"
          >
            Stats NBA
          </a>
          <span v-if="entity.years" class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs">
            {{ entity.years }}
          </span>
          <span v-if="entity.gamesPlayed" class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs">
            {{ entity.gamesPlayed }} matchs
          </span>
          <span v-if="entity.gamesCoached" class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs">
            {{ entity.gamesCoached }} matchs coachés ({{ entity.wins }}V-{{ entity.losses }}D)
          </span>
          <span v-if="entity.team" class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs">
            {{ entity.team }}
          </span>
        </div>
      </div>
    </div>

    <!-- Linked franchise -->
    <div v-if="linkedEntity" class="mb-6">
      <p class="text-sm text-[var(--color-text-soft)]">
        Voir aussi :
        <NuxtLink
          :to="`/entity/${linkedEntity.entityId}`"
          class="text-primary-500 hover:text-primary-600 underline"
        >
          {{ linkedEntity.name }}
        </NuxtLink>
      </p>
    </div>

    <!-- Appearances -->
    <div>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
          Apparitions dans les TOPs ({{ allAppearances.length }})
        </h2>
        <div class="flex gap-1">
          <button
            class="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
            :class="sortBy === 'date'
              ? 'bg-primary-500 text-white'
              : 'bg-[var(--color-bg-mute)] hover:bg-surface-200 dark:hover:bg-surface-700'"
            @click="sortBy = 'date'"
          >
            Par date
          </button>
          <button
            class="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
            :class="sortBy === 'rank'
              ? 'bg-primary-500 text-white'
              : 'bg-[var(--color-bg-mute)] hover:bg-surface-200 dark:hover:bg-surface-700'"
            @click="sortBy = 'rank'"
          >
            Par rang
          </button>
        </div>
      </div>

      <div v-if="sortedAppearances.length === 0" class="py-8 text-center text-[var(--color-text-soft)]">
        Aucune apparition trouvée.
      </div>

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="(app, idx) in sortedAppearances"
          :key="`${app.topSlug}-${app.topVersion}-${idx}`"
          :to="app.isTop100 ? '/top-100' : `/tops/${app.topSlug}?v=${app.topVersion}`"
          class="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3
                 transition-all hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5"
        >
          <div class="min-w-0 flex-1">
            <h3 class="truncate font-medium">
              {{ app.deduplicated ? `Apparaît dans ${app.topTitle}` : app.topTitle }}
            </h3>
            <div class="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-soft)]">
              <span>{{ app.publishedAt }}</span>
              <span v-if="app.topVersion > 1">v{{ app.topVersion }}</span>
            </div>
          </div>
          <div v-if="!app.deduplicated" class="ml-4 flex min-w-28 shrink-0 flex-col gap-1">
            <div
              v-for="ra in app.rankerAppearances"
              :key="ra.ranker"
              class="flex items-center justify-between"
              :class="{ 'blur-md select-none': spoilerOn }"
            >
              <span class="text-xs text-[var(--color-text-soft)]">{{ ra.ranker }}<template v-if="ra.context"> ({{ ra.context }})</template></span>
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full
                       bg-primary-500/10 text-xs font-bold text-primary-600 dark:text-primary-400"
              >
                {{ ra.rank }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
