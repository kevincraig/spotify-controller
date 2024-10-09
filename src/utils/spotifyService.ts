import {SpotifyApi, Track} from '@spotify/web-api-ts-sdk';

let spotifyApi: SpotifyApi | null = null;

export const initializeSpotify = async (clientId: string, redirectUri: string): Promise<SpotifyApi> => {
    if (!spotifyApi) {
        spotifyApi = SpotifyApi.withUserAuthorization(clientId, redirectUri, [
            'user-read-private',
            'user-read-email',
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-library-read',
            'user-library-modify'
        ]);
    }
    return spotifyApi;
};

export const authenticateSpotify = async (api: SpotifyApi): Promise<boolean> => {
    try {
        const accessToken = await api.getAccessToken();
        return !!accessToken;
    } catch (error) {
        console.error('Authentication failed:', error);
        return false;
    }
};

export const loginToSpotify = async (api: SpotifyApi): Promise<void> => {
    await api.authenticate();
};

export const getCurrentTrack = async (api: SpotifyApi) => {
    try {
        const response = await api.player.getCurrentlyPlayingTrack();
        if (response && response.item && response.item.type === 'track') {
            const track = response.item as Track;
            return {
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                albumArt: track.album.images[0]?.url,
                isPlaying: response.is_playing
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching current track:', error);
        return null;
    }
};