import React from 'react';
import type { HexConfig } from '../types';
import NumberToken from './NumberToken';

interface HexProps {
    config: HexConfig;
    size?: number | string; // Size in pixels or percentage
    tokenScale?: number;
    harborScale?: number;
    style?: React.CSSProperties;
}

const Hex: React.FC<HexProps> = ({ config, size = 100, tokenScale = 1, harborScale = 60, style }) => {
    const { terrain, numberToken, harbor, harborRotation, harborOnLand } = config;

    // Determine image path based on terrain
    // Assuming keys in types match filenames in public/fields/
    const imagePath = `/fields/${terrain}.png`;

    // Determine harbor image path
    const harborImagePath = harbor && harbor !== 'none' ? `/harbours/${harbor}_harbour.png` : null;

    // Calculate transformations
    // If on land, we translate backwards (push to border), facing inwards. Needs even larger push (125%) to clear the hex and avoid overlay
    // If on sea, we translate forwards (push to land), facing land. (-42% is sufficient)
    const translateY = harborOnLand ? '112%' : '-42%';

    return (
        <div
            className="absolute flex items-center justify-center"
            style={{
                width: size,
                height: size,
                // Removed clipPath from parent to allow harbors to overflow
                ...style
            }}
        >
            {/* Terrain Image with Hex Shape Clip */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
            >
                <img
                    src={imagePath}
                    alt={terrain}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Harbor Overlay - Rendered outside the clip path */}
            {harborImagePath && (
                <div
                    className="absolute z-[5]"
                    style={{
                        width: `${harborScale}%`,
                        height: `${harborScale}%`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${harborRotation || 0}deg) translateY(${translateY})`,
                    }}
                >
                    <img
                        src={harborImagePath}
                        alt={`${harbor} harbor`}
                        className="w-full h-full object-contain"
                    />
                </div>
            )}

            {/* Number Token Overlay */}
            {numberToken && (
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{
                        left: '50.3%',
                        top: '56.5%',
                        transform: `translate(-50%, -50%) scale(${tokenScale})`
                    }}
                >
                    <NumberToken value={numberToken} />
                </div>
            )}
        </div>
    );
};

export default Hex;
