import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shuffle, ArrowLeftRight } from 'lucide-react';
import NavigationCard from '../components/NavigationCard';

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center flex-1 gap-8 w-full max-w-sm mx-auto h-[90vh]">
            <div className="text-center mb-4 p-4 bg-neutral-900/40 backdrop-blur-md rounded-xl border border-catan-wood/30">
                <h1 className="text-4xl font-extrabold text-[#F5DEB3] mb-2 drop-shadow-md" style={{ textShadow: '2px 2px 4px #000' }}>
                    Catan Helper
                </h1>
                <p className="text-gray-300 font-medium">
                    {t('welcome')}
                </p>
            </div>

            <div className="w-full flex flex-col gap-6">
                <NavigationCard
                    to="/randomizer"
                    title={t('randomizer')}
                    icon={Shuffle}
                    color="#F5DEB3" // Wheat color
                    description={t('randomizerDesc')}
                    bgImage="/fields/ore.png"
                />
                <NavigationCard
                    to="/trading"
                    title={t('trading')}
                    icon={ArrowLeftRight}
                    color="#1E90FF" // Catan Blue
                    description={t('tradingDesc')}
                    bgImage="/fields/sheep.png"
                />
            </div>
        </div>
    );
};

export default Home;
