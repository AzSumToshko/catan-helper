import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ResourcePanel } from './ResourcePanel';
import { TradeList } from './TradeList';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { LogOut, X, Check, ArrowLeftRight, Ban } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const RESOURCE_IMAGES: Record<string, string> = {
    brick: '/resources/Resource_Brick.png',
    wood: '/resources/Resource_Wood.png',
    ore: '/resources/Resource_Ore.png',
    sheep: '/resources/Resource_Sheep.png',
    wheat: '/resources/Resource_Grain.png',
    paper: '/resources/Resource_Paper.png',
    coin: '/resources/Resource_Coin.png',
    cloth: '/resources/Resource_Cloth.png',
};

const parseHistory = (entry: string): { text: string; offer?: { type: string; count: number }[]; want?: { type: string; count: number }[]; type?: string } => {
    try {
        const parsed = JSON.parse(entry);
        return { text: parsed.text || entry, offer: parsed.offer, want: parsed.want, type: parsed.type };
    } catch {
        return { text: entry };
    }
};

export const ActiveGame: React.FC = () => {
    const { room, players, createOffer, history, isConnected, recentResolutions } = useGameStore();
    const [mode, setMode] = useState<'give' | 'want'>('give');
    const [give, setGive] = useState<Record<string, number>>({});
    const [want, setWant] = useState<Record<string, number>>({});
    const [showHistory, setShowHistory] = useState(false);
    const { t } = useTranslation();

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

    const handleCounterOffer = (prefillGive: Record<string, number>, prefillWant: Record<string, number>) => {
        setGive(prefillGive);
        setWant(prefillWant);
        setMode('give');
    };

    const hasResources = Object.keys(give).length > 0 || Object.keys(want).length > 0;

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
                        </div>
                    ))}
                </div>

                {/* Right: Language */}
                <div className="flex items-center justify-end">
                    <LanguageSelector className="h-9 w-20 text-[10px] px-2 py-0" />
                </div>
            </div>

            {/* Toast Notifications */}
            {recentResolutions.length > 0 && (
                <div className="fixed top-16 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
                    {recentResolutions.map((res, i) => (
                        <div
                            key={`toast-${res.timestamp}-${i}`}
                            className={clsx(
                                "px-4 py-2.5 rounded-lg shadow-xl border flex items-center gap-2.5 text-sm font-semibold pointer-events-auto max-w-sm w-full animate-[slideDown_0.3s_ease-out]",
                                res.type === 'accepted' && "bg-green-800/95 border-green-600/60 text-green-100",
                                res.type === 'countered' && "bg-amber-800/95 border-amber-600/60 text-amber-100",
                                res.type === 'cancelled' && "bg-red-800/95 border-red-600/60 text-red-100",
                            )}
                        >
                            {res.type === 'accepted' && <Check size={18} className="shrink-0 text-green-300" />}
                            {res.type === 'countered' && <ArrowLeftRight size={18} className="shrink-0 text-amber-300" />}
                            {res.type === 'cancelled' && <Ban size={18} className="shrink-0 text-red-300" />}
                            <span>
                                {res.type === 'accepted' && t('tradeAccepted', { player: res.resolvedBy, from: res.fromPlayerName })}
                                {res.type === 'countered' && t('tradeCountered', { player: res.resolvedBy, from: res.fromPlayerName })}
                                {res.type === 'cancelled' && t('tradeCancelled', { player: res.resolvedBy })}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content: Trade List & History */}
            <div className="flex-1 overflow-hidden flex flex-col relative pb-[180px]">
                {!isConnected && (
                    <div className="bg-yellow-600/80 text-center py-1.5 text-xs font-bold text-white shrink-0 animate-pulse">
                        Reconnecting...
                    </div>
                )}
                {history.length > 0 && (
                    <button
                        onClick={() => setShowHistory(true)}
                        className="w-full bg-slate-800/60 px-4 py-2 border-b border-slate-700/50 shrink-0 hover:bg-slate-700/60 transition-colors cursor-pointer text-left"
                    >
                        <div className="flex gap-3 overflow-x-auto text-xs text-slate-400 whitespace-nowrap">
                            {history.slice(0, 8).map((h, i) => (
                                <span key={i} className={clsx("shrink-0", i === 0 && "text-slate-300 font-medium")}>
                                    {parseHistory(h).text}
                                </span>
                            ))}
                        </div>
                    </button>
                )}
                <TradeList onCounterOffer={handleCounterOffer} />
            </div>

            {/* Combined Trading Interface (Bottom Section) */}
            <div className="fixed bottom-0 left-0 right-0 px-3 py-2 bg-slate-900/95 border-t border-slate-700 backdrop-blur-md z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-xl mx-auto space-y-1.5">
                    {/* Give → Want preview (full width row) */}
                    <div className="flex items-center gap-1 min-h-[36px] bg-slate-800 rounded-lg px-2 py-1 overflow-x-auto">
                        {/* Give images */}
                        <div className="flex items-end gap-0.5 shrink-0">
                            {Object.entries(give).length > 0 ? (
                                Object.entries(give).map(([type, count]) => (
                                    <button key={type} onClick={() => removeResource(type, 'give')} className="flex -space-x-2.5 hover:opacity-70 transition-opacity">
                                        {Array.from({ length: count }).map((_, i) => (
                                            <img key={i} src={RESOURCE_IMAGES[type]} alt={type} className="w-5 h-8 object-contain drop-shadow" style={{ zIndex: i }} />
                                        ))}
                                    </button>
                                ))
                            ) : (
                                <span className="text-slate-600 text-[9px] italic">{t('iGive')}...</span>
                            )}
                        </div>

                        <span className="text-slate-500 text-sm shrink-0 mx-1">→</span>

                        {/* Want images */}
                        <div className="flex items-end gap-0.5 shrink-0">
                            {Object.entries(want).length > 0 ? (
                                Object.entries(want).map(([type, count]) => (
                                    <button key={type} onClick={() => removeResource(type, 'want')} className="flex -space-x-2.5 hover:opacity-70 transition-opacity">
                                        {Array.from({ length: count }).map((_, i) => (
                                            <img key={i} src={RESOURCE_IMAGES[type]} alt={type} className="w-5 h-8 object-contain drop-shadow" style={{ zIndex: i }} />
                                        ))}
                                    </button>
                                ))
                            ) : (
                                <span className="text-slate-600 text-[9px] italic">{t('iWant')}...</span>
                            )}
                        </div>
                    </div>

                    {/* Controls: mode toggles + post button */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 shrink-0">
                            <button
                                onClick={() => setMode('give')}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-colors",
                                    mode === 'give' ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400"
                                )}
                            >
                                {t('iGive')}
                            </button>
                            <button
                                onClick={() => setMode('want')}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-colors",
                                    mode === 'want' ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
                                )}
                            >
                                {t('iWant')}
                            </button>
                        </div>

                        <div className="flex-1" />

                        <button
                            onClick={handleOffer}
                            disabled={!hasResources}
                            className="shrink-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {t('postOffer')}
                        </button>
                    </div>

                    {/* Resource Selector */}
                    <ResourcePanel onSelect={handleResourceClick} selected={undefined} />
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowHistory(false)}>
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
                        onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
                            <h2 className="text-lg font-bold text-white">{t('history')}</h2>
                            <button onClick={() => setShowHistory(false)}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {history.length === 0 ? (
                                <div className="text-center text-slate-500 italic py-8">{t('noTrades')}</div>
                            ) : (
                                history.map((entry, i) => {
                                    const parsed = parseHistory(entry);
                                    return (
                                        <div key={i} className={clsx(
                                            "rounded-lg p-3 border",
                                            parsed.type === 'accepted' && "bg-green-900/20 border-green-800/40",
                                            parsed.type === 'countered' && "bg-amber-900/20 border-amber-800/40",
                                            parsed.type === 'cancelled' && "bg-red-900/20 border-red-800/40",
                                            !parsed.type && "bg-slate-900/50 border-slate-700/50",
                                        )}>
                                            <div className="text-sm text-slate-300">{parsed.text}</div>
                                            {parsed.offer && parsed.want && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-end gap-0.5">
                                                        {parsed.offer.map((item, idx) => (
                                                            <div key={idx} className="flex -space-x-2">
                                                                {Array.from({ length: item.count }).map((_, j) => (
                                                                    <img key={j} src={RESOURCE_IMAGES[item.type]} alt={item.type}
                                                                        className="w-5 h-8 object-contain drop-shadow" style={{ zIndex: j }} />
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-slate-500 text-sm">→</span>
                                                    <div className="flex items-end gap-0.5">
                                                        {parsed.want.map((item, idx) => (
                                                            <div key={idx} className="flex -space-x-2">
                                                                {Array.from({ length: item.count }).map((_, j) => (
                                                                    <img key={j} src={RESOURCE_IMAGES[item.type]} alt={item.type}
                                                                        className="w-5 h-8 object-contain drop-shadow" style={{ zIndex: j }} />
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
