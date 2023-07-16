import assert from "assert";
import _ from "lodash";
import { Team, SwissInitializer, Matchup, WinLossRecord } from "./types";

export class Swiss {
  initialSeeding: Team[];
  winsNeeded: number;
  rounds: SwissMatchList[][] = [
    [new SwissMatchList(8)],
    [new SwissMatchList(4), new SwissMatchList(4)],
    [new SwissMatchList(2), new SwissMatchList(4), new SwissMatchList(2)],
    [new SwissMatchList(3), new SwissMatchList(3)],
    [new SwissMatchList(3)],
  ];

  constructor({ teams, matchups, matchScores, winsNeeded }: SwissInitializer) {
    this.initialSeeding = teams;
    this.rounds[0][0].setTeams(matchups.map(m => m.map(i => teams[i]) as Matchup));
    this.winsNeeded = winsNeeded;

    for (const [match, scores] of _.zip(this.matches, matchScores)) {
      if (!match || !scores)
        break;
      for (let i = 0; i < 2; i++)
        match.slots[i].score = scores[i];
    }
  }

  get matches(): SwissMatch[] {
    return this.rounds.flatMap(r => r.flatMap(mL => mL.matches));
  }

  getMatchupsForMatchList(round: number, list: number): Matchup[] {
    const teams = this.rounds[0][0].matches.flatMap(m => m.slots.map(s => s.team)) as Team[];

    // Calculate the win/loss record and game difference up until this round
    const winLoss = _.fromPairs(teams.map(t => [t.name, { win: 0, loss: 0 }]));
    const gameDiff = _.fromPairs(teams.map(t => [t.name, 0]));
    for (let i = 0; i < round; i++) {
      for (const list of this.rounds[i]) {
        for (const matchup of list.matches) {
          for (const slot of matchup.slots.filter(s => s.team)) {
            const name = (slot.team as Team).name;
            if (slot.hasWon())
              winLoss[name].win++;
            else
              winLoss[name].loss++;
            gameDiff[name] += (slot.score || 0) - (slot.getOther().score || 0);
          }
        }
      }
    }

    const record = getRecordForMatchList(round, list);
    let matchListTeams = teams.filter(t => _.isEqual(winLoss[t.name], record));

    // The least significant seeding rule is sorting by initial seed
    matchListTeams = _.sortBy(matchListTeams, t => this.initialSeeding.indexOf(t));

    // The second most significant seeding rule is game difference
    matchListTeams = _.sortBy(matchListTeams, t => -gameDiff[t.name]);

    // Most significant is if we came from the upper or lower round: if we lost, we have higher seed
    if (round >= 3 || (round == 2 && list == 1)) {
      const prevRoundSlots = this.rounds[round - 1]
        .flatMap(mL => mL.matches.flatMap(m => m.slots));
      matchListTeams = _.sortBy(matchListTeams, t =>
        (prevRoundSlots.find(s => s.team === t) as SwissSlot).hasWon()
      );
    }

    // Construct the matchups
    const matchups = [];
    const previvousMatches = _.flattenDeep(this.rounds.slice(0, round).map(r => r.map(mL => mL.matches)))
      .filter(m => m.slots[0].team && m.slots[1].team);
    const previvousMatchups = _.mapValues(
      _.groupBy(previvousMatches, m => (m.slots[0].team as Team).name),
      mL => mL.map(m => m.slots[1].team as Team),
    );

    // Mark teams as undefined as they are chosen
    const sortedTeams = matchListTeams as (Team | undefined)[];
    for (let i = 0; i < matchListTeams.length; i++) {
      const team = matchListTeams[i];
      if (!team)
        continue;

      // Find opponent: try to avoid previvous matchups
      let j: number
      let opponent: Team | undefined;
      for (j = matchListTeams.length - 1; j >= 0; j--) {
        opponent = matchListTeams[j];
        if (
          !opponent
          || opponent === team
          || previvousMatchups[team.name]?.includes(opponent)
          || previvousMatchups[opponent.name]?.includes(team)
        ) {
          opponent = undefined;
          continue;
        }
        break;
      }

      // We did not find opponent that we hadn't played, just pick first option
      if (!opponent) {
        for (j = matchListTeams.length - 1; j >= 0; j--) {
          opponent = matchListTeams[j];
          if (!opponent || opponent === team)
            continue;
          break;
        }
      }

      matchups.push([team, opponent as Team]);
      sortedTeams[i] = undefined;
      sortedTeams[j] = undefined;
    }

    return matchups as Matchup[];
  }
}

export class SwissMatchList {
  matches: SwissMatch[];

  constructor(numMatches: number) {
    this.matches = _.range(numMatches).map(_ => new SwissMatch(this));
  }

  setTeams(teams: Matchup[]) {
    assert(teams.length === this.matches.length);

    for (const [pair, matchup] of _.zip(teams, this.matches))
      for (let i = 0; i < 2; i++)
        (matchup as SwissMatch).slots[i].team = (pair as Team[])[i];
  }
}

export class SwissMatch {
  matchList: SwissMatchList;
  winsNeeded: number = 4;
  slots: [SwissSlot, SwissSlot] = [new SwissSlot(this), new SwissSlot(this)];

  constructor(matchList: SwissMatchList) {
    this.matchList = matchList;
  }
}

export class SwissSlot {
  match: SwissMatch;
  team: Team | null = null;
  score: number | null = null;

  constructor(match: SwissMatch) {
    this.match = match;
  }

  getOther(): SwissSlot {
    if (this.match.slots[0] === this) {
      return this.match.slots[1];
    } else {
      return this.match.slots[0];
    }
  }

  hasWon(): boolean {
    return this.score === this.match.winsNeeded;
  }
}

function getRecordForMatchList(round: number, list: number): WinLossRecord {
  if (round === 0 && list === 0)
    return { win: 0, loss: 0 };
  else if (round === 1 && list === 0)
    return { win: 1, loss: 0 };
  else if (round === 1 && list === 1)
    return { win: 0, loss: 1 };
  else if (round === 2 && list === 0)
    return { win: 2, loss: 0 };
  else if (round === 2 && list === 1)
    return { win: 1, loss: 1 };
  else if (round === 2 && list === 2)
    return { win: 0, loss: 2 };
  else if (round === 3 && list === 0)
    return { win: 2, loss: 1 };
  else if (round === 3 && list === 1)
    return { win: 1, loss: 2 };
  else
    return { win: 2, loss: 2 };
}