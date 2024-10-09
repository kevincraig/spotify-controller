// src/hooks/useSpotifyAuth.ts

import {useState, useEffect} from 'react';
import {SpotifyApi} from '@spotify/web-api-ts-sdk';

export const useSpotifyAuth = () => {
    const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initializeSpotify = async () => {
            try {
                const api = SpotifyApi.withUserAuthorization(
                    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
                    process.env.NEXT_PUBLIC_REDIRECT_URI!,
                    ['user-read-private', 'user-read-email', 'user-modify-playback-state', 'user-read-playback-state']
                );
                await api.authenticate();
                setSpotifyApi(api);
                setIsAuthenticated(true);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeSpotify();
    }, []);

    const login = () => {
        // Implement login logic if needed
    };

    return {spotifyApi, isAuthenticated, isLoading, error, login};
};