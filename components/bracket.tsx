import Image from 'next/image';
import styles from '../styles/DoubleElim.module.scss';
import { range } from 'lodash';
import { BracketNode, DoubleElimBracket, TeamSlot } from '../libs/bracket';
import { ChangeEvent } from 'react';

interface BracketProps {
  redrawBracket(): void,
}

interface DoubleElimProps {
  bracket: DoubleElimBracket,
  setBracket(bracket: DoubleElimBracket): void,
}

export default function DoubleElim({ bracket, setBracket }: DoubleElimProps) {
  const redrawBracket = () => setBracket({ ...bracket });

  return (
    <div className={styles.bracket}>
      <Column upper={bracket.upperR1} lower={bracket.lowerR1} upperTitle='UB Round 1' lowerTitle='LB Round 1' redrawBracket={redrawBracket} />
      <BracketLinesColumn upperCount={4} lowerCount={4} lowerIsStraight />
      <Column upper={bracket.upperQuarters} lower={bracket.lowerR2} upperTitle='UB Quarterfinals' lowerTitle='LB Round 2' redrawBracket={redrawBracket} />
      <BracketLinesColumn upperCount={4} lowerCount={2} upperIsStraight />
      <Column upper={2} lower={bracket.lowerR3} lowerTitle='LB Round 3' redrawBracket={redrawBracket} />
      <BracketLinesColumn upperCount={2} lowerCount={2} upperIsStraight lowerIsStraight />
      <Column upper={bracket.upperSemis} lower={bracket.lowerQuarters} upperTitle='UB Semifinals' lowerTitle='LB Quarterfinals' redrawBracket={redrawBracket} />
      <BracketLinesColumn upperCount={2} lowerCount={1} upperIsStraight />
      <Column upper={1} lower={[bracket.lowerSemi]} lowerTitle='LB Semifinal' redrawBracket={redrawBracket} />
      <BracketLinesColumn upperCount={1} lowerCount={1} upperIsStraight lowerIsStraight />
      <Column upper={[bracket.upperFinal]} lower={[bracket.lowerFinal]} upperTitle='UB Final' lowerTitle='LB Final' redrawBracket={redrawBracket} />
      <div className={styles['grand-final-lines']}><BracketLines /></div>
      <div className={styles['grand-final-column']}>
        <div className={styles['column-header']}>Grand Final</div>
        <Match node={bracket.grandFinal} redrawBracket={redrawBracket} />
      </div>
    </div>
  );
}

interface ColumnProps extends BracketProps {
  upper: BracketNode[] | number,
  lower: BracketNode[] | number,
  upperTitle?: string,
  lowerTitle?: string,
}

function Column({ upper, lower, upperTitle, lowerTitle, redrawBracket }: ColumnProps) {
  return (
    <div className={styles.column}>
      {upperTitle
        ? <div className={styles['column-header']}>{upperTitle}</div>
        : <div></div>
      }
      <div className={styles['inner-column']}>
        {typeof (upper) === 'number'
          ? <InnerBracketLinesColumn count={upper} />
          : upper.map((node, i) => <Match node={node} redrawBracket={redrawBracket} key={i} />)
        }
      </div>
      {/* Gutter between upper and lower bracket */}
      <div></div>
      {lowerTitle
        ? <div className={styles['column-header']}>{lowerTitle}</div>
        : <div></div>
      }
      <div className={styles['inner-column']}>
        {typeof (lower) === 'number'
          ? <InnerBracketLinesColumn count={lower} />
          : lower.map((node, i) => <Match node={node} redrawBracket={redrawBracket} key={i} />)
        }
      </div>
    </div>
  );
}

interface MatchProps extends BracketProps {
  node: BracketNode,
}

function Match({ node, redrawBracket }: MatchProps) {
  return (
    <div className={styles.match}>
      <Team slot={node.slots[0]} redrawBracket={redrawBracket} />
      <hr />
      <Team slot={node.slots[1]} redrawBracket={redrawBracket} />
    </div>
  );
}

interface TeamProps extends BracketProps {
  slot: TeamSlot,
}

function Team({ slot, redrawBracket }: TeamProps) {
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

interface BracketLinesColumnProps {
  upperCount: number,
  lowerCount: number,
  upperIsStraight?: boolean,
  lowerIsStraight?: boolean,
}

function BracketLinesColumn({ upperCount, lowerCount, upperIsStraight, lowerIsStraight }: BracketLinesColumnProps) {
  return (
    <div className={styles.column}>
      {/* Upper title stand in */}
      <div></div>
      <div className={styles['inner-column']}>
        <InnerBracketLinesColumn count={upperCount} isStraight={upperIsStraight} />
      </div>
      {/* Gutter between upper and lower bracket */}
      <div></div>
      {/* Lower title stand in */}
      <div></div>
      <div className={styles['inner-column']}>
        <InnerBracketLinesColumn count={lowerCount} isStraight={lowerIsStraight} />
      </div>
    </div>
  );
}

interface InnerBracketLinesColumnProps {
  count: number,
  isStraight?: boolean,
}

function InnerBracketLinesColumn({ count, isStraight = false }: InnerBracketLinesColumnProps) {
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

interface BracketLinesProps {
  withGap?: boolean,
}

function BracketLines({ withGap = false }: BracketLinesProps) {
  return (<>
    <div className={styles['bracket-lines']}>
      <div className={styles['outgoing-lines']}>
      </div>
      <hr className={styles['ingoing-line']} />
    </div>
    {withGap && <div className={styles['bracket-gap']}></div>}
  </>);
}
