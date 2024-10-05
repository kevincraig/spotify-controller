import React, {useRef, useEffect, useState} from 'react';
import Image from 'next/image';
import SpotifyLikeUnlike from '@/components/SpotifyLikeUnlike';

interface TrackInfoProps {
    item: any;
    isLiked: boolean;
    accessToken: string | null;
    logo: string;
    children?: React.ReactNode;
}

const TrackInfo = ({item, isLiked, accessToken, logo, children}: TrackInfoProps) => {
    const textRef = useRef<HTMLHeadingElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (textRef.current) {
            setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, [item]);

    const isTrack = 'album' in item;

    return (
        <div className="flex p-2" style={{width: 1000}}>
            <Image
                src={isTrack ? item.album.images[0].url : item.images[0].url}
                alt={isTrack ? item.album.name : item.name}
                className="rounded-md"
                width={400}
                height={400}
            />
            <div className="ml-8 flex flex-col" style={{width: '100%'}}>
                <Image src={logo} alt="Spotify logo" width={130} height={130}/>
                <div className="flex justify-between pt-0">
                    <h2 ref={textRef}
                        className={`text-3xl font-semibold whitespace-nowrap ${isOverflowing ? 'animate-scroll' : ''}`}>
                        {item.name}
                    </h2>
                    <div>
                        <SpotifyLikeUnlike trackId={item.id} initialLikeState={isLiked} accessToken={accessToken}/>
                    </div>
                </div>
                <p className="pt-1 text-2xl text-white font-bold">
                    {isTrack ? item.artists[0].name : item.show.name}
                </p>
                {children}
            </div>
        </div>
    );
};

export default TrackInfo;