import React, {useState, useCallback, useEffect} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCirclePlus, faCircleCheck} from '@fortawesome/free-solid-svg-icons';
import {toast, ToastContainer} from 'react-toastify';
import {SpotifyLikeUnlikeProps} from '@/types';
import 'react-toastify/dist/ReactToastify.css';

const SpotifyLikeUnlike = ({trackId, initialLikeState, accessToken}: SpotifyLikeUnlikeProps) => {
    const [isLiked, setIsLiked] = useState(initialLikeState);

    // useEffect(() => {
    //     console.log(`SpotifyLikeUnlike: Updating isLiked state to ${initialLikeState} for track ${trackId}`);
    //     setIsLiked(initialLikeState);
    // }, [trackId, initialLikeState]);

    const toggleLike = useCallback(async (event: React.MouseEvent) => {
        event.preventDefault();
        try {
            const url = `https://api.spotify.com/v1/me/tracks`;
            const method = isLiked ? 'DELETE' : 'PUT';

            await axios({
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: {ids: [trackId]},
            });

            const newLikeState = !isLiked;
            setIsLiked(newLikeState);
            console.log(`SpotifyLikeUnlike: Like state toggled by user interaction to ${newLikeState} for track ${trackId}`);
            toast.success(`Track ${isLiked ? 'removed from' : 'added to'} liked songs`);
        } catch (error) {
            console.error('Error toggling like status:', error);
            toast.error('Error toggling like status');
        }
    }, [isLiked, accessToken, trackId]);

    return (
        <div className="pl-8">
            <button onClick={toggleLike}
                    className={`px-1 py-2 ${isLiked ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-300'}`}>
                <FontAwesomeIcon size="xl" icon={isLiked ? faCircleCheck : faCirclePlus} className="ml-2"/>
            </button>
            <ToastContainer autoClose={2000}/>
        </div>
    );
};

export default SpotifyLikeUnlike;