import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Lobby } from '../components/trading/Lobby';
import { ActiveGame } from '../components/trading/ActiveGame';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector'; // Importing LanguageSelector
import { useTranslation } from 'react-i18next';

const Trading: React.FC = () => {
    const { isConnected, connect, room, player } = useGameStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        connect();
    }, [connect]);

    if (!isConnected) {
        return (
            <div className="min-h-screen w-screen bg-slate-900 flex items-center justify-center text-white relative">
                {/* Background sea overlay */}
                <div className="fixed inset-0 pointer-events-none opacity-40 bg-[url('/fields/sea.png')] bg-center z-0" style={{ backgroundSize: '300%' }}></div>

                <div className="animate-pulse relative z-10">{t('connecting')}</div>
                <button
                    onClick={() => navigate('/')}
                    className="fixed top-4 left-4 z-[100] p-2 bg-neutral-800/80 backdrop-blur text-gray-200 hover:text-white rounded-lg border border-white/10 shadow-lg transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Back to Home"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="fixed top-4 right-4 z-[100]">
                    <LanguageSelector />
                </div>
            </div>
        );
    }

    if (!room || !player) {
        return (
            <div className="min-h-screen w-screen bg-slate-900 p-4 flex items-center justify-center relative">
                {/* Background sea overlay */}
                <div className="fixed inset-0 pointer-events-none opacity-40 bg-[url('/fields/sea.png')] bg-center z-0" style={{ backgroundSize: '300%' }}></div>

                <button
                    onClick={() => navigate('/')}
                    className="fixed top-4 left-4 z-[100] p-2 bg-neutral-800/80 backdrop-blur text-gray-200 hover:text-white rounded-lg border border-white/10 shadow-lg transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Back to Home"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="fixed top-4 right-4 z-[100]">
                    <LanguageSelector />
                </div>
                <div className="relative z-10 w-full max-w-md">
                    <Lobby />
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-slate-900">
            {/* Background sea overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('/fields/sea.png')] bg-center z-0" style={{ backgroundSize: '300%' }}></div>
            <ActiveGame />
        </div>
    );
};

export default Trading;
