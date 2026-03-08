// --- Entity reference inside a ranking entry ---

export interface RankingEntityRef {
  entityId: string
  entityType: 'player' | 'coach' | 'team' | 'gm'
  nbaId?: number
}

// --- Ranking entry (used in both TOPs and Top 100) ---

export interface RankingEntry {
  rank: number
  name: string
  entities?: RankingEntityRef[]
  /** Seconds into the YouTube video — generates a ?t= link */
  timestamp?: number
  /** Disambiguation when the same entity appears multiple times (e.g. "Saison 2012-13") */
  context?: string
  note?: string
}

// --- Ranker ranking (one ranker's ordered list) ---

export interface RankerRanking {
  ranker: string
  side: 'left' | 'right'
  entries: RankingEntry[]
}

// --- TOP (one JSON file = one version) ---

export interface Top {
  slug: string
  title: string
  subject: string
  format: number
  temporalType: 'all-time' | 'dated'
  season: string | null
  version: number
  publishedAt: string
  videoId: string
  tags: string[]
  rankings: RankerRanking[]
}

// --- Top 100 ---

export interface Top100Segment {
  ranks: number[]
  videoId: string
}

export interface Top100 {
  slug: string
  version: number
  publishedYear: number
  segments: Top100Segment[]
  rankings: RankerRanking[]
}

// --- Entity ---

export interface Entity {
  entityId: string
  name: string
  type: 'player' | 'coach' | 'team' | 'gm'
  nbaId?: number
  gamesPlayed?: number
  gamesCoached?: number
  wins?: number
  losses?: number
  years?: string
  linkedTo?: string
  team?: string
}

// --- Tags (controlled vocabulary, categorized) ---

export interface Tags {
  position: string[]
  skill: string[]
  theme: string[]
  profile: string[]
  collectif: string[]
  scope: string[]
  era: string[]
  [key: string]: string[]
}

// --- Search types ---

export type SearchCategory = 'tops' | 'franchises' | 'joueurs' | 'coaches'

export interface SearchResultItem {
  category: SearchCategory
  item: Top | Entity
  score: number
}

export interface SearchResultGroup {
  category: SearchCategory
  label: string
  results: SearchResultItem[]
  defaultCount: number
}
