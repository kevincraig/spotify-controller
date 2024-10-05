import React from 'react';
import {MdSpeakerGroup} from 'react-icons/md';
import {DeviceDrawerIconProps} from '@/types';

const DeviceDrawerIcon = ({onClick, size, style}: DeviceDrawerIconProps) => {
    return (
        <div
            className="bg-gray-400 bg-opacity-50 rounded-full flex items-center justify-center"
            onClick={onClick}
            style={{height: 50, width: 50, cursor: 'pointer', ...style}}>
            <MdSpeakerGroup size={size}/>
        </div>
    );
};

export default DeviceDrawerIcon;