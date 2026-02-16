import React, { useEffect, useState } from 'react';
import { BellAlertIcon, XCircleIcon } from './icons';
import type { DocumentReminder, WorkPermitReminder, EmployeeDocumentReminder } from '../types';

type Reminder = DocumentReminder | WorkPermitReminder | EmployeeDocumentReminder;

interface ReminderToastProps {
    reminder: Reminder;
    onDismiss: (id: string) => void;
}

const getReminderText = (reminder: Reminder): string => {
    if ('vehicleModel' in reminder) { // DocumentReminder
        return `${reminder.docType} for ${reminder.vehicleModel} (${reminder.plateNumber}) is ${reminder.status} in ${reminder.daysUntil} days.`;
    }
    if ('permitNumber' in reminder) { // WorkPermitReminder
        return `Work permit for ${reminder.employeeName} is ${reminder.status} in ${reminder.daysUntil} days.`;
    }
    if ('docTitle' in reminder) { // EmployeeDocumentReminder
        return `Document '${reminder.docTitle}' for ${reminder.employeeName} is ${reminder.status} in ${reminder.daysUntil} days.`;
    }
    return 'Reminder';
};

const DocumentReminderToast: React.FC<ReminderToastProps> = ({ reminder, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timerIn = setTimeout(() => setIsVisible(true), 100);
        const timerOut = setTimeout(() => {
            handleDismiss();
        }, 10000);

        return () => {
            clearTimeout(timerIn);
            clearTimeout(timerOut);
        };
    }, []);
    
    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(reminder.id), 300);
    };

    return (
        <div className={`w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex items-start p-4 border-l-4 border-orange-500 transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="flex-shrink-0 text-orange-500">
                <BellAlertIcon className="h-6 w-6" />
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Document Reminder</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {getReminderText(reminder)}
                </p>
            </div>
            <button onClick={handleDismiss} className="ml-4 flex-shrink-0 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <XCircleIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default DocumentReminderToast;
