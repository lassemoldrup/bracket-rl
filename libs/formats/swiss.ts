import assert from 'assert';
import _ from 'lodash';
import {
  Team,
  SwissInitializer,
  Matchup,
  WinLossRecord,
  TeamSlot,
  TeamMatch,
  MaybeTeam,
  Format,
  MatchScore,
} from '../types';

export class SwissFormat implements Format {
  initialSeeding: Team[];
  rounds: SwissMatchList[][];

  // teams is the list of teams sorted by seeding.
  // matchups is the list of all matchups that have happened, given as indices in the teams array
  // not necessarily in any order. This design is due to the lack of structured data available.
  // matchScores is the scores of the matchups given in that same order.
  // winsNeeded is how many wins each team needs to win a match, e.g. 3 for BO5.
  constructor({ teams, matchups, matchScores, winsNeeded }: SwissInitializer) {
    this.initialSeeding = teams;
    const layout = [[8], [4, 4], [2, 4, 2], [3, 3], [3]];
    this.rounds = layout.map((r, i) =>
      r.map((n, j) => new SwissMatchList(this, n, i, j, winsNeeded))
    );
    const firstRoundMatchups = matchups
      .slice(0, 8)
      .map((m) => [teams[m[0]], teams[m[1]]] as Matchup);
    this.rounds[0][0].setMatchups(firstRoundMatchups);

    const matches = this.matches;
    for (let [matchup, scores] of _.zip(matchups, matchScores)) {
      if (!matchup || !scores) break;
      const actualMatchup = [teams[matchup[0]], teams[matchup[1]]];
      let match = matches.find((m) =>
        _.isEqual(
          m.slots.map((s) => s.team),
          actualMatchup
        )
      );
      if (!match) {
        // Try the reverse matchup
        const actualMatchup = [teams[matchup[1]], teams[matchup[0]]];
        match = matches.find((m) =>
          _.isEqual(
            m.slots.map((s) => s.team),
            actualMatchup
          )
        );
        if (!match) {
          throw new Error(
            `Matchup ${actualMatchup[0]?.name} vs ${actualMatchup[1]?.name} not in generated matches`
          );
        }
        scores = scores.reverse() as MatchScore;
      }
      for (let i = 0; i < 2; i++) match.slots[i].score = scores[i];
    }
  }

  get matches(): SwissMatch[] {
    return this.rounds.flatMap((r) => r.flatMap((mL) => mL.matches));
  }

  get winners(): MaybeTeam[] {
    let winners: MaybeTeam[] = [];
    for (let i = 2; i < 5; i++)
      winners = winners.concat(this.rounds[i][0].winners);
    return winners;
  }

  clear() {
    for (const mL of this.rounds.flat())
      for (const match of mL.matches) {
        match.slots[0].score = null;
        match.slots[1].score = null;
      }
  }

  setTeams(_teams: MaybeTeam[]) {
    throw new Error('Not implemented');
  }

  isDone(round: number = 4): boolean {
    return this.rounds[round].every((mL) => mL.isDone());
  }

  propagate(round: number) {
    if (round !== 4) {
      const nextRound = this.rounds[round + 1];
      if (this.isDone(round)) {
        for (let i = 0; i < nextRound.length; i++) {
          const matchups = this.getMatchupsForMatchList(round + 1, i);
          nextRound[i].setMatchups(matchups);
        }
      } else
        for (let i = 0; i < nextRound.length; i++) nextRound[i].clearTeams();
      this.propagate(round + 1);
    }
  }

  getGameDiffs(round?: number): { [teamName: string]: number } {
    if (!round) round = 4;
    const gameDiff = _.fromPairs(this.initialSeeding.map((t) => [t.name, 0]));
    for (let i = 0; i <= round; i++) {
      for (const list of this.rounds[i]) {
        for (const matchup of list.matches) {
          for (const slot of matchup.slots.filter((s) => s.team)) {
            const name = (slot.team as Team).name;
            gameDiff[name] += (slot.score || 0) - (slot.getOther().score || 0);
          }
        }
      }
    }
    return gameDiff;
  }

