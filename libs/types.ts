export interface Team {
  name: string,
  image: string,
}

export type MatchScore = [number | null, number | null];
export type Matchup = [Team, Team];

export enum FormatKind {
  DoubleElim,
  Swiss,
};

export interface FormatInitializer {
  kind: FormatKind,
  matchScores: MatchScore[],
}

export interface BracketInitializer extends FormatInitializer {
  kind: FormatKind.DoubleElim,
  matchups: Matchup[],
}

export interface SwissInitializer extends FormatInitializer {
  kind: FormatKind.Swiss;
  // Seeeded order
  teams: Team[],
  // Indices in teams
  matchups: [number, number][],
  winsNeeded: number,
}

export interface WinLossRecord {
  win: number,
  loss: number,
}