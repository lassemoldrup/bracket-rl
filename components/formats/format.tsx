import Image from 'next/image';
import * as types from 'libs/types';
import { ForwardedRef, KeyboardEvent, RefObject, forwardRef } from 'react';
import styles from 'styles/formats/Format.module.scss';
import { Vertical } from 'components/misc';
import classNames from 'classnames';

export type ScoreRef = ForwardedRef<HTMLInputElement>;

export interface FormatProps {
  nextRef?: RefObject<HTMLDivElement>;
  redrawFormat(): void;
}

function ScoredTeamWithRef(
  {
    slot,
    qualification,
    big,
    reverse,
    nextRef,
    redrawFormat,
  }: {
    slot: types.TeamSlot;
    qualification?: boolean;
    big?: boolean;
    reverse?: boolean;
  } & FormatProps,
  ref: ScoreRef
) {
  const getSetScoreHandler = (field: 'score' | 'bracketResetScore') => {
    return (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Tab') return;
      event.preventDefault();

      const keyNum = parseInt(event.key);
      if (event.key === 'Backspace') slot[field] = null;
      // if (keyNum is not NaN)
      else if (keyNum === keyNum) slot[field] = keyNum;
      else return;

      redrawFormat();
      if (nextRef) nextRef.current?.focus();
      else (event.target as HTMLInputElement).blur();
    };
  };

  const isBracketReset =
    slot.match.bracketReset && slot.match.slots[1].score === slot.winsNeeded;

  const teamContainerClassName = classNames(styles['team-container'], {
    [styles.reversed]: reverse ?? false,
    [styles.qualified]: qualification && slot.hasWon(),
  });
  const scoreClassName = classNames(styles.score, {
    [styles.big]: big ?? false,
    [styles['max-score']]: slot.score === slot.winsNeeded,
  });
  const bracketResetScoreClassName = classNames(styles.score, {
    [styles['max-score']]: slot.hasWon(),
  });

  return (
    <div className={teamContainerClassName}>
      <Team team={slot.team ?? undefined} hasWon={slot.hasWon()} big={big} />

      <Vertical />
      <input
        className={scoreClassName}
        value={slot.score ?? ''}
        readOnly
        onKeyDown={getSetScoreHandler('score')}
        inputMode="numeric"
        ref={ref}
      />
      {slot.match.bracketReset && (
        <>
          <Vertical />
          <input
            disabled={!isBracketReset}
            className={bracketResetScoreClassName}
            value={slot.bracketResetScore ?? ''}
            readOnly
            onKeyDown={getSetScoreHandler('bracketResetScore')}
            inputMode="numeric"
          />
        </>
      )}
    </div>
  );
}

export function Team({
  team,
  hasWon,
  big,
}: {
  team?: types.Team;
  hasWon?: boolean;
  big?: boolean;
}) {
  const teamSize = parseInt(big ? styles.teamHeightBig : styles.teamHeight) - 8;
  const teamNameClassName = classNames(styles['team-name'], {
    [styles['max-score']]: hasWon,
  });

  return (
    <div className={classNames(styles.team, { [styles.big]: big })}>
      {team && (
        <>
          <div className={styles['team-logo-container']}>
            <Image
              src={team.image}
              width={teamSize}
              height={teamSize}
              alt={team.name + ' logo'}
            />
          </div>
          <span className={teamNameClassName}>{team.name}</span>
        </>
      )}
    </div>
  );
}

export const ScoredTeam = forwardRef(ScoredTeamWithRef);
