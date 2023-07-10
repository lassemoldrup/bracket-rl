import { chunk, range, zip } from 'lodash';

export class DoubleElimBracket {
  upperR1;
  upperQuarters;
  upperSemis;
  upperFinal;
  lowerR1;
  lowerR2;
  lowerR3;
  lowerQuarters;
  lowerSemi;
  lowerFinal;
  grandFinal = new BracketNode(4, null, null, null, true);

  constructor(upperR1Teams, matches) {
    this.lowerFinal = new BracketNode(4, this.grandFinal.slots[1]);
    this.lowerSemi = new BracketNode(4, this.lowerFinal.slots[1]);
    this.lowerQuarters = [0, 1].map(i => new BracketNode(4, this.lowerSemi.slots[i]));
    this.lowerR3 = [0, 1].map(i => new BracketNode(3, this.lowerQuarters[i].slots[1]));
    this.lowerR2 = [0, 1].flatMap(i => [0, 1].map(j => new BracketNode(3, this.lowerR3[i].slots[j])));
    this.lowerR1 = range(4).map(i => new BracketNode(3, this.lowerR2[i].slots[1]));
    this.upperFinal = new BracketNode(4, this.grandFinal.slots[0], this.lowerFinal.slots[0]);
    this.upperSemis = [0, 1].map(i => new BracketNode(4, this.upperFinal.slots[i], this.lowerQuarters[i].slots[0]));
    this.upperQuarters = range(4).map(i =>
      new BracketNode(3, this.upperSemis[i >> 1].slots[i % 2], this.lowerR2[3 - i].slots[0])
    );
    this.upperR1 = chunk(upperR1Teams, 2).map((teams, i) =>
      new BracketNode(3, this.upperQuarters[i >> 1].slots[i % 2], this.lowerR1[i >> 1].slots[i % 2], teams)
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
    for (const [node, scores] of zip(matchOrder, matches)) {
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
  winSlot;
  lossSlot;
  winsNeeded;
  bracketReset;
  slots = [new TeamSlot(this), new TeamSlot(this)];

  constructor(winsNeeded, winSlot = null, lossSlot = null, teams = null, bracketReset = false) {
    this.winsNeeded = winsNeeded;
    this.winSlot = winSlot;
    this.lossSlot = lossSlot;
    this.slots[0].team = teams && teams[0];
    this.slots[1].team = teams && teams[1];
    this.bracketReset = bracketReset;
  }

  getOther(slot) {
    if (this.slots[0] === slot) {
      return this.slots[1];
    } else {
      return this.slots[0];
    }
  }
}

export class TeamSlot {
  node;
  #team = null;
  #score = null;
  #bracketResetScore = null;

  constructor(node) {
    this.node = node;
  }

  get team() {
    return this.#team;
  }

  set team(value) {
    this.#team = value;
    if (this.score === this.node.winsNeeded && this.node.winSlot)
      this.node.winSlot.team = value;
    if (this.node.getOther(this).score === this.node.winsNeeded && this.node.lossSlot)
      this.node.lossSlot.team = value;
  }

  get score() {
    return this.#score;
  }

  set score(value) {
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
      if (this.node.getOther(this).score === value)
        this.node.getOther(this).score = null;
      if (this.node.winSlot)
        this.node.winSlot.team = this.team;
      if (this.node.lossSlot)
        this.node.lossSlot.team = this.node.getOther(this).team;
      this.#bracketResetScore = null;
      this.node.getOther(this).bracketResetScore = null;
    }

    this.#score = value;
  }

  get bracketResetScore() {
    return this.#bracketResetScore;
  }

  set bracketResetScore(value) {
    if (value !== null) {
      value = Math.min(value, this.node.winsNeeded);
      value = Math.max(value, 0);
    }

    if (value === this.node.winsNeeded && this.node.getOther(this).bracketResetScore === value) {
      this.node.getOther(this).bracketResetScore = null;
    }

    this.#bracketResetScore = value;
  }

  hasWon() {
    if (this.node.bracketReset && this.node.slots[1].score === this.node.winsNeeded)
      return this.#bracketResetScore === this.node.winsNeeded;
    return this.#score === this.node.winsNeeded;
  }
}