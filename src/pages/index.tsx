// src/pages/index.tsx

import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';
import NowPlaying from '@/components/NowPlaying';

export default function Home() {
    const {isAuthenticated, isLoading, login} = useSpotifyAuth();
    const router = useRouter();

    useEffect(() => {
        if (router.query.code) {
            login();
        }
    }, [router.query.code, login]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex justify-start p-4">
            {isAuthenticated ? (
                <NowPlaying/>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-bold mb-8">Welcome to Spotify HiFi Client</h1>
                    <button
                        onClick={login}
                        className="px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition duration-300"
                    >
                        Login with Spotify
                    </button>
                </div>
            )}
        </div>
    );
}