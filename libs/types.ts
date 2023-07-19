export interface Team {
  name: string,
  image: string,
}

export type MatchScore = [number | null, number | null];
export type Matchup = [Team, Team];

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

export interface WinLossRecord {
  win: number,
  loss: number,
}