import fs from 'node:fs'
import path from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  app: {
    baseURL: '/trashtalk-tops/',
    head: {
      title: 'TrashTalk TOPs',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Parcourez les classements TrashTalk NBA — site fan-made, non officiel.' },
      ],
      htmlAttrs: { lang: 'fr' },
    },
  },

  typescript: {
    strict: true,
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  hooks: {
    'prerender:routes': function ({ routes }) {
      const topsDir = path.resolve(__dirname, 'content/tops')
      const slugs = new Set<string>()
      for (const file of fs.readdirSync(topsDir)) {
        if (file.endsWith('.json')) {
          const slug = file.replace(/-v\d+\.json$/, '')
          slugs.add(slug)
        }
      }
      for (const slug of slugs) {
        routes.add(`/tops/${slug}`)
      }

      // Scan content/entities/ to generate all entity routes
      for (const entityFile of ['players.json', 'coaches.json', 'gms.json', 'teams.json']) {
        const filePath = path.resolve(__dirname, 'content/entities', entityFile)
        const entities = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        for (const entity of entities) {
          routes.add(`/entity/${entity.entityId}`)
        }
      }
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: [
        '/',
        '/about',
        '/top-100',
      ],
    },
  },

  ssr: true,
})
