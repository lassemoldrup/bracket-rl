'use client';

import assert from 'assert';
import classnames from 'classnames';
import _ from 'lodash';
import { useState } from 'react';
import styles from 'styles/Tabbed.module.scss';

export default function Tabbed({
  children,
  tabNames,
}: {
  children: React.ReactNode[];
  tabNames: string[];
}) {
  assert(tabNames.length === children.length);
  const [tab, setTab] = useState(0);

  return (
    <div className={styles['tabs-container']}>
      <div className={styles.tabs}>
        {tabNames.map((name, i) => (
          <div
            className={classnames(styles.tab, { [styles.active]: i === tab })}
            onClick={() => setTab(i)}
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
