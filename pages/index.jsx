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

export default function Home({ teams, matches }) {
  const [bracket, setBracket] = useState(new DoubleElimBracket(teams, matches));
  const [isDownloading, setIsDownloading] = useState(false);

  const captureBracket = async () => {
    setIsDownloading(true);
    const bracketDOMNode = document.getElementsByClassName(bracketStyles.bracket)[0];

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

    if (window.saveAs)
      window.saveAs(blob, 'bracket.png');
    else
      FileSaver.saveAs(blob, 'bracket.png');

    setIsDownloading(false);
  };

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
            style={isDownloading ? { opacity: 0, cursor: "default" } : {}}>
            <Image src='download-image-icon.svg' width={29} height={30} alt='Export PNG image.' />
          </button>
          <div className={styles.spinner} style={{ opacity: isDownloading ? 1 : 0 }}>
            <Image src='wait-loader-icon.svg' width={30} height={30} alt='Downloading image...' />
          </div>
          <button onClick={() => setBracket(new DoubleElimBracket(teams, []))}>Clear</button>
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
  const bracketSection = 13;
  // const bracketSection = 9;
  // const bracketSection = 11;
  const [teams, matches] = await getDoubleElim(event, bracketSection);
  return {
    props: {
      teams,
      matches,
    },
  };
}