import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { Shift } from '../types';
import { PlusIcon, ShiftsIcon, EditIcon, TrashIcon, ChevronLeftIcon } from './icons';

const Shifts: React.FC = () => {
    const { shifts, openAddShiftModal, openEditShiftModal, deleteShift, openConfirmModal, setView } = useAppContext();
    const { t } = useI18n();

    const handleDelete = (shift: Shift) => {
        openConfirmModal(
            t('shifts.confirm_delete_title'),
            t('shifts.confirm_delete_message', { shiftName: shift.name }),
            () => deleteShift(shift.id)
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('shift_roster')} 
                        className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        aria-label="Back to Roster"
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-bold">{t('sidebar.manage_shifts')}</h1>
                </div>
                <button onClick={openAddShiftModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('shifts.add_shift')}</span>
                </button>
            </div>

            {shifts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shifts.map(shift => (
                        <div key={shift.id} className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg shadow-lg border-l-4" style={{ borderColor: shift.color }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold text-lg">{shift.name}</h2>
                                    <p className="text-slate-500 font-mono">{shift.startTime} - {shift.endTime}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditShiftModal(shift)} className="p-2 text-slate-500 hover:text-indigo-600"><EditIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDelete(shift)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-16 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg">
                    <ShiftsIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                    <h2 className="text-xl font-semibold">{t('shifts.empty.title')}</h2>
                    <p className="text-slate-500">{t('shifts.empty.description')}</p>
                </div>
            )}
        </div>
    );
};

export default Shifts;