'use client';

import Tabbed from 'components/tabbed';
import { BracketInitializer, SwissInitializer } from 'libs/types';
import { useRef, useState } from 'react';
import Swiss from './swiss';
import { SwissFormat } from 'libs/formats/swiss';
import { Top8SingleElimBracketFormat } from 'libs/formats/bracket';
import _ from 'lodash';
import { Top8SingleElimBracket } from './bracket';
import Controls from 'components/controls';

export default function Format2024({
  swissInit,
  bracketInit,
}: {
  swissInit: SwissInitializer;
  bracketInit: BracketInitializer;
}) {
  const [tab, setTab] = useState(0);
  const [swiss, setSwiss] = useState(new SwissFormat(swissInit));
  const [bracket, setBracket] = useState(
    new Top8SingleElimBracketFormat(bracketInit)
  );

  const redrawSwiss = () => {
    bracket.setTeams(swiss.winners);
    setSwiss(_.clone(swiss));
  };
  const redrawBracket = () => setBracket(_.clone(bracket));
  bracket.setTeams(swiss.winners);
  const refs = [useRef(null), useRef(null)];
  const clearFormats = [
    () => {
      swiss.clear();
      redrawSwiss();
      redrawBracket();
    },
    () => {
      bracket.clear();
      redrawBracket();
    },
  ];

  return (
    <div>
      <Tabbed tabNames={['Swiss', 'Playoffs']} onChange={setTab}>
        <div ref={refs[0]}>
          <Swiss format={swiss} redrawFormat={redrawSwiss} />
        </div>
        <div ref={refs[1]}>
          <Top8SingleElimBracket
            bracket={bracket}
            redrawFormat={redrawBracket}
          />
        </div>
      </Tabbed>
      <Controls formatRef={refs[tab]} clearFormat={clearFormats[tab]} />
    </div>
  );
}
