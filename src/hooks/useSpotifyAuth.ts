// src/hooks/useSpotifyAuth.ts

import {useState, useEffect, useCallback} from 'react';
import {initializeSpotify, authenticateSpotify, loginToSpotify} from '@/utils/spotifyService';
import {SpotifyApi} from '@spotify/web-api-ts-sdk';

export const useSpotifyAuth = () => {
    const [state, setState] = useState({
        spotifyApi: null as SpotifyApi | null,
        isAuthenticated: false,
        isLoading: true,
        error: null as Error | null
    });

    const initialize = useCallback(async () => {
        try {
            const api = await initializeSpotify(
                process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
                process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!
            );
            const authResult = await authenticateSpotify(api);
            setState(prevState => ({
                ...prevState,
                spotifyApi: api,
                isAuthenticated: authResult,
                isLoading: false
            }));
        } catch (err) {
            setState(prevState => ({
                ...prevState,
                error: err instanceof Error ? err : new Error('Failed to initialize Spotify'),
                isLoading: false
            }));
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const login = useCallback(async () => {
        if (state.spotifyApi) {
            setState(prevState => ({...prevState, isLoading: true}));
            try {
                await loginToSpotify(state.spotifyApi);
                // The page will redirect to Spotify for authentication,
                // so we don't need to update the state here
            } catch (err) {
                setState(prevState => ({
                    ...prevState,
                    error: err instanceof Error ? err : new Error('Failed to authenticate with Spotify'),
                    isLoading: false
                }));
            }
        }
    }, [state.spotifyApi]);

    return {...state, login};
};