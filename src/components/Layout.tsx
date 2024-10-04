import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import AppBar from './AppBar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const router = useRouter();

       return (
        <div className="flex flex-col h-screen bg-black text-white">
            <AppBar />
            <div className="flex flex-1">
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default Layout;