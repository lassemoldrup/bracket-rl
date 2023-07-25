'use client';

import { BracketNode } from 'libs/formats/bracket';
import { DoubleElimBracket } from 'libs/formats/doubleElim';
import styles from 'styles/formats/DoubleElim.module.scss';
import { BracketLines, Column, Match, BracketLinesColumn } from './bracket';
import { BracketInitializer } from 'libs/types';
import { forwardRef, useRef, useState } from 'react';
import Controls from 'components/controls';
import { FormatProps, ScoreRef } from './format';
import _ from 'lodash';

export default function DoubleElim({ init }: { init: BracketInitializer }) {
  const bracketRef = useRef(null);
  const columnRefs = _.range(7).map((_i) => useRef(null));
  const [bracket, setBracket] = useState(new DoubleElimBracket(init));
  const redrawFormat = () => setBracket({ ...bracket });
  const clearBracket = () =>
    setBracket(new DoubleElimBracket({ ...init, matchScores: [] }));

  return (
    <div>
      <div className={styles['double-elim']} ref={bracketRef}>
        <DoubleElimColumn
          upper={bracket.upperR1}
          lower={bracket.lowerR1}
          upperTitle="UB Round 1"
          lowerTitle="LB Round 1"
          ref={columnRefs[0]}
          nextRef={columnRefs[1]}
          redrawFormat={redrawFormat}
        />
        <DoubleElimBracketLinesColumn
          upperCount={4}
          lowerCount={4}
          lowerIsStraight
        />
        <DoubleElimColumn
          upper={bracket.upperQuarters}
          lower={bracket.lowerR2}
          upperTitle="UB Quarterfinals"
          lowerTitle="LB Round 2"
          ref={columnRefs[1]}
          nextRef={columnRefs[2]}
          redrawFormat={redrawFormat}
        />
        <DoubleElimBracketLinesColumn
          upperCount={4}
          lowerCount={2}
          upperIsStraight
        />
        <DoubleElimColumn
          upper={2}
          lower={bracket.lowerR3}
          lowerTitle="LB Round 3"
          ref={columnRefs[2]}
          nextRef={columnRefs[3]}
          redrawFormat={redrawFormat}
        />
        <DoubleElimBracketLinesColumn
          upperCount={2}
          lowerCount={2}
          upperIsStraight
          lowerIsStraight
        />
        <DoubleElimColumn
          upper={bracket.upperSemis}
          lower={bracket.lowerQuarters}
          upperTitle="UB Semifinals"
          lowerTitle="LB Quarterfinals"
          ref={columnRefs[3]}
          nextRef={columnRefs[4]}
          redrawFormat={redrawFormat}
        />
        <DoubleElimBracketLinesColumn
          upperCount={2}
          lowerCount={1}
          upperIsStraight
        />
        <DoubleElimColumn
          upper={1}
          lower={[bracket.lowerSemi]}
          lowerTitle="LB Semifinal"
          ref={columnRefs[4]}
          nextRef={columnRefs[5]}
          redrawFormat={redrawFormat}
        />
        <DoubleElimBracketLinesColumn
          upperCount={1}
          lowerCount={1}
          upperIsStraight
          lowerIsStraight
        />
        <DoubleElimColumn
          upper={[bracket.upperFinal]}
          lower={[bracket.lowerFinal]}
          upperTitle="UB Final"
          ref={columnRefs[5]}
          nextRef={columnRefs[6]}
          lowerTitle="LB Final"
          redrawFormat={redrawFormat}
        />
        <div className={styles['grand-final-lines']}>
          <BracketLines />
        </div>
        <div className={styles['grand-final-column']}>
          <div className={styles['column-header']}>Grand Final</div>
          <div className={styles['grand-final-match']}>
            <Match
              node={bracket.grandFinal}
              ref={columnRefs[6]}
              redrawFormat={redrawFormat}
            />
          </div>
        </div>
      </div>
      <Controls formatRef={bracketRef} clearFormat={clearBracket} />
    </div>
  );
}

export const DoubleElimColumn = forwardRef(function (
  {
    upper,
    lower,
    upperTitle,
    lowerTitle,
    ...formatProps
  }: {
    upper: BracketNode[] | number;
    lower: BracketNode[] | number;
    upperTitle?: string;
    lowerTitle?: string;
  } & FormatProps,
  ref: ScoreRef
) {
  const upperProps = { ...formatProps } as FormatProps & { ref?: ScoreRef };
  const lowerProps = { ...formatProps } as FormatProps & { ref?: ScoreRef };
  if (typeof upper !== 'number') upperProps.ref = ref;
  else if (typeof lower !== 'number') lowerProps.ref = ref;
  if (typeof upper !== 'number' && typeof lower !== 'number') {
    lowerProps.ref = useRef(null);
    upperProps.nextRef = lowerProps.ref;
  }

  return (
    <div className={styles['double-elim-column']}>
      <DoubleElimInnerColumn
        matches={upper}
        title={upperTitle}
        {...upperProps}
      />
      {/* Gutter between upper and lower bracket */}
      <div></div>
      <DoubleElimInnerColumn
        matches={lower}
        title={lowerTitle}
        {...lowerProps}
      />
    </div>
  );
});

const DoubleElimInnerColumn = forwardRef(function (
  {
    matches,
    title,
    ...formatProps
  }: {
    matches: BracketNode[] | number;
    title?: string;
  } & FormatProps,
  ref: ScoreRef
) {
  return title ? (
    <Column
      matches={matches as BracketNode[]}
      title={title}
      ref={ref}
      {...formatProps}
    />
  ) : (
    <BracketLinesColumn count={matches as number} />
  );
});

export function DoubleElimBracketLinesColumn({
  upperCount,
  lowerCount,
  upperIsStraight,
  lowerIsStraight,
}: {
  upperCount: number;
  lowerCount: number;
  upperIsStraight?: boolean;
  lowerIsStraight?: boolean;
}) {
  return (
    <div className={styles['double-elim-column']}>
      <BracketLinesColumn count={upperCount} isStraight={upperIsStraight} />
      {/* Gutter between upper and lower bracket */}
      <div></div>
      <BracketLinesColumn count={lowerCount} isStraight={lowerIsStraight} />
    </div>
  );
}
