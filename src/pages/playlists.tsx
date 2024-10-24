import React from 'react';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import Image from "next/image";
import { useRouter } from 'next/router';

interface PlaylistsProps {
    getSpotifyApi: () => SpotifyApi;
}

const Playlists = ({ getSpotifyApi }: PlaylistsProps) => {
    const spotifyApi = getSpotifyApi();
    const router = useRouter();

    const { playlists } = useUserPlaylists(spotifyApi);

    if (!spotifyApi) {
        return <div className="text-white">Please log in to view your playlists</div>;
    }

    const handlePlay = async (playlistId: string) => {
        try {
            await spotifyApi.makeRequest('PUT', '/v1/me/player/play', {
                body: JSON.stringify({ context_uri: `spotify:playlist:${playlistId}` })
            });
            await router.push('/');
        } catch (error) {
            console.error('Error playing playlist:', error);
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
            {playlists.map((playlist) => (
                <div key={playlist.id} className="relative p-4 items-center justify-center rounded-lg">
                    <Image
                        src={playlist.images[0]?.url || '/placeholder.png'}
                        alt={playlist.name}
                        width={200}
                        height={200}
                        className="object-cover rounded-md mb-2"
                    />
                    <button
                        onClick={() => handlePlay(playlist.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 3.293a1 1 0 011.414 0L15 12.586V4a1 1 0 112 0v12a1 1 0 01-1.707.707L5.707 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <p className="text-sm text-white text-center text-wrap">{playlist.name}</p>
                </div>
            ))}
        </div>
    );
};

export default Playlists;