import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { BriefcaseIcon } from './icons';
import { useAppContext } from '../hooks/useAppContext';
import { View } from '../types';

const HRHub: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { t } = useI18n();

    const hubItems = [
        { view: 'employees' as View, label: t('sidebar.employees') },
        { view: 'recruitment' as View, label: t('sidebar.recruitment') },
        { view: 'disciplinary' as View, label: t('sidebar.disciplinary') },
    ];

    return (
        <div className="container mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">{t('sidebar.hr_hub')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hubItems.map(item => (
                    <button key={item.view} onClick={() => setView(item.view)} className="p-6 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg text-center">
                        <BriefcaseIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4"/>
                        <h2 className="font-bold text-xl">{item.label}</h2>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HRHub;
