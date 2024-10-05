import React, {useState, useEffect} from 'react';
// import { CirclePlay, CirclePause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';
// import { LuMonitorSpeaker } from "react-icons/lu";
import {FaCirclePlay, FaCirclePause, FaBackwardStep, FaForwardStep} from 'react-icons/fa6';
import {PlaybackControlsProps} from "@/types";
import {fetchAccessToken, toggleShuffle, toggleRepeat, fetchPlaybackState} from '@/utils/spotifyApi';
import {FaRepeat, FaShuffle} from "react-icons/fa6";

const PlaybackControls = ({sdk, isPlaying, deviceId}: PlaybackControlsProps) => {
    const [shuffle, setShuffle] = useState<boolean>(false);
    const [repeat, setRepeat] = useState<'off' | 'context' | 'track'>('off');
    const iconSize = 36;

    useEffect(() => {
        const fetchState = async () => {
            const accessToken = await fetchAccessToken(sdk);
            if (accessToken) {
                const data = await fetchPlaybackState(accessToken);
                if (data) {
                    setShuffle(data.shuffle_state);
                    setRepeat(data.repeat_state);
                }
            }
        };
        fetchState();
    }, [sdk]);

    const handleToggleShuffle = async () => {
        const accessToken = await fetchAccessToken(sdk);
        if (accessToken) {
            await toggleShuffle(accessToken, !shuffle);
            setShuffle(!shuffle);
        }
    };

    const handleToggleRepeat = async () => {
        const accessToken = await fetchAccessToken(sdk);
        if (accessToken) {
            const newRepeatState = repeat === 'off' ? 'context' : repeat === 'context' ? 'track' : 'off';
            await toggleRepeat(accessToken, newRepeatState);
            setRepeat(newRepeatState);
        }
    };

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
        console.log("handleNext");
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
        <div className="flex items-center justify-between w-full mt-4">
            <button onClick={handleToggleShuffle} className={`p-2 ${shuffle ? 'text-green-500' : 'text-white'}`}>
                <FaShuffle size={iconSize - 10}/>
            </button>
            <button
                onClick={handlePrevious}
                className="p-2 pl-0"
                disabled={!deviceId}>
                <FaBackwardStep size={iconSize - 5}/>
            </button>
            <button
                onClick={handlePlayPause}
                className="p-2 "
                disabled={!deviceId}>
                {isPlaying ? <FaCirclePause color="white" size={iconSize + 15}/> :
                    <FaCirclePlay color="white" size={iconSize + 15}/>}
            </button>
            <button
                onClick={handleNext}
                className="p-2 "
                disabled={!deviceId}>
                <FaForwardStep size={iconSize - 5}/>
            </button>
            <button onClick={handleToggleRepeat} className="p-2 text-white">
                {repeat === 'off' && <FaRepeat size={iconSize - 15}/>}
                {repeat === 'context' && <FaRepeat className="text-green-500" size={iconSize - 15}/>}
                {repeat === 'track' &&
                    <div className="flex">
                        <FaRepeat className="text-green-500" size={iconSize - 15}/>
                        <p className="text-green-500 font-bold">1</p>
                    </div>
                }
            </button>
        </div>
    );
};

export default PlaybackControls;