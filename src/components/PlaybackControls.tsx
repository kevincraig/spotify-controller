import React from 'react';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PlaybackControlsProps {
    sdk: SpotifyApi;
    isPlaying: boolean;
    deviceId: string | null;
}

const PlaybackControls = ({ sdk, isPlaying, deviceId }: PlaybackControlsProps) => {
    const iconSize = 36;
    const handlePlayPause = async () => {
        if (!deviceId) {
            console.error('No active device found');
            return;
        }
        try {
            if (isPlaying) {
                await sdk.player.pausePlayback(deviceId);
            } else {
                await sdk.player.startResumePlayback(deviceId);
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };

    const handlePrevious = async () => {
        if (!deviceId) {
            console.error('No active device found');
            return;
        }
        try {
            await sdk.player.skipToPrevious(deviceId);
        } catch (error) {
            console.error('Error skipping to previous track:', error);
        }
    };

    const handleNext = async () => {
        if (!deviceId) {
            console.error('No active device found');
            return;
        }
        try {
            await sdk.player.skipToNext(deviceId);
        } catch (error) {
            console.error('Error skipping to next track:', error);
        }
    };

    return (
        <div className="flex space-x-4">
            <button
                onClick={handlePrevious}
                className="p-2 pl-0 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={!deviceId}
            >
                <SkipBack fill="white" strokeWidth={4} size={iconSize - 10} />
            </button>
            <button
                onClick={handlePlayPause}
                className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={!deviceId}
            >
                {isPlaying ? <Pause fill="white" strokeWidth={1} size={iconSize + 10 } /> : <Play fill="white" size={iconSize} />}
            </button>
            <button
                onClick={handleNext}
                className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={!deviceId}
            >
                <SkipForward fill="white" strokeWidth={4} size={iconSize - 10} />
            </button>
        </div>
    );
};

export default PlaybackControls;