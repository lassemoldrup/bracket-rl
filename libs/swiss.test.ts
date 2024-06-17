import { SwissFormat } from './formats/swiss';
import _ from 'lodash';
import { Team, MatchScore } from './types';

function namesToMatchups(
  teams: Team[],
  ...names: [string, string][]
): [number, number][] {
  return names.map(
    (m) => m.map((n) => teams.map((t) => t.name).indexOf(n)) as [number, number]
  );
}

function namesToTeams(...names: string[]): Team[] {
  return names.map((name) => ({ name, image: '' }));
}

function worlds2122Wildcard(): SwissFormat {
  const teams = namesToTeams(
    'V1',
    'RNG',
    'DIG',
    'SSG',
    'KC',
    'KCP',
    'TS',
    'SEN',
    'SMPR',
    'OG',
    'CLUB',
    'VEL',
    '01',
    'OP',
    'GLA',
    'BVD'
  );
  const matchups = namesToMatchups(
    teams,
    ['RNG', 'BVD'],
    ['SEN', 'OG'],
    ['SSG', 'CLUB'],
    ['DIG', 'GLA'],
    ['KC', '01'],
    ['V1', 'OP'],
    ['KCP', 'VEL'],
    ['TS', 'SMPR'],
    ['KCP', 'SMPR'],
    ['RNG', 'KC'],
    ['V1', 'SSG'],
    ['DIG', 'OG'],
    ['CLUB', 'BVD'],
    ['01', 'GLA'],
    ['TS', 'OP'],
    ['SEN', 'VEL'],
    ['SMPR', 'SSG'],
    ['OG', 'KC'],
    ['RNG', 'TS'],
    ['DIG', '01'],
    ['KCP', 'CLUB'],
    ['V1', 'VEL'],
    ['OP', 'GLA'],
    ['SEN', 'BVD'],
    ['OG', 'RNG'],
    ['SSG', 'DIG'],
    ['V1', 'CLUB'],
    ['01', 'SEN'],
    ['KCP', 'OP'],
    ['TS', 'VEL'],
    ['OG', 'TS'],
    ['CLUB', '01'],
    ['SSG', 'KCP']
  );
  const matchScores: MatchScore[] = [
    [4, 0],
    [0, 4],
    [4, 2],
    [4, 0],
    [4, 1],
    [4, 0],
    [4, 0],
    [0, 4],
    [0, 4],
    [0, 4],
    [2, 4],
    [0, 4],
    [4, 0],
    [4, 0],
    [4, 0],
    [0, 4],
    [4, 3],
    [0, 4],
    [4, 1],
    [4, 1],
    [2, 4],
    [4, 1],
    [4, 1],
    [4, 1],
    [2, 4],
    [0, 4],
    [4, 2],
    [4, 0],
    [4, 1],
    [4, 0],
    [4, 2],
    [4, 1],
    [4, 1],
  ];
  const winsNeeded = 4;
  return new SwissFormat({ teams, matchups, matchScores, winsNeeded });
}

test('getMatchupsForMatchList correct for second round matchups Worlds Wildcard 21/22', () => {
  const format = worlds2122Wildcard();
  const r2High = format.getMatchupsForMatchList(1, 0);
  const r2Low = format.getMatchupsForMatchList(1, 1);

  for (const matchup of _.zip(
    namesToTeams('KCP', 'RNG', 'V1', 'DIG'),
    namesToTeams('SMPR', 'KC', 'SSG', 'OG')
  ))
    expect(r2High).toContainEqual(matchup);

  for (const matchup of _.zip(
    namesToTeams('CLUB', '01', 'TS', 'SEN'),
    namesToTeams('BVD', 'GLA', 'OP', 'VEL')
  ))
    expect(r2Low).toContainEqual(matchup);
});

test('Swiss produces correct advancing teams for Worlds Wildcard 21/22', () => {
  const format = worlds2122Wildcard();
  const winners = format.winners;

  expect(winners).toBeDefined();
  for (const team of namesToTeams(
    'SMPR',
    'KC',
    'RNG',
    'DIG',
    'V1',
    'OG',
    'CLUB',
    'SSG'
  ))
    expect(winners).toContainEqual(team);
});

test('Swiss does not crash with random wins', () => {
  const getFormat = () =>
    new SwissFormat({
      teams: namesToTeams(
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P'
      ),
      matchups: [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
        [8, 9],
        [10, 11],
        [12, 13],
        [14, 15],
      ],
      matchScores: [
        [null, null],
        [null, null],
        [null, null],
        [null, null],
        [null, null],
        [null, null],
        [null, null],
        [null, null],
      ],
      winsNeeded: 3,
    });

  for (let i = 0; i < 1000; i++) {
    const format = getFormat();
    for (const match of format.matches) {
      const winner = Math.random() < 0.5 ? 0 : 1;
      match.slots[winner].score = 3;
      match.slots[1 - winner].score = Math.floor(Math.random() * 3);
    }
    for (const winner of format.winners) {
      expect(winner).not.toBeNull();
    }
  }
});
