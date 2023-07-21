import assert from "assert";
import _ from "lodash";
import { Team, SwissInitializer, Matchup, WinLossRecord, TeamSlot, TeamMatch } from "../types";

export class SwissFormat {
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
    this.rounds = layout.map((r, i) => r.map(n => new SwissMatchList(this, n, i, winsNeeded)));
    const firstRoundMatchups = matchups.slice(0, 8).map(m => [teams[m[0]], teams[m[1]]] as Matchup);
    this.rounds[0][0].setMatchups(firstRoundMatchups);

    const matches = this.matches;
    for (const [matchup, scores] of _.zip(matchups, matchScores)) {
      if (!matchup || !scores)
        break;
      const actualMatchup = [teams[matchup[0]], teams[matchup[1]]];
      const match = matches.find(m => _.isEqual(m.slots.map(s => s.team), actualMatchup));
      if (!match)
        throw new Error(
          `Matchup ${actualMatchup[0].name} vs ${actualMatchup[1].name} not in generated matches`
        );
      for (let i = 0; i < 2; i++)
        match.slots[i].score = scores[i];
    }
  }

  get matches(): SwissMatch[] {
    return this.rounds.flatMap(r => r.flatMap(mL => mL.matches));
  }

  get winners(): Team[] | undefined {
    if (!this.isDone())
      return undefined;
    let winners: Team[] = [];
    for (let i = 2; i < 5; i++)
      winners = winners.concat(this.rounds[i][0].winners as Team[]);
    return winners;
  }

  isDone(round: number = 4): boolean {
    return this.rounds[round].every(mL => mL.isDone());
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
        for (let i = 0; i < nextRound.length; i++)
          nextRound[i].clearTeams();
      this.propagate(round + 1);
    }
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
  format: SwissFormat;
  matches: SwissMatch[];
  round: number

  constructor(format: SwissFormat, numMatches: number, round: number, winsNeeded: number) {
    this.format = format;
    this.matches = _.range(numMatches).map(_ => new SwissMatch(this, winsNeeded));
    this.round = round;
  }

  get winners(): Team[] | undefined {
    return this.isDone() ? this.matches.map(m => m.winner) as Team[] : undefined;
  }

  setMatchups(matchups: Matchup[]) {
    assert(matchups.length === this.matches.length);

    for (const [pair, matchup] of _.zip(matchups, this.matches))
      for (let i = 0; i < 2; i++)
        (matchup as SwissMatch).slots[i].team = (pair as Team[])[i];
  }

  clearTeams() {
    for (const match of this.matches)
      for (let i = 0; i < 2; i++)
        match.slots[i].team = null;
  }

  isDone(): boolean {
    return this.matches.every(m => m.winner && m.slots[0].score !== null && m.slots[1].score !== null);
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
    this.slots = [new SwissSlot(this, winsNeeded), new SwissSlot(this, winsNeeded)];
  }

  get winner(): Team | undefined {
    for (let i = 0; i < 2; i++)
      if (this.slots[i].hasWon())
        return this.slots[i].team || undefined;
    return undefined;
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
    if (value && value > this.winsNeeded)
      value = this.winsNeeded;
    if (this.#score === value)
      return;

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