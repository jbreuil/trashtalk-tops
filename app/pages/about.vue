<script setup lang="ts">
useHead({
  title: 'À propos — TrashTalk Tops',
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-8">
    <button class="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-soft)] hover:text-primary-500 transition-colors" @click="$router.back()">
      &larr; Retour
    </button>

    <h1 class="mb-6 text-3xl font-bold">
      À propos
    </h1>

    <div class="space-y-6 text-[var(--color-text-soft)] leading-relaxed">
      <section>
        <h2 class="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Qu'est-ce que TrashTalk Tops ?
        </h2>
        <p>
          Ce site est un projet fan non officiel qui regroupe les classements (TOPs)
          présentés dans les vidéos de la chaîne YouTube
          <a
            href="https://www.youtube.com/@TrashTalkProduction"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 underline"
          >TrashTalk</a>.
          Il permet de rechercher, comparer et explorer les classements d'Alex et Bastien
          sur les joueurs, équipes et coaches NBA.
        </p>
        <p class="mt-2">
          Le contenu original et les classements appartiennent à
          <strong class="text-[var(--color-text)]">TrashTalk</strong>
          (Bastien Fontanieu, Alexandre Martin, Léonce Barbezieux).
          Ce site référence et organise du contenu YouTube public.
          Aucune monétisation.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Sources des données
        </h2>
        <ul class="ml-4 list-disc space-y-2">
          <li>
            <strong class="text-[var(--color-text)]">Données joueurs et équipes :</strong>
            NBA.com via
            <a
              href="https://github.com/swar/nba_api"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-500 hover:text-primary-600 underline"
            >nba_api</a>
            (API publique).
          </li>
          <li>
            <strong class="text-[var(--color-text)]">Données coaches :</strong>
            <a
              href="https://www.basketball-reference.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-500 hover:text-primary-600 underline"
            >Basketball-Reference.com</a>
            — courtesy of Sports Reference LLC.
          </li>
          <li>
            <strong class="text-[var(--color-text)]">Métadonnées vidéos :</strong>
            YouTube Data API v3.
          </li>
        </ul>
        <p class="mt-2">
          Les classements sont extraits manuellement des vidéos publiées par TrashTalk.
          Ce site n'est pas affilié à TrashTalk, à la NBA, ni à aucune équipe ou joueur mentionné.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Fonctionnalités
        </h2>
        <ul class="ml-4 list-disc space-y-1">
          <li>Recherche par nom de TOP, joueur, coach ou équipe</li>
          <li>Mode spoiler pour masquer les classements</li>
          <li>Comparaison des classements Alex vs Bastien</li>
          <li>Suivi des évolutions entre versions d'un même TOP</li>
          <li>Thème clair, sombre ou automatique</li>
        </ul>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Mentions légales
        </h2>
        <p>
          NBA, les noms des équipes et des joueurs sont des marques déposées de la
          National Basketball Association. Les images et logos sont la propriété de
          leurs détenteurs respectifs. Ce site est un projet personnel à but non
          commercial.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-semibold text-[var(--color-text)]">
          Contact
        </h2>
        <p>
          Pour toute demande de retrait ou question, ouvrez une issue sur le
          <a
            href="https://github.com/jbreuil/trashtalk-tops"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 underline"
          >dépôt GitHub</a>
          du projet.
        </p>
        <p class="mt-2">
          Si vous repérez un bug ou une erreur dans les données (classement, joueur, etc.),
          n'hésitez pas à ouvrir une
          <a
            href="https://github.com/jbreuil/trashtalk-tops/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 underline"
          >issue GitHub</a>.
        </p>
      </section>
    </div>
  </div>
</template>
