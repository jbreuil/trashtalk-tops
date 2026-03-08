<script setup lang="ts">
import type { RankingEntityRef, RankingEntry } from '~/types'
import { computed, ref, watch } from 'vue'
import { useEntities } from '~/composables/useEntities'
import { useRankingOrder } from '~/composables/useRankingOrder'
import { useSpoiler } from '~/composables/useSpoiler'

const props = defineProps<{
  ranker: string
  entries: RankingEntry[]
  videoId?: string
}>()

const { spoilerOn } = useSpoiler()
const { ascending } = useRankingOrder()
const { getById } = useEntities()

// Granular spoiler: track which cells have been revealed
const revealedCells = ref<Set<number>>(new Set())

function isCellBlurred(rank: number): boolean {
  if (!spoilerOn.value)
    return false
  return !revealedCells.value.has(rank)
}

function revealCell(rank: number) {
  if (spoilerOn.value) {
    revealedCells.value = new Set([...revealedCells.value, rank])
  }
}

// Reset revealed cells when spoiler toggles
watch(spoilerOn, () => {
  revealedCells.value = new Set()
})

// Note popover state
const activePopover = ref<number | null>(null)

function togglePopover(rank: number) {
  activePopover.value = activePopover.value === rank ? null : rank
}

function closePopover() {
  activePopover.value = null
}

// Sorted entries based on order preference
const sortedEntries = computed(() => {
  const sorted = [...props.entries]
  if (ascending.value) {
    sorted.sort((a, b) => a.rank - b.rank)
  }
  else {
    sorted.sort((a, b) => b.rank - a.rank)
  }
  return sorted
})

function videoLink(videoId: string | undefined, timestamp: number | undefined): string | undefined {
  if (!videoId)
    return undefined
  if (timestamp)
    return `https://www.youtube.com/watch?v=${videoId}&t=${timestamp}`
  return undefined
}

function entityName(ref: RankingEntityRef): string {
  return getById(ref.entityId)?.name ?? ref.entityId
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[var(--color-border)]">
    <div class="bg-[var(--color-bg-mute)] px-4 py-2">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
        {{ ranker }}
      </h3>
    </div>
    <table class="w-full">
      <tbody>
        <tr
          v-for="entry in sortedEntries"
          :key="entry.rank"
          class="border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg-soft)]"
        >
          <td class="w-12 py-2.5 text-center text-sm font-bold text-primary-500">
            <a
              v-if="videoLink(videoId, entry.timestamp)"
              :href="videoLink(videoId, entry.timestamp)"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
              :title="`Voir à ${entry.timestamp}s dans la vidéo`"
            >
              {{ entry.rank }}
            </a>
            <template v-else>
              {{ entry.rank }}
            </template>
          </td>
          <td class="py-2.5 pr-4" @click="revealCell(entry.rank)">
            <div class="flex items-center gap-2">
              <!-- Single entity: display entry.name as one link -->
              <NuxtLink
                v-if="entry.entities?.length === 1"
                :to="`/entity/${entry.entities[0].entityId}`"
                class="font-medium transition-colors hover:text-primary-500"
                :class="{
                  'blur-md select-none pointer-events-none': isCellBlurred(entry.rank),
                  'cursor-pointer': isCellBlurred(entry.rank),
                }"
              >
                {{ entry.name }}
              </NuxtLink>
              <!-- Multiple entities: display each as a separate link -->
              <span
                v-else-if="entry.entities && entry.entities.length > 1"
                class="font-medium"
                :class="{
                  'blur-md select-none': isCellBlurred(entry.rank),
                  'cursor-pointer': isCellBlurred(entry.rank),
                }"
              >
                <template v-for="(entityRef, i) in entry.entities" :key="entityRef.entityId">
                  <template v-if="i > 0"> &amp; </template>
                  <NuxtLink
                    :to="`/entity/${entityRef.entityId}`"
                    class="transition-colors hover:text-primary-500"
                    :class="{ 'pointer-events-none': isCellBlurred(entry.rank) }"
                  >
                    {{ entityName(entityRef) }}
                  </NuxtLink>
                </template>
              </span>
              <!-- No entity: plain text -->
              <span
                v-else
                class="font-medium"
                :class="{
                  'blur-md select-none': isCellBlurred(entry.rank),
                  'cursor-pointer': isCellBlurred(entry.rank),
                }"
              >
                {{ entry.name }}
              </span>
              <span
                v-if="entry.context"
                class="text-xs text-[var(--color-text-soft)]"
                :class="{ 'blur-sm select-none': isCellBlurred(entry.rank) }"
              >
                ({{ entry.context }})
              </span>
              <!-- Note popover -->
              <div v-if="entry.note" class="relative">
                <button
                  class="flex h-5 w-5 items-center justify-center rounded-full text-xs
                         text-[var(--color-text-soft)] hover:bg-[var(--color-bg-mute)] hover:text-primary-500
                         transition-colors"
                  :class="{ 'blur-sm pointer-events-none': isCellBlurred(entry.rank) }"
                  @click.stop="togglePopover(entry.rank)"
                  @mouseenter="activePopover = entry.rank"
                  @mouseleave="closePopover"
                >
                  &#9432;
                </button>
                <div
                  v-if="activePopover === entry.rank"
                  class="absolute bottom-full left-1/2 z-10 mb-1 w-48 -translate-x-1/2 rounded-lg
                         border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-2 text-xs
                         text-[var(--color-text-soft)] shadow-lg"
                  @mouseenter="activePopover = entry.rank"
                  @mouseleave="closePopover"
                >
                  {{ entry.note }}
                </div>
              </div>
              <slot name="badge" :entry="entry" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
