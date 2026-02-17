import React from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

const Layout: React.FC = () => {
    return (
        <div className="h-screen w-screen overflow-hidden bg-neutral-900 text-gray-100 font-sans selection:bg-catan-water selection:text-white flex flex-col relative">
            {/* Background texture overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-40 bg-[url('/fields/sea.png')] bg-center z-0" style={{ backgroundSize: '300%' }}></div>

            <header className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-end items-center bg-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <LanguageSelector />
                </div>
            </header>

            <main className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden flex-1">
                <div className="w-full max-w-md px-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
