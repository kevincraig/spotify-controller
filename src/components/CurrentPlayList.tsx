// import React, {useEffect, useState} from 'react';
// import {Playlist, SpotifyApi} from '@spotify/web-api-ts-sdk';
//
// interface CurrentPlaylistProps {
//     sdk: SpotifyApi;
// }
//
// import SpotifyWebApi from 'spotify-web-api-node';
//
//
// // Set the access token (You need to implement the OAuth flow to get this token)
// spotifyApi.setAccessToken('YOUR_ACCESS_TOKEN');
//
// async function getCurrentPlaylist() {
//     try {
//         // Get the user's currently playing track
//         const currentPlayback = await spotifyApi.getMyCurrentPlaybackState();
//
//         if (currentPlayback.body && currentPlayback.body.context && currentPlayback.body.context.type === 'playlist') {
//             // If a playlist is currently playing, get its details
//             const playlistId = currentPlayback.body.context.uri.split(':')[2];
//             const playlist = await spotifyApi.getPlaylist(playlistId);
//
//             console.log('Current Playlist:', playlist.body.name);
//             console.log('Playlist ID:', playlist.body.id);
//             console.log('Number of tracks:', playlist.body.tracks.total);
//         } else {
//             console.log('No playlist is currently playing.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }
//
// const CurrentPlaylist = ({ sdk }: CurrentPlaylistProps) => {
//     const [playlist, setPlaylist] = useState<Playlist | null>(null);
//
//     useEffect(() => {
//         const fetchPlaylist = async () => {
//             const currentPlaylist = await getCurrentPlaylist(sdk);
//             setPlaylist(currentPlaylist);
//         };
//
//         fetchPlaylist();
//     }, [sdk]);
//
//     if (!playlist) {
//         return <div>No playlist is currently playing.</div>;
//     }
//
//     return (
//         <div>
//             <h2>{playlist.name}</h2>
//             <ul>
//                 {playlist.tracks.items.map((item, index) => (
//                     <li key={index}>{item.track.name}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// };
//
// export default CurrentPlaylist;
