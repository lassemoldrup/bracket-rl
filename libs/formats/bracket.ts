import assert from 'assert';
import {
  TeamMatch,
  TeamSlot,
  PartialMatchup,
  BracketInitializer,
  MaybeTeam,
  Format,
} from '../types';
import _ from 'lodash';

export class Top8SingleElimBracketFormat implements Format {
  quarters: BracketNode[];
  semis: BracketNode[];
  final = new BracketNode(4);

  constructor(init?: BracketInitializer) {
    this.semis = [0, 1].map((i) => new BracketNode(4, this.final.slots[i]));
    this.quarters = [0, 1].flatMap((i) =>
      [0, 1].map((j) => new BracketNode(4, this.semis[i].slots[j]))
    );

    if (init) {
      assert(init.matchups.length <= 8);
      const matches = [...this.quarters, ...this.semis, this.final];
      for (const [match, matchup] of _.zip(matches, init.matchups)) {
        if (!match || !matchup) break;
        match.slots[0].team = matchup[0];
        match.slots[1].team = matchup[1];
      }
      for (const [match, scores] of _.zip(matches, init.matchScores)) {
        if (!match || !scores) break;
        match.slots[0].score = scores[0];
        match.slots[1].score = scores[1];
      }
    }
  }

  clear() {
    const matches = [this.final, ...this.semis, ...this.quarters];
    for (const match of matches)
      for (let i = 0; i < 2; i++) match.slots[i].score = null;
  }

  setTeams(teams: MaybeTeam[]) {
    assert(teams.length <= 8);
    const order = [0, 4, 6, 2, 3, 7, 5, 1];
    for (const [i, team] of _.zip(order, teams)) {
      if (i === undefined) break;
      const maybeTeam = team === undefined ? null : team;
      const quarterIdx = Math.floor(i / 2);
      this.quarters[quarterIdx].slots[i % 2].team = maybeTeam;
    }
  }
}

export class BracketNode implements TeamMatch {
  winsNeeded: number;
  winSlot: BracketSlot | null;
  lossSlot: BracketSlot | null;
  bracketReset: boolean;
  slots: [BracketSlot, BracketSlot] = [
    new BracketSlot(this),
    new BracketSlot(this),
  ];

  constructor(
    winsNeeded: number,
    winSlot: BracketSlot | null = null,
    lossSlot: BracketSlot | null = null,
    matchup: PartialMatchup = [null, null],
    bracketReset: boolean = false
  ) {
    this.winsNeeded = winsNeeded;
    this.winSlot = winSlot;
    this.lossSlot = lossSlot;
    this.slots[0].team = matchup[0];
    this.slots[1].team = matchup[1];
    this.bracketReset = bracketReset;
  }

  get winner(): MaybeTeam {
    if (this.slots[0]?.hasWon()) return this.slots[0].team;
    else if (this.slots[1]?.hasWon()) return this.slots[1].team;
    return null;
  }
}

export class BracketSlot implements TeamSlot {
  match: BracketNode;
  #team: MaybeTeam = null;
  #score: number | null = null;
  #bracketResetScore: number | null = null;

  constructor(node: BracketNode) {
    this.match = node;
  }

  getOther(): BracketSlot {
    if (this.match.slots[0] === this) {
      return this.match.slots[1];
    } else {
      return this.match.slots[0];
    }
  }

  get team(): MaybeTeam {
    return this.#team;
  }

  set team(value: MaybeTeam) {
    this.#team = value;
    if (this.score === this.winsNeeded && this.match.winSlot)
      this.match.winSlot.team = value;
    if (this.getOther().score === this.winsNeeded && this.match.lossSlot)
      this.match.lossSlot.team = value;
  }

  get score(): number | null {
    return this.#score;
  }

  set score(value: number | null) {
    if (value == this.#score) return;

    if (value !== null) {
      value = Math.min(value, this.winsNeeded);
      value = Math.max(value, 0);
    }

    if (this.score === this.winsNeeded && this.match.winSlot) {
      this.match.winSlot.team = null;
      if (this.match.lossSlot) {
        this.match.lossSlot.team = null;
      }
    } else if (this.score === this.winsNeeded) {
      this.#bracketResetScore = null;
      this.getOther().bracketResetScore = null;
    }

    if (value === this.winsNeeded) {
      if (this.getOther().score === value) this.getOther().score = null;
      if (this.match.winSlot) this.match.winSlot.team = this.team;
      if (this.match.lossSlot) this.match.lossSlot.team = this.getOther().team;
      this.#bracketResetScore = null;
      this.getOther().bracketResetScore = null;
    }

    this.#score = value;
  }

  get bracketResetScore(): number | null {
    return this.#bracketResetScore;
  }

  set bracketResetScore(value: number | null) {
    if (value !== null) {
      value = Math.min(value, this.winsNeeded);
      value = Math.max(value, 0);
    }

    if (
      value === this.winsNeeded &&
      this.getOther().bracketResetScore === value
    ) {
      this.getOther().bracketResetScore = null;
    }

    this.#bracketResetScore = value;
  }

  get winsNeeded() {
    return this.match.winsNeeded;
  }

  hasWon(): boolean {
    if (
      this.match.bracketReset &&
      this.match.slots[1].score === this.winsNeeded
    )
      return this.#bracketResetScore === this.winsNeeded;
    return this.#score === this.winsNeeded;
  }
}
