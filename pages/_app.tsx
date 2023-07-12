import { ComponentType } from 'react';
import '../styles/global.scss';

interface AppProps {
    Component: ComponentType,
    pageProps: object,
}

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}
