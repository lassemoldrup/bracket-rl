import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.scss';
import bracketStyles from '../styles/DoubleElim.module.scss';
import { getDoubleElim } from '../libs/liquipedia';
import DoubleElim from '../components/bracket';
import { DoubleElimBracket } from '../libs/bracket';
import { useState } from 'react';
import { toBlob } from 'html-to-image';
import FileSaver from 'file-saver';

export default function Home(init: FormatInitializer) {
  const [bracket, setBracket] = useState(new DoubleElimBracket(init));
  const [isDownloading, setIsDownloading] = useState(false);

  const captureBracket = async () => {
    setIsDownloading(true);
    const bracketDOMNode = document.getElementsByClassName(bracketStyles.bracket)[0] as HTMLDivElement;

    // Try to fix Safari being weird, see
    // https://github.com/bubkoo/html-to-image/issues/361
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari)
      for (let i = 0; i < 2; i++)
        await toBlob(bracketDOMNode, {
          backgroundColor: styles.mainBgColor,
          includeQueryParams: true,
        });

    const blob = await toBlob(bracketDOMNode, {
      backgroundColor: styles.mainBgColor,
      includeQueryParams: true,
    });
    if (blob)
      FileSaver.saveAs(blob, 'bracket.png');

    setIsDownloading(false);
  };

  const clearBracket = () => setBracket(new DoubleElimBracket({ ...init, matchScores: [] }));

  return (
    <div className={styles.container}>
      <Head>
        <title>Rocket League Bracket</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.content}>
        <DoubleElim bracket={bracket} setBracket={setBracket} />
        <div className={styles.controls}>
          <button onClick={captureBracket} disabled={isDownloading}
            style={{ opacity: isDownloading ? 0 : 1, }}>
            <Image src='download-image-icon.svg' width={29} height={30} alt='Export PNG image.' />
          </button>
          <div className={styles.spinner} style={{ opacity: isDownloading ? 1 : 0 }}>
            <Image src='wait-loader-icon.svg' width={30} height={30} alt='Downloading image...' />
          </div>
          <button onClick={clearBracket} disabled={isDownloading}>Clear</button>
        </div>
      </main >

      <footer className={styles.footer}>
        Bracket data and images from <a href='https://liquipedia.net/rocketleague'>Liquipedia</a>.
      </footer>
    </div >
  )
}

export async function getStaticProps() {
  const event = 'Rocket_League_Championship_Series/2022-23/Spring';
  // const event = 'Rocket_League_Championship_Series/2022-23/Spring/Asia-Pacific/Open'
  // const event = 'Rocket_League_Championship_Series/2022-23/Spring/Europe/Cup';
  const init = await getDoubleElim(event);
  return {
    props: init,
  };
}
