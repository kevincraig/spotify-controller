import React, {useState, useEffect, useCallback} from 'react';
import PlaybackControls from '@/components/PlaybackControls';
import DeviceInfo from '@/components/DeviceInfo';
import TrackTimeBar from '@/components/TrackTimeBar';
import TrackInfo from '@/components/TrackInfo';
import {fetchAccessToken, fetchLikedStatus, fetchPlaybackState} from '@/utils/spotifyApi';

import {NowPlayingProps} from '@/types';
import {Episode, Track} from "@spotify/web-api-ts-sdk";

const LOGO_PATH = '/images/spotify_full_logo_rgb_white.png';
const NowPlaying = ({item, isPlaying, className = '', sdk, device}: NowPlayingProps): React.ReactElement | null => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [currentItem, setCurrentItem] = useState<Track | Episode | null>(null);

    const fetchToken = useCallback(async () => {
        try {
            const token = await fetchAccessToken(sdk);
            setAccessToken(token);
        } catch (err) {
            setError("Failed to fetch access token");
            console.error(err);
        }
    }, [sdk]);

    const fetchLikeStatus = useCallback(async () => {
        if (item && accessToken) {
            try {
                const liked = await fetchLikedStatus(accessToken, item.id);
                console.log(`Fetched like status for track ${item.id}: ${liked}`);
                setIsLiked(liked);
            } catch (err) {
                setError("Failed to fetch like status");
                console.error(err);
            }
        }
    }, [item, accessToken]);

    const fetchState = useCallback(async () => {
        if (accessToken) {
            try {
                const data = await fetchPlaybackState(accessToken);
                if (data && data.item && data.progress_ms && data.item.duration_ms) {
                    setProgress(data.progress_ms);
                    setDuration(data.item.duration_ms);
                }
            } catch (err) {
                setError("Failed to fetch playback state");
                console.error(err);
            }
        }
    }, [accessToken]);

    useEffect(() => {
        fetchToken();
    }, [fetchToken]);

    useEffect(() => {
        if (!currentItem || currentItem.id !== item?.id) {
            setCurrentItem(item);
            fetchLikeStatus();
        }

        if (item && accessToken) {
            console.log(`Track changed or accessToken updated. Fetching like status for track ${item.id}`);
            fetchLikeStatus();
        }
    }, [item, accessToken, fetchLikeStatus, currentItem]);

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 1000);
        return () => clearInterval(interval);
    }, [fetchState]);

    const formatTime = useCallback((ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, []);

    if (!item || !accessToken) return null;

    return (
        <div className={className} style={{width: '50vw'}} role="region" aria-label="Now Playing">
            {error && <div role="alert" className="error-message">{error}</div>}
            <TrackInfo item={item} isLiked={isLiked} accessToken={accessToken} logo={LOGO_PATH}>
                <DeviceInfo deviceType={device?.type || ""} deviceName={device?.name || ""}/>
                <PlaybackControls sdk={sdk} isPlaying={isPlaying} deviceId={device?.id || ""}/>
                <TrackTimeBar initialProgress={progress} duration={duration} isPlaying={isPlaying}
                              formatTime={formatTime}/>
            </TrackInfo>
        </div>
    );
}

export default NowPlaying;