import {useState, useCallback, useEffect, useRef} from 'react';
import {SpotifyApi, Track, Episode} from '@spotify/web-api-ts-sdk';

type RepeatMode = 'off' | 'context' | 'track';

interface TrackInfo {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    type: 'track' | 'episode';
}

interface DeviceInfo {
    id: string | null;
    name: string | null;
    type: string | null;
}

interface SpotifyError extends Error {
    status?: number;
    message: string;
}

interface LikedTrackCache {
    [trackId: string]: {
        isLiked: boolean;
        timestamp: number;
    };
}

const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 15000; // 15 seconds
const MAX_RETRIES = 5;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const LONG_POLL_INTERVAL = 15000; // 15 seconds
const SHORT_POLL_INTERVAL = 1000; // 1 second
const SHORT_POLL_DURATION = 5000; // 5 seconds

export const usePlaybackControls = (spotifyApi: SpotifyApi | null) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [currentTrack, setCurrentTrack] = useState<TrackInfo | null>(null);
    const [lastPlayedTrack, setLastPlayedTrack] = useState<TrackInfo | null>(null);
    const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const retryCount = useRef(0);
    const retryDelay = useRef(INITIAL_RETRY_DELAY);
    const likedTracksCache = useRef<LikedTrackCache>({});
    const [pollInterval, setPollInterval] = useState(LONG_POLL_INTERVAL);
    const shortPollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const createTrackInfo = (item: Track | Episode): TrackInfo => {
        if ('album' in item) {
            // It's a Track
            return {
                id: item.id,
                name: item.name,
                artist: item.artists.map((artist) => artist.name).join(', '),
                album: item.album.name,
                albumArt: item.album.images[0]?.url || '',
                type: 'track',
            };
        } else {
            // It's an Episode
            return {
                id: item.id,
                name: item.name,
                artist: item.show.publisher,
                album: item.show.name,
                albumArt: item.images[0]?.url || '',
                type: 'episode',
            };
        }
    };

    const fetchWithRetry = useCallback(async <T>(
        fetchFunction: () => Promise<T>,
        maxRetries: number = MAX_RETRIES
    ): Promise<T> => {
        try {
            await wait(retryDelay.current); // Wait before making the request
            const result = await fetchFunction();
            retryCount.current = 0;
            retryDelay.current = INITIAL_RETRY_DELAY;
            return result;
        } catch (error) {
            const spotifyError = error as SpotifyError;
            if (spotifyError.status === 429 && retryCount.current < maxRetries) {
                retryCount.current += 1;
                retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_DELAY);
                console.log(`Rate limited. Retrying in ${retryDelay.current}ms...`);
                return fetchWithRetry(fetchFunction, maxRetries);
            }
            throw spotifyError;
        }
    }, []);

    const fetchTrackLikedStatus = useCallback(async (trackId: string) => {
        if (!spotifyApi) return;

        const cachedStatus = likedTracksCache.current[trackId];
        if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_EXPIRY) {
            setIsLiked(cachedStatus.isLiked);
            return;
        }

        try {
            const response = await fetchWithRetry(() =>
                spotifyApi.currentUser.tracks.hasSavedTracks([trackId])
            );
            const isLiked = response[0];
            setIsLiked(isLiked);
            likedTracksCache.current[trackId] = {
                isLiked,
                timestamp: Date.now()
            };
        } catch (error) {
            const spotifyError = error as SpotifyError;
            console.error('Failed to fetch track liked status', spotifyError.message);
            setError('Failed to fetch track liked status. Please try again later.');
        }
    }, [spotifyApi, fetchWithRetry]);

    const fetchPlaybackState = useCallback(async () => {
        if (!spotifyApi) return;
        try {
            const playbackState = await fetchWithRetry(() =>
                spotifyApi.player.getPlaybackState()
            );
            if (playbackState && playbackState.item && 'id' in playbackState.item) {
                const trackInfo = createTrackInfo(playbackState.item);
                setCurrentTrack(trackInfo);
                setLastPlayedTrack(trackInfo);
                setIsPlaying(playbackState.is_playing);
                setIsShuffle(playbackState.shuffle_state);
                setRepeatMode(playbackState.repeat_state as RepeatMode);
                setDeviceId(playbackState.device.id);
                setCurrentDevice({
                    id: playbackState.device.id,
                    name: playbackState.device.name,
                    type: playbackState.device.type,
                });
                fetchTrackLikedStatus(trackInfo.id);
            } else {
                setCurrentTrack(null);
                setIsPlaying(false);
                setCurrentDevice(null);
            }
        } catch (error) {
            const spotifyError = error as SpotifyError;
            console.error('Failed to fetch playback state', spotifyError.message);
            setError('Failed to fetch playback state. Please try again later.');
        }
    }, [spotifyApi, fetchTrackLikedStatus, fetchWithRetry]);


    const toggleLike = useCallback(async () => {
        if (!spotifyApi || !currentTrack) return;
        try {
            if (isLiked) {
                await fetchWithRetry(() =>
                    spotifyApi.currentUser.tracks.removeSavedTracks([currentTrack.id])
                );
            } else {
                await fetchWithRetry(() =>
                    spotifyApi.currentUser.tracks.saveTracks([currentTrack.id])
                );
            }
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            likedTracksCache.current[currentTrack.id] = {
                isLiked: newIsLiked,
                timestamp: Date.now()
            };
        } catch (error) {
            const spotifyError = error as SpotifyError;
            console.error('Failed to toggle like', spotifyError.message);
            setError('Failed to update like status. Please try again later.');
        }
    }, [spotifyApi, currentTrack, isLiked, fetchWithRetry]);

    const startShortPolling = useCallback(() => {
        setPollInterval(SHORT_POLL_INTERVAL);
        if (shortPollTimeoutRef.current) {
            clearTimeout(shortPollTimeoutRef.current);
        }
        shortPollTimeoutRef.current = setTimeout(() => {
            setPollInterval(LONG_POLL_INTERVAL);
        }, SHORT_POLL_DURATION);
    }, []);

    const handleControlAction = useCallback(async (action: () => Promise<void>) => {
        try {
            await action();
            startShortPolling();
            await fetchPlaybackState();
        } catch (error) {
            const spotifyError = error as SpotifyError;
            console.error('Failed to perform action', spotifyError.message);
            setError('Failed to perform action. Please try again.');
        }
    }, [fetchPlaybackState, startShortPolling]);

    const togglePlay = useCallback(() => {
        return handleControlAction(async () => {
            if (isPlaying) {
                if (deviceId != null) {
                    await spotifyApi!.player.pausePlayback(deviceId);
                }
            } else {
                if (deviceId != null) {
                    await spotifyApi!.player.startResumePlayback(deviceId);
                }
            }
        });
    }, [spotifyApi, isPlaying, handleControlAction]);

    useCallback(async () => {
        if (!spotifyApi) return;
        try {
            const recentTracks = await spotifyApi.player.getRecentlyPlayedTracks(1);
            if (recentTracks.items.length > 0) {
                const mostRecentTrack = recentTracks.items[0].track;
                const trackInfo = createTrackInfo(mostRecentTrack);
                setLastPlayedTrack(trackInfo);
                if (!currentTrack) {
                    setCurrentTrack(trackInfo);
                    fetchTrackLikedStatus(trackInfo.id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch recently played tracks', error);
        }
    }, [spotifyApi, currentTrack, fetchTrackLikedStatus]);

    const previousTrack = useCallback(() => {
        return handleControlAction(() => spotifyApi!.player.skipToPrevious(deviceId!));
    }, [handleControlAction, spotifyApi, deviceId]);

    const nextTrack = useCallback(() => {
        return handleControlAction(() => spotifyApi!.player.skipToNext(deviceId!));
    }, [handleControlAction, spotifyApi, deviceId]);

    const toggleShuffle = useCallback(() => {
        return handleControlAction(() => spotifyApi!.player.togglePlaybackShuffle(!isShuffle));
    }, [spotifyApi, isShuffle, handleControlAction]);

    const toggleRepeat = useCallback(() => {
        return handleControlAction(() => {
            const nextMode = repeatMode === 'off' ? 'context' : repeatMode === 'context' ? 'track' : 'off';
            return spotifyApi!.player.setRepeatMode(nextMode);
        });
    }, [spotifyApi, repeatMode, handleControlAction]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const startFetchingPlaybackState = () => {
            fetchPlaybackState();
            intervalId = setInterval(fetchPlaybackState, pollInterval);
        };

        if (spotifyApi) {
            startFetchingPlaybackState();
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (shortPollTimeoutRef.current) {
                clearTimeout(shortPollTimeoutRef.current);
            }
        };
    }, [fetchPlaybackState, spotifyApi, pollInterval]);

    return {
        isPlaying,
        isShuffle,
        repeatMode,
        togglePlay,
        previousTrack,
        nextTrack,
        toggleShuffle,
        toggleRepeat,
        deviceId,
        currentTrack,
        lastPlayedTrack,
        currentDevice,
        isLiked,
        toggleLike,
        error,
    };
};