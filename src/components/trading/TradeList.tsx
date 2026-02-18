import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import type { TradeOffer } from '../../store/gameStore';

interface TradeListProps {
    onCounterOffer?: (give: Record<string, number>, want: Record<string, number>) => void;
}

const colorClasses: Record<string, string> = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    orange: 'bg-orange-500',
    white: 'bg-white',
};

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

export const TradeList: React.FC<TradeListProps> = ({ onCounterOffer }) => {
    const { activeTrades, player, players, respondToOffer, recentResolutions } = useGameStore();
    const { t } = useTranslation();

    const getPlayerColor = (playerId: string) => {
        const p = players.find(pl => pl.id === playerId);
        return p?.color || 'white';
    };

    const handleCounter = (trade: TradeOffer) => {
        if (!onCounterOffer) return;
        // Remove the original offer
        respondToOffer(trade.id, 'countered');
        // Pre-fill with inverse: what they want → what I give, what they offer → what I want
        const give: Record<string, number> = {};
        const want: Record<string, number> = {};
        trade.want.forEach(item => { give[item.type] = item.count; });
        trade.offer.forEach(item => { want[item.type] = item.count; });
        onCounterOffer(give, want);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Trade resolution notifications */}
            {recentResolutions.map((res, i) => (
                <div key={`res-${res.timestamp}-${i}`} className={clsx(
                    "rounded-lg px-3 py-2 border text-sm font-medium",
                    res.type === 'accepted' && "bg-green-900/30 border-green-700/50 text-green-300",
                    res.type === 'countered' && "bg-amber-900/30 border-amber-700/50 text-amber-300",
                    res.type === 'cancelled' && "bg-slate-700/30 border-slate-600/50 text-slate-400",
                )}>
                    {res.type === 'accepted' && t('tradeAccepted', { player: res.resolvedBy, from: res.fromPlayerName })}
                    {res.type === 'countered' && t('tradeCountered', { player: res.resolvedBy, from: res.fromPlayerName })}
                    {res.type === 'cancelled' && t('tradeCancelled', { player: res.resolvedBy })}
                </div>
            ))}

            {activeTrades.length === 0 && recentResolutions.length === 0 && (
                <div className="text-center text-slate-500 mt-10 italic">
                    {t('noTrades')}
                </div>
            )}

            {activeTrades.map((trade) => {
                const isMyTrade = trade.fromPlayerId === player?.id;
                const playerColor = getPlayerColor(trade.fromPlayerId);

                return (
                    <div key={trade.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg relative">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <div className={clsx('w-3 h-3 rounded-full shrink-0', colorClasses[playerColor])} />
                                <span>
                                    {t('offerFrom')}{' '}
                                    <span className="text-amber-400 font-bold">
                                        {trade.fromPlayerName || 'Unknown'}
                                    </span>
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                {trade.status}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            {/* Gives */}
                            <div className="flex-1 bg-slate-900/50 p-2 rounded">
                                <div className="text-[10px] text-slate-500 mb-1 font-bold">{t('giving').toUpperCase()}</div>
                                <div className="flex flex-wrap gap-1.5 items-end">
                                    {trade.offer.map((item, idx) => (
                                        <div key={idx} className="flex -space-x-3">
                                            {Array.from({ length: item.count }).map((_, i) => (
                                                <img
                                                    key={i}
                                                    src={RESOURCE_IMAGES[item.type] || ''}
                                                    alt={item.type}
                                                    className="w-7 h-10 object-contain drop-shadow-md"
                                                    style={{ zIndex: i }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-slate-500 text-lg shrink-0">→</div>

                            {/* Wants */}
                            <div className="flex-1 bg-slate-900/50 p-2 rounded">
                                <div className="text-[10px] text-slate-500 mb-1 font-bold">{t('wanting').toUpperCase()}</div>
                                <div className="flex flex-wrap gap-1.5 items-end">
                                    {trade.want.map((item, idx) => (
                                        <div key={idx} className="flex -space-x-3">
                                            {Array.from({ length: item.count }).map((_, i) => (
                                                <img
                                                    key={i}
                                                    src={RESOURCE_IMAGES[item.type] || ''}
                                                    alt={item.type}
                                                    className="w-7 h-10 object-contain drop-shadow-md"
                                                    style={{ zIndex: i }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {!isMyTrade && trade.status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => respondToOffer(trade.id, 'accepted')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors"
                                >
                                    {t('accept')}
                                </button>
                                <button
                                    onClick={() => handleCounter(trade)}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded font-semibold transition-colors"
                                >
                                    {t('counter')}
                                </button>
                            </div>
                        )}

                        {isMyTrade && trade.status === 'pending' && (
                            <button
                                onClick={() => respondToOffer(trade.id, 'rejected')}
                                className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 rounded font-semibold transition-colors mt-2"
                            >
                                {t('cancelOffer')}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
