export interface Team {
  name: string,
  image: string,
}

export type MatchScore = [number | null, number | null];
export type Matchup = [Team, Team];
export type PartialMatchup = [Team | null, Team | null];

export interface BracketInitializer {
  matchups: Matchup[],
  matchScores: MatchScore[],
}

export interface SwissInitializer {
  // Seeeded order
  teams: Team[],
  // Indices in teams
  matchups: [number, number][],
  winsNeeded: number,
  matchScores: MatchScore[],
}

export interface WorldsInitializer {
  matchups: PartialMatchup[],
  matchScores: MatchScore[],
}

export interface WinLossRecord {
  win: number,
  loss: number,
}

// TODO: come up with a better name
export interface TeamMatch {
  slots: [TeamSlot, TeamSlot],
  bracketReset?: boolean,
}

export interface TeamSlot {
  match: TeamMatch,
  winsNeeded: number,
  team: Team | null,
  score: number | null,
  bracketResetScore?: number | null,
  hasWon(): boolean,
}