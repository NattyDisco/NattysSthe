import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { CurrencyDollarIcon, EyeIcon, ChevronLeftIcon } from './icons';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const formatCurrency = (amount: number, currency: string = 'LSL') => 
    `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MyPayslips: React.FC = () => {
    const { currentUser, payrollHistory, openPayslipModal, setView, payrollSettings } = useAppContext();
    const { t } = useI18n();

    const myHistory = useMemo(() => {
        return payrollHistory
            .filter(record => record.employeeId === currentUser?.id)
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
    }, [payrollHistory, currentUser]);

    return (
        <div className="container mx-auto animate-fadeIn pb-24">
            <div className="flex items-center gap-6 mb-12 pt-4">
                <button onClick={() => setView('dashboard')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Financial Ledger</h1>
                    <p className="text-slate-500 font-medium italic mt-2">Verified personal compensation statements and audit trail</p>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b-2 dark:border-slate-700">
                            <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                <th className="p-8">Accounting Period</th>
                                <th className="p-8">Issue Date</th>
                                <th className="p-8 text-right">Settlement (Net)</th>
                                <th className="p-8 text-center">Lifecycle</th>
                                <th className="p-8 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {myHistory.length > 0 ? (
                                myHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all">
                                        <td className="p-8 font-black uppercase text-slate-800 dark:text-white tracking-tighter text-lg">
                                            {new Date(record.year, record.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="p-8 font-mono text-sm text-slate-500">
                                            {new Date(record.generatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-8 text-right">
                                            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter font-mono">
                                                {formatCurrency(record.netSalary, payrollSettings.currency)}
                                            </p>
                                        </td>
                                        <td className="p-8 text-center">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${record.isLocked ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {record.isLocked ? 'Verified' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button 
                                                onClick={() => openPayslipModal({ record, employee: currentUser! })}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 ml-auto"
                                            >
                                                <EyeIcon className="h-4 w-4" /> View Audit Slip
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-40 text-center">
                                        <div className="opacity-20 flex flex-col items-center">
                                            <CurrencyDollarIcon className="h-24 w-24 mb-6 text-slate-300" />
                                            <h2 className="text-2xl font-black uppercase text-slate-400 tracking-[0.3em]">Ledger Stream Empty</h2>
                                            <p className="text-slate-500 font-medium italic mt-2">Zero financial tokens detected in your personal registry.</p>
                                        </div>
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

export default MyPayslips;