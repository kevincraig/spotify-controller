import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCircleCheck, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SpotifyLikeUnlikeProps {
    trackId: string;
    initialLikeState: boolean;
    accessToken: string;
}

const SpotifyLikeUnlike = ({ trackId, initialLikeState, accessToken }: SpotifyLikeUnlikeProps) => {
    const [isLiked, setIsLiked] = useState(initialLikeState);

    useEffect(() => {
        setIsLiked(initialLikeState);
    }, [trackId, initialLikeState]);

    const toggleLike = async () => {
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
                data: { ids: [trackId] },
            });

            setIsLiked(!isLiked);
            toast.success(`Track ${isLiked ? 'removed from' : 'added to'} liked songs`);
        } catch (error) {
            console.error('Error toggling like status:', error);
            toast.error('Error toggling like status');
        }
    };

    return (
        <div className="px-8">
            <button onClick={toggleLike} disabled={isLiked}
                    className="px-1 py-2" >
                <FontAwesomeIcon size="xl" icon={faCircleMinus}/>
            </button>
            <button onClick={toggleLike}
                    className={`px-1 py-2 ${isLiked ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-300'}`}>
                <FontAwesomeIcon size="xl" icon={isLiked ? faCircleCheck : faCirclePlus} className="ml-2"/>
            </button>
            <ToastContainer autoClose={2000} />
        </div>
    );
};

export default SpotifyLikeUnlike;