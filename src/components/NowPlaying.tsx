// src/components/NowPlaying.tsx
import React, {useState, useEffect} from 'react';
import Image from 'next/image';
import {usePlaybackControls} from '@/hooks/usePlaybackControls';
import PlaybackControls from './PlaybackControls';
import {FaLaptop, FaMobileAlt, FaTabletAlt, FaDesktop, FaTv, FaCar, FaGamepad} from 'react-icons/fa';
import {BiSolidSpeaker} from "react-icons/bi";
import {SpotifyApi} from "@spotify/web-api-ts-sdk";

interface NowPlayingProps {
    getSpotifyApi: () => SpotifyApi;
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
    } = usePlaybackControls(getSpotifyApi());

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const logo = '/images/Spotify_Full_Logo_RGB_White.png';

    const displayTrack = currentTrack || lastPlayedTrack;

    if (!displayTrack) {
        return <div className="text-center py-4 text-white">No track information available</div>;
    }

    const handleControlAction = async (action: () => Promise<void>) => {
        try {
            await action();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="flex flex-col text-white w-full pl-4 pt-4">
            {error && (
                <div className="bg-red-500 text-white p-2 mb-4 rounded">
                    Error: {error}
                </div>
            )}
            <div className="flex">
                <div className="relative w-80 h-80 mb-4">
                    <Image
                        src={displayTrack.albumArt}
                        alt={`${displayTrack.album} cover`}
                        sizes="80vw."
                        fill
                        className="rounded-xl object-cover"
                    />
                </div>
                <div className="flex flex-col px-8">
                    <Image
                        src={logo}
                        alt="Spotify logo"
                        width={60}
                        height={30}
                        style={{width: '40%', height: 'auto'}}
                    />
                    <h1 className="text-4xl font-bold my-2">{displayTrack.name}</h1>
                    <p className="text-3xl ">{displayTrack.artist}</p>
                    <p className="text-2xl text-gray-200 mb-2">
                        {displayTrack.type === 'track' ? displayTrack.album : `Podcast: ${displayTrack.album}`}
                    </p>
                    {!isPlaying && <p className="text-xl text-gray-400">Last Played</p>}
                    {currentDevice && (
                        <div className="flex text-green-500 items-center mt-2">
                            <DeviceIcon type={currentDevice.type as DeviceType}/>
                            <span className="ml-2">{currentDevice.name}</span>
                        </div>
                    )}
                    <div className="mt-4">
                        <PlaybackControls
                            isPlaying={isPlaying}
                            isShuffle={isShuffle}
                            repeatMode={repeatMode}
                            isLiked={isLiked}
                            onTogglePlay={() => handleControlAction(togglePlay)}
                            onPreviousTrack={() => handleControlAction(previousTrack)}
                            onNextTrack={() => handleControlAction(nextTrack)}
                            onToggleShuffle={() => handleControlAction(toggleShuffle)}
                            onToggleRepeat={() => handleControlAction(toggleRepeat)}
                            onToggleLike={() => handleControlAction(toggleLike)}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default NowPlaying;