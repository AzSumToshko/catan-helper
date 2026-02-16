import React from 'react';
import type { NumberToken as NumberTokenType } from '../types';

interface NumberTokenProps {
    value: NumberTokenType;
}

const PROBABILITY_DOTS: Record<number, number> = {
    2: 1, 12: 1,
    3: 2, 11: 2,
    4: 3, 10: 3,
    5: 4, 9: 4,
    6: 5, 8: 5
};

const NumberToken: React.FC<NumberTokenProps> = ({ value }) => {
    const dots = PROBABILITY_DOTS[value] || 0;
    const isRed = value === 6 || value === 8;

    return (
        <div className="w-10 h-10 bg-[#F5DEB3] rounded-full flex flex-col items-center justify-center border-2 border-[#8B4513] shadow-md z-10">
            <span className={`text-lg font-bold leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
                {value}
            </span>
            <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: dots }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${isRed ? 'bg-red-600' : 'bg-black'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default NumberToken;
