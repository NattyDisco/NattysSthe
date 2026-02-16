import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { TrophyIcon } from './icons';

const Incentives: React.FC = () => {
    const { employees } = useAppContext();
    const { t } = useI18n();
    
    const leaderboard = [...employees].sort((a, b) => b.points - a.points).slice(0, 10);

    return (
        <div className="container mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">{t('sidebar.incentives')}</h1>
            
            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">{t('incentives.leaderboard')}</h2>
                <ol className="space-y-2">
                    {leaderboard.map((emp, index) => (
                        <li key={emp.id} className="flex justify-between items-center p-2 bg-slate-100/70 rounded-md">
                            <span className="font-bold">{index + 1}. {emp.firstName} {emp.surname}</span>
                            <span className="font-semibold">{emp.points} {t('incentives.points')}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default Incentives;
