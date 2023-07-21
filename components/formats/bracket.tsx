import styles from 'styles/formats/Bracket.module.scss';
import { range } from 'lodash';
import { BracketNode } from 'libs/formats/bracket';
import classNames from 'classnames';
import { FormatProps, ScoreRef, Team } from './format';
import { forwardRef, useRef } from 'react';
import _ from 'lodash';

// Column and Match export the ref of the first score input
export const Column = forwardRef(({
  matches,
  title,
  nextRef,
  redrawFormat,
}: {
  matches: BracketNode[],
  title: string
} & FormatProps, ref: ScoreRef) => {
  const refs = _.range(matches.length - 1).map(_i => useRef(null));

  return (<>
    <div className={styles['column-header']}>{title}</div>
    <div className={classNames(styles.column, styles['match-column'])}>
      {matches.map((node, i) => <Match node={node} ref={i === 0 ? ref : refs[i - 1]}
        nextRef={refs[i] ?? nextRef} redrawFormat={redrawFormat} key={i} />
      )}
    </div>
  </>);
});

export const Match = forwardRef(({
  node,
  ...formatProps
}: {
  node: BracketNode,
} & FormatProps, ref: ScoreRef) => {
  const secondRef = useRef(null);

  return (
    <div className={styles.match}>
      <Team slot={node.slots[0]} ref={ref} {...formatProps} nextRef={secondRef} />
      <hr />
      <Team slot={node.slots[1]} ref={secondRef} {...formatProps} />
    </div>
  );
});


export function BracketLinesColumn({
  count,
  isStraight
}: {
  count: number,
  isStraight?: boolean,
}) {
  return (<>
    {/* Title stand in */}
    <div></div>
    <div className={classNames(styles.column, styles['bracket-lines-column'])}>
      <InnerBracketLinesColumn count={count} isStraight={isStraight} />
    </div>
  </>);
}

export function InnerBracketLinesColumn({
  count,
  isStraight
}: {
  count: number,
  isStraight?: boolean,
}) {
  return isStraight
    ? range(count).map(i => <hr key={i} />)
    : (<>
      <div className={styles['bracket-end-gap']}></div>
      {range(count).map(i => (
        <BracketLines withGap={i < count - 1} key={i} />
      ))}
      <div className={styles['bracket-end-gap']}></div>
    </>);
}

export function BracketLines({ withGap = false }: { withGap?: boolean }) {
  return (<>
    <div className={styles['bracket-lines']}>
      <div className={styles['outgoing-lines']}>
      </div>
      <hr className={styles['ingoing-line']} />
    </div>
    {withGap && <div className={styles['bracket-gap']}></div>}
  </>);
}
