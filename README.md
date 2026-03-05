# TrashTalk TOPs

A static fan-made website to browse and explore NBA rankings ("TOPs") from [TrashTalk](https://www.youtube.com/@TrashTalkProduction) YouTube videos.

> **Disclaimer**: This is an unofficial, non-commercial fan project. It is not affiliated with TrashTalk, the NBA, or any team or player mentioned.

[**Live Demo**](https://jbreuil.github.io/trashtalk-tops/)

## Features

- Search across TOPs, players, coaches, and franchises
- Side-by-side comparison of Alex and Bastien rankings
- Version tracking with diff badges (new entries, rank changes)
- Spoiler mode to hide rankings until you click
- Top 100 All-Time dedicated page
- Entity pages with all TOP appearances
- Light / Dark / Auto theme
- Fully static (SSG) — no backend required

## Tech Stack

- [Nuxt 3](https://nuxt.com/) (Static Site Generation)
- [Vue 3](https://vuejs.org/) (Composition API)
- [Tailwind CSS](https://tailwindcss.com/)
- [Fuse.js](https://www.fusejs.io/) (client-side fuzzy search)
- [VueUse](https://vueuse.org/) (composable utilities)
- [Vitest](https://vitest.dev/) (unit testing)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build for production

```bash
pnpm generate
```

The static site is output to `.output/public/`.

### Lint

```bash
pnpm lint      # check
pnpm lint:fix  # autofix
```

### Test

```bash
pnpm test
```

## Data Sources & Attribution

The data used in this project comes from multiple sources. **None of the underlying data belongs to this project.**

### Rankings

The rankings are manually extracted from videos published by **TrashTalk** (Bastien Fontanieu, Alexandre Martin, Léonce Barbezieux) on their [YouTube channel](https://www.youtube.com/@TrashTalkProduction). All original content and rankings are their intellectual property.

### Player & Team Data

Player and team metadata (names, IDs, games played) comes from [NBA.com](https://www.nba.com/) via the [nba_api](https://github.com/swar/nba_api) Python package (public API).

### Coach Data

Coach data courtesy of [Basketball-Reference.com](https://www.basketball-reference.com/) — a service of [Sports Reference LLC](https://www.sports-reference.com/).

### Video Metadata

Video metadata (titles, publish dates, IDs) is retrieved via the [YouTube Data API v3](https://developers.google.com/youtube/v3).

### Trademarks

NBA, team names, player names, and logos are registered trademarks of the National Basketball Association. All images and logos are the property of their respective owners.

## License

This project is licensed under the [MIT License](LICENSE).

**Important**: The MIT license applies only to the source code of this website (HTML, CSS, JavaScript, Vue components, build configuration). It does **not** apply to:

- Rankings and editorial content, which belong to TrashTalk
- Player, team, and coach data sourced from NBA.com and Basketball-Reference.com
- NBA trademarks, logos, and branding

If you are a rights holder and wish to request content removal, please [open an issue](https://github.com/jbreuil/trashtalk-tops/issues).
