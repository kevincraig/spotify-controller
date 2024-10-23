// src/components/NowPlaying.tsx
import React, {useState, useEffect} from 'react';
import {usePlaybackControls} from '@/hooks/usePlaybackControls';
import PlaybackControls from './PlaybackControls';
import {SpotifyApi} from "@spotify/web-api-ts-sdk";
import Image from "next/image";

interface NowPlayingProps {
    getSpotifyApi: () => SpotifyApi;
}

const NowPlaying = ({getSpotifyApi}: NowPlayingProps) => {
    const [error, setError] = useState<string | null>(null);

    const {
        isPlaying,
        currentTrack,
        lastPlayedTrack,
        isShuffle,
        repeatMode,
        togglePlay,
        previousTrack,
        nextTrack,
        toggleShuffle,
        toggleRepeat,
        isLiked,
        toggleLike,
        currentDevice,
        currentTime,
        duration,
        seekToPosition,
    } = usePlaybackControls(getSpotifyApi());

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);



    const displayTrack = currentTrack || lastPlayedTrack;

    if (!displayTrack) {
        return (
            <>
                {/*<div className="text-center py-4 text-white">No track information available</div>*/}
                {/*<div className="text-center py-4 text-white">{process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}</div>*/}
            </>
        );
    }

    return (
        <div className="flex flex-col bg-black text-white">
            <div className="flex-grow p-2 ">
                {currentTrack && (
                    <div className="flex items-start space-x-4 mb-4">
                        <Image
                            src={currentTrack.albumArt}
                            alt={currentTrack.name}

                            className="h-64 w-64 rounded-xl flex-shrink-0"
                            width={1}
                            height={1}
                        />
                        <div className="flex flex-col py-8 justify-start gap-2">
                            <h2 className="text-4xl font-bold line-clamp-1">{currentTrack.name}</h2>
                            <p className="text-3xl  text-gray-400 line-clamp-1">{currentTrack.artist}</p>
                        </div>
                    </div>
                )}
                {/* You can add more content here if needed */}
            </div>
            <div className={"items-start"}>
                {currentTrack && (
                    <PlaybackControls
                        isPlaying={isPlaying}
                        isShuffle={isShuffle}
                        repeatMode={repeatMode}
                        isLiked={isLiked}
                        currentTime={currentTime}
                        duration={duration}
                        currentDevice={currentDevice}
                        onTogglePlay={togglePlay}
                        onPreviousTrack={previousTrack}
                        onNextTrack={nextTrack}
                        onToggleShuffle={toggleShuffle}
                        onToggleRepeat={toggleRepeat}
                        onToggleLike={toggleLike}
                        onSeek={seekToPosition}
                    />
                )}
            </div>
        </div>
    );
};

export default NowPlaying;