import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Settings2, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Hex from '../components/Hex';
import type { HexConfig, RandomizerSettings } from '../types';
import { generateMap } from '../utils/mapGenerator';
import { GAME_DATA } from '../data/gameData';
import { TerrainType } from '../types';

const Randomizer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [mapData, setMapData] = useState<HexConfig[]>([]);
    const [settings, setSettings] = useState<RandomizerSettings>({
        islands: 1,
        minFieldsPerIsland: 3,
        preventRedClustering: true,
        maxTouchingSameNumbers: 0,
        maxTouchingSameResources: 1,
        harborPlacement: 'balanced',
    });

    // Calculate Dynamic Max for Min Fields
    const totalLandHexes = Object.entries(GAME_DATA.counts.fields.byType).reduce((acc, [type, count]) => {
        return type !== TerrainType.Sea ? acc + count : acc;
    }, 0);

    const maxMinFields = Math.floor(totalLandHexes / settings.islands);

    // Ensure minFieldsPerIsland is valid when islands change
    useEffect(() => {
        if (settings.minFieldsPerIsland > maxMinFields) {
            updateSetting('minFieldsPerIsland', maxMinFields);
        }
    }, [settings.islands, maxMinFields, settings.minFieldsPerIsland]);

    // Calibration State 
    const [showCalibration, setShowCalibration] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [displayMode, setDisplayMode] = useState<'overlay' | 'standalone'>('overlay');
    const [gridScale, setGridScale] = useState(1.11); // Slightly zoomed out
    // Hex Size should be roughly matching X_OFFSET/Y_OFFSET scale if 1:1.
    // X Scale is 10%. Hex Size 12% means slight overlap/tight fit.
    const [hexSize, setHexSize] = useState(12.17);
    const [tokenScale, setTokenScale] = useState(0.6); // Standard size tokens
    const [verOffset, setVerOffset] = useState(-0); // Shift up slightly
    const [horOffset, setHorOffset] = useState(0);
    const [harborScale, setHarborScale] = useState(60);

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
            <button
                onClick={() => navigate('/')}
                className="fixed top-4 left-4 z-[100] p-2 bg-neutral-800/80 backdrop-blur text-gray-200 hover:text-white rounded-lg border border-white/10 shadow-lg transition-all flex items-center justify-center cursor-pointer"
                aria-label="Back to Home"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Display Mode Toggle - Below Back Button */}
            <button
                onClick={() => setDisplayMode(displayMode === 'overlay' ? 'standalone' : 'overlay')}
                className="fixed top-4 left-16 z-[60] px-4 py-2 bg-neutral-800/80 backdrop-blur text-gray-200 hover:text-white rounded-lg border border-white/10 shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
            >
                {displayMode === 'overlay' ? (
                    <>
                        <Settings2 size={16} />
                        {t('boardOverlay')}
                    </>
                ) : (
                    <>
                        <Check size={16} />
                        {t('standaloneGrid')}
                    </>
                )}
            </button>

            {/* Map Area - Maximized */}
            <div className="flex-1 relative w-full h-full flex items-center justify-center bg-[#1a365d]/40 overflow-hidden">
                {displayMode === 'overlay' ? (
                    /* Overlay Mode: Board with calibrated hexes */
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
                                            harborScale={harborScale}
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
                ) : (
                    /* Standalone Mode: Static hex grid without board */
                    <div className="relative w-full h-full flex items-start justify-start pb-8 pl-1">
                        <div className="relative scale-[0.7] sm:scale-85 md:scale-95 lg:scale-100" style={{ width: 'auto', height: '380px' }}>
                            {mapData.map((hex, index) => {
                                // Static hexagonal grid layout matching the 5-6-7-6-7-6-5 pattern
                                // This matches the MAP_SLOTS order from mapSlots.ts
                                const hexSize = 77;
                                const horizontalSpacing = 80;
                                const verticalSpacing = 63;

                                // Row configuration: [5, 6, 7, 6, 7, 6, 5]
                                const rowCounts = [5, 6, 7, 6, 7, 6, 5];

                                // Calculate which row this hex belongs to
                                let currentRow = 0;
                                let indexInRow = index;
                                let cumulativeCount = 0;

                                for (let r = 0; r < rowCounts.length; r++) {
                                    if (index < cumulativeCount + rowCounts[r]) {
                                        currentRow = r;
                                        indexInRow = index - cumulativeCount;
                                        break;
                                    }
                                    cumulativeCount += rowCounts[r];
                                }

                                const hexesInRow = rowCounts[currentRow];

                                // Calculate position
                                // Center the row horizontally
                                const rowStartX = (7 - hexesInRow) * horizontalSpacing / 2;
                                const xPos = rowStartX + indexInRow * horizontalSpacing;
                                const yPos = currentRow * verticalSpacing;

                                const pos = { left: xPos, top: yPos };

                                return (
                                    <Hex
                                        key={index}
                                        config={hex}
                                        size={`${hexSize}px`}
                                        tokenScale={0.6}
                                        harborScale={harborScale}
                                        style={{
                                            left: `${pos.left}px`,
                                            top: `${pos.top}px`,
                                            position: 'absolute'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Section */}
            <div className="bg-neutral-800 border-t border-white/10 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] shrink-0 w-full flex flex-col">

                {/* Scrollable Settings Area */}
                <div className="flex-1 overflow-y-auto max-h-[35vh]">
                    {/* Calibration Section */}
                    <div className="border-b border-white/5">
                        <button
                            onClick={() => setShowCalibration(!showCalibration)}
                            className="w-full flex items-center justify-center py-2 bg-neutral-900/50 hover:bg-neutral-900 text-gray-400 text-xs uppercase tracking-wider font-bold transition-colors"
                        >
                            {showCalibration ? t('hideCalibration') : t('showCalibration')}
                        </button>

                        {showCalibration && (
                            <div className="p-4 bg-black/20 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">{t('zoomSpread')}</label>
                                    <input
                                        type="range" min="0.5" max="2" step="0.05"
                                        value={gridScale}
                                        onChange={(e) => setGridScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">{t('hexSize')}</label>
                                    <input
                                        type="range" min="5" max="25" step="0.5"
                                        value={hexSize}
                                        onChange={(e) => setHexSize(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">{t('horizontal')}</label>
                                    <input
                                        type="range" min="-20" max="20" step="0.5"
                                        value={horOffset}
                                        onChange={(e) => setHorOffset(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">{t('vertical')}</label>
                                    <input
                                        type="range" min="-20" max="20" step="0.5"
                                        value={verOffset}
                                        onChange={(e) => setVerOffset(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">{t('tokenScale')}</label>
                                    <input
                                        type="range" min="0.5" max="1.5" step="0.05"
                                        value={tokenScale}
                                        onChange={(e) => setTokenScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Harbor Scale</label>
                                    <input
                                        type="range" min="30" max="100" step="1"
                                        value={harborScale}
                                        onChange={(e) => setHarborScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map Settings Section */}
                    <div className="border-b border-white/5">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="w-full flex items-center justify-center py-2 bg-neutral-900/50 hover:bg-neutral-900 text-gray-400 text-xs uppercase tracking-wider font-bold transition-colors"
                        >
                            <Settings2 size={14} className="mr-2" />
                            {showSettings ? t('hideMapSettings') : t('showMapSettings')}
                        </button>

                        {showSettings && (
                            <div className="p-4 bg-black/20 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4">
                                {/* Islands Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>{t('islands')}</span>
                                        <span className="font-bold text-catan-wheat">{settings.islands}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="6" step="1"
                                        value={settings.islands}
                                        onChange={(e) => updateSetting('islands', parseInt(e.target.value))}
                                        className="w-full accent-catan-wood h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Min Fields Per Island Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>{t('minFieldsPerIsland')}</span>
                                        <span className="font-bold text-catan-wheat">{settings.minFieldsPerIsland}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max={Math.max(1, maxMinFields)} step="1"
                                        value={settings.minFieldsPerIsland}
                                        onChange={(e) => updateSetting('minFieldsPerIsland', parseInt(e.target.value))}
                                        className="w-full accent-catan-wood h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Max Touching Same Numbers Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>{t('maxTouchingSameNumbers')}</span>
                                        <span className="font-bold text-catan-wheat">{settings.maxTouchingSameNumbers}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="2" step="1"
                                        value={settings.maxTouchingSameNumbers}
                                        onChange={(e) => updateSetting('maxTouchingSameNumbers', parseInt(e.target.value))}
                                        className="w-full accent-catan-wood h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Max Touching Same Resources Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>{t('maxTouchingSameResources')}</span>
                                        <span className="font-bold text-catan-wheat">{settings.maxTouchingSameResources}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="3" step="1"
                                        value={settings.maxTouchingSameResources}
                                        onChange={(e) => updateSetting('maxTouchingSameResources', parseInt(e.target.value))}
                                        className="w-full accent-catan-wood h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="space-y-3">
                                    {/* Harbor Placement Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-sm text-gray-300">{t('harborPlacement')}</span>
                                        <button
                                            onClick={() => updateSetting('harborPlacement', settings.harborPlacement === 'random' ? 'balanced' : 'random')}
                                            className="px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-xs font-bold text-gray-200 transition-colors uppercase tracking-wider"
                                        >
                                            {t(settings.harborPlacement)}
                                        </button>
                                    </div>

                                    {/* Prevent Red Clustering Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-sm text-gray-300">{t('preventRedClustering')}</span>
                                        <button
                                            onClick={() => updateSetting('preventRedClustering', !settings.preventRedClustering)}
                                            className={`p-2 rounded-md transition-colors ${settings.preventRedClustering ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}
                                        >
                                            {settings.preventRedClustering ? <Check size={18} /> : <X size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Big Randomize Button - Always Visible */}
                <div className="p-4 bg-neutral-900 border-t border-white/10">
                    <button
                        onClick={handleRandomize}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] text-white font-bold text-xl rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                        <RefreshCw size={24} />
                        {t('randomizeMap')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Randomizer;
