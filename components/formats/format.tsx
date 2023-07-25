import Image from 'next/image';
import { TeamSlot } from 'libs/types';
import { ForwardedRef, KeyboardEvent, RefObject, forwardRef } from 'react';
import styles from 'styles/formats/Format.module.scss';
import { Vertical } from 'components/misc';
import classNames from 'classnames';

export type ScoreRef = ForwardedRef<HTMLInputElement>;

export interface FormatProps {
  nextRef?: RefObject<HTMLDivElement>;
  redrawFormat(): void;
}

function TeamWithRef(
  {
    slot,
    reverse,
    nextRef,
    redrawFormat,
  }: {
    slot: TeamSlot;
    reverse?: boolean;
  } & FormatProps,
  ref: ScoreRef
) {
  const getSetScoreHandler = (field: 'score' | 'bracketResetScore') => {
    return (event: KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      const keyNum = parseInt(event.key);
      if (event.key === 'Backspace') slot[field] = null;
      // if (numKey is not NaN)
      else if (keyNum === keyNum) slot[field] = keyNum;
      else return;

      redrawFormat();
      nextRef?.current?.focus();
    };
  };

  const isBracketReset =
    slot.match.bracketReset && slot.match.slots[1].score === slot.winsNeeded;

  const teamContainerClassName = classNames(styles['team-container'], {
    [styles.reversed]: reverse ?? false,
  });
  const scoreClassName = classNames(styles.score, {
    [styles['max-score']]: slot.score === slot.winsNeeded,
  });
  const bracketResetScoreClassName = classNames(styles.score, {
    [styles['max-score']]: slot.hasWon(),
  });
  const teamNameClassName = classNames(styles['team-name'], {
    [styles['max-score']]: slot.hasWon(),
  });

  return (
    <div className={teamContainerClassName}>
      <div className={styles.team}>
        {slot.team && (
          <>
            <div className={styles['team-logo-container']}>
              <Image
                src={slot.team.image}
                width={15}
                height={15}
                alt={slot.team.name + ' logo'}
              />
            </div>
            <span className={teamNameClassName}>{slot.team.name}</span>
          </>
        )}
      </div>
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

export const Team = forwardRef(TeamWithRef);
