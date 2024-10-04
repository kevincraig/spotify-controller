import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import NowPlaying from '../components/NowPlaying'

import { Track, Episode, Device } from '@spotify/web-api-ts-sdk'

const Home: NextPage = () => {
    const { sdk, login } = useSpotifyAuth()
    const [currentItem, setCurrentItem] = useState<Track | Episode | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [devices, setDevices] = useState<Device[]>([])
    const [activeDevice, setActiveDevice] = useState<Device | null>(null)

    useEffect(() => {
        const fetchCurrentlyPlaying = async () => {
            if (sdk) {
                try {
                    const response = await sdk.player.getCurrentlyPlayingTrack()
                    if (response && response.item) {
                        setCurrentItem(response.item)
                        setIsPlaying(response.is_playing)
                    }
                } catch (error) {
                    console.error('Error fetching current track:', error)
                }
            }
        }

        const fetchDevices = async () => {
            if (sdk) {
                try {
                    const response = await sdk.player.getAvailableDevices()
                    setDevices(response.devices)
                    const newActiveDevice = response.devices.find(device => device.is_active) || null
                    if (newActiveDevice) {
                        setActiveDevice(newActiveDevice)
                    } else {
                        setActiveDevice(null)
                    }
                } catch (error) {
                    console.error('Error fetching devices:', error)
                }
            }
            console.log(`Active device: ${activeDevice?.name}`)
        }

        fetchCurrentlyPlaying()
        fetchDevices()

        // Set up intervals to periodically fetch updates
        const playingInterval = setInterval(fetchCurrentlyPlaying, 5000)
        const devicesInterval = setInterval(fetchDevices, 10000)

        return () => {
            clearInterval(playingInterval)
            clearInterval(devicesInterval)
        }
    }, [sdk])

    // const handleDeviceChange = async (deviceId: string) => {
    //     if (sdk) {
    //         try {
    //             await sdk.player.transferPlayback([deviceId], true)
    //             const newActiveDevice = devices.find(device => device.id === deviceId) || null
    //             if (newActiveDevice) {
    //                 setActiveDevice(newActiveDevice)
    //             }
    //         } catch (error) {
    //             console.error('Error transferring playback:', error)
    //         }
    //     }
    // }

    if (!sdk) {
        return <button onClick={login}>Login to Spotify</button>
    }

    return (
        <div className="p-4">
            <NowPlaying item={currentItem} isPlaying={isPlaying} device={activeDevice} sdk={sdk}/>

            {/*<div className="mt-4">*/}
            {/*    <h2 className="text-xl font-semibold mb-2">Available Devices</h2>*/}
            {/*    <select*/}
            {/*        value={activeDeviceId ?? ''}*/}
            {/*        onChange={(e) => handleDeviceChange(e.target.value)}*/}
            {/*        className="bg-gray-800 text-white rounded p-2"*/}
            {/*    >*/}
            {/*        <option value="">Select a device</option>*/}
            {/*        {devices.map(device => (*/}
            {/*            <option key={device.id} value={device.id?.toString()}>*/}
            {/*                {device.name} ({device.type})*/}
            {/*            </option>*/}
            {/*        ))}*/}
            {/*    </select>*/}
            {/*</div>*/}
        </div>
    )
}

export default Home