// src/components/NowPlaying.tsx
import React from 'react';
import Image from 'next/image';
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';
import {usePlaybackControls} from '@/hooks/usePlaybackControls';
import PlaybackControls from './PlaybackControls';
import {FaLaptop, FaMobileAlt, FaTabletAlt, FaDesktop, FaTv, FaCar, FaGamepad} from 'react-icons/fa';
import {BiSolidSpeaker} from "react-icons/bi";


type DeviceIconProps = {
    type: string | null;
};

const DeviceIcon = ({type}: DeviceIconProps) => {
    switch (type?.toLowerCase()) {
        case 'computer':
            return <FaLaptop/>;
        case 'smartphone':
            return <FaMobileAlt/>;
        case 'tablet':
            return <FaTabletAlt/>;
        case 'speaker':
            return <BiSolidSpeaker/>;
        case 'tv':
            return <FaTv/>;
        case 'avr':
        case 'stb':
            return <FaDesktop/>;
        case 'audio_dongle':
        case 'game_console':
            return <FaGamepad/>;
        case 'car_thing':
        case 'automobile':
            return <FaCar/>;
        default:
            return <BiSolidSpeaker/>;
    }
};

const NowPlaying = () => {
    const {spotifyApi, isAuthenticated, isLoading, error: authError, login} = useSpotifyAuth();
    const {
        isPlaying,
        isShuffle,
        isLiked,
        repeatMode,
        togglePlay,
        toggleLike,
        previousTrack,
        nextTrack,
        toggleShuffle,
        toggleRepeat,
        currentTrack,
        lastPlayedTrack,
        currentDevice,
    } = usePlaybackControls(spotifyApi);

    const logo = '/images/Spotify_Full_Logo_RGB_White.png';

    if (isLoading) {
        return <div className="text-center py-4 text-white">Initializing Spotify...</div>;
    }

    if (authError) {
        return <div className="text-red-500 text-center py-4">Error: {authError.message}</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <h1 className="text-3xl font-bold mb-4">Connect to Spotify</h1>
                <button
                    onClick={login}
                    className="px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition duration-300"
                >
                    Login with Spotify
                </button>
            </div>
        );
    }

    const displayTrack = currentTrack || lastPlayedTrack;

    if (!displayTrack) {
        return <div className="text-center py-4 text-white">No track information available</div>;
    }

    return (
        <div className="flex flex-col text-white w-full pl-8">
            <div className="flex">
                <div className="relative mb-4" style={{width: '310px', height: '310px'}}>
                    <Image
                        src={displayTrack.albumArt}
                        alt={`${displayTrack.album} cover`}
                        className="rounded-lg"
                        width={310}
                        height={310}
                    />
                </div>
                <div className="flex flex-col px-8">
                    <Image src={logo} alt="Spotify logo" width={100} height={30}/>
                    <h1 className="text-4xl font-bold mb-2">{displayTrack.name}</h1>
                    <p className="text-3xl mb-1">{displayTrack.artist}</p>
                    <p className="text-2xl text-gray-200 mb-2">
                        {displayTrack.type === 'track' ? displayTrack.album : `Podcast: ${displayTrack.album}`}
                    </p>
                    {!isPlaying && <p className="text-xl text-gray-400">Last Played</p>}
                    {currentDevice && (
                        <div className="flex items-center mt-2 text-green-500">
                            <DeviceIcon type={currentDevice.type}/>
                            <span className="ml-2">{currentDevice.name || 'Unknown Device'}</span>
                        </div>
                    )}
                    <div className="mt-4">
                        <PlaybackControls
                            isPlaying={isPlaying}
                            isShuffle={isShuffle}
                            isLiked={isLiked}
                            repeatMode={repeatMode}
                            onTogglePlay={togglePlay}
                            onToggleLike={toggleLike}
                            onPreviousTrack={previousTrack}
                            onNextTrack={nextTrack}
                            onToggleShuffle={toggleShuffle}
                            onToggleRepeat={toggleRepeat}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NowPlaying;