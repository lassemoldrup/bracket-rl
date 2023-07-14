interface Team {
  name: string,
  image: string,
}

type MatchScore = [number | null, number | null];
type Matchup = [Team, Team];

interface BracketInitializer {
  matchups: Matchup[],
  matchScores: MatchScore[],
}

interface SwissInitializer {
  // Seeeded order
  teams: Team[],
  // Indices in teams
  matchups: [number, number][],
  matchScores: MatchScore[],
  winsNeeded: number,
}

interface WinLossRecord {
  win: number,
  loss: number,
}
