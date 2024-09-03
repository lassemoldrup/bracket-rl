'use client';

import Tabbed from 'components/tabbed';
import { SwissFormat } from 'libs/formats/swiss';
import { Worlds2024Initializer, SwissInitializer } from 'libs/types';
import { forwardRef, Ref, useRef, useState } from 'react';
import Swiss from './swiss';
import Controls from 'components/controls';
import { Worlds2024Playoffs } from 'libs/formats/worlds2024';
import { Bracket, BracketLinesColumn, Column, PhantomColumn } from './bracket';
import { FormatProps } from './format';
import _ from 'lodash';
import styles from 'styles/formats/Bracket.module.scss';

export default function Worlds2024({
  swissInit,
  playoffsInit,
}: {
  swissInit: SwissInitializer;
  playoffsInit: Worlds2024Initializer;
}) {
  const [tab, setTab] = useState(0);
  const [swiss, setSwiss] = useState(new SwissFormat(swissInit));
  const [playoffs, setPlayoffs] = useState(
    new Worlds2024Playoffs(playoffsInit)
  );

  const redrawSwiss = () => {
    playoffs.setTeams(swiss.winners);
    setSwiss(_.clone(swiss));
  };
  const redrawPlayoffs = () => setPlayoffs(_.clone(playoffs));
  playoffs.setTeams(swiss.winners);
  const refs = [useRef(null), useRef(null)];
  const clearFormats = [
    () => {
      swiss.clear();
      redrawSwiss();
      redrawPlayoffs();
    },
    () => {
      playoffs.clear();
      redrawPlayoffs();
    },
  ];

  return (
    <div>
      <Tabbed tabNames={['Swiss', 'Playoffs']} onChange={setTab}>
        <Swiss format={swiss} redrawFormat={redrawSwiss} ref={refs[0]} />
        <Worlds2024Bracket
          playoffs={playoffs}
          redrawFormat={redrawPlayoffs}
          ref={refs[1]}
        />
      </Tabbed>
      <Controls formatRef={refs[tab]} clearFormat={clearFormats[tab]} />
    </div>
  );
}

const Worlds2024Bracket = forwardRef(function (
  {
    playoffs,
    redrawFormat,
  }: {
    playoffs: Worlds2024Playoffs;
  } & FormatProps,
  ref: Ref<HTMLDivElement>
) {
  const lbRound1Ref = useRef(null);
  const ubQuartersRef = useRef(null);
  const lbQuartersRef = useRef(null);
  const semisRef = useRef(null);
  const grandFinalRef = useRef(null);

  return (
    <div
      className={styles.playoffs}
      style={{ display: 'flex', flexDirection: 'column' }}
      ref={ref}
    >
      <Bracket className={styles['upper-bracket']}>
        <Column
          matches={playoffs.tiebreaker}
          title="Swiss Tiebreaker"
          bigMatches
          redrawFormat={redrawFormat}
          nextRef={lbRound1Ref}
        />
        <BracketLinesColumn count={0} />
        <Column
          matches={playoffs.upperQuarters}
          title="UB Quarterfinals"
          bigMatches
          ref={ubQuartersRef}
          nextRef={lbQuartersRef}
          redrawFormat={redrawFormat}
        />
        <BracketLinesColumn count={0} />
        <PhantomColumn bigMatches />
        <BracketLinesColumn count={0} />
        <PhantomColumn bigMatches />
      </Bracket>
      <div className={styles['bracket-vertical-gap']}></div>
      <Bracket>
        <Column
          matches={playoffs.lowerR1}
          title="LB Round 1"
          bigMatches
          ref={lbRound1Ref}
          nextRef={ubQuartersRef}
          redrawFormat={redrawFormat}
        />
        <BracketLinesColumn count={2} isStraight />
        <Column
          matches={playoffs.lowerQuarters}
          title="LB Quarterfinals"
          bigMatches
          ref={lbQuartersRef}
          nextRef={semisRef}
          redrawFormat={redrawFormat}
        />
        <BracketLinesColumn count={2} isStraight />
        <Column
          matches={playoffs.semis}
          title="Semifinals"
          bigMatches
          ref={semisRef}
          nextRef={grandFinalRef}
          redrawFormat={redrawFormat}
        />
        <BracketLinesColumn count={1} />
        <Column
          matches={[playoffs.grandFinal]}
          title="Grand Final"
          bigMatches
          ref={grandFinalRef}
          redrawFormat={redrawFormat}
        />
      </Bracket>
    </div>
  );
});
