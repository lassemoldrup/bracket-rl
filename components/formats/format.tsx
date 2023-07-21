import Image from 'next/image';
import { TeamSlot } from "libs/types";
import { ChangeEvent } from "react";
import styles from "styles/formats/Format.module.scss";
import { Vertical } from 'components/misc';

export interface FormatProps {
  redrawFormat(): void,
}

export function Team({ slot, redrawFormat }: { slot: TeamSlot } & FormatProps) {
  const setScore = (event: ChangeEvent) => {
    const score = parseInt((event.target as HTMLInputElement).value);
    // if (score is NaN)
    if (score !== score) {
      slot.score = null;
    } else {
      slot.score = score;
    }
    redrawFormat();
  };

  const setBracketResetScore = (event: ChangeEvent) => {
    const score = parseInt((event.target as HTMLInputElement).value);
    // if (score is NaN)
    if (score !== score) {
      slot.bracketResetScore = null;
    } else {
      slot.bracketResetScore = score;
    }
    redrawFormat();
  }

  const scoreClassName = styles.score
    + (slot.score === slot.winsNeeded ? ' ' + styles['max-score'] : '');
  const bracketResetScoreClassName = styles.score
    + (slot.hasWon() ? ' ' + styles['max-score'] : '');
  const teamNameClassName = styles['team-name']
    + (slot.hasWon() ? ' ' + styles['max-score'] : '');

  return (
    <div className={styles['team-container']}>
      <div className={styles.team}>
        {slot.team && <>
          <div className={styles['team-logo-container']}>
            <Image src={slot.team.image} width={15} height={15} alt={slot.team.name + ' logo'} />
          </div>
          <span className={teamNameClassName}>{slot.team.name}</span>
        </>}
      </div>
      <Vertical />
      <input value={slot.score === null ? '' : slot.score}
        onChange={setScore} className={scoreClassName}>
      </input>
      {slot.match.bracketReset && <>
        <Vertical />
        <input value={slot.bracketResetScore === null ? '' : slot.bracketResetScore}
          disabled={slot.match.slots[1].score !== slot.winsNeeded}
          onChange={setBracketResetScore} className={bracketResetScoreClassName}>
        </input>
      </>}
    </div>
  );
}
