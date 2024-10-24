// src/components/Layout.tsx

import AppBar from './AppBar';
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="flex flex-col bg-black min-h-screen min-w-full">
            <AppBar/>
            <main className="flex-grow flex flex-row-reverse">
                <Sidebar/>
                <div className="flex-grow">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;