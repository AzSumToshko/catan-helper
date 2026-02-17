import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from 'react-i18next';

export const TradeList: React.FC = () => {
    const { activeTrades, player, respondToOffer } = useGameStore();
    const { t } = useTranslation();

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTrades.length === 0 && (
                <div className="text-center text-slate-500 mt-10 italic">
                    {t('noTrades')}
                </div>
            )}

            {activeTrades.map((trade) => {
                const isMyTrade = trade.fromPlayerId === player?.id;

                return (
                    <div key={trade.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg relative">
                        <div className="flex justify-between items-start mb-3">
                            <div className="text-sm text-slate-400">
                                {t('offerFrom')} <span className="text-amber-400 font-bold">{trade.fromPlayerId}</span>
                            </div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                {trade.status}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            {/* Gives */}
                            <div className="flex-1 bg-slate-900/50 p-2 rounded flex flex-wrap gap-1">
                                <div className="w-full text-xs text-slate-500 mb-1">{t('giving').toUpperCase()}</div>
                                {trade.offer.map((item, idx) => (
                                    <div key={idx} className="bg-slate-700 px-2 py-1 rounded text-sm text-white flex items-center gap-1">
                                        {/* Could use tiny icons here */}
                                        <span>{item.count}x {t(item.type)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-slate-500">→</div>

                            {/* Wants */}
                            <div className="flex-1 bg-slate-900/50 p-2 rounded flex flex-wrap gap-1">
                                <div className="w-full text-xs text-slate-500 mb-1">{t('wanting').toUpperCase()}</div>
                                {trade.want.map((item, idx) => (
                                    <div key={idx} className="bg-slate-700 px-2 py-1 rounded text-sm text-white flex items-center gap-1">
                                        <span>{item.count}x {t(item.type)}</span>
                                    </div>
                                ))}
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
                                    // Implement counter offer logic or reject
                                    onClick={() => respondToOffer(trade.id, 'rejected')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition-colors"
                                >
                                    {t('reject')}
                                </button>
                            </div>
                        )}

                        {isMyTrade && trade.status === 'pending' && (
                            <button
                                onClick={() => respondToOffer(trade.id, 'rejected')} // Cancel
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
