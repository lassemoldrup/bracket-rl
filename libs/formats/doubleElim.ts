import { BracketInitializer, Matchup } from 'libs/types';
import _ from 'lodash';
import { BracketNode } from './bracket';

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
  grandFinal = new BracketNode(4, null, null, [null, null], true);

  constructor({ matchups, matchScores }: BracketInitializer) {
    this.lowerFinal = new BracketNode(4, this.grandFinal.slots[1]);
    this.lowerSemi = new BracketNode(4, this.lowerFinal.slots[1]);
    this.lowerQuarters = [0, 1].map(
      (i) => new BracketNode(4, this.lowerSemi.slots[i])
    );
    this.lowerR3 = [0, 1].map(
      (i) => new BracketNode(3, this.lowerQuarters[i].slots[1])
    );
    this.lowerR2 = [0, 1].flatMap((i) =>
      [0, 1].map((j) => new BracketNode(3, this.lowerR3[i].slots[j]))
    );
    this.lowerR1 = _.range(4).map(
      (i) => new BracketNode(3, this.lowerR2[i].slots[1])
    );
    this.upperFinal = new BracketNode(
      4,
      this.grandFinal.slots[0],
      this.lowerFinal.slots[0]
    );
    this.upperSemis = [0, 1].map(
      (i) =>
        new BracketNode(
          4,
          this.upperFinal.slots[i],
          this.lowerQuarters[i].slots[0]
        )
    );
    this.upperQuarters = _.range(4).map(
      (i) =>
        new BracketNode(
          3,
          this.upperSemis[i >> 1].slots[i % 2],
          this.lowerR2[3 - i].slots[0]
        )
    );
    this.upperR1 = matchups.map(
      (teams, i) =>
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
    for (const [node, scores] of _.zip(matchOrder, matchScores)) {
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
