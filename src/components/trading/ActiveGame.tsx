import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ResourcePanel } from './ResourcePanel';
import { TradeList } from './TradeList';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { LogOut, Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

export const ActiveGame: React.FC = () => {
    const { room, players, player, claimTurn, createOffer } = useGameStore();
    const [mode, setMode] = useState<'give' | 'want'>('give');
    const [give, setGive] = useState<Record<string, number>>({});
    const [want, setWant] = useState<Record<string, number>>({});
    const { t } = useTranslation();

    const isMyTurn = player?.isTurn;

    const handleResourceClick = (type: string) => {
        if (mode === 'give') {
            setGive(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
        } else {
            setWant(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
        }
    };

    const removeResource = (type: string, target: 'give' | 'want') => {
        if (target === 'give') {
            setGive(prev => {
                const newCount = (prev[type] || 0) - 1;
                if (newCount <= 0) {
                    const { [type]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [type]: newCount };
            });
        } else {
            setWant(prev => {
                const newCount = (prev[type] || 0) - 1;
                if (newCount <= 0) {
                    const { [type]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [type]: newCount };
            });
        }
    };

    const handleOffer = () => {
        const offerItems = Object.entries(give).map(([type, count]) => ({ type, count }));
        const wantItems = Object.entries(want).map(([type, count]) => ({ type, count }));

        if (offerItems.length === 0 && wantItems.length === 0) return;

        createOffer(offerItems, wantItems);
        setGive({});
        setWant({});
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-transparent text-white relative">
            {/* Header */}
            <div className="bg-slate-800 p-3 shadow-md grid grid-cols-3 items-center z-10 shrink-0">
                {/* Left: Logout & Room Info */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => useGameStore.getState().leaveRoom()}
                        className="p-2 bg-slate-700 hover:bg-red-900/40 text-slate-300 rounded-lg transition-colors border border-slate-600"
                        title={t('leave')}
                    >
                        <LogOut size={18} />
                    </button>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t('room')}</span>
                        <span className="text-amber-500 font-bold text-lg">{room?.pin}</span>
                    </div>
                </div>

                {/* Center: Player Avatars */}
                <div className="flex justify-center -space-x-1.5">
                    {players.map(p => (
                        <div
                            key={p.id}
                            title={p.name}
                            className={clsx(
                                "w-7 h-7 rounded-full border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold relative",
                                {
                                    'bg-red-600': p.color === 'red',
                                    'bg-blue-600': p.color === 'blue',
                                    'bg-orange-500': p.color === 'orange',
                                    'bg-white text-slate-900': p.color === 'white'
                                }
                            )}
                        >
                            {p.name[0]}
                            {p.isTurn && (
                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse border border-slate-900" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2">
                    <LanguageSelector className="h-9 w-20 text-[10px] px-2 py-0" />
                    <button
                        onClick={claimTurn}
                        disabled={isMyTurn}
                        className={clsx(
                            "h-9 w-28 rounded-lg font-bold text-[10px] transition-all border",
                            isMyTurn
                                ? "bg-green-600 border-green-500 cursor-default"
                                : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                        )}
                    >
                        {isMyTurn ? t('itsMyTurn') : t('claimTurn')}
                    </button>
                </div>
            </div>

            {/* Main Content: Trade List & History */}
            <div className="flex-1 overflow-hidden flex flex-col relative pb-[450px]">
                {/* History Log (Overlay or separate?) - Let's keep it simple for now, just TradeList */}
                <TradeList />
            </div>

            {/* Combined Trading Interface (Bottom Section) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 border-t border-slate-700 backdrop-blur-md z-40 transition-all shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-xl mx-auto space-y-4">
                    {/* Action Button */}
                    <button
                        onClick={handleOffer}
                        disabled={Object.keys(give).length === 0 && Object.keys(want).length === 0}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {t('postOffer')}
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Toggle Give/Want */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('give')}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold transition-colors",
                                    mode === 'give' ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400"
                                )}
                            >
                                {t('iGive')}
                            </button>
                            <button
                                onClick={() => setMode('want')}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold transition-colors",
                                    mode === 'want' ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
                                )}
                            >
                                {t('iWant')}
                            </button>
                        </div>

                        {/* Selected Resources */}
                        <div className="flex-1 flex gap-2 min-h-[48px] bg-slate-800 rounded-lg p-2 items-center overflow-x-auto">
                            {(mode === 'give' ? Object.entries(give) : Object.entries(want)).length === 0 ? (
                                <span className="text-slate-600 text-[10px] italic ml-1">{t('selectResources')}</span>
                            ) : (
                                (mode === 'give' ? Object.entries(give) : Object.entries(want)).map(([type, count]) => (
                                    <button
                                        key={type}
                                        onClick={() => removeResource(type, mode)}
                                        className="bg-slate-700 hover:bg-red-900/50 text-white px-2 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0 text-xs"
                                    >
                                        <span className="capitalize">{t(type)}</span>
                                        <span className="bg-slate-900 px-1 rounded-full text-[10px]">{count}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Resource Selector (Integrated) */}
                    <ResourcePanel onSelect={handleResourceClick} selected={undefined} />
                </div>
            </div>
        </div>
    );
};
