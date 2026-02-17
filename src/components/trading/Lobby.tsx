import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const Lobby: React.FC = () => {
    const { createRoom, joinRoom, isConnected } = useGameStore();
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [color, setColor] = useState<'red' | 'blue' | 'orange' | 'white'>('red');
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            createRoom(name, color);
        } else {
            joinRoom(pin, name, color);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-white">
                <h2 className="text-xl">{t('connecting')}</h2>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
            <h1 className="text-3xl font-bold text-center mb-8 text-amber-500">{t('catanTrading')}</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setMode('create')}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-semibold transition-colors",
                        mode === 'create'
                            ? "bg-amber-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    )}
                >
                    {t('createRoom')}
                </button>
                <button
                    onClick={() => setMode('join')}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-semibold transition-colors",
                        mode === 'join'
                            ? "bg-amber-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    )}
                >
                    {t('joinRoom')}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t('playerName')}</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                        placeholder={t('enterName')}
                    />
                </div>

                {mode === 'join' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t('roomPin')}</label>
                        <input
                            type="text"
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                            placeholder={t('enterPin')}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('selectColor')}</label>
                    <div className="flex gap-2 justify-between">
                        {['red', 'blue', 'orange', 'white'].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c as any)}
                                className={clsx(
                                    "w-12 h-12 rounded-full border-4 transition-transform hover:scale-110",
                                    color === c ? "border-amber-400 scale-110" : "border-slate-600",
                                    {
                                        'bg-red-600': c === 'red',
                                        'bg-blue-600': c === 'blue',
                                        'bg-orange-500': c === 'orange',
                                        'bg-white': c === 'white'
                                    }
                                )}
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                    {mode === 'create' ? t('createLobby') : t('joinLobby')}
                </button>
            </form>
        </div>
    );
};
