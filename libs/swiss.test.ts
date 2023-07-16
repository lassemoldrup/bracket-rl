import { Swiss } from './swiss';
import _ from 'lodash';
import { Team, MatchScore, FormatKind } from './types';

function namesToMatchups(teams: Team[], ...names: [string, string][]): [number, number][] {
  return names.map(m => m.map(n => teams.map(t => t.name).indexOf(n)) as [number, number]);
}

function namesToTeams(...names: string[]): Team[] {
  return names.map(name => ({ name, image: '' }));
}

test('getMatchupsForMatchList correct for second round matchups Worlds Wildcard 21/22', () => {
  const teams = namesToTeams('V1', 'RNG', 'DIG', 'SSG', 'KC', 'KCP', 'TS', 'SEN',
    'SMPR', 'OG', 'CLUB', 'VEL', '01', 'OP', 'GLA', 'BVD');
  const matchups = namesToMatchups(teams, ['V1', 'OP'], ['RNG', 'BVD'], ['DIG', 'GLA'],
    ['SSG', 'CLUB'], ['KC', '01'], ['KCP', 'VEL'], ['TS', 'SMPR'], ['SEN', 'OG']);
  const matchScores: MatchScore[] = [[4, 0], [4, 0], [4, 0], [4, 2], [4, 1], [4, 0], [0, 4], [0, 4]];
  const winsNeeded = 4;
  const swiss = new Swiss({ kind: FormatKind.Swiss, teams, matchups, matchScores, winsNeeded });
  const r2High = swiss.getMatchupsForMatchList(1, 0);
  const r2Low = swiss.getMatchupsForMatchList(1, 1);

  for (const matchup of _.zip(namesToTeams('KCP', 'RNG', 'V1', 'DIG'), namesToTeams('SMPR', 'KC', 'SSG', 'OG')))
    expect(r2High).toContainEqual(matchup);

  for (const matchup of _.zip(namesToTeams('CLUB', '01', 'TS', 'SEN'), namesToTeams('BVD', 'GLA', 'OP', 'VEL')))
    expect(r2Low).toContainEqual(matchup);
});