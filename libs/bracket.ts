import { chunk, range, zip } from 'lodash';

export class DoubleElimBracket {
  upperR1: BracketNode[];
  upperQuarters: BracketNode[];
  upperSemis: BracketNode[];
  upperFinal: BracketNode;
  lowerR1: BracketNode[];
  lowerR2: BracketNode[];
  lowerR3: BracketNode[];
  lowerQuarters: BracketNode[];
  lowerSemi: BracketNode;
  lowerFinal: BracketNode;
  grandFinal: BracketNode = new BracketNode(4, null, null, null, true);

  constructor({ matchups, matchScores }: BracketInitializer) {
    this.lowerFinal = new BracketNode(4, this.grandFinal.slots[1]);
    this.lowerSemi = new BracketNode(4, this.lowerFinal.slots[1]);
    this.lowerQuarters = [0, 1].map(i => new BracketNode(4, this.lowerSemi.slots[i]));
    this.lowerR3 = [0, 1].map(i => new BracketNode(3, this.lowerQuarters[i].slots[1]));
    this.lowerR2 = [0, 1].flatMap(i => [0, 1].map(j => new BracketNode(3, this.lowerR3[i].slots[j])));
    this.lowerR1 = range(4).map(i => new BracketNode(3, this.lowerR2[i].slots[1]));
    this.upperFinal = new BracketNode(4, this.grandFinal.slots[0], this.lowerFinal.slots[0]);
    this.upperSemis = [0, 1].map(i =>
      new BracketNode(4, this.upperFinal.slots[i], this.lowerQuarters[i].slots[0])
    );
    this.upperQuarters = range(4).map(i =>
      new BracketNode(3, this.upperSemis[i >> 1].slots[i % 2], this.lowerR2[3 - i].slots[0])
    );
    this.upperR1 = matchups.map((teams, i) =>
      new BracketNode(
        3,
        this.upperQuarters[i >> 1].slots[i % 2],
        this.lowerR1[i >> 1].slots[i % 2],
        teams as Matchup
      )
    );

    const matchOrder = [
      ...this.upperR1,
      ...this.lowerR1,
      ...this.upperQuarters,
      ...this.lowerR2,
      ...this.lowerR3,
      ...this.upperSemis,
      ...this.lowerQuarters,
      this.lowerSemi,
      this.upperFinal,
      this.lowerFinal,
      this.grandFinal,
    ];
    for (const [node, scores] of zip(matchOrder, matchScores)) {
      if (!scores) {
        break;
      }
      // If bracket reset
      if (!node) {
        this.grandFinal.slots[0].bracketResetScore = scores[0];
        this.grandFinal.slots[1].bracketResetScore = scores[1];
      } else {
        node.slots[0].score = scores[0];
        node.slots[1].score = scores[1];
      }
    }
  }
}

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
