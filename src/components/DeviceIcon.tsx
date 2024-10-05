import React from 'react';
import {FaDesktop, FaTabletAlt, FaMobileAlt, FaTv, FaGamepad, FaCar, FaQuestion} from 'react-icons/fa';
import {MdSpeaker} from 'react-icons/md';

export const DeviceIcon = (deviceType: string | null): React.ReactElement => {
    switch (deviceType) {
        case 'Computer':
            return <FaDesktop/>;
        case 'Tablet':
            return <FaTabletAlt/>;
        case 'Smartphone':
            return <FaMobileAlt/>;
        case 'Speaker':
            return <MdSpeaker/>;
        case 'TV':
            return <FaTv/>;
        case 'GameConsole':
            return <FaGamepad/>;
        case 'Automobile':
            return <FaCar/>;
        default:
            return <FaQuestion/>;
    }
};