  // TODO: refactor
  getMatchupsForMatchList(round: number, list: number): Matchup[] {
    const teams = this.initialSeeding;

    // Calculate the win/loss record and game difference up until this round
    const winLoss = _.fromPairs(
      teams.map((t) => [t.name, { win: 0, loss: 0 }])
    );
    const gameDiff = _.fromPairs(teams.map((t) => [t.name, 0]));
    for (let i = 0; i < round; i++) {
      for (const list of this.rounds[i]) {
        for (const matchup of list.matches) {
          for (const slot of matchup.slots.filter((s) => s.team)) {
            const name = (slot.team as Team).name;
            if (slot.hasWon()) winLoss[name].win++;
            else winLoss[name].loss++;
            gameDiff[name] += (slot.score || 0) - (slot.getOther().score || 0);
          }
        }
      }
    }

    const record = getRecordForMatchList(round, list);
    let matchListTeams = teams.filter((t) =>
      _.isEqual(winLoss[t.name], record)
    );

    // The least significant seeding rule is sorting by initial seed
    matchListTeams = _.sortBy(matchListTeams, (t) =>
      this.initialSeeding.indexOf(t)
    );

    // The second most significant seeding rule is game difference
    matchListTeams = _.sortBy(matchListTeams, (t) => -gameDiff[t.name]);

    // Construct the matchups
    const previvousMatches = _.flattenDeep(
      this.rounds.slice(0, round).map((r) => r.map((mL) => mL.matches))
    ).filter((m) => m.slots[0].team && m.slots[1].team);
    const previvousMatchups = _.mapValues(
      _.groupBy(previvousMatches, (m) => (m.slots[0].team as Team).name),
      (mL) => mL.map((m) => m.slots[1].team as Team)
    );

    const played = (t1: Team, t2: Team) =>
      previvousMatchups[t1.name]?.includes(t2) ||
      previvousMatchups[t2.name]?.includes(t1);

    // Most significant is if we came from the upper or lower round: if we lost, we have higher seed
    if (round >= 3 || (round == 2 && list == 1)) {
      const prevRoundSlots = this.rounds[round - 1].flatMap((mL) =>
        mL.matches.flatMap((m) => m.slots)
      );
      // The losers in the previous round are the upper teams
      matchListTeams = _.sortBy(matchListTeams, (t) =>
        prevRoundSlots.find((s) => s.team === t)!.hasWon()
      );

      // Below is wrong, since the best team from lower can be treated as an upper team
      // const upperTeams = matchListTeams.filter((t) =>
      //   prevRoundSlots.find((s) => s.team === t && !s.hasWon())
      // );
      // const lowerTeams = matchListTeams.filter((t) =>
      //   prevRoundSlots.find((s) => s.team === t && s.hasWon())
      // );
      const upperTeams = matchListTeams.slice(0, matchListTeams.length / 2);
      const lowerTeams = matchListTeams.slice(matchListTeams.length / 2);
      let matchups: Matchup[] = [];

      const findMatchups = (allowedRematches: number) => {
        if (upperTeams.length === 0) {
          if (lowerTeams.length === 0) return true;
          const [low1, low2] = lowerTeams.splice(0, 2);
          if (!played(low1, low2)) {
            matchups.push([low1, low2]);
            return true;
          }
        } else if (lowerTeams.length === 0) {
          const [up1, up2] = upperTeams.splice(0, 2);
          if (!played(up1, up2)) {
            matchups.push([up1, up2]);
            return true;
          }
        }

        let success = false;
        for (let i = 0; i < upperTeams.length; i++) {
          const [up] = upperTeams.splice(i, 1);
          for (let j = lowerTeams.length - 1; j >= 0; j--) {
            const [low] = lowerTeams.splice(j, 1);
            if (
              played(up, low) &&
              allowedRematches > 0 &&
              findMatchups(allowedRematches - 1)
            ) {
              matchups.push([up, low]);
              success = true;
            } else if (!played(up, low) && findMatchups(allowedRematches)) {
              matchups.push([up, low]);
              success = true;
            }
            lowerTeams.splice(j, 0, low);
            if (success) break;
          }
          upperTeams.splice(i, 0, up);
          if (success) break;
        }
        return success;
      };

      for (let i = 0; i <= matchListTeams.length; i++) {
        if (findMatchups(i)) return matchups;
      }
      assert(false, 'We should eventually find a matching');
    }

    // No rematches are possible in these rounds
    const matchups: Matchup[] = [];
    for (let i = 0; i < matchListTeams.length / 2; i++) {
      matchups.push([
        matchListTeams[i],
        matchListTeams[matchListTeams.length - i - 1],
      ]);
    }
    return matchups;
  }
}

