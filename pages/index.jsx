import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { getDoubleElim } from '../libs/liquipedia';
import DoubleElim from '../components/bracket';

export default function Home({ teams }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.content}>
        <DoubleElim teams={teams} />
      </main>

      <footer className={styles.footer}>
        Bracket data and images from <a href='https://liquipedia.net'>Liquipedia</a>.
      </footer>
    </div>
  )
}

export async function getStaticProps() {
  const event = 'Rocket_League_Championship_Series/2022-23/Spring';
  const bracketSection = 13;
  const teams = await getDoubleElim(event, bracketSection);
  return {
    props: {
      teams,
    },
  };
}