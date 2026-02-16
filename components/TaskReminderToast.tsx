import React, { useEffect, useState } from 'react';
import { BellAlertIcon, XCircleIcon } from './icons';
import type { Task } from '../types';

interface TaskReminderToastProps {
    task: Task;
    onDismiss: (taskId: string) => void;
}

const TaskReminderToast: React.FC<TaskReminderToastProps> = ({ task, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timerIn = setTimeout(() => setIsVisible(true), 100);
        // Auto dismiss after some time, but user can dismiss earlier
        const timerOut = setTimeout(() => {
            handleDismiss();
        }, 15000); // 15 seconds

        return () => {
            clearTimeout(timerIn);
            clearTimeout(timerOut);
        };
    }, []);
    
    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(task.id), 300); // Call onDismiss after animation
    };

    return (
        <div 
            className={`w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex items-start p-4 border-l-4 border-indigo-500 transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        >
            <div className="flex-shrink-0 text-indigo-500">
                <BellAlertIcon className="h-6 w-6" />
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Task Reminder</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    It's time for: "{task.title}"
                </p>
            </div>
            <button onClick={handleDismiss} className="ml-4 flex-shrink-0 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <XCircleIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default TaskReminderToast;
