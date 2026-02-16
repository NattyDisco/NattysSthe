import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { TrophyIcon } from './icons';

const EmployeeJourney: React.FC = () => {
    const { selectedEmployeeForJourney, openJourneyEventModal } = useAppContext();
    const { t } = useI18n();

    if (!selectedEmployeeForJourney) {
        return <div className="text-center p-8">{t('employee_journey.no_employee_selected')}</div>;
    }

    const allEvents = [
        ...selectedEmployeeForJourney.achievements.map(a => ({ ...a, type: 'achievement' as const })),
        ...selectedEmployeeForJourney.trainings.map(t => ({ ...t, type: 'training' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="container mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold mb-2">{selectedEmployeeForJourney.firstName} {selectedEmployeeForJourney.surname}'s Journey</h1>
            <p className="text-slate-500 mb-6">{t('employee_journey.subtitle')}</p>
            
            <button onClick={() => openJourneyEventModal(selectedEmployeeForJourney.id, 'achievement')} className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                {t('employee_journey.add_event')}
            </button>
            
            <div className="relative border-l-2 border-indigo-500 pl-8">
                {allEvents.map((event, index) => (
                    <div key={index} className="mb-8">
                        <div className="absolute -left-3.5 mt-1.5 w-6 h-6 bg-indigo-500 rounded-full border-4 border-white dark:border-slate-800"></div>
                        <p className="text-sm text-slate-500">{event.date}</p>
                        <h3 className="font-bold text-lg">{event.type === 'achievement' ? event.title : event.courseName}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{event.type === 'achievement' ? event.description : event.provider}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeJourney;