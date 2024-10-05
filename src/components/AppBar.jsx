import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaBars } from 'react-icons/fa6';

const AppBar = () => {
    const router = useRouter();
    const [ time, setTime ] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 text-white h-12">
            <div className="flex items-center">
                <img src="/images/ga-logo.svg" alt="Logo" className="h-8 mr-4"/> {/* Replace with your logo */}
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