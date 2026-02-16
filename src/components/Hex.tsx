import React from 'react';
import type { HexConfig } from '../types';
import NumberToken from './NumberToken';

interface HexProps {
    config: HexConfig;
    size?: number | string; // Size in pixels or percentage
    tokenScale?: number;
    style?: React.CSSProperties;
}

const Hex: React.FC<HexProps> = ({ config, size = 100, tokenScale = 1, style }) => {
    const { terrain, numberToken } = config;

    // Determine image path based on terrain
    // Assuming keys in types match filenames in public/fields/
    const imagePath = `/fields/${terrain}.png`;

    return (
        <div
            className="absolute flex items-center justify-center"
            style={{
                width: size,
                height: size,
                // Clip path for hex shape (pointy top)
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                ...style
            }}
        >
            <img
                src={imagePath}
                alt={terrain}
                className="absolute inset-0 w-full h-full object-cover"
            />

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
