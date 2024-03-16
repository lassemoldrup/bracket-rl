'use client';

import assert from 'assert';
import classnames from 'classnames';
import _ from 'lodash';
import { useState } from 'react';
import styles from 'styles/Tabbed.module.scss';

export default function Tabbed({
  children,
  tabNames,
  start = 0,
  onChange,
}: {
  children: React.ReactNode[];
  tabNames: string[];
  start?: number;
  onChange?: (tab: number) => void;
}) {
  assert(tabNames.length === children.length, 'Incorrect number of tab names');
  const [tab, setTab] = useState(start);
  const changeTab = (i: number) => {
    if (i === tab) return;
    setTab(i);
    onChange && onChange(i);
  };

  return (
    <div className={styles['tabs-container']}>
      <div className={styles.tabs}>
        {tabNames.map((name, i) => (
          <div
            className={classnames(styles.tab, {
              [styles.active]: i === tab,
              [styles.crowded]: tabNames.length > 2,
            })}
            onClick={() => changeTab(i)}
            key={i}
          >
            {name}
          </div>
        ))}
      </div>
      {children.map((content, i) => (
        <div hidden={i !== tab} key={i}>
          {content}
        </div>
      ))}
    </div>
  );
}
