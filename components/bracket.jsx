import Image from 'next/image';
import styles from '../styles/Bracket.module.css';
import { DoubleElimBracket } from '../libs/bracket';

export default function DoubleElim({ teams }) {
  const bracket = new DoubleElimBracket(teams);

  return (
    <div className={styles.bracket}>
      <Column upper={bracket.upperR1} lower={bracket.lowerR1} />
      <Column upper={bracket.upperQuarters} lower={bracket.lowerR2} />
      <Column upper={[]} lower={bracket.lowerR3} />
      <Column upper={bracket.upperSemis} lower={bracket.lowerQuarters} />
      <Column upper={[]} lower={[bracket.lowerSemi]} />
      <Column upper={[bracket.upperFinal]} lower={[bracket.lowerFinal]} />
      <Column upper={[bracket.grandFinal]} lower={[]} />
    </div>
  );
}

function Column({ upper, lower }) {
  return (
    <div className={styles.column}>
      <div className={styles.upper}>
        {upper.map((node, i) => <Match node={node} key={i} />)}
      </div>
      <hr />
      <div className={styles.lower}>
        {lower.map((node, i) => <Match node={node} key={i} />)}
      </div>
    </div>
  );
}

function Match({ node }) {
  return (
    <div className={styles.match}>
      <Team slot={node.slots[0]} />
      <hr />
      <Team slot={node.slots[1]} />
    </div>
  );
}

function Team({ slot }) {
  return (
    <div className={styles['team-container']}>
      {slot.team &&
        <div className={styles.team}>
          <Image src={slot.team.image} width={20} height={20} alt={slot.team.team + ' logo'} />
          <span>{slot.team.team}</span>
        </div>}
      <input className={styles.score}></input>
    </div>
  );
}