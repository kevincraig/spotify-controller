// src/pages/playlists.tsx
import React, {useEffect, useState} from 'react';
import {SpotifyApi, SimplifiedPlaylist} from '@spotify/web-api-ts-sdk';
import {useRouter} from 'next/router';
import {useSpotifyAuth} from '@/hooks/useSpotifyAuth';

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
    const {getSpotifyApi} = useSpotifyAuth();
    const spotifyApi = getSpotifyApi();
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userProfile = await spotifyApi.currentUser.profile();
                const response = await spotifyApi.playlists.getUsersPlaylists(userProfile.id);
                setPlaylists(response.items);
            } catch (error) {
                console.error('Failed to fetch user data or playlists', error);
            }
        };

        fetchUserData();
    }, [spotifyApi]);

    return (
        <div className="playlists grid grid-cols-2 gap-4 p-4 overflow-y-auto h-screen">
            {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-card">
                    <img src={playlist.images[0]?.url} alt={playlist.name}
                         className="playlist-image w-full h-32 object-cover"/>
                    <div className="playlist-info text-white p-2">
                        <h3>{playlist.name}</h3>
                        <p>{playlist.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlaylistsPage;