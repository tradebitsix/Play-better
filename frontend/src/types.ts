// UI-focused types (can include mock-only fields)
export interface UIPlayer {
  id: string
  name: string
  avatar?: string
  rank?: string
  winRate?: number
}

// Backend player shape
export interface ApiPlayer {
  id: string
  name: string
  created_at?: string
}

export interface Match {
  id: string
  player1: UIPlayer
  player2: UIPlayer
  score1: number
  score2: number
  status: 'live' | 'scheduled' | 'finished'
  table: number
  tournamentRound?: string
}

export interface Tournament {
  id: string
  name: string
  entryFee: number
  prizePool: number
  startDate: string
  registeredCount: number
  maxPlayers: number
}

// App navigation (AI-studio inspired)
// Navigation states. We keep legacy states for backward compatibility with older components.
export type ViewState =
  | 'lobby'
  | 'tourneys'
  | 'live'
  | 'profile'
  | 'bracket'
  | 'match'
  | 'dashboard'
  | 'tournaments'
  | 'livehall'
  | 'merch'
