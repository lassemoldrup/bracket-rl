interface Team {
  name: string,
  image: string,
}

type MatchScore = [number | null, number | null];

interface FormatInitializer {
  teams: Team[],
  matchScores: MatchScore[],
}
