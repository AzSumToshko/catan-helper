import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavigationCardProps {
    to: string;
    title: string;
    icon: LucideIcon;
    color: string;
    description?: string;
    bgImage?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ to, title, icon: Icon, color, description, bgImage }) => {
    return (
        <Link
            to={to}
            className={`
        w-full p-6 rounded-xl border-4 border-catan-wood
        bg-neutral-900/60 hover:bg-neutral-900/40 active:scale-95 transition-all
        flex flex-col items-center justify-center text-center gap-4
        group shadow-xl backdrop-blur-sm relative overflow-hidden
      `}
            style={{
                boxShadow: `0 8px 30px -5px rgba(0,0,0,0.5)`,
            }}
        >
            {/* Background Image */}
            {bgImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                ></div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center">
                <div
                    className="p-4 rounded-full bg-neutral-900/80 border-2 border-catan-wood/50 transition-transform group-hover:scale-110 shadow-lg mb-2"
                    style={{ color: color }}
                >
                    <Icon size={40} strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold text-[#F5DEB3] drop-shadow-md mb-1" style={{ textShadow: '2px 2px 0px #000' }}>{title}</h2>
                    {description && <p className="text-sm text-gray-200 font-medium drop-shadow-sm bg-black/40 px-3 py-1 rounded-full">{description}</p>}
                </div>
            </div>
        </Link>
    );
};

export default NavigationCard;
