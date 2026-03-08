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
interface TopAppearance {
  top: Top | Top100
  topTitle: string
  topSlug: string
  topVersion: number
  ranker: string
  rank: number
  context?: string
  publishedAt: string
  isTop100: boolean
  deduplicated: boolean
}

const allAppearances = computed<TopAppearance[]>(() => {
  const appearances: TopAppearance[] = []

  // Standard TOPs
  for (const top of getAllTopFiles()) {
    // Check if entity appears more than once across all rankings in this TOP
    let totalAppearances = 0
    for (const ranking of top.rankings) {
      for (const entry of ranking.entries) {
        if (entry.entities?.some(e => e.entityId === entityId))
          totalAppearances++
      }
    }

    if (totalAppearances > 1) {
      // Deduplicated: show once with no rank
      appearances.push({
        top,
        topTitle: top.title,
        topSlug: top.slug,
        topVersion: top.version,
        ranker: '',
        rank: 0,
        publishedAt: top.publishedAt,
        isTop100: false,
        deduplicated: true,
      })
    }
    else {
      // Normal: show with rank and ranker
      for (const ranking of top.rankings) {
        for (const entry of ranking.entries) {
          if (entry.entities?.some(e => e.entityId === entityId)) {
            appearances.push({
              top,
              topTitle: top.title,
              topSlug: top.slug,
              topVersion: top.version,
              ranker: ranking.ranker,
              rank: entry.rank,
              context: entry.context,
              publishedAt: top.publishedAt,
              isTop100: false,
              deduplicated: false,
            })
          }
        }
      }
    }
  }

  // Top 100
  for (const top100 of getAllTop100()) {
    let totalAppearances = 0
    for (const ranking of top100.rankings) {
      for (const entry of ranking.entries) {
        if (entry.entities?.some(e => e.entityId === entityId))
          totalAppearances++
      }
    }

    if (totalAppearances > 1) {
      appearances.push({
        top: top100,
        topTitle: `Top 100 All-Time`,
        topSlug: top100.slug,
        topVersion: top100.version,
        ranker: '',
        rank: 0,
        publishedAt: `${top100.publishedYear}-01-01`,
        isTop100: true,
        deduplicated: true,
      })
    }
    else {
      for (const ranking of top100.rankings) {
        for (const entry of ranking.entries) {
          if (entry.entities?.some(e => e.entityId === entityId)) {
            appearances.push({
              top: top100,
              topTitle: `Top 100 All-Time`,
              topSlug: top100.slug,
              topVersion: top100.version,
              ranker: ranking.ranker,
              rank: entry.rank,
              publishedAt: `${top100.publishedYear}-01-01`,
              isTop100: true,
              deduplicated: false,
            })
          }
        }
      }
    }
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
    items.sort((a, b) => a.rank - b.rank)
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
          :key="`${app.topSlug}-${app.topVersion}-${app.ranker}-${idx}`"
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
              <span v-if="!app.deduplicated && app.ranker" class="capitalize">{{ app.ranker }}</span>
              <span v-if="app.context">({{ app.context }})</span>
              <span v-if="app.topVersion > 1">v{{ app.topVersion }}</span>
            </div>
          </div>
          <div
            v-if="!app.deduplicated"
            class="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                   bg-primary-500/10 text-sm font-bold text-primary-600 dark:text-primary-400"
            :class="{ 'blur-md select-none': spoilerOn }"
          >
            #{{ app.rank }}
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
