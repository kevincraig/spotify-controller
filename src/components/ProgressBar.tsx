import React, { useState, useEffect, useRef } from 'react';

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (position: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState(0);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        updateDragPosition(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            updateDragPosition(e);
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            onSeek(dragPosition);
        }
    };

    const updateDragPosition = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            setDragPosition(Math.max(0, Math.min(position, 1)));
        }
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                onSeek(dragPosition);
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragPosition, onSeek]);

    const progress = isDragging ? dragPosition : (currentTime / duration) || 0;

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full flex items-center space-x-2">
            <span className="text-sm text-gray-200">{formatTime(currentTime)}</span>
            <div
                ref={progressBarRef}
                className="flex-grow h-1 bg-gray-600 rounded-full cursor-pointer"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${progress * 100}%` }}
                ></div>
            </div>
            <span className="text-sm text-gray-200">{formatTime(duration)}</span>
        </div>
    );
};

export default ProgressBar;
