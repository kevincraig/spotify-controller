import { useState, useEffect } from 'react';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI; // Update this for production

if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error('Missing environment variables: NEXT_PUBLIC_SPOTIFY_CLIENT_ID or NEXT_PUBLIC_SPOTIFY_REDIRECT_URI');
}

export const useSpotifyAuth = () => {
    const [sdk, setSdk] = useState<SpotifyApi | null>(null);

    useEffect(() => {
        const initializeSdk = async () => {
            const sdk = SpotifyApi.withUserAuthorization(
                CLIENT_ID,
                REDIRECT_URI,
                [
                    'user-read-private',
                    'user-read-email',
                    'user-modify-playback-state',
                    'user-read-playback-state',
                    'user-library-read',
                    'user-library-modify',
                    'playlist-read-private',
                    'playlist-modify-public',
                    'playlist-modify-private',
                ]
            );

            try {
                await sdk.authenticate();
                setSdk(sdk);
            } catch (error) {
                console.error('Authentication failed:', error);
            }
        };

        initializeSdk();
    }, []);

    const login = () => {
        if (sdk) {
            sdk.authenticate();
        }
    };

    return { sdk, login };
};