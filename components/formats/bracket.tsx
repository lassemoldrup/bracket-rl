import styles from 'styles/formats/Bracket.module.scss';
import { range } from 'lodash';
import { BracketNode } from 'libs/formats/bracket';
import classNames from 'classnames';
import { FormatProps, Team } from './format';

export function Column({ matches, title, redrawFormat: redrawBracket }: { matches: BracketNode[], title: string } & FormatProps) {
  return (<>
    <div className={styles['column-header']}>{title}</div>
    <div className={classNames(styles.column, styles['match-column'])}>
      {matches.map((node, i) => <Match node={node} redrawFormat={redrawBracket} key={i} />)}
    </div>
  </>);
}

export function Match({ node, redrawFormat: redrawBracket }: { node: BracketNode } & FormatProps) {
  return (
    <div className={styles.match}>
      <Team slot={node.slots[0]} redrawFormat={redrawBracket} />
      <hr />
      <Team slot={node.slots[1]} redrawFormat={redrawBracket} />
    </div>
  );
}

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
