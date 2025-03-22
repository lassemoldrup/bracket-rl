import { Format, MaybeTeam, AFLInitializer } from 'libs/types';
import { BracketNode } from './bracket';
import _ from 'lodash';

export class AFLFormat implements Format {
  lowerR1: BracketNode[];
  upperQuarters: BracketNode[];
  lowerQuarters: BracketNode[];
  semis: BracketNode[];
  grandFinal = new BracketNode(4);

  constructor({ teams, matchScores }: AFLInitializer) {
    this.semis = [0, 1].map(
      (i) => new BracketNode(4, this.grandFinal.slots[i])
    );
    this.lowerQuarters = [
      new BracketNode(4, this.semis[0].slots[1]),
      new BracketNode(4, this.semis[1].slots[1]),
    ];
    this.upperQuarters = [
      new BracketNode(
        4,
        this.semis[1].slots[0],
        this.lowerQuarters[0].slots[0]
      ),
      new BracketNode(
        4,
        this.semis[0].slots[0],
        this.lowerQuarters[1].slots[0]
      ),
    ];
    this.lowerR1 = [
      new BracketNode(4, this.lowerQuarters[0].slots[1]),
      new BracketNode(4, this.lowerQuarters[1].slots[1]),
    ];

    this.setTeams(teams);

    for (const [node, scores] of _.zip(this.matchOrder, matchScores)) {
      if (!node || !scores) break;
      node.slots[0].score = scores[0];
      node.slots[1].score = scores[1];
    }
  }

  private get matchOrder(): BracketNode[] {
    return [
      ...this.lowerR1,
      ...this.upperQuarters,
      ...this.lowerQuarters,
      ...this.semis,
      this.grandFinal,
    ];
  }

  clear(): void {
    for (const node of this.matchOrder) {
      node.slots[0].score = null;
      node.slots[1].score = null;
    }
  }

  setTeams(teams: MaybeTeam[]): void {
    this.upperQuarters[0].slots[0].team = teams[0];
    this.upperQuarters[1].slots[0].team = teams[1];
    this.upperQuarters[1].slots[1].team = teams[2];
    this.upperQuarters[0].slots[1].team = teams[3];
    this.lowerR1[0].slots[0].team = teams[4];
    this.lowerR1[1].slots[0].team = teams[5];
    this.lowerR1[1].slots[1].team = teams[6];
    this.lowerR1[0].slots[1].team = teams[7];
  }
}
