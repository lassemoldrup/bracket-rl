import Image from 'next/image';
import styles from 'styles/formats/Bracket.module.scss';
import { range } from 'lodash';
import { BracketNode, BracketSlot } from 'libs/formats/bracket';
import { ChangeEvent } from 'react';
import classNames from 'classnames';

export interface BracketProps {
  redrawBracket(): void,
}

export function Column({ matches, title, redrawBracket }: { matches: BracketNode[], title: string } & BracketProps) {
  return (<>
    <div className={styles['column-header']}>{title}</div>
    <div className={classNames(styles.column, styles['match-column'])}>
      {matches.map((node, i) => <Match node={node} redrawBracket={redrawBracket} key={i} />)}
    </div>
  </>);
}

export function Match({ node, redrawBracket }: { node: BracketNode } & BracketProps) {
  return (
    <div className={styles.match}>
      <Team slot={node.slots[0]} redrawBracket={redrawBracket} />
      <hr />
      <Team slot={node.slots[1]} redrawBracket={redrawBracket} />
    </div>
  );
}

function Team({ slot, redrawBracket }: { slot: BracketSlot } & BracketProps) {
  const setScore = (event: ChangeEvent) => {
    const score = parseInt((event.target as HTMLInputElement).value);
    // if (score is NaN)
    if (score !== score) {
      slot.score = null;
    } else {
      slot.score = score;
    }
    redrawBracket();
  };

  const setBracketResetScore = (event: ChangeEvent) => {
    const score = parseInt((event.target as HTMLInputElement).value);
    // if (score is NaN)
    if (score !== score) {
      slot.bracketResetScore = null;
    } else {
      slot.bracketResetScore = score;
    }
    redrawBracket();
  }

  const scoreClassName = styles.score
    + (slot.score === slot.node.winsNeeded ? ' ' + styles['max-score'] : '');
  const bracketResetScoreClassName = styles.score
    + (slot.hasWon() ? ' ' + styles['max-score'] : '');
  const teamNameClassName = styles['team-name']
    + (slot.hasWon() ? ' ' + styles['max-score'] : '');

  return (
    <div className={styles['team-container']}>
      <div className={styles.team}>
        {slot.team &&
          <>
            <div className={styles['team-logo-container']}>
              <Image src={slot.team.image} width={15} height={15} alt={slot.team.name + ' logo'} />
            </div>
            <span className={teamNameClassName}>{slot.team.name}</span>
          </>
        }
      </div>
      <input value={slot.score === null ? '' : slot.score}
        onChange={setScore} className={scoreClassName}>
      </input>
      {slot.node.bracketReset &&
        <input value={slot.bracketResetScore === null ? '' : slot.bracketResetScore}
          disabled={slot.node.slots[1].score !== slot.node.winsNeeded}
          onChange={setBracketResetScore} className={bracketResetScoreClassName}>
        </input>
      }
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
