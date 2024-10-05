// src/components/NowPlaying.tsx

import {useState, useEffect, useCallback} from 'react';
import {getCurrentTrack} from '@/utils/spotifyService';
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';
import Image from 'next/image';

interface Track {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    isPlaying: boolean;
}

const NowPlaying = () => {
    const {spotifyApi, isAuthenticated, isLoading, error: authError, login} = useSpotifyAuth();
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchTrack = useCallback(async () => {
        if (!spotifyApi || !isAuthenticated) return;

        try {
            const track = await getCurrentTrack(spotifyApi);
            setCurrentTrack(track);
        } catch (err) {
            setError('Failed to fetch current track');
            console.error(err);
        }
    }, [spotifyApi, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTrack();
            const interval = setInterval(fetchTrack, 30000); // Fetch every 30 seconds
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchTrack]);

    if (isLoading) {
        return <div className="text-center py-4">Initializing Spotify...</div>;
    }

    if (authError) {
        return <div className="text-red-500 text-center py-4">Error: {authError.message}</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <h1 className="text-3xl font-bold mb-4">Connect to Spotify</h1>
                <button
                    onClick={login}
                    className="px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition duration-300"
                >
                    Login with Spotify
                </button>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">Error: {error}</div>;
    }

    if (!currentTrack) {
        return <div className="text-center py-4">No track currently playing</div>;
    }

    return (
        <div className="flex text-white w-full">
            <div className="relative w-96 h-96 mb-4">
                <Image
                    src={currentTrack.albumArt}
                    alt={`${currentTrack.album} cover`}
                    width={325}
                    height={325}
                    className="rounded-lg"
                />
            </div>
            <div className="flex flex-col px-0">
                <h1 className="text-4xl font-bold mb-2">{currentTrack.name}</h1>
                <p className="text-lg mb-1">{currentTrack.artist}</p>
                <p className="text-sm text-gray-400 mb-2">{currentTrack.album}</p>
                <p className="text-sm font-semibold">
                    {currentTrack.isPlaying ? 'Now Playing' : 'Paused'}
                </p>
            </div>
        </div>
    );
};

export default NowPlaying;