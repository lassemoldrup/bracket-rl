'use client';

import { SwissFormat, SwissMatch, SwissMatchList } from 'libs/formats/swiss';
import { Ref, forwardRef, useRef } from 'react';
import styles from 'styles/formats/Swiss.module.scss';
import { Vertical } from 'components/misc';
import { FormatProps, ScoreRef, ScoredTeam } from './format';
import _ from 'lodash';

type SwissProps = {
  format: SwissFormat;
  redrawFormat: () => void;
};

const Swiss = forwardRef(function (
  { format, redrawFormat }: SwissProps,
  ref: Ref<HTMLDivElement>
) {
  const roundRefs = _.range(format.rounds.length).map((_m) => useRef(null));

  return (
    <div className={styles['swiss-container']}>
      <div className={styles.swiss} ref={ref}>
        {format.rounds.map((r, i) => (
          <Round
            round={r}
            name={`Round ${i + 1}`}
            ref={roundRefs[i]}
            nextRef={roundRefs[i + 1]}
            redrawFormat={redrawFormat}
            key={i}
          />
        ))}
      </div>
    </div>
  );
});

export default Swiss;

const Round = forwardRef(function (
  {
    round,
    name,
    nextRef,
    redrawFormat,
  }: {
    round: SwissMatchList[];
    name: string;
  } & FormatProps,
  ref: ScoreRef
) {
  const matchRefs = _.range(round.length - 1).map((_m) => useRef(null));
  let listNames: string[];
  if (round.length === 1) listNames = [''];
  else if (round.length === 2) listNames = ['High', 'Low'];
  else listNames = ['High', 'Mid', 'Low'];

  return (
    <div className={styles.round}>
      <div className={styles['round-header']}>{name}</div>
      {round.map((mL, i) => (
        <MatchList
          matchList={mL}
          name={listNames[i]}
          ref={i === 0 ? ref : matchRefs[i - 1]}
          nextRef={matchRefs[i] ?? nextRef}
          redrawFormat={redrawFormat}
          key={i}
        />
      ))}
    </div>
  );
});

const MatchList = forwardRef(function (
  {
    matchList,
    name,
    nextRef,
    redrawFormat,
  }: {
    matchList: SwissMatchList;
    name: string;
  } & FormatProps,
  ref: ScoreRef
) {
  const matchRefs = _.range(matchList.matches.length - 1).map((_m) =>
    useRef(null)
  );
  return (
    <div className={styles['match-list']}>
      <div className={styles['match-list-header']}>{name}</div>
      {matchList.matches.map((m, i) => (
        <Match
          match={m}
          ref={i === 0 ? ref : matchRefs[i - 1]}
          nextRef={matchRefs[i] ?? nextRef}
          redrawFormat={redrawFormat}
          key={i}
        />
      ))}
    </div>
  );
});

const Match = forwardRef(function (
  {
    match,
    ...formatProps
  }: {
    match: SwissMatch;
  } & FormatProps,
  ref: ScoreRef
) {
  const secondRef = useRef(null);

  return (
    <div className={styles.match}>
      <ScoredTeam
        slot={match.slots[0]}
        big
        qualification={match.isQualification}
        ref={ref}
        {...formatProps}
        nextRef={secondRef}
      />
      <Vertical />
      <ScoredTeam
        slot={match.slots[1]}
        big
        qualification={match.isQualification}
        reverse
        ref={secondRef}
        {...formatProps}
      />
    </div>
  );
});
