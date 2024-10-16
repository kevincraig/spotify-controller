import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaBars } from 'react-icons/fa6';
import Image from 'next/image';

const AppBar = () => {
    const router = useRouter();
    const [ time, setTime ] = useState(new Date());
    const gaugedLogo = "/images/ga-logo.svg";
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 text-white h-12">
            <div>
                <Image
                    src={gaugedLogo}
                    alt="Logo"
                    width={50}
                    height={50}
                />
            </div>
            <div className="justify-center">
                <span className="font-bold text-3xl">{time.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', hour12: true})}</span>
            </div>
            <div className="flex items-center">
                <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-700 rounded">
                    <FaBars className="w-6 h-6"/>
                </button>
            </div>
        </div>
    );
};

export default AppBar;