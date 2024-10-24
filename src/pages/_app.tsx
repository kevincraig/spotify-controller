// src/pages/_app.tsx

import type {AppProps} from 'next/app';
import '@/styles/globals.css'
import Layout from '@/components/Layout'
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';

function MyApp({Component, pageProps}: AppProps) {
    const {getSpotifyApi} = useSpotifyAuth();

    return (
        <Layout>
            <Component {...pageProps} getSpotifyApi={getSpotifyApi}  />
        </Layout>
    )
}

export default MyApp