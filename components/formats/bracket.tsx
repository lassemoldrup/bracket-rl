import styles from 'styles/formats/Bracket.module.scss';
import { BracketNode, Top8SingleElimBracketFormat } from 'libs/formats/bracket';
import classNames from 'classnames';
import { FormatProps, ScoreRef, ScoredTeam, Team } from './format';
import { forwardRef, useRef } from 'react';
import _ from 'lodash';
import * as types from 'libs/types';

export function Top8SingleElimBracket({
  bracket,
  redrawFormat,
}: {
  bracket: Top8SingleElimBracketFormat;
} & FormatProps) {
  const quartersRef = useRef(null);
  const semisRef = useRef(null);
  const finalRef = useRef(null);
  return (
    <Bracket className={styles.playoffs}>
      <Column
        matches={bracket.quarters}
        title={'Quarterfinals'}
        bigMatches
        redrawFormat={redrawFormat}
        ref={quartersRef}
        nextRef={semisRef}
      />
      <BracketLinesColumn count={2} />
      <Column
        matches={bracket.semis}
        title={'Semifinals'}
        bigMatches
        redrawFormat={redrawFormat}
        ref={semisRef}
        nextRef={finalRef}
      />
      <BracketLinesColumn count={1} />
      <Column
        matches={[bracket.final]}
        title={'Grand Final'}
        bigMatches
        redrawFormat={redrawFormat}
        ref={finalRef}
      />
    </Bracket>
  );
}

export function Bracket({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames(styles.bracket, className)}>{children}</div>
  );
}

export const Column = forwardRef(function (
  {
    matches,
    title,
    bigMatches,
    nextRef,
    redrawFormat,
  }: {
    matches: BracketNode[];
    title: string;
    bigMatches?: boolean;
  } & FormatProps,
  ref: ScoreRef
) {
  const refs = _.range(matches.length - 1).map((_i) => useRef(null));

  return (
    <div className={styles.column}>
      <div className={styles['column-header']}>{title}</div>
      <div className={classNames(styles['inner-column'])}>
        {matches.map((node, i) => (
          <Match
            node={node}
            big={bigMatches}
            ref={i === 0 ? ref : refs[i - 1]}
            nextRef={refs[i] ?? nextRef}
            redrawFormat={redrawFormat}
            key={i}
          />
        ))}
      </div>
    </div>
  );
});

export const Match = forwardRef(function (
  {
    node,
    big,
    ...formatProps
  }: {
    node: BracketNode;
    big?: boolean;
  } & FormatProps,
  ref: ScoreRef
) {
  const secondRef = useRef(null);

  return (
    <div className={styles.match}>
      <ScoredTeam
        slot={node.slots[0]}
        big={big}
        ref={ref}
        {...formatProps}
        nextRef={secondRef}
      />
      <hr />
      <ScoredTeam
        slot={node.slots[1]}
        big={big}
        ref={secondRef}
        {...formatProps}
      />
    </div>
  );
});

export function BracketLinesColumn({
  count,
  isStraight,
  fullWidth,
}: {
  count: number;
  isStraight?: boolean;
  fullWidth?: boolean;
}) {
  const className = classNames(
    styles['inner-column'],
    styles['bracket-lines-column'],
    {
      [styles['full-width-column']]: fullWidth,
    }
  );
  return (
    <div className={className}>
      <InnerBracketLinesColumn count={count} isStraight={isStraight} />
    </div>
  );
}

export function InnerBracketLinesColumn({
  count,
  isStraight,
}: {
  count: number;
  isStraight?: boolean;
}) {
  return isStraight ? (
    _.range(count).map((i) => <hr key={i} />)
  ) : (
    <>
      <div className={styles['bracket-end-gap']}></div>
      {_.range(count).map((i) => (
        <BracketLines withGap={i < count - 1} key={i} />
      ))}
      <div className={styles['bracket-end-gap']}></div>
    </>
  );
}

export function BracketLines({ withGap = false }: { withGap?: boolean }) {
  return (
    <>
      <div className={styles['bracket-lines']}>
        <div className={styles['outgoing-lines']}></div>
        <hr className={styles['ingoing-line']} />
      </div>
      {withGap && <div className={styles['bracket-gap']}></div>}
    </>
  );
}

export function QualifiedColumn({
  teams,
  big,
}: {
  teams: (types.Team | null)[];
  big?: boolean;
}) {
  return (
    <div className={styles.column}>
      <div className={styles['column-header']}>Qualified</div>
      <div className={styles['inner-column']}>
        {teams.map((team, i) => (
          <Qualified team={team ?? undefined} big={big} key={i}></Qualified>
        ))}
      </div>
    </div>
  );
}

function Qualified({ team, big }: { team?: types.Team; big?: boolean }) {
  return (
    <div
      className={classNames(styles.qualified, { [styles['has-team']]: team })}
    >
      <Team team={team} hasWon big={big} />
    </div>
  );
}
