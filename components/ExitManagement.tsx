
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, BriefcaseIcon, ChevronLeftIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { ExitRecord } from '../types';

const ExitManagement: React.FC = () => {
    const { exitRecords, employees, addExitRecord, updateExitRecord, openConfirmModal, setView } = useAppContext();
    const { t } = useI18n();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [exitDate, setExitDate] = useState('');
    const [reason, setReason] = useState('');
    const [exitType, setExitType] = useState<ExitRecord['type']>('Resignation');

    const handleAddExit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeId || !exitDate) return;

        await addExitRecord({
            employeeId: selectedEmployeeId,
            exitDate,
            reason,
            type: exitType,
            clearanceStatus: { it: false, finance: false, hr: false }
        });
        setIsAddModalOpen(false);
        // Reset
        setSelectedEmployeeId('');
        setExitDate('');
        setReason('');
    };

    const toggleClearance = async (record: ExitRecord, dept: keyof ExitRecord['clearanceStatus']) => {
        const updatedStatus = { ...record.clearanceStatus, [dept]: !record.clearanceStatus[dept] };
        let newStatus = record.status;
        if (updatedStatus.it && updatedStatus.finance && updatedStatus.hr) {
            newStatus = 'completed';
        } else if (updatedStatus.it || updatedStatus.finance || updatedStatus.hr) {
            newStatus = 'in-progress';
        } else {
            newStatus = 'initiated';
        }
        await updateExitRecord(record.id, { clearanceStatus: updatedStatus, status: newStatus });
    };

    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, `${e.firstName} ${e.surname}`])), [employees]);

    // FIX: Cast motion.div to any to avoid type errors with motion props.
    const MotionDiv = motion.div as any;

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('dashboard')} 
                        className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-extrabold">{t('sidebar.exit_management')}</h1>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">
                    <PlusIcon className="h-5 w-5" />
                    <span className="font-bold">Initiate Exit</span>
                </button>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                            <tr className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                <th className="p-5">Employee</th>
                                <th className="p-5">Exit Date</th>
                                <th className="p-5">Type</th>
                                <th className="p-5">Clearance Status</th>
                                <th className="p-5">Process Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {exitRecords.length > 0 ? (
                                exitRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="p-5">
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{employeeMap.get(record.employeeId) || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{record.reason}</p>
                                        </td>
                                        <td className="p-5 font-mono text-sm">{record.exitDate}</td>
                                        <td className="p-5">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                {(['it', 'finance', 'hr'] as const).map(dept => (
                                                    <button 
                                                        key={dept}
                                                        onClick={() => toggleClearance(record, dept)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${record.clearanceStatus[dept] ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'}`}
                                                    >
                                                        {dept}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${
                                                record.status === 'completed' ? 'bg-green-500 text-white' : 
                                                record.status === 'in-progress' ? 'bg-amber-400 text-white' : 'bg-slate-400 text-white'
                                            }`}>
                                                {record.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <BriefcaseIcon className="h-16 w-16 mb-4" />
                                            <p className="text-xl font-bold">No Exit Process Active</p>
                                            <p className="text-sm">Initiate an exit for employees leaving the company.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <MotionDiv 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-extrabold">Initiate Exit Process</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                    <XCircleIcon className="h-6 w-6 text-slate-400" />
                                </button>
                            </div>
                            <form onSubmit={handleAddExit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">Employee</label>
                                    <select 
                                        value={selectedEmployeeId} 
                                        onChange={e => setSelectedEmployeeId(e.target.value)}
                                        required 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees.filter(e => e.status !== 'terminated').map(e => (
                                            <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-1">Exit Date</label>
                                        <input 
                                            type="date" 
                                            value={exitDate} 
                                            onChange={e => setExitDate(e.target.value)} 
                                            required 
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-1">Exit Type</label>
                                        <select 
                                            value={exitType} 
                                            onChange={e => setExitType(e.target.value as any)} 
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option>Resignation</option>
                                            <option>Termination</option>
                                            <option>Retirement</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1">Reason / Notes</label>
                                    <textarea 
                                        value={reason} 
                                        onChange={e => setReason(e.target.value)} 
                                        rows={3} 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Enter reason for leaving..."
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                                    >
                                        Start Process
                                    </button>
                                </div>
                            </form>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExitManagement;
