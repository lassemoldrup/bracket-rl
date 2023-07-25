import { Matchup, PartialMatchup, Team, WorldsInitializer } from 'libs/types';
import { BracketNode } from './bracket';
import assert from 'assert';
import _ from 'lodash';

export class WorldsFormat {
  groups: [WorldsGroup, WorldsGroup];
  playoffs = new WorldsPlayoffsFormat();

  constructor({ matchups, matchScores }: WorldsInitializer) {
    assert(matchups.length === 8);

    this.groups = [0, 1].map(
      (i) => new WorldsGroup(matchups.slice(i * 4, i * 4 + 4), i, this)
    ) as [WorldsGroup, WorldsGroup];
    const matches = [0, 1]
      .flatMap((i) => [
        ...this.groups[i].upperQuarters,
        ...this.groups[i].lowerQuarters,
        ...this.groups[i].upperSemis,
        ...this.groups[i].lowerSemis,
      ])
      .concat([
        ...this.playoffs.quarters,
        ...this.playoffs.semis,
        this.playoffs.final,
      ]);

    for (const [match, scores] of _.zip(matches, matchScores)) {
      if (!match || !scores) break;
      for (let i = 0; i < 2; i++) match.slots[i].score = scores[i];
    }
  }
}

export class WorldsGroup {
  upperQuarters: BracketNode[];
  upperSemis: BracketNode[];
  lowerQuarters: BracketNode[];
  lowerSemis: BracketNode[];

  constructor(matchups: PartialMatchup[], index: number, format: WorldsFormat) {
    const lowerPlayoffs = format.playoffs.quarters.slice(
      (1 - index) * 2,
      (1 - index) * 2 + 2
    );
    const upperPlayoffs = format.playoffs.quarters.slice(
      index * 2,
      index * 2 + 2
    );
    this.lowerSemis = [0, 1].map(
      (i) => new BracketNode(4, lowerPlayoffs[1 - i].slots[1])
    );
    this.lowerQuarters = [0, 1].map(
      (i) => new BracketNode(4, this.lowerSemis[i].slots[1])
    );
    this.upperSemis = [0, 1].map(
      (i) =>
        new BracketNode(
          4,
          upperPlayoffs[i].slots[0],
          this.lowerSemis[1 - i].slots[0]
        )
    );
    this.upperQuarters = [0, 1].flatMap((i) =>
      [0, 1].map(
        (j) =>
          new BracketNode(
            4,
            this.upperSemis[i].slots[j],
            this.lowerQuarters[i].slots[j],
            matchups[i * 2 + j]
          )
      )
    );
  }
}

export class WorldsPlayoffsFormat {
  quarters: BracketNode[];
  semis: BracketNode[];
  final = new BracketNode(4);

  constructor() {
    this.semis = [0, 1].map((i) => new BracketNode(4, this.final.slots[i]));
    this.quarters = [0, 1].flatMap((i) =>
      [0, 1].map((j) => new BracketNode(4, this.semis[i].slots[j]))
    );
  }
}
