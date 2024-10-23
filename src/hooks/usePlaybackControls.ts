import {useState, useCallback, useEffect, useRef} from 'react';
import {SpotifyApi, Track, Episode, Device} from '@spotify/web-api-ts-sdk';

type RepeatMode = 'off' | 'context' | 'track';

interface TrackInfo {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    type: 'track' | 'episode';
}

// interface DeviceInfo {
//     id: string | null;
//     name: string | null;
//     type: string | null;
// }

interface SpotifyError extends Error {
    status?: number;
    message: string;
    response?: never;
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
    const initialFetchDone = useRef(false);
    const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const retryCount = useRef(0);
    const retryDelay = useRef(INITIAL_RETRY_DELAY);
    const likedTracksCache = useRef<LikedTrackCache>({});
    const [pollInterval, setPollInterval] = useState(LONG_POLL_INTERVAL);
    const shortPollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

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

    const spotifyApiWrapper = async <T>(apiCall: () => Promise<T>): Promise<T> => {
        try {
            const response = await apiCall();
            console.log('Raw API response:', response);
            return response;
        } catch (error) {
            if (error instanceof Response) {
                const text = await error.text();
                console.error('Raw API error response:', text);
                if (error.status === 429) {
                    const retryAfter = error.headers.get('Retry-After');
                    console.error(`Rate limited. Retry after ${retryAfter} seconds.`);
                }
                throw new Error(`API error: ${error.status} ${error.statusText}. Raw response: ${text}`);
            } else if (error instanceof Error) {
                console.error('Error in API call:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    };

    const fetchWithRetry = useCallback(async <T>(
        fetchFunction: () => Promise<T>,
        maxRetries: number = MAX_RETRIES
    ): Promise<T> => {
        try {
            await wait(retryDelay.current);
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
                setCurrentDevice(playbackState.device);
                setCurrentTime(playbackState.progress_ms / 1000);
                setDuration(playbackState.item.duration_ms / 1000);
                fetchTrackLikedStatus(trackInfo.id);
            } else {
                setCurrentTrack(null);
                setIsPlaying(false);
                setCurrentDevice(null);
                setCurrentTime(0);
                setDuration(0);
            }
        } catch (error) {
            const spotifyError = error as SpotifyError;
            console.error('Failed to fetch playback state', spotifyError.message);
            setError('Failed to fetch playback state. Please try again later.');
        }
    }, [spotifyApi, fetchTrackLikedStatus, fetchWithRetry]);

    const fetchLastPlayedTrack = useCallback(async () => {
        if (!spotifyApi) return;
        try {
            const recentTracks = await fetchWithRetry(() =>
                spotifyApi.player.getRecentlyPlayedTracks(1)
            );
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
            const spotifyError = error as SpotifyError;
            console.error('Failed to fetch recently played tracks', spotifyError.message);
            setError('Failed to fetch recently played tracks. Please try again later.');
        }
    }, [spotifyApi, fetchWithRetry, currentTrack, fetchTrackLikedStatus]);

    const saveOrRemoveTracks = useCallback((ids: string[], action: 'save' | 'remove'): Promise<void> => {
        if (!spotifyApi) {
            throw new Error('Spotify API is not initialized');
        }

        return spotifyApiWrapper(() => {
            if (action === 'save') {
                return spotifyApi.makeRequest("PUT", "me/tracks", {ids: ids});
                //return spotifyApi.currentUser.tracks.saveTracks(ids);
            } else {
                return spotifyApi.makeRequest("DELETE", "me/tracks", {ids: ids});
            }
        });
    }, [spotifyApi]);


    const toggleLike = useCallback(async () => {
        if (!spotifyApi || !currentTrack || !currentTrack.id) {
            setError('No track is currently playing or track ID is missing.');
            return;
        }
        console.log('Calling API with:', {
            method: isLiked ? 'removeSavedTracks' : 'saveTracks',
            trackId: currentTrack.id
        });
        try {
            await spotifyApiWrapper(() =>
                saveOrRemoveTracks([currentTrack.id], isLiked ? 'remove' : 'save')
            );
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            likedTracksCache.current[currentTrack.id] = {
                isLiked: newIsLiked,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Failed to toggle like', error);
            setError('Failed to update like status. Please try again later.');
        }
    }, [spotifyApi, currentTrack, isLiked, saveOrRemoveTracks]);


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
            console.error('Action error:', error);

            let errorMessage = 'Failed to perform action. Please try again.';
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                if (error.message.startsWith('API error:')) {
                    console.error('API error details:', error.message);
                }
                errorMessage += ' Error: ' + error.message;
            }

            setError(errorMessage);
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
    }, [handleControlAction, isPlaying, deviceId, spotifyApi]);

    const previousTrack = useCallback(() => {
        return handleControlAction(async () => {
            if (!spotifyApi || !deviceId) {
                throw new Error('Spotify API or device ID is not available');
            }
            console.log('Attempting to skip to previous track');
            const response = await spotifyApiWrapper(() => spotifyApi.player.skipToPrevious(deviceId));
            console.log('Skip to previous track response:', response);
            // No need to process the response, as we're not expecting any particular data
        });
    }, [handleControlAction, spotifyApi, deviceId]);

    const nextTrack = useCallback(() => {
        return handleControlAction(async () => {
            if (!spotifyApi || !deviceId) {
                throw new Error('Spotify API or device ID is not available');
            }
            console.log('Attempting to skip to next track');
            const response = await spotifyApiWrapper(() => spotifyApi.player.skipToNext(deviceId));
            console.log('Skip to next track response:', response);
            // No need to process the response, as we're not expecting any particular data
        });
    }, [handleControlAction, spotifyApi, deviceId]);

    const seekToPosition = useCallback(async (position: number) => {
        if (!spotifyApi || !deviceId) return;
        try {
            const positionMs = Math.floor(position * duration * 1000);
            await spotifyApiWrapper(() =>
                spotifyApi.player.seekToPosition(positionMs, deviceId)
            );
            setCurrentTime(position * duration);
        } catch (error) {
            console.error('Failed to seek to position', error);
            setError('Failed to seek to position. Please try again later.');
        }
    }, [spotifyApi, deviceId, duration]);

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
        if (spotifyApi && !initialFetchDone.current) {
            fetchLastPlayedTrack();
            initialFetchDone.current = true;
        }

        const startFetchingPlaybackState = () => {
            fetchPlaybackState();
            intervalId = setInterval(() => {
                fetchPlaybackState().catch(error => {
                    if (error.message.includes('rate limits')) {
                        clearInterval(intervalId);
                        setTimeout(startFetchingPlaybackState, 30000); // Wait for 30 seconds before retrying
                    }
                });
            }, pollInterval);
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
    }, [fetchPlaybackState, spotifyApi, pollInterval, fetchLastPlayedTrack]);

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
        currentTime,
        duration,
        seekToPosition,
    };
};