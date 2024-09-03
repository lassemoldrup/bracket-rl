import { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import 'styles/global.scss';
import styles from 'styles/RootLayout.module.scss';

export const metadata: Metadata = {
  title: 'Rocket League Bracket',
  icons: '/favicon.ico',
  description: 'Rocket League Esports bracket prediction tool',
};

const exo_2 = Exo_2({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={exo_2.className}>
      <body>
        <div className={styles.container}>
          <main className={styles.content}>{children}</main>
          <footer className={styles.footer}>
            Bracket data and images from{' '}
            <a href="https://liquipedia.net/rocketleague">Liquipedia</a>.
          </footer>
        </div>
      </body>
    </html>
  );
}
