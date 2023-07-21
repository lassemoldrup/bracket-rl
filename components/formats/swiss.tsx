'use client';

import { SwissFormat, SwissMatch, SwissMatchList } from "libs/formats/swiss";
import { SwissInitializer } from "libs/types";
import { useRef, useState } from "react";
import styles from "styles/formats/Swiss.module.scss";
import Controls from "components/controls";
import { Vertical } from "components/misc";
import { FormatProps, Team } from "./format";
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

  return (<div>
    <div ref={formatRef} className={styles.swiss}>
      {format.rounds.map((r, i) =>
        <Round round={r} name={`Round ${i + 1}`} redrawFormat={redrawFormat} key={i} />
      )}
    </div>
    <Controls formatRef={formatRef} clearFormat={clearFormat} />
  </div>);
}

function Round({
  round,
  name,
  redrawFormat,
}: {
  round: SwissMatchList[],
  name: string,
} & FormatProps) {
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
        <MatchList matchList={mL} name={listNames[i]}
          redrawFormat={redrawFormat} key={i}
        />
      )}
    </div>
  )
}

function MatchList({
  matchList,
  name,
  redrawFormat,
}: {
  matchList: SwissMatchList,
  name: string,
} & FormatProps) {
  return (
    <div className={styles['match-list']}>
      <div className={styles['match-list-header']}>{name}</div>
      {matchList.matches.map((m, i) => <Match match={m} redrawFormat={redrawFormat} key={i} />)}
    </div>
  )
}

function Match({
  match,
  redrawFormat,
}: {
  match: SwissMatch,
} & FormatProps) {
  return (
    <div className={styles.match}>
      <Team slot={match.slots[0]} redrawFormat={redrawFormat} />
      <Vertical />
      <Team slot={match.slots[1]} redrawFormat={redrawFormat} />
    </div>
  )
}
