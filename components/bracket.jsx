import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/DoubleElim.module.css';
import { DoubleElimBracket } from '../libs/bracket';

export default function DoubleElim({ teams }) {
  const [bracket, setBracket] = useState(new DoubleElimBracket(teams));

  const redrawBracket = () => setBracket({ ...bracket });

  return (
    <div className={styles.bracket}>
      <Column upper={bracket.upperR1} lower={bracket.lowerR1} upperTitle='UB Round 1' lowerTitle='LB Round 1' redrawBracket={redrawBracket} />
      <Column upper={bracket.upperQuarters} lower={bracket.lowerR2} upperTitle='UB Quarterfinals' lowerTitle='LB Round 2' redrawBracket={redrawBracket} />
      <Column upper={[]} lower={bracket.lowerR3} lowerTitle='LB Round 3' redrawBracket={redrawBracket} />
      <Column upper={bracket.upperSemis} lower={bracket.lowerQuarters} upperTitle='UB Semifinals' lowerTitle='LB Quarterfinals' redrawBracket={redrawBracket} />
      <Column upper={[]} lower={[bracket.lowerSemi]} lowerTitle='LB Semifinal' redrawBracket={redrawBracket} />
      <Column upper={[bracket.upperFinal]} lower={[bracket.lowerFinal]} upperTitle='UB Final' lowerTitle='LB Final' redrawBracket={redrawBracket} />
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
      {upperTitle ?
        <div className={styles['column-header']}>{upperTitle}</div>
        :
        <div></div>
      }
      <div className={styles['inner-column']}>
        {upper.map((node, i) => <Match node={node} redrawBracket={redrawBracket} key={i} />)}
      </div>
      {lowerTitle ?
        <div className={styles['column-header']}>{lowerTitle}</div>
        :
        <div></div>
      }
      <div className={styles['inner-column']}>
        {lower.map((node, i) => <Match node={node} redrawBracket={redrawBracket} key={i} />)}
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

  return (
    <div className={styles['team-container']}>
      <div className={styles.team}>
        {slot.team &&
          <>
            <Image src={slot.team.image} width={15} height={15} alt={slot.team.team + ' logo'} />
            <span className={slot.hasWon() ? styles['max-score'] : ''}>{slot.team.team}</span>
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