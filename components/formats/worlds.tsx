'use client';

import Tabbed from 'components/tabbed';
import { SwissInitializer, WorldsInitializer } from 'libs/types';
import Swiss from './swiss';
import { FormatProps, ScoreRef } from './format';
import { forwardRef, useRef, useState } from 'react';
import {
  WorldsFormat,
  WorldsGroup,
  WorldsPlayoffsFormat,
} from 'libs/formats/worlds';
import Controls from 'components/controls';
import { DoubleElimBracketLinesColumn, DoubleElimColumn } from './doubleElim';
import styles from 'styles/formats/Worlds.module.scss';
import { BracketLinesColumn, Column } from './bracket';

export default function Worlds({
  wildcardInit: swissInit,
  mainInit,
}: {
  wildcardInit: SwissInitializer;
  mainInit: WorldsInitializer;
}) {
  const [format, setFormat] = useState(new WorldsFormat(mainInit));
  const redrawFormat = () => setFormat({ ...format });

  return (
    <Tabbed tabNames={['Wildcard', 'Group Stage', 'Playoffs']}>
      <Swiss init={swissInit} />
      <WorldsGroups groups={format.groups} redrawFormat={redrawFormat} />
      <WorldsPlayoffs bracket={format.playoffs} redrawFormat={redrawFormat} />
    </Tabbed>
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
    <div>
      <div className={styles.groups} ref={formatRef}>
        <Group
          group={groups[0]}
          nextRef={groupBRef}
          redrawFormat={redrawFormat}
        />
        <Group group={groups[1]} ref={groupBRef} redrawFormat={redrawFormat} />
      </div>
      <Controls formatRef={formatRef} clearFormat={() => {}} />
    </div>
  );
}

const Group = forwardRef(function (
  {
    group,
    ...formatProps
  }: {
    group: WorldsGroup;
  } & FormatProps,
  ref: ScoreRef
) {
  const semisRef = useRef(null);
  return (
    <div className={styles.group}>
      <DoubleElimColumn
        upper={group.upperQuarters}
        lower={group.lowerQuarters}
        upperTitle="UB Quarterfinals"
        lowerTitle="LB Quarterfinals"
        ref={ref}
        {...formatProps}
        nextRef={semisRef}
      />
      <DoubleElimBracketLinesColumn
        upperCount={2}
        lowerCount={2}
        lowerIsStraight
      />
      <DoubleElimColumn
        upper={group.upperSemis}
        lower={group.lowerSemis}
        upperTitle="UB Semifinals"
        lowerTitle="LB Semifinals"
        ref={semisRef}
        {...formatProps}
      />
    </div>
  );
});

function WorldsPlayoffs({
  bracket,
  redrawFormat,
}: {
  bracket: WorldsPlayoffsFormat;
} & FormatProps) {
  return (
    <div className={styles.playoffs}>
      <Column
        matches={bracket.quarters}
        title={'Quarterfinals'}
        redrawFormat={redrawFormat}
      />
      <BracketLinesColumn count={2} />
      <Column
        matches={bracket.semis}
        title={'Semifinals'}
        redrawFormat={redrawFormat}
      />
      <BracketLinesColumn count={1} />
      <Column
        matches={[bracket.final]}
        title={'Grand Final'}
        redrawFormat={redrawFormat}
      />
    </div>
  );
}
