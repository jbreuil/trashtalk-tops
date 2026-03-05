<script setup lang="ts">
import type { Top } from '~/types'
import { computed, ref } from 'vue'
import { useEntities } from '~/composables/useEntities'
import { useSpoiler } from '~/composables/useSpoiler'
import { useTops } from '~/composables/useTops'

const route = useRoute()
const entityId = route.params.slug as string

const { getById, getEntityMap } = useEntities()
const { getAllTopFiles } = useTops()
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
}

// Collect all TOP appearances for this entity across all files (all versions)
interface TopAppearance {
  top: Top
  ranker: 'alex' | 'bastien'
  rank: number
  context?: string
  publishedAt: string
}

const allAppearances = computed<TopAppearance[]>(() => {
  const appearances: TopAppearance[] = []

  for (const top of getAllTopFiles()) {
    for (const entry of top.rankingAlex) {
      if (entry.entityId === entityId) {
        appearances.push({
          top,
          ranker: 'alex',
          rank: entry.rank,
          context: entry.context,
          publishedAt: top.publishedAt,
        })
      }
    }
    for (const entry of top.rankingBastien) {
      if (entry.entityId === entityId) {
        appearances.push({
          top,
          ranker: 'bastien',
          rank: entry.rank,
          context: entry.context,
          publishedAt: top.publishedAt,
        })
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
          <span v-if="entity.years" class="rounded bg-[var(--color-bg-mute)] px-2 py-0.5 text-xs">
            {{ entity.years }}
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
          :key="`${app.top.slug}-${app.top.version}-${app.ranker}-${idx}`"
          :to="`/tops/${app.top.slug}?v=${app.top.version}`"
          class="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3
                 transition-all hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5"
        >
          <div class="min-w-0 flex-1">
            <h3 class="truncate font-medium">
              {{ app.top.title }}
            </h3>
            <div class="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-soft)]">
              <span>{{ app.publishedAt }}</span>
              <span class="capitalize">{{ app.ranker }}</span>
              <span v-if="app.context">({{ app.context }})</span>
              <span v-if="app.top.version > 1">v{{ app.top.version }}</span>
            </div>
          </div>
          <div
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
