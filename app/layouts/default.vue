<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

// Initialize theme on layout mount
useTheme()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NuxtLink
          to="/"
          class="text-xl font-bold text-primary-500 hover:text-primary-600 transition-colors"
        >
          TrashTalk Tops
        </NuxtLink>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/top-100"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
                   hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            Top 100
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
                   hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            À propos
          </NuxtLink>
          <div class="mx-1 h-5 w-px bg-[var(--color-border)]" />
          <SpoilerToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
