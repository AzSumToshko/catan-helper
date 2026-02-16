import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Trading: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} className="mr-1" />
                    {t('back')}
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                <h2 className="text-2xl font-bold mb-2 text-catan-water">{t('trading')}</h2>
                <p className="text-gray-400">Implementation coming soon...</p>
            </div>
        </div>
    );
};

export default Trading;
