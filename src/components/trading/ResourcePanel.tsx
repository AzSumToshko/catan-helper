import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface ResourcePanelProps {
    onSelect: (type: string) => void;
    selected?: string;
}

const RESOURCES = [
    { id: 'brick', id_key: 'brick', img: '/resources/Resource_Brick.png' },
    { id: 'wood', id_key: 'wood', img: '/resources/Resource_Wood.png' },
    { id: 'ore', id_key: 'ore', img: '/resources/Resource_Ore.png' },
    { id: 'sheep', id_key: 'sheep', img: '/resources/Resource_Sheep.png' },
    { id: 'wheat', id_key: 'wheat', img: '/resources/Resource_Grain.png' },
    { id: 'paper', id_key: 'paper', img: '/resources/Resource_Paper.png' },
    { id: 'coin', id_key: 'coin', img: '/resources/Resource_Coin.png' },
    { id: 'cloth', id_key: 'cloth', img: '/resources/Resource_Cloth.png' }
];

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ onSelect, selected }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full mt-4">
            <div className="flex flex-wrap justify-center gap-y-4 gap-x-2 max-w-lg mx-auto">
                {RESOURCES.map((res) => (
                    <button
                        key={res.id}
                        onClick={() => onSelect(res.id)}
                        className={clsx(
                            "relative group transition-all duration-200 flex flex-col items-center w-[18%]",
                            selected === res.id ? "scale-110" : "hover:scale-105"
                        )}
                    >
                        <div className="w-12 h-18 sm:w-16 sm:h-24 relative">
                            <img
                                src={res.img}
                                alt={t(res.id_key)}
                                className="w-full h-full object-contain filter drop-shadow-md transition-transform group-hover:-translate-y-1"
                            />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-400 mt-1 truncate w-full text-center">
                            {t(res.id_key)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
