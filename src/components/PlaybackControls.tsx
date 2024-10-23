import React from 'react';
import {FaBackwardStep, FaForwardStep, FaHeart, FaPause, FaPlay, FaShuffle} from 'react-icons/fa6';
import {LuRepeat, LuRepeat1} from 'react-icons/lu';
import {FaCar, FaDesktop, FaGamepad, FaLaptop, FaMobileAlt, FaTabletAlt, FaTv} from "react-icons/fa";
import {BiSolidSpeaker} from "react-icons/bi";
import {Device} from "@spotify/web-api-ts-sdk";
import Image from 'next/image';
import ProgressBar from "@/components/ProgressBar";

type RepeatMode = 'off' | 'context' | 'track';

interface PlaybackControlsProps {
    isPlaying: boolean,
    isShuffle: boolean,
    repeatMode: RepeatMode,
    isLiked: boolean,
    currentTime: number,
    duration: number,
    onTogglePlay: () => void,
    onPreviousTrack: () => void,
    onNextTrack: () => void,
    onToggleShuffle: () => void,
    onToggleRepeat: () => void,
    onToggleLike: () => void,
    onSeek: (position: number) => void,
    currentDevice?: Device | null,
}

type DeviceType =
    'Computer'
    | 'Smartphone'
    | 'Tablet'
    | 'Speaker'
    | 'TV'
    | 'AVR'
    | 'STB'
    | 'AudioDongle'
    | 'GameConsole'
    | 'CarThing'
    | 'Automobile'
    | 'Unknown';

const DeviceIcon = ({type}: { type: DeviceType }) => {
    switch (type) {
        case 'Computer':
            return <FaLaptop/>;
        case 'Smartphone':
            return <FaMobileAlt/>;
        case 'Tablet':
            return <FaTabletAlt/>;
        case 'Speaker':
            return <BiSolidSpeaker/>;
        case 'TV':
            return <FaTv/>;
        case 'AVR':
        case 'STB':
            return <FaDesktop/>;
        case 'AudioDongle':
        case 'GameConsole':
            return <FaGamepad/>;
        case 'CarThing':
        case 'Automobile':
            return <FaCar/>;
        default:
            return <BiSolidSpeaker/>;
    }
};


const PlaybackControls = ({
                              isPlaying,
                              isShuffle,
                              repeatMode,
                              isLiked,
                              currentTime,
                              duration,
                              onTogglePlay,
                              onPreviousTrack,
                              onNextTrack,
                              onToggleShuffle,
                              onToggleRepeat,
                              onToggleLike,
                              onSeek,
                              currentDevice
                          }: PlaybackControlsProps) => {
    const handleButtonClick = (action: () => void) => (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        action();
    };
    const logo = '/images/Spotify_Full_Logo_RGB_White.png';

    return (
        <div className="w-full px-2 sm:px-4 pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="flex items-center h-full">
                    <Image
                        src={logo}
                        className="w-24 sm:w-28 h-6 sm:h-8 object-contain"
                        alt="Spotify logo"
                        width={112}
                        height={32}
                    />
                </div>
                <div className="flex justify-center space-x-2 sm:space-x-4">
                    <button
                        onClick={handleButtonClick(onToggleShuffle)}
                        className={`p-1 sm:p-2 rounded-full ${isShuffle ? 'text-green-500' : 'text-white'}`}
                    >
                        <FaShuffle size="20px" className="sm:w-6 sm:h-6" />
                    </button>
                    <button onClick={handleButtonClick(onPreviousTrack)} className="p-1 sm:p-2 text-white">
                        <FaBackwardStep size="24px" className="sm:w-8 sm:h-8" />
                    </button>
                    <button onClick={handleButtonClick(onTogglePlay)} className="p-1 sm:p-2 text-white">
                        {isPlaying ? <FaPause size="28px" className="sm:w-10 sm:h-10" /> : <FaPlay size="24px" className="sm:w-8 sm:h-8" />}
                    </button>
                    <button onClick={handleButtonClick(onNextTrack)} className="p-1 sm:p-2 text-white">
                        <FaForwardStep size="24px" className="sm:w-8 sm:h-8" />
                    </button>
                    <button
                        onClick={handleButtonClick(onToggleRepeat)}
                        className={`p-1 sm:p-2 rounded-full ${repeatMode !== 'off' ? 'text-green-500' : 'text-white'}`}
                    >
                        {repeatMode === 'track' ? <LuRepeat1 size="20px" className="sm:w-6 sm:h-6" /> : <LuRepeat size="20px" className="sm:w-6 sm:h-6" />}
                    </button>
                    <button
                        onClick={handleButtonClick(onToggleLike)}
                        className={`p-1 sm:p-2 rounded-full ${isLiked ? 'text-green-500' : 'text-white'}`}
                    >
                        <FaHeart size="20px" className="sm:w-6 sm:h-6" />
                    </button>
                </div>
                {currentDevice && (
                    <div className="flex text-green-500 items-center text-md">
                        <DeviceIcon type={currentDevice.type as DeviceType}/>
                        <span className="ml-1 sm:ml-2">{currentDevice.name}</span>
                    </div>
                )}
            </div>
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek}/>
        </div>
    );
};

export default PlaybackControls;