export class SwissMatchList {
  format: SwissFormat;
  matches: SwissMatch[];
  round: number;
  list: number;

  constructor(
    format: SwissFormat,
    numMatches: number,
    round: number,
    list: number,
    winsNeeded: number
  ) {
    this.format = format;
    this.matches = _.range(numMatches).map(
      (_) => new SwissMatch(this, winsNeeded)
    );
    this.round = round;
    this.list = list;
  }

  get winners(): MaybeTeam[] {
    const gameDiff = this.format.getGameDiffs(this.round);
    let res = this.matches.map((m) => m.winner);
    res = _.sortBy(res, (t) =>
      t ? this.format.initialSeeding.indexOf(t) : 1000000
    );
    res = _.sortBy(res, (t) => (t ? -gameDiff[t.name] : 1000000));
    return res;
  }

  get isQualification(): boolean {
    return [2, 3, 4].includes(this.round) && this.list === 0;
  }

  setMatchups(matchups: Matchup[]) {
    assert(matchups.length === this.matches.length);

    for (const [pair, matchup] of _.zip(matchups, this.matches))
      for (let i = 0; i < 2; i++)
        (matchup as SwissMatch).slots[i].team = (pair as Team[])[i];
  }

  clearTeams() {
    for (const match of this.matches)
      for (let i = 0; i < 2; i++) match.slots[i].team = null;
  }

  isDone(): boolean {
    return this.matches.every(
      (m) => m.winner && m.slots[0].score !== null && m.slots[1].score !== null
    );
  }

  propagate() {
    this.format.propagate(this.round);
  }
}

export class SwissMatch implements TeamMatch {
  matchList: SwissMatchList;
  slots: [SwissSlot, SwissSlot];

  constructor(matchList: SwissMatchList, winsNeeded: number) {
    this.matchList = matchList;
    this.slots = [
      new SwissSlot(this, winsNeeded),
      new SwissSlot(this, winsNeeded),
    ];
  }

  get winner(): MaybeTeam {
    for (let i = 0; i < 2; i++)
      if (this.slots[i].hasWon()) return this.slots[i].team;
    return null;
  }

  get isQualification(): boolean {
    return this.matchList.isQualification;
  }

  propagate() {
    this.matchList.propagate();
  }
}

export class SwissSlot implements TeamSlot {
  match: SwissMatch;
  winsNeeded: number;
  team: Team | null = null;
  #score: number | null = null;

  constructor(match: SwissMatch, winsNeeded: number) {
    this.match = match;
    this.winsNeeded = winsNeeded;
  }

  get score(): number | null {
    return this.#score;
  }

  set score(value: number | null) {
    if (value && value > this.winsNeeded) value = this.winsNeeded;
    if (this.#score === value) return;

    if (value === this.winsNeeded && this.getOther().hasWon())
      this.getOther().#score = 0;
    this.#score = value;

    this.match.propagate();
  }

  getOther(): SwissSlot {
    if (this.match.slots[0] === this) {
      return this.match.slots[1];
    } else {
      return this.match.slots[0];
    }
  }

  hasWon(): boolean {
    return this.score === this.winsNeeded;
  }
}

function getRecordForMatchList(round: number, list: number): WinLossRecord {
  if (round === 0 && list === 0) return { win: 0, loss: 0 };
  else if (round === 1 && list === 0) return { win: 1, loss: 0 };
  else if (round === 1 && list === 1) return { win: 0, loss: 1 };
  else if (round === 2 && list === 0) return { win: 2, loss: 0 };
  else if (round === 2 && list === 1) return { win: 1, loss: 1 };
  else if (round === 2 && list === 2) return { win: 0, loss: 2 };
  else if (round === 3 && list === 0) return { win: 2, loss: 1 };
  else if (round === 3 && list === 1) return { win: 1, loss: 2 };
  else return { win: 2, loss: 2 };
}
