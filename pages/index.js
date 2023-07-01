import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { getLatestBracket } from '../libs/bracket';
import Bracket from '../components/bracket';

export default function Home({ latestBracket }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.content}>
        <Bracket bracket={latestBracket} />
      </main>

      <footer className={styles.footer}>
        Footer
      </footer>
    </div>
  )
}

export async function getStaticProps() {
  const latestBracket = await getLatestBracket();
  return {
    props: {
      latestBracket,
    },
  };
}