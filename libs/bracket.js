import { chunk, range } from 'lodash';

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

  constructor(upperR1Teams) {
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
  team;
  #score;

  constructor(node, team = null, score = null) {
    this.node = node;
    this.team = team;
    this.#score = score;
  }

  get score() {
    return this.#score;
  }

  set score(value) {
    if (this.score === this.node.winsNeeded && value !== this.node.winsNeeded && this.node.winSlot) {
      this.node.winSlot.team = null;
      if (this.node.lossSlot)
        this.node.lossSlot.team = null;
    }
    if (value === this.node.winsNeeded && this.node.winSlot) {
      this.node.winSlot.team = this.name;
      if (this.node.lossSlot)
        this.node.lossSlot.team = this.node.getOther(this).name;
    }
    this.score = value;
  }
}