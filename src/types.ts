import {Track, Episode, SpotifyApi} from '@spotify/web-api-ts-sdk';
import React from "react";

export interface SpotifyDevice {
    id: string | null;
    name: string | null;
    type: string | null;
    is_active: boolean;
    is_restricted: boolean;
    volume_percent: number | null;
    // Add other properties if needed
}

export interface NowPlayingProps {
    item: Track | Episode | null;
    isPlaying: boolean;
    className?: string;
    sdk: SpotifyApi;
    device: SpotifyDevice | null;
}

export interface PlaybackControlsProps {
    sdk: SpotifyApi;
    isPlaying: boolean;
    deviceId: string | null;
}

export interface PlaybackState {
    item: {
        id: string;
        name: string;
        duration_ms: number;
        [key: string]: any;
    };
    progress_ms: number;

    [key: string]: any;
}

export interface DeviceDrawerIconProps {
    onClick: () => void;
    size?: number;
    style?: React.CSSProperties;
}

export interface SpotifyLikeUnlikeProps {
    trackId: string;
    initialLikeState: boolean;
    accessToken: string | null;
}