// src/components/Layout.tsx

import AppBar from './AppBar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="flex flex-col bg-black min-h-screen min-w-full">
            <AppBar/>
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
};

export default Layout;