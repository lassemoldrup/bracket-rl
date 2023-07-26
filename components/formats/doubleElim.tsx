'use client';

import { DoubleElimBracket } from 'libs/formats/doubleElim';
import styles from 'styles/formats/DoubleElim.module.scss';
import {
  BracketLines,
  Column,
  Match,
  BracketLinesColumn,
  Bracket,
} from './bracket';
import { BracketInitializer } from 'libs/types';
import { useRef, useState } from 'react';
import Controls from 'components/controls';
import _ from 'lodash';

export default function DoubleElim({ init }: { init: BracketInitializer }) {
  const bracketRef = useRef(null);
  const upperRefs = _.range(4).map((_i) => useRef(null));
  const lowerRefs = _.range(6).map((_i) => useRef(null));
  const grandFinalRef = useRef(null);

  const [bracket, setBracket] = useState(new DoubleElimBracket(init));
  const redrawFormat = () => setBracket({ ...bracket });
  const clearBracket = () =>
    setBracket(new DoubleElimBracket({ ...init, matchScores: [] }));

  return (
    <div>
      <div className={styles['double-elim']} ref={bracketRef}>
        <div className={styles.brackets}>
          <Bracket className={styles['upper-bracket']}>
            <Column
              matches={bracket.upperR1}
              title="UB Round 1"
              ref={upperRefs[0]}
              nextRef={upperRefs[1]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={4} />
            <Column
              matches={bracket.upperQuarters}
              title="UB Quarterfinals"
              ref={upperRefs[1]}
              nextRef={upperRefs[2]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={2} fullWidth />
            <Column
              matches={bracket.upperSemis}
              title="UB Semifinals"
              ref={upperRefs[2]}
              nextRef={upperRefs[3]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={1} fullWidth />
            <Column
              matches={[bracket.upperFinal]}
              title="UB Final"
              ref={upperRefs[3]}
              nextRef={lowerRefs[0]}
              redrawFormat={redrawFormat}
            />
          </Bracket>
          <Bracket>
            <Column
              matches={bracket.lowerR1}
              title="LB Round 1"
              ref={lowerRefs[0]}
              nextRef={lowerRefs[1]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={4} isStraight />
            <Column
              matches={bracket.lowerR2}
              title="LB Round 2"
              ref={lowerRefs[1]}
              nextRef={lowerRefs[2]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={2} />
            <Column
              matches={bracket.lowerR3}
              title="LB Round 3"
              ref={lowerRefs[2]}
              nextRef={lowerRefs[3]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={2} isStraight />
            <Column
              matches={bracket.lowerQuarters}
              title="LB Quarterfinals"
              ref={lowerRefs[3]}
              nextRef={lowerRefs[4]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={1} />
            <Column
              matches={[bracket.lowerSemi]}
              title="LB Semifinal"
              ref={lowerRefs[4]}
              nextRef={lowerRefs[5]}
              redrawFormat={redrawFormat}
            />
            <BracketLinesColumn count={1} isStraight />
            <Column
              matches={[bracket.lowerFinal]}
              title="LB Final"
              ref={lowerRefs[5]}
              nextRef={grandFinalRef}
              redrawFormat={redrawFormat}
            />
          </Bracket>
        </div>
        <div className={styles['grand-final-lines']}>
          <BracketLines />
        </div>
        <div className={styles['grand-final-column']}>
          <div className={styles['column-header']}>Grand Final</div>
          <div className={styles['grand-final-match']}>
            <Match
              node={bracket.grandFinal}
              ref={grandFinalRef}
              redrawFormat={redrawFormat}
            />
          </div>
        </div>
      </div>
      <Controls formatRef={bracketRef} clearFormat={clearBracket} />
    </div>
  );
}
