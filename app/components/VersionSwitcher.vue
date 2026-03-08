<script setup lang="ts">
interface VersionItem {
  version: number
  publishedAt?: string
  publishedYear?: number
}

defineProps<{
  versions: VersionItem[]
  currentVersion: number
}>()

const emit = defineEmits<{
  change: [version: number]
}>()

function versionLabel(v: VersionItem): string {
  if (v.publishedAt)
    return v.publishedAt
  if (v.publishedYear)
    return String(v.publishedYear)
  return ''
}
</script>

<template>
  <div v-if="versions.length > 1" class="flex items-center gap-2">
    <span class="text-sm text-[var(--color-text-soft)]">Version :</span>
    <div class="flex gap-1">
      <button
        v-for="v in versions"
        :key="v.version"
        class="rounded-lg px-3 py-1 text-sm font-medium transition-colors"
        :class="v.version === currentVersion
          ? 'bg-primary-500 text-white'
          : 'bg-[var(--color-bg-mute)] hover:bg-surface-200 dark:hover:bg-surface-700'"
        @click="emit('change', v.version)"
      >
        V{{ v.version }}
        <span v-if="versionLabel(v)" class="ml-1 text-xs opacity-75">{{ versionLabel(v) }}</span>
      </button>
    </div>
  </div>
</template>
