import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaBars } from 'react-icons/fa6';

const AppBar = () => {
    const router = useRouter();
    const [time, setTime] = useState(new Date());
    // const [weather, setWeather] = useState({ temp: 0, icon: 'clear' });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Fetch weather data from an API
        // const fetchWeather = async () => {
        //     try {
        //         const response = await fetch('/api/weather'); // Replace with your weather API endpoint
        //         const data = await response.json();
        //         // setWeather({ temp: data.temp, icon: data.icon });
        //     } catch (error) {
        //         console.error('Error fetching weather data:', error);
        //     }
        // };

        // fetchWeather();
    }, []);

    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 text-white h-12">
            <div className="flex items-center">
                <img src="/images/ga-logo.svg" alt="Logo" className="h-8 mr-4" /> {/* Replace with your logo */}
            </div>
            <div className="flex items-center">
                <span className="mr-4">{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                {/*<div className="flex items-center">*/}
                {/*    <span className="mr-2">{weather.temp}°C</span>*/}
                {/*    <img src={`/icons/${weather.icon}.png`} alt={weather.icon} className="h-6" /> /!* Replace with your weather icons *!/*/}
                {/*</div>*/}
            </div>
            <div className="flex items-center">
                <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-700 rounded">
                    <FaBars className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default AppBar;