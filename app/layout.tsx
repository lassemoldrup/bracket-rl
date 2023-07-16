import { Metadata } from 'next';
import 'styles/global.scss';
import styles from 'styles/RootLayout.module.scss';

export const metadata: Metadata = {
  title: 'Rocket League Bracket',
  icons: '/favicon.ico',
  description: 'Rocket Leauge Esports bracket prediction tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><div className={styles.container}>
        <main className={styles.content}>
          {children}
        </main >
        <footer className={styles.footer}>
          Bracket data and images from <a href='https://liquipedia.net/rocketleague'>Liquipedia</a>.
        </footer>
      </div ></body>
    </html>
  )
}
