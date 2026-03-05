<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { ref } from 'vue'

const emit = defineEmits<{
  search: [query: string]
}>()

const input = ref('')

const debouncedEmit = useDebounceFn((value: string) => {
  emit('search', value)
}, 250)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  input.value = value
  debouncedEmit(value)
}

function clear() {
  input.value = ''
  emit('search', '')
}
</script>

<template>
  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
      <svg class="h-5 w-5 text-[var(--color-text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      :value="input"
      type="text"
      placeholder="Rechercher un TOP, un joueur, une équipe..."
      class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3 pl-12 pr-10
             text-base placeholder:text-[var(--color-text-soft)]
             focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
             transition-colors"
      @input="onInput"
    >
    <button
      v-if="input"
      class="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
      @click="clear"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
