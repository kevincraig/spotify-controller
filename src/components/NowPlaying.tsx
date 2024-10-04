import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Track, Episode, SpotifyApi } from '@spotify/web-api-ts-sdk';
import PlaybackControls from '@/components/PlaybackControls';
import SpotifyLikeUnlike from "@/components/SpotifyLikeUnlike";

interface NowPlayingProps {
    item: Track | Episode | null;
    isPlaying: boolean;
    device: object | null;
    className?: string;
    sdk: SpotifyApi;
}

const NowPlaying = ({ item, isPlaying, className, sdk, device }: NowPlayingProps) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const fetchAccessToken = async () => {
            const tokenResponse = await sdk.getAccessToken();
            if (tokenResponse) {
                setAccessToken(tokenResponse.access_token);
            }
        };
        fetchAccessToken();
    }, [sdk]);

    useEffect(() => {
        if (textRef.current) {
            setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, [item]);

    if (!item || !accessToken) return null;

    const isTrack = 'album' in item;
    const logo = '/images/spotify_full_logo_rgb_white.png';
    const classNameProp = className ? className : '';

    return (
        <div className={`flex items-center p-4 ${classNameProp}`}>
            <Image
                src={isTrack ? item.album.images[0].url : item.images[0].url}
                alt={isTrack ? item.album.name : item.name}
                width={260}
                height={260}
                className="rounded-md"
            />
            <div className="ml-8">
                <Image src={logo} alt="Spotify logo" width={130} height={130}/>
                <div className="flex pt-1">
                    <div className="max-w-md overflow-hidden">
                        <h2 ref={textRef} className={`text-3xl font-semibold whitespace-nowrap ${isOverflowing ? 'animate-scroll' : ''}`}>
                            {item.name}
                        </h2>
                    </div>
                    <SpotifyLikeUnlike trackId={item.id} initialLikeState={item.is_liked} accessToken={accessToken}/>
                </div>
                <p className="pt-1 text-2xl text-white font-bold">
                    {isTrack ? item.artists[0].name : item.show.name}
                </p>
                <div>
                    <p className="text-green-500 text-sm pt-4">Playing on {device!.name}</p>
                </div>
                <PlaybackControls sdk={sdk} isPlaying={isPlaying} deviceId={device?.id.toString()}/>
            </div>
        </div>
    );
};

export default NowPlaying;