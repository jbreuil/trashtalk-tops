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

  nitro: {
    prerender: {
      routes: [
        '/',
        '/about',
        '/top-100',
        '/tops/top-10-joueurs-saison-2024',
        '/tops/meilleurs-meneurs-all-time',
        '/tops/top-5-rookies-saison-2025',
        '/entity/lebron-james',
        '/entity/stephen-curry',
        '/entity/kevin-durant',
        '/entity/giannis-antetokounmpo',
        '/entity/nikola-jokic',
        '/entity/luka-doncic',
        '/entity/jayson-tatum',
        '/entity/shai-gilgeous-alexander',
        '/entity/joel-embiid',
        '/entity/anthony-edwards',
        '/entity/victor-wembanyama',
        '/entity/anthony-davis',
        '/entity/jimmy-butler',
        '/entity/devin-booker',
        '/entity/donovan-mitchell',
        '/entity/gregg-popovich',
        '/entity/erik-spoelstra',
        '/entity/joe-mazzulla',
        '/entity/los-angeles-lakers',
        '/entity/golden-state-warriors',
        '/entity/boston-celtics',
        '/entity/phoenix-suns',
        '/entity/milwaukee-bucks',
        '/entity/denver-nuggets',
        '/entity/oklahoma-city-thunder',
        '/entity/philadelphia-76ers',
        '/entity/minnesota-timberwolves',
        '/entity/san-antonio-spurs',
        '/entity/miami-heat',
        '/entity/cleveland-cavaliers',
        '/entity/seattle-supersonics',
      ],
    },
  },

  ssr: true,
})
