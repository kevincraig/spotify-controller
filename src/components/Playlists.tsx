// src/components/Playlists.tsx
import React, {useEffect, useState} from 'react';
import {SpotifyApi, SimplifiedPlaylist} from '@spotify/web-api-ts-sdk';
import {useRouter} from 'next/router';

interface PlaylistsProps {
    spotifyApi: SpotifyApi;
}

const Playlists = ({spotifyApi}: PlaylistsProps) => {
    const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userProfile = await spotifyApi.currentUser.profile();
                console.log('User ID:', userProfile.id);

                const response = await spotifyApi.playlists.getUsersPlaylists(userProfile.id);
                setPlaylists(response.items);
            } catch (error) {
                console.error('Failed to fetch user data or playlists', error);
            }
        };

        fetchUserData();
    }, [spotifyApi]);

    // const handlePlay = async (playlistId: string) => {
    //     try {
    //         await spotifyApi.player.startResumePlayback({context_uri: `spotify:playlist:${playlistId}`});
    //         router.push('/now-playing');
    //     } catch (error) {
    //         console.error('Failed to start playback', error);
    //     }
    // };

    return (
        <div className="playlists">
            {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-card">
                    <img src={playlist.images[0]?.url} alt={playlist.name} className="playlist-image"/>
                    <div className="playlist-info text-white">
                        <h3>{playlist.name}</h3>
                        <p>{playlist.description}</p>
                        {/*<button onClick={() => handlePlay(playlist.id)}>Play</button>*/}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Playlists;