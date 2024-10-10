// src/hooks/useSpotifyAuth.ts

import {useState, useEffect, useCallback} from 'react';
import {SpotifyApi} from '@spotify/web-api-ts-sdk';

const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-library-read',
    'user-library-modify',
    'user-read-recently-played'  // Add this scope
];

export const useSpotifyAuth = () => {
    const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const initializeSpotify = useCallback(async () => {
        try {
            const api = SpotifyApi.withUserAuthorization(
                process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
                process.env.NEXT_PUBLIC_REDIRECT_URI!,
                SCOPES
            );
            await api.authenticate();
            setSpotifyApi(api);
            setIsAuthenticated(true);
            setIsLoading(false);
        } catch (err) {
            setError(err as Error);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeSpotify();
    }, [initializeSpotify]);

    const login = useCallback(() => {
        initializeSpotify();
    }, [initializeSpotify]);

    const getSpotifyApi = useCallback(() => {
        if (!spotifyApi) {
            throw new Error('Spotify API is not initialized');
        }
        return spotifyApi;
    }, [spotifyApi]);

    return {isAuthenticated, isLoading, error, login, getSpotifyApi};
};