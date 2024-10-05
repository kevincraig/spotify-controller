// src/utils/spotifyApi.ts
import {SpotifyApi} from "@spotify/web-api-ts-sdk";
import {PlaybackState} from "@/types";

export const fetchAccessToken = async (sdk: SpotifyApi): Promise<string | null> => {
    const tokenResponse = await sdk.getAccessToken();
    return tokenResponse ? tokenResponse.access_token : null;
};

export const fetchLikedStatus = async (accessToken: string, trackId: string): Promise<boolean> => {
    const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    return data[0];
};

export const fetchPlaybackState = async (accessToken: string): Promise<PlaybackState | null> => {
    const response = await fetch(`https://api.spotify.com/v1/me/player`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data || null;
};

export const toggleShuffle = async (accessToken: string, shuffle: boolean): Promise<void> => {
    await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${shuffle}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
};

export const toggleRepeat = async (accessToken: string, repeatState: 'off' | 'context' | 'track'): Promise<void> => {
    await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${repeatState}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
};