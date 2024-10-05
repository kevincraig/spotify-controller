// src/utils/spotifyApi.ts
import {SpotifyApi} from "@spotify/web-api-ts-sdk";
import {PlaybackState} from "@/types";

let accessToken: string | null = null;
let tokenExpirationTime: number | null = null;

const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 60000; // 1 minute

export const setAccessToken = (token: string, expiresIn: number) => {
    accessToken = token;
    tokenExpirationTime = Date.now() + expiresIn * 1000;
};

export const getAccessToken = () => {
    if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
        return accessToken;
    }
    return null;
};

const getCachedData = (key: string) => {
    const cachedItem = cache[key];
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
        return cachedItem.data;
    }
    return null;
};

const setCachedData = (key: string, data: any) => {
    cache[key] = {data, timestamp: Date.now()};
};

const exponentialBackoff = async (fn: () => Promise<any>, maxRetries = 5, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error.status === 429 && i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
};

export const fetchAccessToken = async (sdk: SpotifyApi): Promise<string | null> => {
    return exponentialBackoff(async () => {
        const tokenResponse = await sdk.getAccessToken();
        if (tokenResponse) {
            setAccessToken(tokenResponse.access_token, tokenResponse.expires_in);
            return tokenResponse.access_token;
        }
        return null;
    });
};

export const fetchLikedStatus = async (trackId: string): Promise<boolean> => {
    const cacheKey = `liked_${trackId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData !== null) return cachedData;

    return exponentialBackoff(async () => {
        const token = getAccessToken();
        if (!token) throw new Error("No access token available");

        const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCachedData(cacheKey, data[0]);
        return data[0];
    });
};

export const fetchPlaybackState = async (): Promise<PlaybackState | null> => {
    const cacheKey = 'playback_state';
    const cachedData = getCachedData(cacheKey);
    if (cachedData !== null) return cachedData;

    return exponentialBackoff(async () => {
        const token = getAccessToken();
        if (!token) throw new Error("No access token available");

        const response = await fetch(`https://api.spotify.com/v1/me/player`, {
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!response.ok) {
            if (response.status === 204) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
    });
};

// ... (keep other functions like toggleShuffle and toggleRepeat)