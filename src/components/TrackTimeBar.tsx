import React, {useState, useEffect} from 'react';

interface TrackTimeBarProps {
    initialProgress: number;
    duration: number;
    isPlaying: boolean;
    formatTime: (ms: number) => string;
}

const TrackTimeBar = ({initialProgress, duration, isPlaying, formatTime}: TrackTimeBarProps) => {
    const [progress, setProgress] = useState(initialProgress);

    useEffect(() => {
        setProgress(initialProgress);
    }, [initialProgress]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isPlaying && progress < duration) {
            intervalId = setInterval(() => {
                setProgress((prevProgress) => {
                    const newProgress = prevProgress + 1000; // Increase by 1 second
                    return newProgress < duration ? newProgress : duration;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isPlaying, duration, progress]);

    return (
        <div className="flex items-center w-full mt-4">
            <span>{formatTime(progress)}</span>
            <div className="flex-1 mx-4 h-2 bg-gray-600 rounded">
                <div
                    className="h-2 bg-green-500 rounded"
                    style={{width: `${(progress / duration) * 100}%`}}
                ></div>
            </div>
            <span>{formatTime(duration)}</span>
        </div>
    );
};

export default TrackTimeBar;