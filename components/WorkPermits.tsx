import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, IdentificationIcon, EditIcon, TrashIcon } from './icons';
import type { WorkPermit } from '../types';

const WorkPermits: React.FC = () => {
    const { workPermits, employees, openWorkPermitModal, deleteWorkPermit, openConfirmModal } = useAppContext();
    const { t } = useI18n();

    const employeeMap = new Map(employees.map(e => [e.id, `${e.firstName} ${e.surname}`]));

    const handleDelete = (permit: WorkPermit) => {
        openConfirmModal(
            t('work_permits.confirm_delete_title'),
            t('work_permits.confirm_delete_message', { permitNumber: permit.permitNumber }),
            () => deleteWorkPermit(permit.id)
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('sidebar.work_permits')}</h1>
                <button onClick={() => openWorkPermitModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('work_permits.add_permit')}</span>
                </button>
            </div>
             <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 font-semibold">{t('common.employee')}</th>
                                <th className="p-4 font-semibold">{t('work_permits.table.permit_number')}</th>
                                <th className="p-4 font-semibold">{t('work_permits.table.issue_date')}</th>
                                <th className="p-4 font-semibold">{t('work_permits.table.expiry_date')}</th>
                                <th className="p-4 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {workPermits.length > 0 ? (
                            workPermits.map(p => (
                                <tr key={p.id} className="border-t dark:border-slate-700">
                                    <td className="p-4 font-medium">{employeeMap.get(p.employeeId)}</td>
                                    <td className="p-4 font-mono">{p.permitNumber}</td>
                                    <td className="p-4">{p.issueDate}</td>
                                    <td className="p-4">{p.expiryDate}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => openWorkPermitModal(p)} className="p-2 text-slate-500 hover:text-indigo-600"><EditIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(p)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={5} className="text-center p-16">
                                    <IdentificationIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                                    <h2 className="text-xl font-semibold">{t('work_permits.empty.title')}</h2>
                                    <p className="text-slate-500">{t('work_permits.empty.description')}</p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkPermits;
