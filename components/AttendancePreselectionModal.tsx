import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { AttendanceIcon, ChartIcon, XCircleIcon } from './icons';

interface AttendancePreselectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { employeeId: string };
}

const AttendancePreselectionModal: React.FC<AttendancePreselectionModalProps> = ({ isOpen, onClose, context }) => {
    const { setView, setPreselectedEmployeeForAttendance, setPreselectedEmployeeIdForReport, employees } = useAppContext();
    const { t } = useI18n();
    
    const employee = employees.find(e => e.id === context.employeeId);

    const handleViewAttendance = () => {
        setPreselectedEmployeeForAttendance(context.employeeId);
        setView('attendance');
        onClose();
    };
    
    const handleViewReport = () => {
        setPreselectedEmployeeIdForReport(context.employeeId);
        setView('reports');
        onClose();
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-center">{employee.firstName} {employee.surname}</h2>
                <p className="text-center text-slate-500 mb-6">{t('modals.preselection.subtitle')}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={handleViewAttendance} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
                        <AttendanceIcon className="h-8 w-8 text-indigo-500"/>
                        <span className="font-semibold">{t('modals.preselection.view_attendance')}</span>
                    </button>
                     <button onClick={handleViewReport} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
                        <ChartIcon className="h-8 w-8 text-indigo-500"/>
                        <span className="font-semibold">{t('modals.preselection.view_reports')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendancePreselectionModal;
