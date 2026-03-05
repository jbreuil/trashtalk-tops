// --- Ranking entry (used in both TOPs and Top 100) ---

export interface RankingEntry {
  rank: number
  name: string
  entityId?: string
  entityType?: 'player' | 'coach' | 'team'
  nbaId?: number
  /** Seconds into the YouTube video — generates a ?t= link */
  timestamp?: number
  /** Disambiguation when the same entity appears multiple times (e.g. "Saison 2012-13") */
  context?: string
  note?: string
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
  rankingAlex: RankingEntry[]
  rankingBastien: RankingEntry[]
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
  rankingAlex: RankingEntry[]
  rankingBastien: RankingEntry[]
}

// --- Entity ---

export interface Entity {
  entityId: string
  name: string
  type: 'player' | 'coach' | 'team'
  nbaId: number
  gamesPlayed?: number
  years?: string
  linkedTo?: string
}

// --- Tags (controlled vocabulary, categorized) ---

export interface Tags {
  position: string[]
  theme: string[]
  scope: string[]
  era: string[]
  [key: string]: string[]
}

// --- Search types ---

export type SearchCategory = 'tops' | 'franchises' | 'joueurs' | 'coaches'

export interface SearchResult {
  category: SearchCategory
  item: Top | Entity
  score: number
}

export interface SearchResultGroup {
  category: SearchCategory
  label: string
  results: SearchResult[]
  total: number
}
