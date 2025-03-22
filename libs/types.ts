export interface Team {
  name: string;
  image: string;
}

export type MatchScore = [number | null, number | null];
export type Matchup = [Team, Team];
export type MaybeTeam = Team | null;
export type PartialMatchup = [MaybeTeam, MaybeTeam];

export interface BracketInitializer {
  matchups: PartialMatchup[];
  matchScores: MatchScore[];
}

export interface SwissInitializer {
  // Seeeded order
  teams: Team[];
  // Indices in teams
  matchups: [number, number][];
  winsNeeded: number;
  matchScores: MatchScore[];
  useBuchholz: boolean;
}

export interface WorldsInitializer {
  matchups: PartialMatchup[];
  matchScores: MatchScore[];
}

export interface AFLInitializer {
  teams: MaybeTeam[];
  matchScores: MatchScore[];
}

export interface Format {
  clear(): void;
  setTeams(teams: MaybeTeam[]): void;
}

export interface WinLossRecord {
  win: number;
  loss: number;
}

// TODO: come up with a better name
export interface TeamMatch {
  slots: [TeamSlot, TeamSlot];
  bracketReset?: boolean;
}

export interface TeamSlot {
  match: TeamMatch;
  winsNeeded: number;
  team: Team | null;
  score: number | null;
  bracketResetScore?: number | null;
  hasWon(): boolean;
}
