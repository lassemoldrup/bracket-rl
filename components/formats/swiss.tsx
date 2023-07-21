'use client';

import { SwissFormat, SwissMatch, SwissMatchList } from "libs/formats/swiss";
import { SwissInitializer } from "libs/types";
import { forwardRef, useRef, useState } from "react";
import styles from "styles/formats/Swiss.module.scss";
import Controls from "components/controls";
import { Vertical } from "components/misc";
import { FormatProps, ScoreRef, Team } from "./format";
import _ from "lodash";

export default function Swiss({
  init,
}: {
  init: SwissInitializer,
}) {
  const [format, setFormat] = useState(new SwissFormat(init));
  const clearFormat = () => setFormat(new SwissFormat({ ...init, matchScores: [] }));
  const redrawFormat = () => setFormat({ ...format } as SwissFormat);
  const formatRef = useRef(null);
  const roundRefs = _.range(format.rounds.length).map(_m => useRef(null));

  return (<div>
    <div ref={formatRef} className={styles.swiss}>
      {format.rounds.map((r, i) =>
        <Round round={r} name={`Round ${i + 1}`} ref={roundRefs[i]} nextRef={roundRefs[i + 1]}
          redrawFormat={redrawFormat} key={i} />
      )}
    </div>
    <Controls formatRef={formatRef} clearFormat={clearFormat} />
  </div>);
}

const Round = forwardRef(({
  round,
  name,
  nextRef,
  redrawFormat,
}: {
  round: SwissMatchList[],
  name: string,
} & FormatProps, ref: ScoreRef) => {
  const matchRefs = _.range(round.length - 1).map(_m => useRef(null));
  let listNames: string[];
  if (round.length === 1)
    listNames = [''];
  else if (round.length === 2)
    listNames = ['High', 'Low'];
  else
    listNames = ['High', 'Mid', 'Low'];

  return (
    <div className={styles.round}>
      <div className={styles['round-header']}>{name}</div>
      {round.map((mL, i) =>
        <MatchList matchList={mL} name={listNames[i]} ref={i === 0 ? ref : matchRefs[i - 1]}
          nextRef={matchRefs[i] ?? nextRef} redrawFormat={redrawFormat} key={i}
        />
      )}
    </div>
  )
});

const MatchList = forwardRef(({
  matchList,
  name,
  nextRef,
  redrawFormat,
}: {
  matchList: SwissMatchList,
  name: string,
} & FormatProps, ref: ScoreRef) => {
  const matchRefs = _.range(matchList.matches.length - 1).map(_m => useRef(null));
  return (
    <div className={styles['match-list']}>
      <div className={styles['match-list-header']}>{name}</div>
      {matchList.matches.map((m, i) => <Match match={m} ref={i === 0 ? ref : matchRefs[i - 1]}
        nextRef={matchRefs[i] ?? nextRef} redrawFormat={redrawFormat} key={i} />
      )}
    </div>
  )
});

const Match = forwardRef(({
  match,
  ...formatProps
}: {
  match: SwissMatch,
} & FormatProps, ref: ScoreRef) => {
  const secondRef = useRef(null);

  return (
    <div className={styles.match}>
      <Team slot={match.slots[0]} ref={ref} {...formatProps} nextRef={secondRef} />
      <Vertical />
      <Team slot={match.slots[1]} reverse ref={secondRef} {...formatProps} />
    </div>
  )
});
