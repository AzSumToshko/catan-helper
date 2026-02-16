import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Settings2, Check, X, GripHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hex from '../components/Hex';
import type { HexConfig, RandomizerSettings } from '../types';
import { generateMap } from '../utils/mapGenerator';

const Randomizer: React.FC = () => {
    const [mapData, setMapData] = useState<HexConfig[]>([]);
    const [settings, setSettings] = useState<RandomizerSettings>({
        islands: 1,
        minFieldsPerIsland: 3,
        preventRedClustering: true,
        maxTouchingSameNumbers: 0,
        maxTouchingSameResources: 1,
    });

    // Calibration State 
    const [showCalibration, setShowCalibration] = useState(false);
    const [gridScale, setGridScale] = useState(1.11); // Slightly zoomed out
    // Hex Size should be roughly matching X_OFFSET/Y_OFFSET scale if 1:1.
    // X Scale is 10%. Hex Size 12% means slight overlap/tight fit.
    const [hexSize, setHexSize] = useState(12.17);
    const [tokenScale, setTokenScale] = useState(0.6); // Standard size tokens
    const [verOffset, setVerOffset] = useState(-0); // Shift up slightly
    const [horOffset, setHorOffset] = useState(0);

    // Helper to update settings
    const updateSetting = (key: keyof RandomizerSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomize = () => {
        const newMap = generateMap(settings);
        setMapData(newMap);
    };

    useEffect(() => {
        handleRandomize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.islands]);

    return (
        <div className="flex flex-col h-full bg-neutral-900 overflow-hidden relative">
            {/* Custom Back Button */}
            <Link
                to="/"
                className="fixed top-4 left-4 z-[60] p-2 bg-neutral-800/80 backdrop-blur text-gray-200 hover:text-white rounded-lg border border-white/10 shadow-lg transition-all flex items-center justify-center"
                aria-label="Back to Home"
            >
                <ArrowLeft size={24} />
            </Link>

            {/* Map Area - Maximized */}
            <div className="flex-1 relative w-full h-full flex items-center justify-center bg-[#1a365d]/40 overflow-hidden">
                {/* Board Container with explicit dimensions and aspect ratio handling */}
                <div className="relative w-full h-full max-w-[95vw] max-h-[70vh] aspect-square lg:aspect-[4/3] flex items-center justify-center">
                    {/* Background Image Container */}
                    <div
                        className="absolute inset-0 bg-contain bg-no-repeat bg-center transition-all duration-300"
                        style={{ backgroundImage: "url('/board.png')" }}
                    >
                        {/* Hex Grid Overlay */}
                        <div className="relative w-full h-full">
                            {mapData.map((hex, index) => {
                                // Apply Calibration Transforms
                                // Original standard layout is centered at 50%, 50%
                                // We scale the distance from center
                                const qDist = hex.q - 50;
                                const rDist = hex.r - 50;

                                const finalLeft = 50 + qDist * gridScale + horOffset;
                                const finalTop = 50 + rDist * gridScale + verOffset;

                                return (
                                    <Hex
                                        key={index}
                                        config={hex}
                                        size={`${hexSize}%`}
                                        tokenScale={tokenScale}
                                        style={{
                                            left: `${finalLeft}%`,
                                            top: `${finalTop}%`,
                                            transform: 'translate(-50%, -50%)',
                                            position: 'absolute'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls Section */}
            <div className="bg-neutral-800 border-t border-white/10 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] shrink-0 w-full flex flex-col max-h-[40vh]">

                {/* Toggle Calibration Header */}
                <button
                    onClick={() => setShowCalibration(!showCalibration)}
                    className="w-full flex items-center justify-center py-2 bg-neutral-900/50 hover:bg-neutral-900 text-gray-400 text-xs uppercase tracking-wider font-bold transition-colors border-b border-white/5"
                >
                    {showCalibration ? "Hide Calibration" : "Show Calibration Controls"}
                </button>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                    {/* Settings Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-catan-wheat flex items-center gap-2">
                            <Settings2 size={20} />
                            Map Settings
                        </h2>
                    </div>

                    {/* Calibration Section */}
                    {showCalibration && (
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="col-span-2 text-sm font-bold text-blue-400 flex items-center gap-2">
                                <GripHorizontal size={14} /> Board Calibration
                            </h3>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Zoom / Spread</label>
                                <input
                                    type="range" min="0.5" max="2" step="0.05"
                                    value={gridScale}
                                    onChange={(e) => setGridScale(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Hex Size</label>
                                <input
                                    type="range" min="5" max="25" step="0.5"
                                    value={hexSize}
                                    onChange={(e) => setHexSize(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Horizontal</label>
                                <input
                                    type="range" min="-20" max="20" step="0.5"
                                    value={horOffset}
                                    onChange={(e) => setHorOffset(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Vertical</label>
                                <input
                                    type="range" min="-20" max="20" step="0.5"
                                    value={verOffset}
                                    onChange={(e) => setVerOffset(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Token Scale</label>
                                <input
                                    type="range" min="0.5" max="1.5" step="0.05"
                                    value={tokenScale}
                                    onChange={(e) => setTokenScale(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Standard Settings Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-300">
                                <span>Islands</span>
                                <span className="font-bold text-catan-wheat">{settings.islands}</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="12" step="1"
                                value={settings.islands}
                                onChange={(e) => updateSetting('islands', parseInt(e.target.value))}
                                className="w-full accent-catan-wood h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Toggles Row */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-sm text-gray-300">Prevent Red # Clustering</span>
                            <button
                                onClick={() => updateSetting('preventRedClustering', !settings.preventRedClustering)}
                                className={`p-2 rounded-md transition-colors ${settings.preventRedClustering ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}
                            >
                                {settings.preventRedClustering ? <Check size={18} /> : <X size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Big Randomize Button */}
                    <button
                        onClick={handleRandomize}
                        className="w-full py-4 mt-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] text-white font-bold text-xl rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                        <RefreshCw size={24} />
                        Randomize Map
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Randomizer;
