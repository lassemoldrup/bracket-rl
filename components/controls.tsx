'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Controls.module.scss';
import { toBlob } from 'html-to-image';
import FileSaver from 'file-saver';

export default function Controls({
  formatElement,
  clearFormat,
}: {
  formatElement: HTMLElement | null,
  clearFormat: () => void,
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const captureBracket = async () => {
    if (!formatElement) return;

    setIsDownloading(true);

    // Try to fix Safari being weird, see
    // https://github.com/bubkoo/html-to-image/issues/361
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari)
      for (let i = 0; i < 2; i++)
        await toBlob(formatElement, {
          includeQueryParams: true,
        });

    const blob = await toBlob(formatElement, {
      backgroundColor: styles.mainBgColor,
      includeQueryParams: true,
      style: {
        scale: '98%',
      },
    });
    if (blob)
      FileSaver.saveAs(blob, 'bracket.png');

    setIsDownloading(false);
  };

  return (
    <div className={styles.controls}>
      <button onClick={captureBracket} disabled={isDownloading}
        style={{ opacity: isDownloading ? 0 : 1, }}>
        <Image src='/download-image-icon.svg' width={29} height={30} alt='Export PNG image.' />
      </button>
      <div className={styles.spinner} style={{ opacity: isDownloading ? 1 : 0 }}>
        <Image src='/wait-loader-icon.svg' width={30} height={30} alt='Downloading image...' />
      </div>
      <button onClick={clearFormat} disabled={isDownloading}>Clear</button>
    </div>
  );
}