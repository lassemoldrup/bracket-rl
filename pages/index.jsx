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

  const captureBracket = async () => {
    const bracketDOMNode = document.getElementsByClassName(bracketStyles.bracket)[0];
    const blob = await toBlob(bracketDOMNode, {
      backgroundColor: styles.mainBgColor,
    });
    if (window.saveAs)
      window.saveAs(blob, 'bracket.png');
    else
      FileSaver.saveAs(blob, 'bracket.png');
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
          <button onClick={captureBracket}>
            {/* loading='eager', since, otherwise, export doesn't work on Webkit browsers */}
            <Image src='download-image-icon.svg' width={29} height={30} alt={'Export PNG image.'} loading='eager' />
          </button>
          <button onClick={() => setBracket(new DoubleElimBracket(teams, []))}>Clear</button>
        </div>
      </main>

      <footer className={styles.footer}>
        Bracket data and images from <a href='https://liquipedia.net/rocketleague'>Liquipedia</a>.
      </footer>
    </div>
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