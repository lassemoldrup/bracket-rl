import { Matchup, Team } from '../types';

export class BracketNode {
  winsNeeded: number;
  winSlot: BracketSlot | null;
  lossSlot: BracketSlot | null;
  bracketReset: boolean;
  slots: [BracketSlot, BracketSlot] = [new BracketSlot(this), new BracketSlot(this)];

  constructor(
    winsNeeded: number,
    winSlot: BracketSlot | null = null,
    lossSlot: BracketSlot | null = null,
    teams: Matchup | null = null,
    bracketReset: boolean = false
  ) {
    this.winsNeeded = winsNeeded;
    this.winSlot = winSlot;
    this.lossSlot = lossSlot;
    this.slots[0].team = teams && teams[0];
    this.slots[1].team = teams && teams[1];
    this.bracketReset = bracketReset;
  }
}

export class BracketSlot {
  node: BracketNode;
  #team: Team | null = null;
  #score: number | null = null;
  #bracketResetScore: number | null = null;

  constructor(node: BracketNode) {
    this.node = node;
  }

  getOther(): BracketSlot {
    if (this.node.slots[0] === this) {
      return this.node.slots[1];
    } else {
      return this.node.slots[0];
    }
  }

  get team(): Team | null {
    return this.#team;
  }

  set team(value: Team | null) {
    this.#team = value;
    if (this.score === this.node.winsNeeded && this.node.winSlot)
      this.node.winSlot.team = value;
    if (this.getOther().score === this.node.winsNeeded && this.node.lossSlot)
      this.node.lossSlot.team = value;
  }

  get score(): number | null {
    return this.#score;
  }

  set score(value: number | null) {
    if (value !== null) {
      value = Math.min(value, this.node.winsNeeded);
      value = Math.max(value, 0);
    }

    if (this.score === this.node.winsNeeded && value !== this.node.winsNeeded && this.node.winSlot) {
      this.node.winSlot.team = null;
      this.node.winSlot.score = null;
      if (this.node.lossSlot) {
        this.node.lossSlot.team = null;
        this.node.lossSlot.score = null;
      }
    }

    if (value === this.node.winsNeeded && value != this.#score) {
      if (this.getOther().score === value)
        this.getOther().score = null;
      if (this.node.winSlot)
        this.node.winSlot.team = this.team;
      if (this.node.lossSlot)
        this.node.lossSlot.team = this.getOther().team;
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
      value = Math.min(value, this.node.winsNeeded);
      value = Math.max(value, 0);
    }

    if (value === this.node.winsNeeded && this.getOther().bracketResetScore === value) {
      this.getOther().bracketResetScore = null;
    }

    this.#bracketResetScore = value;
  }

  hasWon(): boolean {
    if (this.node.bracketReset && this.node.slots[1].score === this.node.winsNeeded)
      return this.#bracketResetScore === this.node.winsNeeded;
    return this.#score === this.node.winsNeeded;
  }
}
