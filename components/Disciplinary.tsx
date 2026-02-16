import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ExclamationTriangleIcon, PlusIcon } from './icons';

const Disciplinary: React.FC = () => {
    const { disciplinaryRecords, employees, openDisciplinaryModal } = useAppContext();
    const { t } = useI18n();

    const employeeMap = new Map(employees.map(e => [e.id, `${e.firstName} ${e.surname}`]));

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('sidebar.disciplinary')}</h1>
                {/* A button to open the modal should ideally be contextual per employee, but a general one can be here */}
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4">{t('common.employee')}</th>
                                <th className="p-4">{t('disciplinary.table.date')}</th>
                                <th className="p-4">{t('disciplinary.table.type')}</th>
                                <th className="p-4">{t('disciplinary.table.reason')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {disciplinaryRecords.map(rec => (
                            <tr key={rec.id} className="border-t dark:border-slate-700">
                                <td className="p-4">{employeeMap.get(rec.employeeId)}</td>
                                <td className="p-4">{rec.incidentDate}</td>
                                <td className="p-4">{rec.type}</td>
                                <td className="p-4">{rec.reason}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Disciplinary;