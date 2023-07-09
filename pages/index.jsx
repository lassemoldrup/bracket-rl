import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { getDoubleElim } from '../libs/liquipedia';
import DoubleElim from '../components/bracket';
import { DoubleElimBracket } from '../libs/bracket';

export default function Home({ teams, matches }) {
  const bracket = new DoubleElimBracket(teams, matches);
  return (
    <div className={styles.container}>
      <Head>
        <title>Rocket League Bracket</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.content}>
        <DoubleElim initBracket={bracket} />
      </main>

      <footer className={styles.footer}>
        Bracket data and images from <a href='https://liquipedia.net'>Liquipedia</a>.
      </footer>
    </div>
  )
}

export async function getStaticProps() {
  const event = 'Rocket_League_Championship_Series/2022-23/Spring';
  // const event = 'Rocket_League_Championship_Series/2022-23/Spring/Asia-Pacific/Open'
  const bracketSection = 13;
  // const bracketSection = 9;
  const [teams, matches] = await getDoubleElim(event, bracketSection);
  return {
    props: {
      teams,
      matches,
    },
  };
}