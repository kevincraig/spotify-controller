import React from 'react';
import { useRouter } from 'next/router';
import {FaHouse} from "react-icons/fa6";
import { PiPlaylistFill } from "react-icons/pi";


const Sidebar = () => {
    const router = useRouter();

    const handleNavigation = (path: string) => () => {
        router.push(path);
    }
    return (
        <div className="w-20 bg-gray-900 text-white h-screen p-4">
            <nav>
                <div className={"flex flex-col gap-8 items-center"}>
                    <button
                        onClick={handleNavigation('/')}
                        className={`p-1 sm:p-2 rounded-full }`}
                    >
                        <FaHouse size="40px" />
                    </button>
                    <button
                        onClick={handleNavigation('/playlists')}
                        className={`p-1 sm:p-2 rounded-full }`}
                    >
                        <PiPlaylistFill size="40px" />
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
