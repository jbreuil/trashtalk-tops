<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-soft)] py-8">
    <div class="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--color-text-soft)]">
      <p class="mb-2">
        Site fan-made, non officiel — aucune affiliation avec TrashTalk.
      </p>
      <p class="mb-2">
        Le contenu original et les classements appartiennent à
        <a
          href="https://www.youtube.com/@TrashTalkProduction"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-500 hover:text-primary-600 underline"
        >TrashTalk</a>
        (Bastien Fontanieu, Alexandre Martin, Léonce Barbezieux).
        Ce site référence et organise du contenu YouTube public. Aucune monétisation.
      </p>
      <p class="mb-2">
        Coach data courtesy of
        <a
          href="https://www.basketball-reference.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-500 hover:text-primary-600 underline"
        >Basketball-Reference.com</a>.
      </p>
      <p class="mb-2">
        NBA et les logos des équipes sont des marques déposées de la NBA.
      </p>
      <p class="mb-3">
        &copy; {{ currentYear }} TrashTalk Tops
      </p>
      <p class="text-xs">
        Un TOP manquant, un bug ou une erreur ?
        <a
          href="https://github.com/jbreuil/trashtalk-tops/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-500 hover:text-primary-600 underline"
        >Ouvrir une issue</a>
        ou proposer un
        <a
          href="https://github.com/jbreuil/trashtalk-tops/pulls"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-500 hover:text-primary-600 underline"
        >pull request</a>.
        Pour toute demande de retrait, voir
        <NuxtLink to="/about" class="text-primary-500 hover:text-primary-600 underline">
          À propos
        </NuxtLink>.
      </p>
    </div>
  </footer>
</template>
