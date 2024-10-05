import type {NextPage} from 'next';
import React, {useEffect, useState} from 'react';
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';
import NowPlaying from '../components/NowPlaying';
import {Track, Episode, Device} from '@spotify/web-api-ts-sdk';
import DeviceDrawerIcon from '../components/DeviceDrawerIcon';
import {DeviceIcon} from '@/components/DeviceIcon';
import {SpotifyDevice} from '@/types';


const Home: NextPage = () => {
    const {sdk, login} = useSpotifyAuth();
    const [currentItem, setCurrentItem] = useState<Track | Episode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [activeDevice, setActiveDevice] = useState<SpotifyDevice | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const fetchDevices = async () => {
        if (sdk) {
            try {
                const response = await sdk.player.getAvailableDevices();
                setDevices(response.devices);
                const newActiveDevice = response.devices.find(device => device.is_active) || null;
                setActiveDevice(newActiveDevice);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        }
    };

    useEffect(() => {
        const fetchCurrentlyPlaying = async () => {
            if (sdk) {
                try {
                    const response = await sdk.player.getCurrentlyPlayingTrack();
                    if (response && response.item) {
                        setCurrentItem(response.item);
                        setIsPlaying(response.is_playing);
                    }
                } catch (error) {
                    console.error('Error fetching current track:', error);
                }
            }
        };

        fetchCurrentlyPlaying();
        fetchDevices();

        const playingInterval = setInterval(fetchCurrentlyPlaying, 3000);
        const devicesInterval = setInterval(fetchDevices, 10000);

        return () => {
            clearInterval(playingInterval);
            clearInterval(devicesInterval);
        };
    }, [fetchDevices, sdk]);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleDeviceSelect = async (device: Device) => {
        try {
            if (sdk && device.id) {
                await sdk.player.transferPlayback([device.id], true);
                setActiveDevice(device);
                setIsDrawerOpen(false);
                fetchDevices();
            }
        } catch (error) {
            console.error('Error transferring playback:', error);
        }
    };

    if (!sdk) {
        return <button onClick={login}>Login to Spotify</button>;
    }

    return (
        <div className="flex">
            <div className="w-1/2">
                <NowPlaying
                    className="pt-2 ml-2"
                    item={currentItem}
                    isPlaying={isPlaying}
                    device={activeDevice}
                    sdk={sdk}
                />
            </div>
            <div className="w-1/2 flex justify-end items-start p-4">
                <DeviceDrawerIcon onClick={toggleDrawer} size={28}/>
                {isDrawerOpen && (
                    <div
                        className="drawer rounded-lg fixed bottom-0 right-10 h-3/4 w-auto bg-gray-800 bg-opacity-75 overflow-y-auto p-4 px-6">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className={`flex device-item mb-4 hover:bg-gray-700 ${device.is_active ? 'text-green-500' : 'text-white'}`}
                                onClick={() => handleDeviceSelect(device)}
                            >
                                {DeviceIcon(device.type)}
                                <p className="text-xs px-1">{device.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;