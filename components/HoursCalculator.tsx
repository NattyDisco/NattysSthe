import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { CalculatorIcon } from './icons';

const HoursCalculator: React.FC = () => {
    const { t } = useI18n();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [breakMinutes, setBreakMinutes] = useState('0');
    const [totalHours, setTotalHours] = useState<string | null>(null);
    
    const calculateHours = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !endTime) {
            setTotalHours(null);
            return;
        }
        
        try {
            const start = new Date(`1970-01-01T${startTime}:00`);
            const end = new Date(`1970-01-01T${endTime}:00`);
            
            let diff = end.getTime() - start.getTime();

            if(diff < 0) { // Handles overnight shifts
                diff += 24 * 60 * 60 * 1000;
            }

            diff -= parseInt(breakMinutes, 10) * 60 * 1000;
            
            if (diff < 0) {
                setTotalHours('Break is longer than work duration.');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            setTotalHours(`${hours}h ${minutes}m`);
        } catch(error) {
            setTotalHours('Invalid time format');
        }
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">{t('sidebar.hours_calculator')}</h1>
            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                <form onSubmit={calculateHours} className="space-y-4">
                    <div>
                        <label htmlFor="start-time" className="block text-sm font-medium">Start Time</label>
                        <input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                     <div>
                        <label htmlFor="end-time" className="block text-sm font-medium">End Time</label>
                        <input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                     <div>
                        <label htmlFor="break-minutes" className="block text-sm font-medium">Break (in minutes)</label>
                        <input id="break-minutes" type="number" value={breakMinutes} onChange={e => setBreakMinutes(e.target.value)} min="0" required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <button type="submit" className="w-full mt-6 p-3 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700">
                        <CalculatorIcon className="h-5 w-5" />
                        {t('hours_calculator.calculate')}
                    </button>
                </form>

                 {totalHours && (
                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-center animate-fadeIn">
                        <p className="text-sm text-slate-500">Total Duration</p>
                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{totalHours}</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default HoursCalculator;