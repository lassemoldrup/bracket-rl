import { TeamMatch, Matchup, Team, TeamSlot, PartialMatchup } from '../types';

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

  get winner(): Team | undefined {
    if (this.slots[0]?.hasWon()) return this.slots[0].team ?? undefined;
    else if (this.slots[1]?.hasWon()) return this.slots[1].team ?? undefined;
    return undefined;
  }
}

export class BracketSlot implements TeamSlot {
  match: BracketNode;
  #team: Team | null = null;
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

  get team(): Team | null {
    return this.#team;
  }

  set team(value: Team | null) {
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
