// src/components/PlaybackControls.tsx

import React from 'react';
import {FaShuffle, FaBackwardStep, FaForwardStep, FaPlay, FaPause, FaHeart} from 'react-icons/fa6';
import {LuRepeat, LuRepeat1} from 'react-icons/lu';

type RepeatMode = 'off' | 'context' | 'track';

interface PlaybackControlsProps {
    isPlaying: boolean;
    isShuffle: boolean;
    repeatMode: RepeatMode;
    isLiked: boolean;
    onTogglePlay: () => void;
    onPreviousTrack: () => void;
    onNextTrack: () => void;
    onToggleShuffle: () => void;
    onToggleRepeat: () => void;
    onToggleLike: () => void;
}

const PlaybackControls = ({
                              isPlaying,
                              isShuffle,
                              repeatMode,
                              isLiked,
                              onTogglePlay,
                              onPreviousTrack,
                              onNextTrack,
                              onToggleShuffle,
                              onToggleRepeat,
                              onToggleLike
                          }: PlaybackControlsProps) => {
    return (
        <div className="flex items-center space-x-4">
            <button
                onClick={onToggleShuffle}
                className={`p-2 rounded-full ${isShuffle ? 'text-green-500' : 'text-white'}`}
            >
                <FaShuffle size="30px"/>
            </button>
            <button onClick={onPreviousTrack} className="p-2 text-white">
                <FaBackwardStep size="35px"/>
            </button>
            <button onClick={onTogglePlay} className="p-2 text-white">
                {isPlaying ? <FaPause size="40px"/> : <FaPlay size="35px"/>}
            </button>
            <button onClick={onNextTrack} className="p-2 text-white">
                <FaForwardStep size="35px"/>
            </button>
            <button
                onClick={onToggleRepeat}
                className={`p-2 rounded-full ${
                    repeatMode !== 'off' ? 'text-green-500' : 'text-white'
                }`}
            >
                {repeatMode === 'track' ? <LuRepeat1 size="30px"/> : <LuRepeat size="30px"/>}
            </button>
            <button
                onClick={onToggleLike}
                className={`p-2 rounded-full ${isLiked ? 'text-green-500' : 'text-white'}`}
            >
                <FaHeart size="30px"/>
            </button>
        </div>
    );
};

export default PlaybackControls;