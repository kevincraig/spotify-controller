// src/pages/index.tsx

import {useEffect} from 'react';
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';
import {clearAuthData} from "@/utils/authUtils";
import NowPlaying from '@/components/NowPlaying';

export default function Home() {
    const {isAuthenticated, isLoading, error, login, getSpotifyApi} = useSpotifyAuth();

    useEffect(() => {
        if (error && error.message.includes("Insufficient client scope")) {
            clearAuthData();
            login(); // This will redirect the user to Spotify to re-authenticate with the new scope
        }
    }, [error, login]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error.message}</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-screen">
                <button
                    onClick={login}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Login to Spotify
                </button>
            </div>
        );
    }

    return <NowPlaying getSpotifyApi={getSpotifyApi}/>;
};