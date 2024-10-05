import React from 'react';
import {DeviceIcon} from '@/components/DeviceIcon';

interface DeviceInfoProps {
    deviceType: string;
    deviceName: string;
}

function DeviceInfo({deviceType, deviceName}: DeviceInfoProps) {
    return (
        <div className="flex items-center text-green-500 text-sm pt-4">
            {DeviceIcon(deviceType)}
            <span className="ml-2">Playing on {deviceName}</span>
        </div>
    );
}

export default DeviceInfo;