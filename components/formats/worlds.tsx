'use client';

import Tabbed from 'components/tabbed';
import { SwissInitializer, WorldsInitializer } from 'libs/types';
import Swiss from './swiss';
import { FormatProps, ScoreRef } from './format';
import { forwardRef, useRef, useState } from 'react';
import { WorldsFormat, WorldsGroup } from 'libs/formats/worlds';
import Controls from 'components/controls';
import styles from 'styles/formats/Worlds.module.scss';
import {
  Bracket,
  BracketLinesColumn,
  Column,
  QualifiedColumn,
  Top8SingleElimBracket,
} from './bracket';
import _ from 'lodash';
import { SwissFormat } from 'libs/formats/swiss';
import { Top8SingleElimBracketFormat } from 'libs/formats/bracket';

export default function Worlds({
  wildcardInit,
  mainInit,
}: {
  wildcardInit: SwissInitializer;
  mainInit: WorldsInitializer;
}) {
  const [tab, setTab] = useState(0);
  const [wildcard, setWildcard] = useState(new SwissFormat(wildcardInit));
  const [format, setFormat] = useState(new WorldsFormat(mainInit));

  const redrawWildcard = () => {
    format.setTeams(wildcard.winners);
    setWildcard(_.clone(wildcard));
  };
  const redrawFormat = () => setFormat(_.clone(format));
  format.setTeams(wildcard.winners);

  const refs = [useRef(null), useRef(null), useRef(null)];
  const clearFormats = [
    () => {
      setWildcard(new SwissFormat({ ...wildcardInit, matchScores: [] }));
      format.setTeams(wildcard.winners);
      redrawFormat();
    },
    () => {
      setFormat(new WorldsFormat({ ...mainInit, matchScores: [] }));
      format.setTeams(wildcard.winners);
    },
    () => {
      format.playoffs.clear();
      redrawFormat();
    },
  ];

  return (
    <div>
      <Tabbed
        tabNames={['Wildcard', 'Group Stage', 'Playoffs']}
        onChange={setTab}
      >
        <div ref={refs[0]}>
          <Swiss format={wildcard} redrawFormat={redrawWildcard} />
        </div>
        <div ref={refs[1]}>
          <WorldsGroups groups={format.groups} redrawFormat={redrawFormat} />
        </div>
        <div ref={refs[2]}>
          <Top8SingleElimBracket
            bracket={format.playoffs}
            redrawFormat={redrawFormat}
          />
        </div>
      </Tabbed>
      <Controls formatRef={refs[tab]} clearFormat={clearFormats[tab]} />
    </div>
  );
}

function WorldsGroups({
  groups,
  redrawFormat,
}: {
  groups: [WorldsGroup, WorldsGroup];
} & FormatProps) {
  const groupBRef = useRef(null);
  const formatRef = useRef(null);

  return (
    <div className={styles.groups} ref={formatRef}>
      <Group
        group={groups[0]}
        title="Group A"
        nextRef={groupBRef}
        redrawFormat={redrawFormat}
      />
      <Group
        group={groups[1]}
        title="Group B"
        ref={groupBRef}
        redrawFormat={redrawFormat}
      />
    </div>
  );
}

const Group = forwardRef(function (
  {
    group,
    title,
    ...formatProps
  }: {
    group: WorldsGroup;
    title: string;
  } & FormatProps,
  upperQuartersRef: ScoreRef
) {
  const upperSemisRef = useRef(null);
  const lowerQuartersRef = useRef(null);
  const lowerSemisRef = useRef(null);
  return (
    <div className={styles.group}>
      <h2 className={styles['group-title']}>{title}</h2>
      <Bracket className={styles['upper-bracket']}>
        <Column
          matches={group.upperQuarters}
          title="UB Quarterfinals"
          bigMatches
          {...formatProps}
          ref={upperQuartersRef}
          nextRef={upperSemisRef}
        />
        <BracketLinesColumn count={2} />
        <Column
          matches={group.upperSemis}
          title="UB Semifinals"
          bigMatches
          {...formatProps}
          ref={upperSemisRef}
          nextRef={lowerQuartersRef}
        />
        <BracketLinesColumn count={2} isStraight />
        <QualifiedColumn
          teams={group.upperSemis.map((m) => m.winner ?? null)}
          big
        />
      </Bracket>
      <Bracket>
        <Column
          matches={group.lowerQuarters}
          title="LB Quarterfinals"
          bigMatches
          {...formatProps}
          ref={lowerQuartersRef}
          nextRef={lowerSemisRef}
        />
        <BracketLinesColumn count={2} isStraight />
        <Column
          matches={group.lowerSemis}
          title="LB Semifinals"
          bigMatches
          {...formatProps}
          ref={lowerSemisRef}
        />
        <BracketLinesColumn count={2} isStraight />
        <QualifiedColumn
          teams={group.lowerSemis.map((m) => m.winner ?? null)}
          big
        />
      </Bracket>
    </div>
  );
});
