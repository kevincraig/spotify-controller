import { SpotifyApi, Page, SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { useEffect, useState } from "react";

interface Playlist {
    id: string;
    name: string;
    images: { url: string }[];
}

export const useUserPlaylists = (spotifyApi: SpotifyApi) => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response: Page<SimplifiedPlaylist> = await spotifyApi.currentUser.playlists.playlists();
                const mappedPlaylists: Playlist[] = response.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    images: item.images
                }));
                setPlaylists(mappedPlaylists);
            } catch (error) {
                console.error('Failed to fetch playlists', error);
            }
        };

        fetchPlaylists();
    }, [spotifyApi]);

    return { playlists };
};