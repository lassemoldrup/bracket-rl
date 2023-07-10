import Image from 'next/image';
import styles from '../styles/DoubleElim.module.scss';
import { range } from 'lodash';

export default function DoubleElim({ bracket, setBracket }) {
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

function Column({ upper, lower, upperTitle, lowerTitle, redrawBracket }) {
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

function Match({ node, redrawBracket }) {
  return (
    <div className={styles.match}>
      <Team slot={node.slots[0]} redrawBracket={redrawBracket} />
      <hr />
      <Team slot={node.slots[1]} redrawBracket={redrawBracket} />
    </div>
  );
}

function Team({ slot, redrawBracket }) {
  const setScore = event => {
    const score = parseInt(event.target.value);
    // if (score is NaN)
    if (score !== score) {
      slot.score = null;
    } else {
      slot.score = score;
    }
    redrawBracket();
  };

  const setBracketResetScore = event => {
    const score = parseInt(event.target.value);
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
            {/* loading='eager', since, otherwise, export doesn't work on Webkit browsers */}
            <div className={styles['team-logo-container']}>
              <Image src={slot.team.image} width={15} height={15} alt={slot.team.name + ' logo'} loading='eager' />
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

function BracketLinesColumn({ upperCount, lowerCount, upperIsStraight = false, lowerIsStraight = false }) {
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

function InnerBracketLinesColumn({ count, isStraight = false }) {
  return isStraight
    ? range(count).map((_, i) => <hr key={i} />)
    : (<>
      <div className={styles['bracket-end-gap']}></div>
      {range(count).map((_, i) => (
        <BracketLines withGap={i < count - 1} key={i} />
      ))}
      <div className={styles['bracket-end-gap']}></div>
    </>);
}

function BracketLines({ withGap = false }) {
  return (<>
    <div className={styles['bracket-lines']}>
      <div className={styles['outgoing-lines']}>
      </div>
      <hr className={styles['ingoing-line']} />
    </div>
    {withGap && <div className={styles['bracket-gap']}></div>}
  </>);
}