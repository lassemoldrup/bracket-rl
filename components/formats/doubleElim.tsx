'use client';

import { BracketNode } from "libs/formats/bracket";
import { DoubleElimBracket } from "libs/formats/doubleElim";
import styles from 'styles/formats/DoubleElim.module.scss';
import { BracketLines, BracketProps, Column, Match, BracketLinesColumn } from "./bracket";
import { BracketInitializer } from "libs/types";
import { useRef, useState } from "react";
import Controls from "components/controls";

export default function DoubleElim({
  init
}: {
  init: BracketInitializer
}) {
  const bracketRef = useRef(null);
  const [bracket, setBracket] = useState(new DoubleElimBracket(init));
  const redrawBracket = () => setBracket({ ...bracket });
  const clearBracket = () => setBracket(new DoubleElimBracket({ ...init, matchScores: [] }));

  return (<div>
    <div className={styles['double-elim']} ref={bracketRef}>
      <DoubleElimColumn upper={bracket.upperR1} lower={bracket.lowerR1} upperTitle='UB Round 1' lowerTitle='LB Round 1' redrawBracket={redrawBracket} />
      <DoubleElimBracketLinesColumn upperCount={4} lowerCount={4} lowerIsStraight />
      <DoubleElimColumn upper={bracket.upperQuarters} lower={bracket.lowerR2} upperTitle='UB Quarterfinals' lowerTitle='LB Round 2' redrawBracket={redrawBracket} />
      <DoubleElimBracketLinesColumn upperCount={4} lowerCount={2} upperIsStraight />
      <DoubleElimColumn upper={2} lower={bracket.lowerR3} lowerTitle='LB Round 3' redrawBracket={redrawBracket} />
      <DoubleElimBracketLinesColumn upperCount={2} lowerCount={2} upperIsStraight lowerIsStraight />
      <DoubleElimColumn upper={bracket.upperSemis} lower={bracket.lowerQuarters} upperTitle='UB Semifinals' lowerTitle='LB Quarterfinals' redrawBracket={redrawBracket} />
      <DoubleElimBracketLinesColumn upperCount={2} lowerCount={1} upperIsStraight />
      <DoubleElimColumn upper={1} lower={[bracket.lowerSemi]} lowerTitle='LB Semifinal' redrawBracket={redrawBracket} />
      <DoubleElimBracketLinesColumn upperCount={1} lowerCount={1} upperIsStraight lowerIsStraight />
      <DoubleElimColumn upper={[bracket.upperFinal]} lower={[bracket.lowerFinal]} upperTitle='UB Final' lowerTitle='LB Final' redrawBracket={redrawBracket} />
      <div className={styles['grand-final-lines']}><BracketLines /></div>
      <div className={styles['grand-final-column']}>
        <div className={styles['column-header']}>Grand Final</div>
        <div className={styles['grand-final-match']}>
          <Match node={bracket.grandFinal} redrawFormat={redrawBracket} />
        </div>
      </div>
    </div>
    <Controls formatRef={bracketRef} clearFormat={clearBracket} />
  </div>);
}

function DoubleElimColumn({
  upper,
  lower,
  upperTitle,
  lowerTitle,
  redrawBracket
}: {
  upper: BracketNode[] | number,
  lower: BracketNode[] | number,
  upperTitle?: string,
  lowerTitle?: string,
} & BracketProps) {
  return (
    <div className={styles['double-elim-column']}>
      <DoubleElimInnerColumn matches={upper} title={upperTitle} redrawBracket={redrawBracket} />
      {/* Gutter between upper and lower bracket */}
      <div></div>
      <DoubleElimInnerColumn matches={lower} title={lowerTitle} redrawBracket={redrawBracket} />
    </div>
  );
}

function DoubleElimInnerColumn({
  matches,
  title,
  redrawBracket
}: {
  matches: BracketNode[] | number,
  title?: string,
} & BracketProps) {
  return title ?
    <Column matches={matches as BracketNode[]} title={title} redrawFormat={redrawBracket} />
    :
    <BracketLinesColumn count={matches as number} />;
}

function DoubleElimBracketLinesColumn({
  upperCount,
  lowerCount,
  upperIsStraight,
  lowerIsStraight
}: {
  upperCount: number,
  lowerCount: number,
  upperIsStraight?: boolean,
  lowerIsStraight?: boolean,
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