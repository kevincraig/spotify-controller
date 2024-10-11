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
            <div className="flex items-center">
                <Image
                    src={gaugedLogo}
                    alt="Logo"
                    width={120}
                    height={96}
                    style={{width: '4.5%', height: 'auto'}}
                />


            </div>
            <div className="flex items-center">
                <span className="mr-4">{time.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}</span>
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