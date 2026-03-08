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

## Data

All data consumed by the site lives in `content/`. There are no API calls at runtime — everything is bundled at build time.

### Source files

| File | Content | Source | Update |
|---|---|---|---|
| `content/entities/players.json` | ~5 000 NBA players (name, nbaId, games played) | NBA.com public API | Automated script |
| `content/entities/coaches.json` | ~360 NBA coaches (name, games coached, wins, losses) | Basketball-Reference.com | Automated script |
| `content/entities/teams.json` | ~60 NBA teams and historical franchises (name, nbaId, years, franchise links) | NBA.com public API | Automated script |
| `content/entities/gms.json` | General Managers referenced in TOP files | Manual | Manual |

Entity files are the reference for all entity lookups (search, entity pages, ranking links). If an `entityId` used in a TOP JSON does not exist in the entity files, the entity page will 404.

### General Managers (`gms.json`)

This file is maintained by hand. It only needs to contain GMs that are actually referenced in `content/tops/` files (via `"entityType": "gm"` in a ranking entry). If a new TOP references a GM not yet in `gms.json`, add an entry before building:

```json
{
  "entityId": "jerry-krause",
  "name": "Jerry Krause",
  "type": "gm",
  "team": "Chicago Bulls"
}
```

### TOP files (`content/tops/`)

One JSON file per TOP version, named `{slug}-v{version}.json`. Rankings and entities are filled in manually.

### Top 100 (`content/top100/`)

Same structure as standard TOPs but with a `segments` array mapping rank ranges to video IDs. Separate directory because it has a different data model.

### Entity slugs

Entity IDs (`entityId`) are generated from the player's full legal name as returned by the NBA API. Some players have suffixes that differ from their common name:

| Common name | `entityId` |
|---|---|
| Jimmy Butler | `jimmy-butler-iii` |
| Jaren Jackson Jr. | `jaren-jackson-jr` |
| Gary Payton II | `gary-payton-ii` |
| Tim Hardaway Jr. | `tim-hardaway-jr` |

When referencing a player in a TOP JSON file, always use the `entityId` from `content/entities/players.json` — not the common name.

```json
{ "entityId": "jimmy-butler-iii", "entityType": "player", "nbaId": 202710 }
```

The suffixes are meaningful when two players share the same base name (e.g. `gary-payton` vs `gary-payton-ii`), so they cannot be stripped automatically.

## Contributing

Spotted an error or a missing TOP? Contributions are welcome via [issue](https://github.com/jbreuil/trashtalk-tops/issues) or pull request.

### Adding a new TOP

1. Create `content/tops/{slug}-v1.json` following the existing files as a template.
2. Fill in `videoId` (from the YouTube URL) and `publishedAt` (publish date in ISO 8601).
3. Make sure every `entityId` in ranking entries exists in the corresponding entity file (`players.json`, `coaches.json`, `teams.json`, `gms.json`). A missing entity will produce a 404 page.
4. If you need a new tag, add it to `content/tags.json` first.
5. If the TOP references a GM not yet listed, add them to `content/entities/gms.json`.

### Adding a new version of an all-time TOP

1. Create `content/tops/{slug}-vN.json` where `N` is the next version number.
2. The `slug` field must match the previous version(s) exactly — versions are grouped by slug at runtime.

### Updating the Top 100

1. Create `content/top100/top-100-all-time-vN.json` — **not** in `content/tops/` (different data model with a `segments` array).

### Updating coaches data

1. Go to [Basketball-Reference.com — Coach Register](https://www.basketball-reference.com/coaches/NBA_stats.html).
2. Click **"Share & Export"** → **"Get table as CSV"**.
3. Save the CSV file in `scripts/input/coaches/`.
4. Run `npx tsx scripts/convert-coaches.ts`.

### Updating teams data

Only needed when a franchise is added, relocated, or renamed (extremely rare).

```bash
npx tsx scripts/fetch-teams.ts
```

### Updating players data

Once per year, at the end of the NBA season.

```bash
npx tsx scripts/fetch-players.ts
```

This fetches the full player list and career games played from the NBA API (~80 calls, ~2 minutes).

### Summary

| Script | Command | Source | Frequency |
|---|---|---|---|
| Coaches | `npx tsx scripts/convert-coaches.ts` | CSV from Basketball-Reference | Once per year |
| Teams | `npx tsx scripts/fetch-teams.ts` | NBA API (30 calls, ~20s) | New franchise only |
| Players | `npx tsx scripts/fetch-players.ts` | NBA API (81 calls, ~2min) | Once per year |

## Data Sources & Attribution

The data used in this project comes from multiple sources. **None of the underlying data belongs to this project.**

### Rankings

The rankings are manually extracted from videos published by **TrashTalk** (Bastien Fontanieu, Alexandre Martin, Léonce Barbezieux) on their [YouTube channel](https://www.youtube.com/@TrashTalkProduction). All original content and rankings are their intellectual property.

### Player & Team Data

Player and team metadata (names, IDs, games played) comes from the [NBA.com](https://www.nba.com/) public API (`stats.nba.com`).

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
